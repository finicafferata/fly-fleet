import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { PrismaClient } from '../../../../generated/prisma';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Analytics event validation schema
const AnalyticsEventSchema = z.object({
  eventName: z.string().min(1).max(50),
  eventData: z.record(z.any()).optional().default({}),
  userId: z.string().min(1).max(100).optional(),
  sessionId: z.string().min(1).max(100).optional(),
  pagePath: z.string().max(255).optional(),
  referrer: z.string().max(255).optional(),
  locale: z.enum(['es', 'en', 'pt']).optional(),
  timestamp: z.string().datetime().optional()
});

// GA4 Measurement Protocol interface
interface GA4Event {
  client_id: string;
  user_id?: string;
  events: {
    name: string;
    parameters: Record<string, any>;
  }[];
}

// Get client IP address
const getClientIP = (req: NextRequest): string => {
  const forwarded = req.headers.get('x-forwarded-for');
  const realIP = req.headers.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  return req.ip || 'unknown';
};

// Generate anonymous user ID from IP and user agent
const generateAnonymousUserId = (req: NextRequest): string => {
  const ip = getClientIP(req);
  const userAgent = req.headers.get('user-agent') || 'unknown';
  const seed = `${ip}-${userAgent}`;

  // Create a consistent but anonymized ID
  return crypto.createHash('sha256').update(seed).digest('hex').substring(0, 16);
};

// Request deduplication using in-memory cache
const eventCache = new Map<string, number>();
const DEDUP_WINDOW = 30 * 1000; // 30 seconds

const isDuplicateEvent = (eventKey: string): boolean => {
  const now = Date.now();
  const lastSeen = eventCache.get(eventKey);

  if (lastSeen && (now - lastSeen) < DEDUP_WINDOW) {
    return true;
  }

  eventCache.set(eventKey, now);

  // Clean old entries
  for (const [key, timestamp] of eventCache.entries()) {
    if (now - timestamp > DEDUP_WINDOW) {
      eventCache.delete(key);
    }
  }

  return false;
};

// Batch processing queue
interface BatchedEvent {
  eventName: string;
  userId?: string;
  sessionId?: string;
  eventData: Record<string, any>;
  pagePath?: string;
  referrer?: string;
  userAgent?: string;
  ipAddress: string;
  locale?: string;
  timestamp: Date;
}

const eventBatch: BatchedEvent[] = [];
const BATCH_SIZE = 10;
const BATCH_TIMEOUT = 5000; // 5 seconds

let batchTimer: NodeJS.Timeout | null = null;

// Process batch of events
const processBatch = async () => {
  if (eventBatch.length === 0) return;

  const eventsToProcess = eventBatch.splice(0, eventBatch.length);

  try {
    // Store in database
    await prisma.analyticsEvent.createMany({
      data: eventsToProcess.map(event => ({
        eventName: event.eventName,
        userId: event.userId,
        sessionId: event.sessionId,
        eventData: event.eventData,
        pagePath: event.pagePath,
        referrer: event.referrer,
        userAgent: event.userAgent,
        ipAddress: event.ipAddress,
        locale: event.locale,
        timestamp: event.timestamp
      }))
    });

    // Forward to GA4 if measurement ID is configured
    if (process.env.GA4_MEASUREMENT_ID && process.env.GA4_API_SECRET) {
      await forwardToGA4(eventsToProcess);
    }

    console.log(`Processed batch of ${eventsToProcess.length} analytics events`);

  } catch (error) {
    console.error('Error processing analytics batch:', error);

    // Re-add failed events to the front of the queue for retry
    eventBatch.unshift(...eventsToProcess);
  }
};

