import { NextRequest, NextResponse } from 'next/server';
import { QuoteStatusService } from '../../../../lib/quotes/QuoteStatusService';

// GET /api/admin/quotes - List quotes with filtering and pagination
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Extract query parameters
    const status = searchParams.get('status') as any;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const stale = searchParams.get('stale') === 'true';
    const stats = searchParams.get('stats') === 'true';
    const adminToken = req.headers.get('authorization')?.replace('Bearer ', '');
    const adminEmail = req.headers.get('x-admin-email');

    // Simple authentication check
    if (!adminToken || !adminEmail || !isValidAdminAccess(adminToken, adminEmail)) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

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
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    const quotes = await prisma.quoteRequest.findMany({
      skip: offset,
      take: limit,
      orderBy: { created_at: 'desc' },
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
        updated_at: true
      }
    });

    // Get current status for each quote (this is expensive - consider caching)
    const quotesWithStatus = await Promise.all(
      quotes.map(async (quote: any) => {
        const currentStatus = await QuoteStatusService.getCurrentQuoteStatus(quote.id);
        return {
          id: quote.id,
          serviceType: quote.service_type,
          fullName: quote.full_name,
          email: quote.email,
          phone: quote.phone,
          passengers: quote.passengers,
          origin: quote.origin,
          destination: quote.destination,
          departureDate: quote.departure_date,
          departureTime: quote.departure_time,
          locale: quote.locale,
          createdAt: quote.created_at,
          updatedAt: quote.updated_at,
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
  try {
    const adminToken = req.headers.get('authorization')?.replace('Bearer ', '');
    const adminEmail = req.headers.get('x-admin-email');

    // Authentication check
    if (!adminToken || !adminEmail || !isValidAdminAccess(adminToken, adminEmail)) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

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

function isValidAdminAccess(token: string, email: string): boolean {
  // Simple token validation - in production, use proper JWT validation
  const expectedToken = process.env.ADMIN_TOKEN || 'demo-admin-token-2024';
  const allowedEmails = [
    'admin@fly-fleet.com',
    'contact@fly-fleet.com',
    'demo@fly-fleet.com'
  ];

  return token === expectedToken && allowedEmails.includes(email);
}