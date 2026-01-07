import { prisma } from '../database/prisma';
import { QuoteStatusService, QuoteStatus } from '../quotes/QuoteStatusService';
import { startOfDay, subDays, format } from 'date-fns';

export type TimeRange = '7d' | '30d' | '90d' | 'all';
export type GroupBy = 'day' | 'week' | 'month';

interface TimeSeriesData {
  date: string;
  count: number;
}

interface ServiceTypeData {
  serviceType: string;
  count: number;
}

interface StatusDistributionData {
  status: string;
  count: number;
}

interface RouteData {
  route: string;
  count: number;
}

export class AnalyticsService {
  /**
   * Get date filter for time range
   */
  private static getDateFilter(timeRange: TimeRange): Date | undefined {
    const now = new Date();

    switch (timeRange) {
      case '7d':
        return subDays(now, 7);
      case '30d':
        return subDays(now, 30);
      case '90d':
        return subDays(now, 90);
      case 'all':
        return undefined;
      default:
        return undefined;
    }
  }

  /**
   * Get quotes over time grouped by day/week/month
   */
  static async getQuotesOverTime(
    timeRange: TimeRange = '30d',
    groupBy: GroupBy = 'day'
  ): Promise<TimeSeriesData[]> {
    const dateFilter = this.getDateFilter(timeRange);

    const quotes = await prisma.quoteRequest.findMany({
      where: dateFilter
        ? {
            createdAt: {
              gte: dateFilter,
            },
          }
        : undefined,
      select: {
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Group quotes by date
    const grouped = quotes.reduce((acc, quote) => {
      let dateKey: string;

      if (groupBy === 'day') {
        dateKey = format(quote.createdAt, 'yyyy-MM-dd');
      } else if (groupBy === 'week') {
        dateKey = format(startOfDay(quote.createdAt), 'yyyy-MM-dd');
      } else {
        dateKey = format(quote.createdAt, 'yyyy-MM');
      }

      if (!acc[dateKey]) {
        acc[dateKey] = 0;
      }
      acc[dateKey]++;

      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Get quotes by service type
   */
  static async getQuotesByServiceType(timeRange: TimeRange = '30d'): Promise<ServiceTypeData[]> {
    const dateFilter = this.getDateFilter(timeRange);

    const quotes = await prisma.quoteRequest.groupBy({
      by: ['serviceType'],
      where: dateFilter
        ? {
            createdAt: {
              gte: dateFilter,
            },
          }
        : undefined,
      _count: {
        serviceType: true,
      },
    });

    return quotes.map((quote) => ({
      serviceType: quote.serviceType,
      count: quote._count.serviceType,
    }));
  }

  /**
   * Get status distribution
   */
  static async getStatusDistribution(timeRange: TimeRange = '30d'): Promise<StatusDistributionData[]> {
    const dateFilter = this.getDateFilter(timeRange);

    // Get all quotes in the time range
    const quotes = await prisma.quoteRequest.findMany({
      where: dateFilter
        ? {
            createdAt: {
              gte: dateFilter,
            },
          }
        : undefined,
      select: {
        id: true,
      },
    });

    // Get current status for each quote
    const statusCounts: Record<QuoteStatus, number> = {
      pending: 0,
      processing: 0,
      quoted: 0,
      converted: 0,
      closed: 0,
    };

    for (const quote of quotes) {
      const currentStatus = await QuoteStatusService.getCurrentQuoteStatus(quote.id);
      statusCounts[currentStatus]++;
    }

    return Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
    }));
  }

  /**
   * Get top routes (origin → destination pairs)
   */
  static async getTopRoutes(limit: number = 10, timeRange: TimeRange = '30d'): Promise<RouteData[]> {
    const dateFilter = this.getDateFilter(timeRange);

    const quotes = await prisma.quoteRequest.findMany({
      where: dateFilter
        ? {
            createdAt: {
              gte: dateFilter,
            },
          }
        : undefined,
      select: {
        origin: true,
        destination: true,
      },
    });

    // Group by route
    const routeCounts = quotes.reduce((acc, quote) => {
      const route = `${quote.origin} → ${quote.destination}`;
      if (!acc[route]) {
        acc[route] = 0;
      }
      acc[route]++;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(routeCounts)
      .map(([route, count]) => ({ route, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * Calculate conversion rate (converted / quoted * 100)
   */
  static async getConversionRate(timeRange: TimeRange = '30d'): Promise<number> {
    const dateFilter = this.getDateFilter(timeRange);

    const quotes = await prisma.quoteRequest.findMany({
      where: dateFilter
        ? {
            createdAt: {
              gte: dateFilter,
            },
          }
        : undefined,
      select: {
        id: true,
      },
    });

    let quotedCount = 0;
    let convertedCount = 0;

    for (const quote of quotes) {
      const currentStatus = await QuoteStatusService.getCurrentQuoteStatus(quote.id);

      if (currentStatus === 'quoted' || currentStatus === 'converted') {
        quotedCount++;
      }

      if (currentStatus === 'converted') {
        convertedCount++;
      }
    }

    if (quotedCount === 0) {
      return 0;
    }

    return (convertedCount / quotedCount) * 100;
  }

  /**
   * Calculate average response time (hours from pending → quoted)
   */
  static async getAverageResponseTime(timeRange: TimeRange = '30d'): Promise<number> {
    const dateFilter = this.getDateFilter(timeRange);

    // Get all status change events for quotes in time range
    const statusEvents = await prisma.analyticsEvent.findMany({
      where: {
        eventName: 'quote_status_change',
        timestamp: dateFilter
          ? {
              gte: dateFilter,
            }
          : undefined,
      },
      select: {
        eventData: true,
        timestamp: true,
      },
      orderBy: {
        timestamp: 'asc',
      },
    });

    // Group events by quote ID
    const quoteEvents: Record<string, any[]> = {};

    for (const event of statusEvents) {
      const eventData = event.eventData as any;
      const quoteId = eventData.quoteRequestId;

      if (!quoteEvents[quoteId]) {
        quoteEvents[quoteId] = [];
      }

      quoteEvents[quoteId].push({
        fromStatus: eventData.fromStatus,
        toStatus: eventData.toStatus,
        timestamp: event.timestamp,
      });
    }

    // Calculate response times (pending → quoted)
    const responseTimes: number[] = [];

    for (const quoteId in quoteEvents) {
      const events = quoteEvents[quoteId];

      // Find the first pending event
      const pendingEvent = events.find((e) => e.fromStatus === 'pending');
      // Find the first quoted event
      const quotedEvent = events.find((e) => e.toStatus === 'quoted');

      if (pendingEvent && quotedEvent) {
        const timeDiff = quotedEvent.timestamp.getTime() - pendingEvent.timestamp.getTime();
        const hours = timeDiff / (1000 * 60 * 60);
        responseTimes.push(hours);
      }
    }

    if (responseTimes.length === 0) {
      return 0;
    }

    const totalHours = responseTimes.reduce((sum, hours) => sum + hours, 0);
    return totalHours / responseTimes.length;
  }

  /**
   * Get total quote count
   */
  static async getTotalQuotes(timeRange: TimeRange = '30d'): Promise<number> {
    const dateFilter = this.getDateFilter(timeRange);

    return await prisma.quoteRequest.count({
      where: dateFilter
        ? {
            createdAt: {
              gte: dateFilter,
            },
          }
        : undefined,
    });
  }

  /**
   * Get most popular route
   */
  static async getMostPopularRoute(timeRange: TimeRange = '30d'): Promise<string> {
    const topRoutes = await this.getTopRoutes(1, timeRange);

    if (topRoutes.length === 0) {
      return 'N/A';
    }

    return topRoutes[0].route;
  }
}
