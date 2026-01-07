import { prisma } from '../database/prisma';

export interface QuoteStatusUpdate {
  quoteId: string;
  newStatus: QuoteStatus;
  adminEmail: string;
  adminNote?: string;
  ipAddress?: string;
  userAgent?: string;
}

export type QuoteStatus = 'new_request' | 'reviewing' | 'quote_sent' | 'awaiting_confirmation' | 'confirmed' | 'payment_pending' | 'paid' | 'completed' | 'cancelled';

export interface StatusChangeEvent {
  id: string;
  quoteRequestId: string;
  fromStatus: QuoteStatus;
  toStatus: QuoteStatus;
  adminEmail: string;
  adminNote?: string;
  changedAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface QuoteWithStatus {
  id: string;
  serviceType: string;
  fullName: string;
  email: string;
  phone?: string;
  passengers: number;
  origin: string;
  destination: string;
  departureDate: Date;
  departureTime: string;
  locale: string;
  createdAt: Date;
  updatedAt: Date;
  currentStatus: QuoteStatus;
  statusHistory: StatusChangeEvent[];
}

export class QuoteStatusService {

  // Status workflow rules - allows skipping intermediate statuses
  private static readonly STATUS_TRANSITIONS: Record<QuoteStatus, QuoteStatus[]> = {
    new_request: ['reviewing', 'quote_sent', 'awaiting_confirmation', 'confirmed', 'payment_pending', 'paid', 'completed', 'cancelled'],
    reviewing: ['quote_sent', 'awaiting_confirmation', 'confirmed', 'payment_pending', 'paid', 'completed', 'cancelled'],
    quote_sent: ['awaiting_confirmation', 'confirmed', 'payment_pending', 'paid', 'completed', 'cancelled'],
    awaiting_confirmation: ['confirmed', 'payment_pending', 'paid', 'completed', 'cancelled'],
    confirmed: ['payment_pending', 'paid', 'completed', 'cancelled'],
    payment_pending: ['paid', 'completed', 'cancelled'],
    paid: ['completed', 'cancelled'],
    completed: [],
    cancelled: []
  };

  // Get quote with current status and history
  static async getQuoteWithStatus(quoteId: string): Promise<QuoteWithStatus | null> {
    const quote = await prisma.quoteRequest.findUnique({
      where: { id: quoteId }
    });

    if (!quote) return null;

    const statusHistory = await this.getQuoteStatusHistory(quoteId);
    const currentStatus = statusHistory[0]?.toStatus || 'new_request';

    return {
      id: quote.id,
      serviceType: quote.serviceType,
      fullName: quote.fullName,
      email: quote.email,
      phone: quote.phone || undefined,
      passengers: quote.passengers,
      origin: quote.origin,
      destination: quote.destination,
      departureDate: quote.departureDate,
      departureTime: quote.departureTime,
      locale: quote.locale,
      createdAt: quote.createdAt,
      updatedAt: quote.updatedAt,
      currentStatus,
      statusHistory
    };
  }

  // Update quote status with validation
  static async updateQuoteStatus(data: QuoteStatusUpdate): Promise<StatusChangeEvent> {
    const currentStatus = await this.getCurrentQuoteStatus(data.quoteId);

    if (!this.isValidStatusTransition(currentStatus, data.newStatus)) {
      throw new Error(
        `Invalid status transition from ${currentStatus} to ${data.newStatus}. ` +
        `Valid transitions: ${this.STATUS_TRANSITIONS[currentStatus].join(', ')}`
      );
    }

    // Create status change log
    const statusChange = await this.createStatusChangeLog({
      quoteRequestId: data.quoteId,
      fromStatus: currentStatus,
      toStatus: data.newStatus,
      adminEmail: data.adminEmail,
      adminNote: data.adminNote,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent
    });

    // Update quote timestamp
    await prisma.quoteRequest.update({
      where: { id: data.quoteId },
      data: { updatedAt: new Date() }
    });

    return statusChange;
  }

  // Get current status of a quote
  static async getCurrentQuoteStatus(quoteId: string): Promise<QuoteStatus> {
    const latestStatusEvent = await prisma.analyticsEvent.findFirst({
      where: {
        eventName: 'quote_status_change',
        eventData: {
          path: ['quoteRequestId'],
          equals: quoteId
        }
      },
      orderBy: { timestamp: 'desc' }
    });

    if (!latestStatusEvent) return 'new_request';

    const eventData = latestStatusEvent.eventData as any;
    return eventData.toStatus as QuoteStatus;
  }

  // Get complete status history for a quote
  static async getQuoteStatusHistory(quoteId: string): Promise<StatusChangeEvent[]> {
    const statusEvents = await prisma.analyticsEvent.findMany({
      where: {
        eventName: 'quote_status_change',
        eventData: {
          path: ['quoteRequestId'],
          equals: quoteId
        }
      },
      orderBy: { timestamp: 'desc' }
    });

    return statusEvents.map(event => {
      const eventData = event.eventData as any;
      return {
        id: event.id,
        quoteRequestId: quoteId,
        fromStatus: eventData.fromStatus as QuoteStatus,
        toStatus: eventData.toStatus as QuoteStatus,
        adminEmail: eventData.adminEmail,
        adminNote: eventData.adminNote,
        changedAt: event.timestamp,
        ipAddress: event.ipAddress || undefined,
        userAgent: event.userAgent || undefined
      };
    });
  }

