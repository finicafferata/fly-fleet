import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Resend webhook event types
type ResendEventType =
  | 'email.sent'
  | 'email.delivered'
  | 'email.delivery_delayed'
  | 'email.complained'
  | 'email.bounced'
  | 'email.delivery_failed'
  | 'email.opened'
  | 'email.clicked';

interface ResendWebhookPayload {
  type: ResendEventType;
  created_at: string;
  data: {
    email_id: string;
    from: string;
    to: string[];
    subject: string;
    error?: {
      message: string;
      code?: string;
    };
    [key: string]: any;
  };
}

interface WebhookLogEntry {
  eventType: ResendEventType;
  emailId: string;
  timestamp: Date;
  payload: any;
  processed: boolean;
  error?: string;
  deliveryRecordId?: string;
}

export async function POST(req: NextRequest) {
  let webhookLog: WebhookLogEntry | null = null;

  try {
    // Get raw body for signature verification
    const rawBody = await req.text();
    const payload: ResendWebhookPayload = JSON.parse(rawBody);

    // Verify webhook signature for security
    const isValidSignature = await verifyWebhookSignature(
      rawBody,
      req.headers.get('resend-signature') || '',
      process.env.RESEND_WEBHOOK_SECRET || ''
    );

    if (!isValidSignature) {
      console.error('Invalid webhook signature received');
      await logWebhookEvent({
        eventType: payload.type || 'unknown' as ResendEventType,
        emailId: payload.data?.email_id || 'unknown',
        timestamp: new Date(),
        payload,
        processed: false,
        error: 'Invalid signature'
      });

      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Initialize webhook log entry
    webhookLog = {
      eventType: payload.type,
      emailId: payload.data?.email_id || 'unknown',
      timestamp: new Date(payload.created_at || Date.now()),
      payload,
      processed: false
    };

    // Validate required fields
    if (!payload.type || !payload.data?.email_id) {
      const error = 'Missing required fields: type or email_id';
      console.warn('Invalid webhook payload:', payload);

      webhookLog.error = error;
      await logWebhookEvent(webhookLog);

      return NextResponse.json(
        { error },
        { status: 400 }
      );
    }

    const emailId = payload.data.email_id;
    const timestamp = new Date(payload.created_at || Date.now());

    // Find the email delivery record by Resend message ID
    const emailDelivery = await prisma.emailDelivery.findFirst({
      where: { resendMessageId: emailId }
    });

    if (!emailDelivery) {
      const warning = `Email delivery record not found for Resend ID: ${emailId}`;
      console.warn(warning);

      webhookLog.error = warning;
      webhookLog.processed = false;
      await logWebhookEvent(webhookLog);

      // Return 200 to prevent Resend from retrying for non-existent records
      return NextResponse.json({
        received: true,
        warning: 'Email delivery record not found'
      }, { status: 200 });
    }

    webhookLog.deliveryRecordId = emailDelivery.id;

    // Process the webhook event and update email delivery status
    const updateResult = await processWebhookEvent(emailDelivery, payload, timestamp);

    if (updateResult.success) {
      webhookLog.processed = true;
      console.log(`Email delivery updated: ${emailId} -> ${payload.type} (Status: ${updateResult.newStatus})`);
    } else {
      webhookLog.error = updateResult.error;
      console.error(`Failed to update email delivery for ${emailId}: ${updateResult.error}`);
    }

    // Log the webhook event
    await logWebhookEvent(webhookLog);

    return NextResponse.json({
      received: true,
      processed: updateResult.success,
      emailId,
      eventType: payload.type,
      status: updateResult.newStatus || 'unchanged',
      timestamp: timestamp.toISOString()
    }, { status: 200 });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Resend webhook processing error:', error);

    // Log the failed webhook event
    if (webhookLog) {
      webhookLog.processed = false;
      webhookLog.error = errorMessage;
      await logWebhookEvent(webhookLog);
    }

    return NextResponse.json(
      {
        error: 'Webhook processing failed',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}

async function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  if (!secret || !signature) {
    console.warn('Webhook signature verification skipped: missing secret or signature');
    return true; // In development, allow webhooks without signatures
  }

  try {
    // Resend uses HMAC-SHA256 for signature verification
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    // Resend typically sends signature in format: "sha256=<hash>"
    const receivedSignature = signature.replace('sha256=', '');

    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(receivedSignature)
    );
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

async function processWebhookEvent(
  emailDelivery: any,
  payload: ResendWebhookPayload,
  timestamp: Date
): Promise<{ success: boolean; newStatus?: string; error?: string }> {

  try {
    // Prepare update data
    const updateData: any = {
      webhook_data: payload,
      updated_at: new Date()
    };

    let newStatus = emailDelivery.status; // Default to current status

    // Handle different Resend event types
    switch (payload.type) {
      case 'email.sent':
        updateData.status = 'sent';
        updateData.sent_at = timestamp;
        newStatus = 'sent';
        break;

      case 'email.delivered':
        updateData.status = 'delivered';
        updateData.delivered_at = timestamp;
        newStatus = 'delivered';
        break;

      case 'email.delivery_delayed':
        // Keep current status but log the delay
        console.log(`Email delivery delayed for ${payload.data.email_id}: ${payload.data.error?.message || 'No details'}`);
        updateData.error_message = `Delivery delayed: ${payload.data.error?.message || 'Unknown reason'}`;
        break;

      case 'email.complained':
        updateData.status = 'complained';
        updateData.error_message = 'Recipient marked as spam/complaint';
        newStatus = 'complained';
        break;

      case 'email.bounced':
        updateData.status = 'bounced';
        updateData.bounced_at = timestamp;
        updateData.error_message = payload.data.error?.message || 'Email bounced';
        newStatus = 'bounced';
        break;

      case 'email.delivery_failed':
        updateData.status = 'failed';
        updateData.failed_at = timestamp;
        updateData.error_message = payload.data.error?.message || 'Email delivery failed';
        newStatus = 'failed';
        break;

      case 'email.opened':
        // Track opens but don't change delivery status
        console.log(`Email opened: ${payload.data.email_id} at ${timestamp.toISOString()}`);
        // Could store open tracking data here if needed
        break;

      case 'email.clicked':
        // Track clicks but don't change delivery status
        console.log(`Email clicked: ${payload.data.email_id} at ${timestamp.toISOString()}`);
        // Could store click tracking data here if needed
        break;

      default:
        console.warn(`Unhandled webhook event type: ${payload.type} for email ${payload.data.email_id}`);
        return {
          success: false,
          error: `Unhandled event type: ${payload.type}`
        };
    }

    // Update the email delivery record
    await prisma.emailDelivery.update({
      where: { id: emailDelivery.id },
      data: updateData
    });

    return {
      success: true,
      newStatus
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: `Database update failed: ${errorMessage}`
    };
  }
}

async function logWebhookEvent(logEntry: WebhookLogEntry): Promise<void> {
  try {
    // Log webhook events to analytics_events table for debugging and monitoring
    await prisma.analytics_events.create({
      data: {
        event_name: 'resend_webhook_received',
        event_data: {
          eventType: logEntry.eventType,
          emailId: logEntry.emailId,
          processed: logEntry.processed,
          error: logEntry.error,
          deliveryRecordId: logEntry.deliveryRecordId,
          payload: logEntry.payload
        },
        page_path: '/webhooks/resend',
        ip_address: 'resend-webhook',
        timestamp: logEntry.timestamp
      }
    });
  } catch (error) {
    // Don't fail the webhook processing if logging fails
    console.error('Failed to log webhook event:', error);
  }
}

// GET endpoint for webhook status and statistics
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const hours = parseInt(searchParams.get('hours') || '24');

    // Get webhook statistics for the last N hours
    const since = new Date();
    since.setHours(since.getHours() - hours);

    const webhookEvents = await prisma.analytics_events.findMany({
      where: {
        event_name: 'resend_webhook_received',
        timestamp: {
          gte: since
        }
      },
      orderBy: {
        timestamp: 'desc'
      }
    });

    const stats = {
      totalEvents: webhookEvents.length,
      processed: webhookEvents.filter((e: any) => (e.event_data as any)?.processed === true).length,
      failed: webhookEvents.filter((e: any) => (e.event_data as any)?.processed === false).length,
      byEventType: {} as Record<string, number>,
      errors: webhookEvents
        .filter((e: any) => (e.event_data as any)?.error)
        .map((e: any) => ({
          timestamp: e.timestamp,
          eventType: (e.event_data as any)?.eventType,
          error: (e.event_data as any)?.error,
          emailId: (e.event_data as any)?.emailId
        }))
        .slice(0, 10) // Last 10 errors
    };

    // Count events by type
    webhookEvents.forEach((event: any) => {
      const eventType = (event.event_data as any)?.eventType || 'unknown';
      stats.byEventType[eventType] = (stats.byEventType[eventType] || 0) + 1;
    });

    return NextResponse.json({
      success: true,
      timeframe: `${hours} hours`,
      statistics: stats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Webhook statistics error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve webhook statistics' },
      { status: 500 }
    );
  }
}