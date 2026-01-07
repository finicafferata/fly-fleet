import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, getAuthSession } from '@/lib/auth/server';
import { QuoteStatusService, QuoteStatus } from '@/lib/quotes/QuoteStatusService';
import { prisma } from '@/lib/database/prisma';

// GET /api/admin/quotes/[id] - Get single quote with full details
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Check authentication
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const quoteId = params.id;

    // Get quote with full details
    const quote = await prisma.quoteRequest.findUnique({
      where: { id: quoteId },
    });

    if (!quote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }

    // Get current status and history
    const currentStatus = await QuoteStatusService.getCurrentQuoteStatus(quoteId);
    const statusHistory = await QuoteStatusService.getQuoteStatusHistory(quoteId);

    // Get related email deliveries
    const emailDeliveries = await prisma.emailDelivery.findMany({
      where: { quoteRequestId: quoteId },
      orderBy: { createdAt: 'desc' },
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
        errorMessage: true,
      },
    });

    return NextResponse.json({
      success: true,
      quote: {
        ...quote,
        currentStatus,
        statusHistory,
        emailDeliveries,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching quote:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/quotes/[id] - Update quote status
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Check authentication
  const authError = await requireAdmin();
  if (authError) return authError;

  const session = await getAuthSession();
  const adminEmail = session?.user?.email || 'admin';

  try {
    const quoteId = params.id;
    const body = await req.json();
    const { status, note } = body;

    // Validate status
    const validStatuses: QuoteStatus[] = ['pending', 'processing', 'quoted', 'converted', 'closed'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status', validStatuses },
        { status: 400 }
      );
    }

    // Check if quote exists
    const quote = await prisma.quoteRequest.findUnique({
      where: { id: quoteId },
    });

    if (!quote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }

    // Update status using QuoteStatusService
    const statusChange = await QuoteStatusService.updateQuoteStatus({
      quoteId,
      newStatus: status,
      adminEmail,
      adminNote: note,
    });

    // Get updated quote with new status
    const currentStatus = await QuoteStatusService.getCurrentQuoteStatus(quoteId);
    const statusHistory = await QuoteStatusService.getQuoteStatusHistory(quoteId);

    return NextResponse.json({
      success: true,
      message: `Quote status updated to ${status}`,
      quote: {
        ...quote,
        currentStatus,
        statusHistory,
      },
      statusChange,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error updating quote status:', error);

    // Handle validation errors from QuoteStatusService
    if (error.message?.includes('Invalid status transition')) {
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
