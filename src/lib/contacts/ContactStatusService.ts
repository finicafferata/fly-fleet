import { prisma } from '../database/prisma';

export interface ContactStatusUpdate {
  contactId: string;
  newStatus: ContactStatus;
  adminEmail: string;
  adminNote?: string;
  ipAddress?: string;
  userAgent?: string;
}

export type ContactStatus = 'pending' | 'responded' | 'closed';

export interface StatusChangeEvent {
  id: string;
  contactFormId: string;
  fromStatus: ContactStatus;
  toStatus: ContactStatus;
  adminEmail: string;
  adminNote?: string;
  changedAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface ContactWithStatus {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  contactViaWhatsApp?: boolean;
  locale: string;
  createdAt: Date;
  updatedAt: Date;
  currentStatus: ContactStatus;
  statusHistory: StatusChangeEvent[];
}

export class ContactStatusService {
  // Status workflow rules
  private static readonly STATUS_TRANSITIONS: Record<ContactStatus, ContactStatus[]> = {
    pending: ['responded', 'closed'],
    responded: ['closed'],
    closed: [],
  };

  // Get contact with current status and history
  static async getContactWithStatus(contactId: string): Promise<ContactWithStatus | null> {
    const contact = await prisma.contactForm.findUnique({
      where: { id: contactId },
    });

    if (!contact) return null;

    const statusHistory = await this.getContactStatusHistory(contactId);
    const currentStatus = statusHistory[0]?.toStatus || 'pending';

    return {
      id: contact.id,
      fullName: contact.fullName,
      email: contact.email,
      phone: contact.phone || undefined,
      subject: contact.subject || undefined,
      message: contact.message,
      contactViaWhatsApp: contact.contactViaWhatsApp || undefined,
      locale: contact.locale,
      createdAt: contact.createdAt,
      updatedAt: contact.createdAt,
      currentStatus,
      statusHistory,
    };
  }

  // Update contact status with validation
  static async updateContactStatus(data: ContactStatusUpdate): Promise<StatusChangeEvent> {
    const currentStatus = await this.getCurrentContactStatus(data.contactId);

    if (!this.isValidStatusTransition(currentStatus, data.newStatus)) {
      throw new Error(
        `Invalid status transition from ${currentStatus} to ${data.newStatus}. ` +
        `Valid transitions: ${this.STATUS_TRANSITIONS[currentStatus].join(', ')}`
      );
    }

    // Create status change log
    const statusChange = await this.createStatusChangeLog({
      contactFormId: data.contactId,
      fromStatus: currentStatus,
      toStatus: data.newStatus,
      adminEmail: data.adminEmail,
      adminNote: data.adminNote,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    });

    return statusChange;
  }

  // Get current status of a contact
  static async getCurrentContactStatus(contactId: string): Promise<ContactStatus> {
    const latestStatusEvent = await prisma.analyticsEvent.findFirst({
      where: {
        eventName: 'contact_status_change',
        eventData: {
          path: ['contactFormId'],
          equals: contactId,
        },
      },
      orderBy: { timestamp: 'desc' },
    });

    if (!latestStatusEvent) return 'pending';

    const eventData = latestStatusEvent.eventData as any;
    return eventData.toStatus as ContactStatus;
  }

  // Get complete status history for a contact
  static async getContactStatusHistory(contactId: string): Promise<StatusChangeEvent[]> {
    const statusEvents = await prisma.analyticsEvent.findMany({
      where: {
        eventName: 'contact_status_change',
        eventData: {
          path: ['contactFormId'],
          equals: contactId,
        },
      },
      orderBy: { timestamp: 'desc' },
    });

    return statusEvents.map((event) => {
      const eventData = event.eventData as any;
      return {
        id: event.id,
        contactFormId: contactId,
        fromStatus: eventData.fromStatus as ContactStatus,
        toStatus: eventData.toStatus as ContactStatus,
        adminEmail: eventData.adminEmail,
        adminNote: eventData.adminNote,
        changedAt: event.timestamp,
        ipAddress: event.ipAddress || undefined,
        userAgent: event.userAgent || undefined,
      };
    });
  }