  // Get quotes by status with pagination
  static async getQuotesByStatus(
    status: QuoteStatus,
    limit: number = 50,
    offset: number = 0
  ): Promise<QuoteWithStatus[]> {

    // Get all quotes
    const quotes = await prisma.quoteRequest.findMany({
      skip: offset,
      take: limit,
      orderBy: { createdAt: 'desc' }
    });

    // Filter by current status
    const quotesWithStatus: QuoteWithStatus[] = [];

    for (const quote of quotes) {
      const currentStatus = await this.getCurrentQuoteStatus(quote.id);

      if (currentStatus === status) {
        const statusHistory = await this.getQuoteStatusHistory(quote.id);

        quotesWithStatus.push({
          id: quote.id,
          serviceType: quote.serviceType,
          fullName: quote.fullName,
          email: quote.email,
          phone: quote.phone || undefined,
          passengers: quote.passengers,
          origin: quote.origin,
          destination: quote.destination,
          departureDate: quote.departureDate,
          departureTime: quote.departureTime,
          locale: quote.locale,
          createdAt: quote.createdAt,
          updatedAt: quote.updatedAt,
          currentStatus,
          statusHistory
        });
      }
    }

    return quotesWithStatus;
  }

  // Get status statistics
  static async getStatusStatistics(): Promise<Record<QuoteStatus, number>> {
    const stats: Record<QuoteStatus, number> = {
      new_request: 0,
      reviewing: 0,
      quote_sent: 0,
      awaiting_confirmation: 0,
      confirmed: 0,
      payment_pending: 0,
      paid: 0,
      completed: 0,
      cancelled: 0
    };

    // Get all quotes and check their current status
    const allQuotes = await prisma.quoteRequest.findMany({
      select: { id: true }
    });

    for (const quote of allQuotes) {
      const currentStatus = await this.getCurrentQuoteStatus(quote.id);
      stats[currentStatus]++;
    }

    return stats;
  }

  // Get available actions for a status
  static getAvailableActions(currentStatus: QuoteStatus): QuoteStatus[] {
    return this.STATUS_TRANSITIONS[currentStatus] || [];
  }

  // Validate status transition
  static isValidStatusTransition(fromStatus: QuoteStatus, toStatus: QuoteStatus): boolean {
    const validTransitions = this.STATUS_TRANSITIONS[fromStatus];
    return validTransitions ? validTransitions.includes(toStatus) : false;
  }

  // Private helper to create status change log
  private static async createStatusChangeLog(data: {
    quoteRequestId: string;
    fromStatus: QuoteStatus;
    toStatus: QuoteStatus;
    adminEmail: string;
    adminNote?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<StatusChangeEvent> {

    const logEntry = await prisma.analyticsEvent.create({
      data: {
        eventName: 'quote_status_change',
        eventData: {
          quoteRequestId: data.quoteRequestId,
          fromStatus: data.fromStatus,
          toStatus: data.toStatus,
          adminEmail: data.adminEmail,
          adminNote: data.adminNote,
          type: 'status_change'
        },
        pagePath: `/admin/quotes/${data.quoteRequestId}`,
        userAgent: data.userAgent,
        ipAddress: data.ipAddress,
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

  // Bulk status update for multiple quotes
  static async bulkUpdateStatus(
    quoteIds: string[],
    newStatus: QuoteStatus,
    adminEmail: string,
    adminNote?: string
  ): Promise<StatusChangeEvent[]> {
    const results: StatusChangeEvent[] = [];

    for (const quoteId of quoteIds) {
      try {
        const statusChange = await this.updateQuoteStatus({
          quoteId,
          newStatus,
          adminEmail,
          adminNote
        });
        results.push(statusChange);
      } catch (error) {
        console.error(`Failed to update status for quote ${quoteId}:`, error);
        // Continue with other quotes
      }
    }

    return results;
  }

  // Get quotes needing attention (stale statuses)
  static async getStaleQuotes(daysOld: number = 7): Promise<QuoteWithStatus[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const quotes = await prisma.quoteRequest.findMany({
      where: {
        createdAt: {
          lt: cutoffDate
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    const staleQuotes: QuoteWithStatus[] = [];

    for (const quote of quotes) {
      const currentStatus = await this.getCurrentQuoteStatus(quote.id);

      // Consider quotes stale if they're in early stages after the cutoff
      if (currentStatus === 'new_request' || currentStatus === 'reviewing' ||
          currentStatus === 'quote_sent' || currentStatus === 'awaiting_confirmation') {
        const statusHistory = await this.getQuoteStatusHistory(quote.id);

        staleQuotes.push({
          id: quote.id,
          serviceType: quote.serviceType,
          fullName: quote.fullName,
          email: quote.email,
          phone: quote.phone || undefined,
          passengers: quote.passengers,
          origin: quote.origin,
          destination: quote.destination,
          departureDate: quote.departureDate,
          departureTime: quote.departureTime,
          locale: quote.locale,
          createdAt: quote.createdAt,
          updatedAt: quote.updatedAt,
          currentStatus,
          statusHistory
        });
      }
    }

    return staleQuotes;
  }
}