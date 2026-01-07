import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { QuoteStatusService, type QuoteStatus } from '@/lib/quotes/QuoteStatusService';
import { requireAdmin, getAuthSession } from '@/lib/auth/server';

// GET /api/admin/quotes/[id] - Get single quote with full details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Check authentication
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { id } = await params;

    // Get quote with status details
    const quote = await QuoteStatusService.getQuoteWithStatus(id);

    if (!quote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }

    // Get related email deliveries
    const emailDeliveries = await prisma.emailDelivery.findMany({
      where: {
        quoteRequestId: id
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        recipientEmail: true,
        subject: true,
        status: true,
        createdAt: true,
        sentAt: true,
        deliveredAt: true,
        bouncedAt: true,
        failedAt: true,
        errorMessage: true
      }
    });

    return NextResponse.json({
      success: true,
      quote: {
        ...quote,
        emailDeliveries
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Admin quote detail API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/quotes/[id] - Update quote status
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Check authentication
  const authError = await requireAdmin();
  if (authError) return authError;

  const session = await getAuthSession();
  const adminEmail = session?.user?.email || 'admin';

  try {
    const { id } = await params;
    const body = await req.json();
    const { status, note } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    const validStatuses: QuoteStatus[] = [
      'new_request',
      'reviewing',
      'quote_sent',
      'awaiting_confirmation',
      'confirmed',
      'payment_pending',
      'paid',
      'completed',
      'cancelled'
    ];

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status', validStatuses },
        { status: 400 }
      );
    }

    // Update status using QuoteStatusService
    const statusChange = await QuoteStatusService.updateQuoteStatus({
      quoteId: id,
      newStatus: status,
      adminEmail,
      adminNote: note,
    });

    return NextResponse.json({
      success: true,
      action: 'status_updated',
      statusChange,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Admin quote update API error:', error);

    // Handle validation errors from QuoteStatusService
    if (error instanceof Error && error.message.includes('Invalid status transition')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
