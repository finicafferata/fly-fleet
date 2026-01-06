import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { z } from 'zod';


// Status validation schema
const QuoteStatusUpdateSchema = z.object({
  status: z.enum(['pending', 'processing', 'quoted', 'converted', 'closed']),
  adminNote: z.string().max(1000).optional(),
  adminEmail: z.string().email(),
  adminToken: z.string().min(1) // Simple token-based auth for now
});

// Status workflow validation
const VALID_STATUS_TRANSITIONS = {
  pending: ['processing', 'closed'],
  processing: ['quoted', 'closed'],
  quoted: ['converted', 'closed'],
  converted: [],
  closed: []
};

interface StatusChangeLog {
  id: string;
  quoteRequestId: string;
  fromStatus: string;
  toStatus: string;
  adminEmail: string;
  adminNote?: string;
  changedAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Validate UUID format
    if (!isValidUUID(id)) {
      return NextResponse.json(
        { error: 'Invalid quote ID format' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await req.json();
    const validationResult = QuoteStatusUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.issues
        },
        { status: 400 }
      );
    }

    const { status: newStatus, adminNote, adminEmail, adminToken } = validationResult.data;

    // Simple authentication check (in production, use proper JWT/session)
    if (!isValidAdminToken(adminToken, adminEmail)) {
      return NextResponse.json(
        { error: 'Unauthorized. Invalid admin credentials.' },
        { status: 401 }
      );
    }

    // Get current quote
    const currentQuote = await prisma.quoteRequest.findUnique({
      where: { id },
      select: {
        id: true,
        service_type: true,
        full_name: true,
        email: true,
        phone: true,
        passengers: true,
        origin: true,
        destination: true,
        departure_date: true,
        departure_time: true,
        locale: true,
        created_at: true,
        updated_at: true,
        // Add status field - note: this might need to be added to schema
        // For now, we'll work with a separate status tracking approach
      }
    });

    if (!currentQuote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }

    // Get current status from our status log or default to 'pending'
    const currentStatusLog = await getLatestQuoteStatus(id);
    const currentStatus = currentStatusLog?.toStatus || 'pending';

    // Validate status transition
    if (!isValidStatusTransition(currentStatus, newStatus)) {
      return NextResponse.json(
        {
          error: 'Invalid status transition',
          currentStatus,
          attemptedStatus: newStatus,
          validTransitions: VALID_STATUS_TRANSITIONS[currentStatus as keyof typeof VALID_STATUS_TRANSITIONS]
        },
        { status: 400 }
      );
    }

    // Create status change log entry
    const statusChangeLog = await createStatusChangeLog({
      quoteRequestId: id,
      fromStatus: currentStatus,
      toStatus: newStatus,
      adminEmail,
      adminNote,
      ipAddress: getClientIP(req),
      userAgent: req.headers.get('user-agent') || undefined
    });

    // Update quote's updated_at timestamp
    const updatedQuote = await prisma.quoteRequest.update({
      where: { id },
      data: {
        updated_at: new Date()
      },
      include: {
        // Include any related data you want to return
      }
    });

    // Get quote history for context
    const statusHistory = await getQuoteStatusHistory(id);

