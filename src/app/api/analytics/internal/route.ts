import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../../generated/prisma';

const prisma = new PrismaClient();

interface InternalAnalyticsEvent {
  eventName: string;
  parameters: Record<string, any>;
  timestamp: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: InternalAnalyticsEvent = await request.json();

    // Validate required fields
    if (!body.eventName || !body.parameters || !body.timestamp) {
      return NextResponse.json(
        { error: 'Missing required fields: eventName, parameters, timestamp' },
        { status: 400 }
      );
    }

    // Extract client information
    const userAgent = request.headers.get('user-agent') || '';
    const ipAddress = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     'unknown';

    // Create analytics event record
    await prisma.analyticsEvent.create({
      data: {
        eventName: body.eventName,
        eventData: body.parameters,
        userAgent,
        ipAddress,
        locale: body.parameters.locale || 'en',
        pagePath: body.parameters.page_path || '',
        referrer: body.parameters.referrer || '',
        userId: body.parameters.user_id || null,
        sessionId: body.parameters.session_id || null,
        timestamp: new Date(body.timestamp),
      },
    });

    return NextResponse.json({
      success: true,
      eventName: body.eventName,
      timestamp: body.timestamp,
    });

  } catch (error) {
    console.error('Internal analytics error:', error);

    return NextResponse.json(
      {
        error: 'Failed to record analytics event',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// GET endpoint for analytics dashboard/reporting
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');
    const eventName = searchParams.get('event');

    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - days);

    // Build where clause
    const whereClause: any = {
      timestamp: {
        gte: dateFrom,
      },
    };

    if (eventName) {
      whereClause.eventName = eventName;
    }

    // Get events with aggregation
    const [events, eventCounts] = await Promise.all([
      // Recent events
      prisma.analyticsEvent.findMany({
        where: whereClause,
        select: {
          id: true,
          eventName: true,
          eventData: true,
          locale: true,
          pagePath: true,
          timestamp: true,
        },
        orderBy: {
          timestamp: 'desc',
        },
        take: 100,
      }),

      // Event counts by name
      prisma.analyticsEvent.groupBy({
        by: ['eventName'],
        where: whereClause,
        _count: {
          eventName: true,
        },
        orderBy: {
          _count: {
            eventName: 'desc',
          },
        },
      }),
    ]);

    // Calculate accessibility metrics
    const accessibilityMetrics = await calculateA11yMetrics(dateFrom);

    return NextResponse.json({
      success: true,
      timeframe: `${days} days`,
      summary: {
        totalEvents: events.length,
        uniqueEventTypes: eventCounts.length,
        topEvents: eventCounts.slice(0, 10),
      },
      accessibilityMetrics,
      recentEvents: events.slice(0, 20),
    });

  } catch (error) {
    console.error('Analytics reporting error:', error);

    return NextResponse.json(
      { error: 'Failed to retrieve analytics data' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

async function calculateA11yMetrics(dateFrom: Date) {
  try {
    // Get all events with accessibility data
    const accessibilityEvents = await prisma.analyticsEvent.findMany({
      where: {
        timestamp: {
          gte: dateFrom,
        },
        eventData: {
          path: ['screen_reader_detected'],
          not: null,
        },
      },
      select: {
        eventData: true,
        sessionId: true,
        timestamp: true,
      },
    });

    const uniqueSessions = new Set(accessibilityEvents
      .filter(e => e.sessionId)
      .map(e => e.sessionId!)
    ).size;

    const metrics = {
      totalSessions: uniqueSessions,
      screenReaderUsers: 0,
      highContrastUsers: 0,
      reducedMotionUsers: 0,
      keyboardNavigationUsers: 0,
      touchDeviceUsers: 0,
      conversionsWithA11y: 0,
      avgAccessibilityFeaturesUsed: 0,
    };

    // Process events to calculate metrics
    const sessionMetrics = new Map<string, any>();

    accessibilityEvents.forEach(event => {
      const data = event.eventData as any;
      const sessionId = event.sessionId;

      if (!sessionId) return;

      if (!sessionMetrics.has(sessionId)) {
        sessionMetrics.set(sessionId, {
          screenReader: false,
          highContrast: false,
          reducedMotion: false,
          keyboardNav: false,
          touchDevice: false,
          hasConversion: false,
          featuresUsed: new Set(),
        });
      }

      const session = sessionMetrics.get(sessionId)!;

      if (data.screen_reader_detected) {
        session.screenReader = true;
        session.featuresUsed.add('screen_reader');
      }
      if (data.high_contrast_mode) {
        session.highContrast = true;
        session.featuresUsed.add('high_contrast');
      }
      if (data.reduced_motion_preference) {
        session.reducedMotion = true;
        session.featuresUsed.add('reduced_motion');
      }
      if (data.keyboard_navigation_used) {
        session.keyboardNav = true;
        session.featuresUsed.add('keyboard_nav');
      }
      if (data.device_type === 'mobile' || data.device_type === 'tablet') {
        session.touchDevice = true;
        session.featuresUsed.add('touch_device');
      }
      if (data.event_category === 'conversion') {
        session.hasConversion = true;
      }
    });

    // Calculate final metrics
    let totalFeatures = 0;
    sessionMetrics.forEach(session => {
      if (session.screenReader) metrics.screenReaderUsers++;
      if (session.highContrast) metrics.highContrastUsers++;
      if (session.reducedMotion) metrics.reducedMotionUsers++;
      if (session.keyboardNav) metrics.keyboardNavigationUsers++;
      if (session.touchDevice) metrics.touchDeviceUsers++;
      if (session.hasConversion) metrics.conversionsWithA11y++;

      totalFeatures += session.featuresUsed.size;
    });

    metrics.avgAccessibilityFeaturesUsed = uniqueSessions > 0
      ? Math.round((totalFeatures / uniqueSessions) * 100) / 100
      : 0;

    return metrics;

  } catch (error) {
    console.error('Error calculating accessibility metrics:', error);
    return null;
  }
}