// Forward events to GA4 Measurement Protocol
const forwardToGA4 = async (events: BatchedEvent[]) => {
  try {
    const measurementId = process.env.GA4_MEASUREMENT_ID;
    const apiSecret = process.env.GA4_API_SECRET;

    if (!measurementId || !apiSecret) {
      console.warn('GA4 not configured, skipping forwarding');
      return;
    }

    // Group events by user/session for GA4
    const userEvents = new Map<string, BatchedEvent[]>();

    events.forEach(event => {
      const key = event.userId || event.sessionId || 'anonymous';
      if (!userEvents.has(key)) {
        userEvents.set(key, []);
      }
      userEvents.get(key)!.push(event);
    });

    // Send to GA4 for each user/session
    for (const [clientId, userEventList] of userEvents.entries()) {
      const ga4Payload: GA4Event = {
        client_id: clientId,
        user_id: userEventList[0].userId,
        events: userEventList.map(event => ({
          name: event.eventName,
          parameters: {
            ...event.eventData,
            page_location: event.pagePath,
            page_referrer: event.referrer,
            language: event.locale,
            timestamp_micros: event.timestamp.getTime() * 1000
          }
        }))
      };

      const response = await fetch(
        `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(ga4Payload),
        }
      );

      if (!response.ok) {
        console.error(`GA4 forwarding failed: ${response.status} ${response.statusText}`);
      }
    }

  } catch (error) {
    console.error('Error forwarding to GA4:', error);
  }
};

// Schedule batch processing
const scheduleBatchProcessing = () => {
  if (batchTimer) {
    clearTimeout(batchTimer);
  }

  batchTimer = setTimeout(processBatch, BATCH_TIMEOUT);
};

export async function POST(req: NextRequest) {
  try {
    let body;

    try {
      body = await req.json();
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Validate request body manually for now to avoid zod issues
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    if (!body.eventName || typeof body.eventName !== 'string' || body.eventName.length === 0 || body.eventName.length > 50) {
      return NextResponse.json(
        { error: 'eventName is required and must be a string (1-50 chars)' },
        { status: 400 }
      );
    }

    // Use the validated body
    const eventData = {
      eventName: body.eventName,
      eventData: body.eventData || {},
      userId: body.userId,
      sessionId: body.sessionId,
      pagePath: body.pagePath,
      referrer: body.referrer,
      locale: body.locale,
      timestamp: body.timestamp
    };
    const clientIP = getClientIP(req);
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Handle anonymous users
    const userId = eventData.userId || generateAnonymousUserId(req);
    const sessionId = eventData.sessionId || userId; // Fallback to userId if no session

    // Create deduplication key
    const dedupKey = `${userId}-${eventData.eventName}-${eventData.pagePath || ''}-${Math.floor(Date.now() / 1000)}`;

    // Check for duplicate events
    if (isDuplicateEvent(dedupKey)) {
      return NextResponse.json(
        { message: 'Duplicate event ignored' },
        { status: 200 }
      );
    }

    // Create event for batch processing
    const batchEvent: BatchedEvent = {
      eventName: eventData.eventName,
      userId: userId,
      sessionId: sessionId,
      eventData: eventData.eventData,
      pagePath: eventData.pagePath,
      referrer: eventData.referrer,
      userAgent: userAgent,
      ipAddress: clientIP,
      locale: eventData.locale,
      timestamp: eventData.timestamp ? new Date(eventData.timestamp) : new Date()
    };

    // Add to batch
    eventBatch.push(batchEvent);

    // Process batch if it's full or schedule processing
    if (eventBatch.length >= BATCH_SIZE) {
      await processBatch();
    } else {
      scheduleBatchProcessing();
    }

    return NextResponse.json({
      success: true,
      message: 'Event queued for processing',
      userId: userId,
      sessionId: sessionId
    });

  } catch (error) {
    console.error('Analytics event API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Optional: Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    batchSize: eventBatch.length,
    cacheSize: eventCache.size,
    ga4Configured: !!(process.env.GA4_MEASUREMENT_ID && process.env.GA4_API_SECRET)
  });
}

// Cleanup function - can be called periodically
export const cleanup = () => {
  const now = Date.now();
  for (const [key, timestamp] of eventCache.entries()) {
    if (now - timestamp > DEDUP_WINDOW) {
      eventCache.delete(key);
    }
  }
};