    // Build response
    const response = {
      success: true,
      quote: {
        id: updatedQuote.id,
        serviceType: updatedQuote.service_type,
        fullName: updatedQuote.full_name,
        email: updatedQuote.email,
        phone: updatedQuote.phone,
        passengers: updatedQuote.passengers,
        origin: updatedQuote.origin,
        destination: updatedQuote.destination,
        departureDate: updatedQuote.departure_date,
        departureTime: updatedQuote.departure_time,
        locale: updatedQuote.locale,
        createdAt: updatedQuote.created_at,
        updatedAt: updatedQuote.updated_at,
        currentStatus: newStatus
      },
      statusChange: {
        id: statusChangeLog.id,
        fromStatus: currentStatus,
        toStatus: newStatus,
        changedBy: adminEmail,
        changedAt: statusChangeLog.changedAt,
        note: adminNote || null
      },
      statusHistory,
      availableActions: getAvailableStatusActions(newStatus),
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Quote status update error:', error);

    if (error instanceof Error && error.message.includes('P2025')) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve quote status and history
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Validate UUID format
    if (!isValidUUID(id)) {
      return NextResponse.json(
        { error: 'Invalid quote ID format' },
        { status: 400 }
      );
    }

    // Get quote
    const quote = await prisma.quoteRequest.findUnique({
      where: { id }
    });

    if (!quote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }

    // Get status history
    const statusHistory = await getQuoteStatusHistory(id);
    const currentStatus = statusHistory[0]?.toStatus || 'pending';

    return NextResponse.json({
      success: true,
      quote: {
        id: quote.id,
        fullName: quote.full_name,
        email: quote.email,
        currentStatus,
        createdAt: quote.created_at,
        updatedAt: quote.updated_at
      },
      statusHistory,
      availableActions: getAvailableStatusActions(currentStatus),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Quote status retrieval error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper functions
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

function isValidAdminToken(token: string, email: string): boolean {
  // Simple token validation - in production, use proper JWT validation
  // For demo purposes, accept a simple token format
  const expectedToken = process.env.ADMIN_TOKEN || 'demo-admin-token-2024';
  const allowedEmails = [
    'admin@fly-fleet.com',
    'contact@fly-fleet.com',
    'demo@fly-fleet.com'
  ];

  return token === expectedToken && allowedEmails.includes(email);
}

function isValidStatusTransition(fromStatus: string, toStatus: string): boolean {
  const validTransitions = VALID_STATUS_TRANSITIONS[fromStatus as keyof typeof VALID_STATUS_TRANSITIONS];
  return validTransitions ? (validTransitions as string[]).includes(toStatus) : false;
}

async function createStatusChangeLog(data: {
  quoteRequestId: string;
  fromStatus: string;
  toStatus: string;
  adminEmail: string;
  adminNote?: string;
  ipAddress?: string;
  userAgent?: string;
}): Promise<StatusChangeLog> {

  // Since we don't have a status_changes table in the schema yet,
  // we'll store this in the analytics_events table for now
  const logEntry = await prisma.analytics_events.create({
    data: {
      event_name: 'quote_status_change',
      event_data: {
        quoteRequestId: data.quoteRequestId,
        fromStatus: data.fromStatus,
        toStatus: data.toStatus,
        adminEmail: data.adminEmail,
        adminNote: data.adminNote,
        type: 'status_change'
      },
      page_path: `/admin/quotes/${data.quoteRequestId}`,
      user_agent: data.userAgent,
      ip_address: data.ipAddress,
      locale: 'en'
    }
  });

  return {
    id: logEntry.id,
    quoteRequestId: data.quoteRequestId,
    fromStatus: data.fromStatus,
    toStatus: data.toStatus,
    adminEmail: data.adminEmail,
    adminNote: data.adminNote,
    changedAt: logEntry.timestamp,
    ipAddress: data.ipAddress,
    userAgent: data.userAgent
  };
}

async function getLatestQuoteStatus(quoteId: string) {
  const latestStatusEvent = await prisma.analytics_events.findFirst({
    where: {
      event_name: 'quote_status_change',
      event_data: {
        path: ['quoteRequestId'],
        equals: quoteId
      }
    },
    orderBy: {
      timestamp: 'desc'
    }
  });

  if (!latestStatusEvent) return null;

  const eventData = latestStatusEvent.event_data as any;
  return {
    toStatus: eventData.toStatus,
    fromStatus: eventData.fromStatus,
    changedAt: latestStatusEvent.timestamp
  };
}

async function getQuoteStatusHistory(quoteId: string) {
  const statusEvents = await prisma.analytics_events.findMany({
    where: {
      event_name: 'quote_status_change',
      event_data: {
        path: ['quoteRequestId'],
        equals: quoteId
      }
    },
    orderBy: {
      timestamp: 'desc'
    }
  });

  return statusEvents.map((event: any) => {
    const eventData = event.event_data as any;
    return {
      id: event.id,
      fromStatus: eventData.fromStatus,
      toStatus: eventData.toStatus,
      adminEmail: eventData.adminEmail,
      adminNote: eventData.adminNote,
      changedAt: event.timestamp
    };
  });
}

function getAvailableStatusActions(currentStatus: string): string[] {
  return VALID_STATUS_TRANSITIONS[currentStatus as keyof typeof VALID_STATUS_TRANSITIONS] || [];
}

function getClientIP(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const realIP = req.headers.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  return 'unknown';
}