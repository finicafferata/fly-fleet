import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { ContactStatusService } from '@/lib/contacts/ContactStatusService';
import { requireAdmin, getAuthSession } from '@/lib/auth/server';

// GET /api/admin/contacts - List contacts with filtering and pagination
export async function GET(req: NextRequest) {
  // Check authentication
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { searchParams } = new URL(req.url);

    // Extract query parameters
    const status = searchParams.get('status') as any;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const stats = searchParams.get('stats') === 'true';

    // Handle statistics request
    if (stats) {
      const statistics = await ContactStatusService.getStatusStatistics();
      return NextResponse.json({
        success: true,
        action: 'statistics',
        statistics,
        timestamp: new Date().toISOString(),
      });
    }

    // Build where clause for filtering
    const where: any = {};

    // Date range filter
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo);
      }
    }

    // Search filter
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Filter by specific status
    if (status) {
      const validStatuses = ['pending', 'responded', 'closed'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: 'Invalid status filter', validStatuses },
          { status: 400 }
        );
      }

      const contacts = await ContactStatusService.getContactsByStatus(status, limit, offset);
      return NextResponse.json({
        success: true,
        action: 'filter_by_status',
        status,
        contacts,
        total: contacts.length,
        limit,
        offset,
        timestamp: new Date().toISOString(),
      });
    }

    // Default: Return all contacts with basic info
    const contacts = await prisma.contactForm.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        subject: true,
        message: true,
        contactViaWhatsApp: true,
        locale: true,
        createdAt: true,
      },
    });

    // Get current status for each contact
    const contactsWithStatus = await Promise.all(
      contacts.map(async (contact) => {
        const currentStatus = await ContactStatusService.getCurrentContactStatus(contact.id);
        return {
          ...contact,
          currentStatus,
        };
      })
    );

    const totalCount = await prisma.contactForm.count({ where });

    return NextResponse.json({
      success: true,
      action: 'list_all',
      contacts: contactsWithStatus,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Admin contacts API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/contacts - Bulk operations
export async function POST(req: NextRequest) {
  // Check authentication
  const authError = await requireAdmin();
  if (authError) return authError;

  const session = await getAuthSession();
  const adminEmail = session?.user?.email || 'admin';

  try {
    const body = await req.json();
    const { action, contactIds, status, note } = body;

    if (action === 'bulk_status_update') {
      if (!contactIds || !Array.isArray(contactIds) || !status) {
        return NextResponse.json(
          { error: 'Missing required fields: contactIds (array), status' },
          { status: 400 }
        );
      }

      const validStatuses = ['pending', 'responded', 'closed'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: 'Invalid status', validStatuses },
          { status: 400 }
        );
      }

      const results = await ContactStatusService.bulkUpdateStatus(
        contactIds,
        status,
        adminEmail,
        note
      );

      return NextResponse.json({
        success: true,
        action: 'bulk_status_update',
        updated: results.length,
        failed: contactIds.length - results.length,
        results,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json(
      { error: 'Invalid action', availableActions: ['bulk_status_update'] },
      { status: 400 }
    );
  } catch (error) {
    console.error('Admin contacts bulk operation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
