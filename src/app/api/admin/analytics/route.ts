import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/server';
import { AnalyticsService, TimeRange, GroupBy } from '@/lib/analytics/AnalyticsService';

// GET /api/admin/analytics - Get analytics data
export async function GET(req: NextRequest) {
  // Check authentication
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { searchParams } = new URL(req.url);

    const metric = searchParams.get('metric');
    const timeRange = (searchParams.get('timeRange') || '30d') as TimeRange;
    const groupBy = (searchParams.get('groupBy') || 'day') as GroupBy;
    const limit = parseInt(searchParams.get('limit') || '10');

    // Validate time range
    const validTimeRanges: TimeRange[] = ['7d', '30d', '90d', 'all'];
    if (!validTimeRanges.includes(timeRange)) {
      return NextResponse.json(
        { error: 'Invalid time range', validTimeRanges },
        { status: 400 }
      );
    }

    // Validate group by
    const validGroupBy: GroupBy[] = ['day', 'week', 'month'];
    if (groupBy && !validGroupBy.includes(groupBy)) {
      return NextResponse.json(
        { error: 'Invalid groupBy', validGroupBy },
        { status: 400 }
      );
    }

    // Handle different metric types
    switch (metric) {
      case 'quotes_over_time': {
        const data = await AnalyticsService.getQuotesOverTime(timeRange, groupBy);
        return NextResponse.json({
          success: true,
          metric: 'quotes_over_time',
          timeRange,
          groupBy,
          data,
          timestamp: new Date().toISOString(),
        });
      }

      case 'quotes_by_service_type': {
        const data = await AnalyticsService.getQuotesByServiceType(timeRange);
        return NextResponse.json({
          success: true,
          metric: 'quotes_by_service_type',
          timeRange,
          data,
          timestamp: new Date().toISOString(),
        });
      }

      case 'status_distribution': {
        const data = await AnalyticsService.getStatusDistribution(timeRange);
        return NextResponse.json({
          success: true,
          metric: 'status_distribution',
          timeRange,
          data,
          timestamp: new Date().toISOString(),
        });
      }

      case 'top_routes': {
        const data = await AnalyticsService.getTopRoutes(limit, timeRange);
        return NextResponse.json({
          success: true,
          metric: 'top_routes',
          timeRange,
          limit,
          data,
          timestamp: new Date().toISOString(),
        });
      }

      case 'conversion_rate': {
        const rate = await AnalyticsService.getConversionRate(timeRange);
        return NextResponse.json({
          success: true,
          metric: 'conversion_rate',
          timeRange,
          data: { rate },
          timestamp: new Date().toISOString(),
        });
      }

      case 'avg_response_time': {
        const hours = await AnalyticsService.getAverageResponseTime(timeRange);
        return NextResponse.json({
          success: true,
          metric: 'avg_response_time',
          timeRange,
          data: { hours },
          timestamp: new Date().toISOString(),
        });
      }

      case 'total_quotes': {
        const total = await AnalyticsService.getTotalQuotes(timeRange);
        return NextResponse.json({
          success: true,
          metric: 'total_quotes',
          timeRange,
          data: { total },
          timestamp: new Date().toISOString(),
        });
      }

      case 'most_popular_route': {
        const route = await AnalyticsService.getMostPopularRoute(timeRange);
        return NextResponse.json({
          success: true,
          metric: 'most_popular_route',
          timeRange,
          data: { route },
          timestamp: new Date().toISOString(),
        });
      }

      case 'overview': {
        // Get all overview metrics at once for dashboard
        const [totalQuotes, conversionRate, avgResponseTime, mostPopularRoute] = await Promise.all([
          AnalyticsService.getTotalQuotes(timeRange),
          AnalyticsService.getConversionRate(timeRange),
          AnalyticsService.getAverageResponseTime(timeRange),
          AnalyticsService.getMostPopularRoute(timeRange),
        ]);

        return NextResponse.json({
          success: true,
          metric: 'overview',
          timeRange,
          data: {
            totalQuotes,
            conversionRate,
            avgResponseTime,
            mostPopularRoute,
          },
          timestamp: new Date().toISOString(),
        });
      }

      default: {
        return NextResponse.json(
          {
            error: 'Invalid metric',
            availableMetrics: [
              'quotes_over_time',
              'quotes_by_service_type',
              'status_distribution',
              'top_routes',
              'conversion_rate',
              'avg_response_time',
              'total_quotes',
              'most_popular_route',
              'overview',
            ],
          },
          { status: 400 }
        );
      }
    }
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
