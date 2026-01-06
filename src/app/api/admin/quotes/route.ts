import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { QuoteStatusService } from '../../../../lib/quotes/QuoteStatusService';
import { requireAdmin, getAuthSession } from '@/lib/auth/server';

// GET /api/admin/quotes - List quotes with filtering and pagination
export async function GET(req: NextRequest) {
  // Check authentication
  const authError = await requireAdmin();
  if (authError) return authError;

  const session = await getAuthSession();
  const adminEmail = session?.user?.email || 'admin';

  try {
    const { searchParams } = new URL(req.url);

    // Extract query parameters
    const status = searchParams.get('status') as any;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const stale = searchParams.get('stale') === 'true';
    const stats = searchParams.get('stats') === 'true';

    // Handle different request types
    if (stats) {
      // Return status statistics
      const statistics = await QuoteStatusService.getStatusStatistics();
      return NextResponse.json({
        success: true,
        action: 'statistics',
        statistics,
        timestamp: new Date().toISOString()
      });
    }

    if (stale) {
      // Return stale quotes (older than 7 days and still pending/processing)
      const staleQuotes = await QuoteStatusService.getStaleQuotes(7);
      return NextResponse.json({
        success: true,
        action: 'stale_quotes',
        quotes: staleQuotes,
        total: staleQuotes.length,
        timestamp: new Date().toISOString()
      });
    }

    if (status) {
      // Filter by specific status
      const validStatuses = ['pending', 'processing', 'quoted', 'converted', 'closed'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: 'Invalid status filter', validStatuses },
          { status: 400 }
        );
      }

      const quotes = await QuoteStatusService.getQuotesByStatus(status, limit, offset);
      return NextResponse.json({
        success: true,
        action: 'filter_by_status',
        status,
        quotes,
        total: quotes.length,
        limit,
        offset,
        timestamp: new Date().toISOString()
      });
    }

    // Default: Return all quotes with basic info (without full status history for performance)
    const quotes = await prisma.quoteRequest.findMany({
      skip: offset,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        serviceType: true,
        fullName: true,
        email: true,
        phone: true,
        passengers: true,
        origin: true,
        destination: true,
        departureDate: true,
        departureTime: true,
        locale: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Get current status for each quote (this is expensive - consider caching)
    const quotesWithStatus = await Promise.all(
      quotes.map(async (quote) => {
        const currentStatus = await QuoteStatusService.getCurrentQuoteStatus(quote.id);
        return {
          id: quote.id,
          serviceType: quote.serviceType,
          fullName: quote.fullName,
          email: quote.email,
          phone: quote.phone,
          passengers: quote.passengers,
          origin: quote.origin,
          destination: quote.destination,
          departureDate: quote.departureDate,
          departureTime: quote.departureTime,
          locale: quote.locale,
          createdAt: quote.createdAt,
          updatedAt: quote.updatedAt,
          currentStatus
        };
      })
    );

    const totalCount = await prisma.quoteRequest.count();

    return NextResponse.json({
      success: true,
      action: 'list_all',
      quotes: quotesWithStatus,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Admin quotes API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/quotes - Bulk operations
export async function POST(req: NextRequest) {
  // Check authentication
  const authError = await requireAdmin();
  if (authError) return authError;

  const session = await getAuthSession();
  const adminEmail = session?.user?.email || 'admin';

  try {
    const body = await req.json();
    const { action, quoteIds, status, note } = body;

    if (action === 'bulk_status_update') {
      if (!quoteIds || !Array.isArray(quoteIds) || !status) {
        return NextResponse.json(
          { error: 'Missing required fields: quoteIds (array), status' },
          { status: 400 }
        );
      }

      const validStatuses = ['pending', 'processing', 'quoted', 'converted', 'closed'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: 'Invalid status', validStatuses },
          { status: 400 }
        );
      }

      const results = await QuoteStatusService.bulkUpdateStatus(
        quoteIds,
        status,
        adminEmail,
        note
      );

      return NextResponse.json({
        success: true,
        action: 'bulk_status_update',
        updated: results.length,
        failed: quoteIds.length - results.length,
        results,
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json(
      { error: 'Invalid action', availableActions: ['bulk_status_update'] },
      { status: 400 }
    );

  } catch (error) {
    console.error('Admin quotes bulk operation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}