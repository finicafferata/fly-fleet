import { prisma } from '../database/prisma';
import crypto from 'crypto';

export interface ResendWebhookEvent {
  type: string;
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

export interface WebhookProcessingResult {
  success: boolean;
  processed: boolean;
  emailId: string;
  eventType: string;
  newStatus?: string;
  error?: string;
  deliveryRecordId?: string;
}

export class ResendWebhookService {

  // Verify webhook signature using HMAC-SHA256
  static verifySignature(payload: string, signature: string, secret: string): boolean {
    if (!secret || !signature) {
      return false;
    }

    try {
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');

      // Handle both formats: "sha256=hash" or just "hash"
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

  // Process a webhook event and update email delivery status
  static async processWebhookEvent(event: ResendWebhookEvent): Promise<WebhookProcessingResult> {
    const result: WebhookProcessingResult = {
      success: false,
      processed: false,
      emailId: event.data.email_id,
      eventType: event.type
    };

    try {
      // Find the email delivery record
      const emailDelivery = await prisma.email_deliveries.findFirst({
        where: { resend_message_id: event.data.email_id }
      });

      if (!emailDelivery) {
        result.error = 'Email delivery record not found';
        return result;
      }

      result.deliveryRecordId = emailDelivery.id;

      // Determine status update based on event type
      const statusUpdate = this.getStatusUpdateForEvent(event);

      if (statusUpdate) {
        // Update the email delivery record
        await prisma.email_deliveries.update({
          where: { id: emailDelivery.id },
          data: {
            ...statusUpdate,
            webhook_data: event,
            updated_at: new Date()
          }
        });

        result.newStatus = statusUpdate.status || emailDelivery.status;
        result.processed = true;
      }

      result.success = true;
      return result;

    } catch (error) {
      result.error = error instanceof Error ? error.message : 'Unknown error';
      return result;
    }
  }

  // Get the appropriate status update based on event type
  private static getStatusUpdateForEvent(event: ResendWebhookEvent): any {
    const timestamp = new Date(event.created_at || Date.now());

    switch (event.type) {
      case 'email.sent':
        return {
          status: 'sent',
          sent_at: timestamp
        };

      case 'email.delivered':
        return {
          status: 'delivered',
          delivered_at: timestamp
        };

      case 'email.bounced':
        return {
          status: 'bounced',
          bounced_at: timestamp,
          error_message: event.data.error?.message || 'Email bounced'
        };

      case 'email.delivery_failed':
        return {
          status: 'failed',
          failed_at: timestamp,
          error_message: event.data.error?.message || 'Email delivery failed'
        };

      case 'email.complained':
        return {
          status: 'complained',
          error_message: 'Recipient marked as spam/complaint'
        };

      case 'email.delivery_delayed':
        return {
          error_message: `Delivery delayed: ${event.data.error?.message || 'Unknown reason'}`
        };

      case 'email.opened':
      case 'email.clicked':
        // These events don't change delivery status but could be tracked separately
        return null;

      default:
        return null;
    }
  }

  // Log webhook event for debugging and monitoring
  static async logWebhookEvent(
    event: ResendWebhookEvent,
    result: WebhookProcessingResult,
    error?: string
  ): Promise<void> {
    try {
      await prisma.analytics_events.create({
        data: {
          event_name: 'resend_webhook_received',
          event_data: {
            eventType: event.type,
            emailId: event.data.email_id,
            processed: result.processed,
            success: result.success,
            newStatus: result.newStatus,
            error: error || result.error,
            deliveryRecordId: result.deliveryRecordId,
            payload: event
          },
          page_path: '/webhooks/resend',
          ip_address: 'resend-webhook',
          timestamp: new Date(event.created_at || Date.now())
        }
      });
    } catch (logError) {
      console.error('Failed to log webhook event:', logError);
    }
  }

  // Get webhook statistics for monitoring
  static async getWebhookStatistics(hoursBack: number = 24) {
    const since = new Date();
    since.setHours(since.getHours() - hoursBack);

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
      timeframe: `${hoursBack} hours`,
      totalEvents: webhookEvents.length,
      processed: 0,
      failed: 0,
      byEventType: {} as Record<string, number>,
      byStatus: {} as Record<string, number>,
      recentErrors: [] as any[]
    };

    webhookEvents.forEach(event => {
      const eventData = event.event_data as any;

      // Count processed vs failed
      if (eventData.processed) {
        stats.processed++;
      } else {
        stats.failed++;
      }

      // Count by event type
      const eventType = eventData.eventType || 'unknown';
      stats.byEventType[eventType] = (stats.byEventType[eventType] || 0) + 1;

      // Count by resulting status
      if (eventData.newStatus) {
        stats.byStatus[eventData.newStatus] = (stats.byStatus[eventData.newStatus] || 0) + 1;
      }

      // Collect recent errors
      if (eventData.error && stats.recentErrors.length < 10) {
        stats.recentErrors.push({
          timestamp: event.timestamp,
          eventType: eventData.eventType,
          emailId: eventData.emailId,
          error: eventData.error
        });
      }
    });

    return stats;
  }

  // Get email delivery status by Resend message ID
  static async getEmailDeliveryStatus(resendMessageId: string) {
    const emailDelivery = await prisma.email_deliveries.findFirst({
      where: { resend_message_id: resendMessageId },
      include: {
        // Include related quote or contact if needed
      }
    });

    if (!emailDelivery) {
      return null;
    }

    return {
      id: emailDelivery.id,
      resendMessageId: emailDelivery.resend_message_id,
      status: emailDelivery.status,
      recipientEmail: emailDelivery.recipient_email,
      subject: emailDelivery.subject,
      emailType: emailDelivery.email_type,
      sentAt: emailDelivery.sent_at,
      deliveredAt: emailDelivery.delivered_at,
      bouncedAt: emailDelivery.bounced_at,
      failedAt: emailDelivery.failed_at,
      errorMessage: emailDelivery.error_message,
      createdAt: emailDelivery.created_at,
      updatedAt: emailDelivery.updated_at,
      webhookData: emailDelivery.webhook_data
    };
  }

  // Simulate webhook events for testing
  static createTestWebhookEvent(
    emailId: string,
    eventType: string,
    recipientEmail: string = 'test@example.com'
  ): ResendWebhookEvent {
    const baseEvent = {
      created_at: new Date().toISOString(),
      data: {
        email_id: emailId,
        from: 'contact@fly-fleet.com',
        to: [recipientEmail],
        subject: 'Test Email'
      }
    };

    switch (eventType) {
      case 'email.sent':
        return {
          type: 'email.sent',
          ...baseEvent
        };

      case 'email.delivered':
        return {
          type: 'email.delivered',
          ...baseEvent
        };

      case 'email.bounced':
        return {
          type: 'email.bounced',
          ...baseEvent,
          data: {
            ...baseEvent.data,
            error: {
              message: 'Recipient address rejected',
              code: 'recipient_rejected'
            }
          }
        };

      case 'email.delivery_failed':
        return {
          type: 'email.delivery_failed',
          ...baseEvent,
          data: {
            ...baseEvent.data,
            error: {
              message: 'SMTP server error',
              code: 'smtp_error'
            }
          }
        };

      case 'email.complained':
        return {
          type: 'email.complained',
          ...baseEvent
        };

      default:
        return {
          type: eventType,
          ...baseEvent
        };
    }
  }

  // Retry failed webhook processing
  static async retryFailedWebhooks(hoursBack: number = 1): Promise<number> {
    const since = new Date();
    since.setHours(since.getHours() - hoursBack);

    const failedEvents = await prisma.analytics_events.findMany({
      where: {
        event_name: 'resend_webhook_received',
        timestamp: {
          gte: since
        },
        event_data: {
          path: ['processed'],
          equals: false
        }
      },
      orderBy: {
        timestamp: 'desc'
      }
    });

    let retryCount = 0;

    for (const event of failedEvents) {
      try {
        const eventData = event.event_data as any;
        const webhookEvent = eventData.payload as ResendWebhookEvent;

        if (webhookEvent) {
          const result = await this.processWebhookEvent(webhookEvent);
          if (result.success) {
            retryCount++;
            await this.logWebhookEvent(webhookEvent, result, 'Retry successful');
          }
        }
      } catch (error) {
        console.error('Failed to retry webhook event:', error);
      }
    }

    return retryCount;
  }
}