  // Get contacts by status with pagination
  static async getContactsByStatus(
    status: ContactStatus,
    limit: number = 50,
    offset: number = 0
  ): Promise<ContactWithStatus[]> {
    // Get all contacts
    const contacts = await prisma.contactForm.findMany({
      skip: offset,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    // Filter by current status
    const contactsWithStatus: ContactWithStatus[] = [];

    for (const contact of contacts) {
      const currentStatus = await this.getCurrentContactStatus(contact.id);

      if (currentStatus === status) {
        const statusHistory = await this.getContactStatusHistory(contact.id);

        contactsWithStatus.push({
          id: contact.id,
          fullName: contact.fullName,
          email: contact.email,
          phone: contact.phone || undefined,
          subject: contact.subject || undefined,
          message: contact.message,
          contactViaWhatsApp: contact.contactViaWhatsApp || undefined,
          locale: contact.locale,
          createdAt: contact.createdAt,
          updatedAt: contact.createdAt,
          currentStatus,
          statusHistory,
        });
      }
    }

    return contactsWithStatus;
  }

  // Get status statistics
  static async getStatusStatistics(): Promise<Record<ContactStatus, number>> {
    const stats: Record<ContactStatus, number> = {
      pending: 0,
      responded: 0,
      closed: 0,
    };

    // Get all contacts and check their current status
    const allContacts = await prisma.contactForm.findMany({
      select: { id: true },
    });

    for (const contact of allContacts) {
      const currentStatus = await this.getCurrentContactStatus(contact.id);
      stats[currentStatus]++;
    }

    return stats;
  }

  // Get available actions for a status
  static getAvailableActions(currentStatus: ContactStatus): ContactStatus[] {
    return this.STATUS_TRANSITIONS[currentStatus] || [];
  }

  // Validate status transition
  static isValidStatusTransition(fromStatus: ContactStatus, toStatus: ContactStatus): boolean {
    const validTransitions = this.STATUS_TRANSITIONS[fromStatus];
    return validTransitions ? validTransitions.includes(toStatus) : false;
  }

  // Private helper to create status change log
  private static async createStatusChangeLog(data: {
    contactFormId: string;
    fromStatus: ContactStatus;
    toStatus: ContactStatus;
    adminEmail: string;
    adminNote?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<StatusChangeEvent> {
    const logEntry = await prisma.analyticsEvent.create({
      data: {
        eventName: 'contact_status_change',
        eventData: {
          contactFormId: data.contactFormId,
          fromStatus: data.fromStatus,
          toStatus: data.toStatus,
          adminEmail: data.adminEmail,
          adminNote: data.adminNote,
          type: 'status_change',
        },
        pagePath: `/admin/contacts/${data.contactFormId}`,
        userAgent: data.userAgent,
        ipAddress: data.ipAddress,
        locale: 'en',
      },
    });

    return {
      id: logEntry.id,
      contactFormId: data.contactFormId,
      fromStatus: data.fromStatus,
      toStatus: data.toStatus,
      adminEmail: data.adminEmail,
      adminNote: data.adminNote,
      changedAt: logEntry.timestamp,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    };
  }

  // Bulk status update for multiple contacts
  static async bulkUpdateStatus(
    contactIds: string[],
    newStatus: ContactStatus,
    adminEmail: string,
    adminNote?: string
  ): Promise<StatusChangeEvent[]> {
    const results: StatusChangeEvent[] = [];

    for (const contactId of contactIds) {
      try {
        const statusChange = await this.updateContactStatus({
          contactId,
          newStatus,
          adminEmail,
          adminNote,
        });
        results.push(statusChange);
      } catch (error) {
        console.error(`Failed to update status for contact ${contactId}:`, error);
        // Continue with other contacts
      }
    }

    return results;
  }
}
