import { NextRequest, NextResponse } from 'next/server';
import { ResendWebhookService } from '../../../../../lib/webhooks/ResendWebhookService';

// POST /api/webhooks/resend/test - Test webhook processing with simulated events
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { emailId, eventType, recipientEmail } = body;

    if (!emailId || !eventType) {
      return NextResponse.json(
        { error: 'Missing required fields: emailId, eventType' },
        { status: 400 }
      );
    }

    // Create test webhook event
    const testEvent = ResendWebhookService.createTestWebhookEvent(
      emailId,
      eventType,
      recipientEmail || 'test@example.com'
    );

    // Process the test event
    const result = await ResendWebhookService.processWebhookEvent(testEvent);

    // Log the test event
    await ResendWebhookService.logWebhookEvent(testEvent, result);

    return NextResponse.json({
      success: true,
      testEvent,
      result,
      message: 'Test webhook event processed',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Webhook test error:', error);
    return NextResponse.json(
      { error: 'Test webhook processing failed' },
      { status: 500 }
    );
  }
}

// GET /api/webhooks/resend/test - Get webhook test information and examples
export async function GET() {
  try {
    const statistics = await ResendWebhookService.getWebhookStatistics(24);

    const examples = {
      testWebhookCall: {
        method: 'POST',
        url: '/api/webhooks/resend/test',
        body: {
          emailId: 'test-email-id-123',
          eventType: 'email.sent',
          recipientEmail: 'test@example.com'
        }
      },
      supportedEventTypes: [
        'email.sent',
        'email.delivered',
        'email.bounced',
        'email.delivery_failed',
        'email.complained',
        'email.delivery_delayed',
        'email.opened',
        'email.clicked'
      ],
      sampleWebhookPayload: {
        type: 'email.delivered',
        created_at: new Date().toISOString(),
        data: {
          email_id: 'sample-email-id',
          from: 'contact@fly-fleet.com',
          to: ['recipient@example.com'],
          subject: 'Your quote request confirmation'
        }
      }
    };

    return NextResponse.json({
      success: true,
      message: 'Resend webhook test endpoint',
      statistics,
      examples,
      endpoints: {
        'POST /api/webhooks/resend': 'Main webhook endpoint (for Resend)',
        'GET /api/webhooks/resend': 'Get webhook statistics',
        'POST /api/webhooks/resend/test': 'Test webhook processing',
        'GET /api/webhooks/resend/test': 'This endpoint'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Webhook test info error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve test information' },
      { status: 500 }
    );
  }
}