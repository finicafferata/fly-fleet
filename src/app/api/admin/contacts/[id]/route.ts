import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, getAuthSession } from '@/lib/auth/server';
import { ContactStatusService, ContactStatus } from '@/lib/contacts/ContactStatusService';
import { prisma } from '@/lib/database/prisma';

// GET /api/admin/contacts/[id] - Get single contact with full details
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Check authentication
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const contactId = params.id;

    // Get contact with full details
    const contact = await prisma.contactForm.findUnique({
      where: { id: contactId },
    });

    if (!contact) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      );
    }

    // Get current status and history
    const currentStatus = await ContactStatusService.getCurrentContactStatus(contactId);
    const statusHistory = await ContactStatusService.getContactStatusHistory(contactId);

    // Get related email deliveries
    const emailDeliveries = await prisma.emailDelivery.findMany({
      where: { contactFormId: contactId },
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
      contact: {
        ...contact,
        currentStatus,
        statusHistory,
        emailDeliveries,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching contact:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/contacts/[id] - Update contact status
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
    const contactId = params.id;
    const body = await req.json();
    const { status, note } = body;

    // Validate status
    const validStatuses: ContactStatus[] = ['pending', 'responded', 'closed'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status', validStatuses },
        { status: 400 }
      );
    }

    // Check if contact exists
    const contact = await prisma.contactForm.findUnique({
      where: { id: contactId },
    });

    if (!contact) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      );
    }

    // Update status using ContactStatusService
    const statusChange = await ContactStatusService.updateContactStatus({
      contactId,
      newStatus: status,
      adminEmail,
      adminNote: note,
    });

    // Get updated contact with new status
    const currentStatus = await ContactStatusService.getCurrentContactStatus(contactId);
    const statusHistory = await ContactStatusService.getContactStatusHistory(contactId);

    return NextResponse.json({
      success: true,
      message: `Contact status updated to ${status}`,
      contact: {
        ...contact,
        currentStatus,
        statusHistory,
      },
      statusChange,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error updating contact status:', error);

    // Handle validation errors from ContactStatusService
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
