'use client';

import React, { useState, useEffect } from 'react';
import { ChartCard } from '@/components/admin/ChartCard';
import { StatsCard } from '@/components/admin/StatsCard';
import { TimeRange } from '@/lib/analytics/AnalyticsService';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface OverviewData {
  totalQuotes: number;
  conversionRate: number;
  avgResponseTime: number;
  mostPopularRoute: string;
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [loading, setLoading] = useState(true);

  // Overview metrics
  const [overviewData, setOverviewData] = useState<OverviewData>({
    totalQuotes: 0,
    conversionRate: 0,
    avgResponseTime: 0,
    mostPopularRoute: 'N/A',
  });

  // Chart data
  const [quotesOverTime, setQuotesOverTime] = useState<any[]>([]);
  const [quotesByServiceType, setQuotesByServiceType] = useState<any[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<any[]>([]);
  const [topRoutes, setTopRoutes] = useState<any[]>([]);

  // Fetch overview data
  useEffect(() => {
    fetchOverviewData();
  }, [timeRange]);

  const fetchOverviewData = async () => {
    setLoading(true);
    try {
      // Fetch overview metrics
      const overviewResponse = await fetch(`/api/admin/analytics?metric=overview&timeRange=${timeRange}`);
      if (overviewResponse.ok) {
        const overviewResult = await overviewResponse.json();
        setOverviewData(overviewResult.data);
      }

      // Fetch charts data in parallel
      const [quotesTimeRes, serviceTypeRes, statusDistRes, routesRes] = await Promise.all([
        fetch(`/api/admin/analytics?metric=quotes_over_time&timeRange=${timeRange}&groupBy=day`),
        fetch(`/api/admin/analytics?metric=quotes_by_service_type&timeRange=${timeRange}`),
        fetch(`/api/admin/analytics?metric=status_distribution&timeRange=${timeRange}`),
        fetch(`/api/admin/analytics?metric=top_routes&timeRange=${timeRange}&limit=10`),
      ]);

      if (quotesTimeRes.ok) {
        const data = await quotesTimeRes.json();
        setQuotesOverTime(data.data);
      }

      if (serviceTypeRes.ok) {
        const data = await serviceTypeRes.json();
        setQuotesByServiceType(data.data);
      }

      if (statusDistRes.ok) {
        const data = await statusDistRes.json();
        setStatusDistribution(data.data);
      }

      if (routesRes.ok) {
        const data = await routesRes.json();
        setTopRoutes(data.data);
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Export functions
  const exportQuotesOverTime = () => {
    const csv = [
      ['Date', 'Count'],
      ...quotesOverTime.map((item) => [item.date, item.count]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    downloadCSV(csv, `quotes-over-time-${timeRange}.csv`);
  };

  const exportQuotesByServiceType = () => {
    const csv = [
      ['Service Type', 'Count'],
      ...quotesByServiceType.map((item) => [item.serviceType, item.count]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    downloadCSV(csv, `quotes-by-service-type-${timeRange}.csv`);
  };

  const exportStatusDistribution = () => {
    const csv = [
      ['Status', 'Count'],
      ...statusDistribution.map((item) => [item.status, item.count]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    downloadCSV(csv, `status-distribution-${timeRange}.csv`);
  };

  const exportTopRoutes = () => {
    const csv = [
      ['Route', 'Count'],
      ...topRoutes.map((item) => [item.route, item.count]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    downloadCSV(csv, `top-routes-${timeRange}.csv`);
  };

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Chart colors
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];

  // Status colors
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: '#F59E0B',
      processing: '#3B82F6',
      quoted: '#8B5CF6',
      converted: '#10B981',
      closed: '#6B7280',
    };
    return colors[status] || '#6B7280';
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Business metrics and insights for quote performance
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Quotes"
          value={overviewData.totalQuotes.toLocaleString()}
          icon={
            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
          loading={loading}
        />

        <StatsCard
          title="Conversion Rate"
          value={`${overviewData.conversionRate.toFixed(1)}%`}
          icon={
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
          loading={loading}
        />

        <StatsCard
          title="Avg Response Time"
          value={overviewData.avgResponseTime > 0 ? `${overviewData.avgResponseTime.toFixed(1)}h` : 'N/A'}
          icon={
            <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          loading={loading}
        />

        <StatsCard
          title="Most Popular Route"
          value={overviewData.mostPopularRoute}
          icon={
            <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
          loading={loading}
        />
      </div>

      {/* Charts Grid */}
      <div className="space-y-8">
        {/* Quotes Over Time */}
        <ChartCard
          title="Quotes Over Time"
          description="Track quote volume trends"
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
          onExport={exportQuotesOverTime}
          loading={loading}
        >
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={quotesOverTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="count"
                name="Quotes"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ fill: '#3B82F6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Quotes by Service Type & Status Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Service Type */}
          <ChartCard
            title="Quotes by Service Type"
            description="Distribution across service categories"
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
            onExport={exportQuotesByServiceType}
            loading={loading}
          >
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={quotesByServiceType}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="serviceType" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="Quotes" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Status Distribution */}
          <ChartCard
            title="Status Distribution"
            description="Current status breakdown"
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
            onExport={exportStatusDistribution}
            loading={loading}
          >
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry: any) => `${entry.status}: ${entry.count}`}
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getStatusColor(entry.status)} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Top Routes */}
        <ChartCard
          title="Top 10 Routes"
          description="Most requested flight routes"
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
          onExport={exportTopRoutes}
          loading={loading}
        >
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={topRoutes} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="route" type="category" width={200} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" name="Quotes" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
