import Link from 'next/link';
import { StatsCard } from '@/components/admin/StatsCard';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { QuoteStatusService } from '@/lib/quotes/QuoteStatusService';
import { prisma } from '@/lib/database/prisma';

export const revalidate = 60; // Revalidate every 60 seconds

async function getDashboardStats() {
  try {
    // Get quote statistics
    const statusStats = await QuoteStatusService.getStatusStatistics();
    const totalQuotes = Object.values(statusStats).reduce((sum, count) => sum + count, 0);
    const pendingQuotes = statusStats.pending || 0;

    // Calculate conversion rate (converted / quoted * 100)
    const conversionRate = statusStats.quoted > 0
      ? ((statusStats.converted / statusStats.quoted) * 100).toFixed(1)
      : '0.0';

    // Get stale quotes (>7 days pending/processing)
    const staleQuotes = await QuoteStatusService.getStaleQuotes(7);

    // Get recent quotes (5 latest)
    const recentQuotes = await prisma.quoteRequest.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fullName: true,
        email: true,
        origin: true,
        destination: true,
        createdAt: true,
      },
    });

    // Add current status to recent quotes
    const recentQuotesWithStatus = await Promise.all(
      recentQuotes.map(async (quote) => ({
        ...quote,
        currentStatus: await QuoteStatusService.getCurrentQuoteStatus(quote.id),
      }))
    );

    // Get recent contacts (5 latest)
    const recentContacts = await prisma.contactForm.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fullName: true,
        email: true,
        subject: true,
        createdAt: true,
      },
    });

    // Get email stats
    const emailStatsResponse = await fetch(
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/admin/email-stats`,
      { cache: 'no-store' }
    );
    const emailStats = emailStatsResponse.ok ? await emailStatsResponse.json() : null;

    // Calculate average response time (simplified - would need status change events for accuracy)
    const avgResponseTime = '2.5'; // Placeholder - would calculate from status change events

    return {
      totalQuotes,
      pendingQuotes,
      conversionRate,
      avgResponseTime,
      staleQuotes,
      recentQuotesWithStatus,
      recentContacts,
      emailStats,
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return null;
  }
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  if (!stats) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading dashboard statistics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Welcome back! Here's what's happening with your quotes and contacts.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatsCard
          title="Total Quotes"
          value={stats.totalQuotes.toLocaleString()}
          icon={
            <svg className="h-6 w-6 text-navy-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
        <StatsCard
          title="Pending Quotes"
          value={stats.pendingQuotes.toLocaleString()}
          icon={
            <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatsCard
          title="Conversion Rate"
          value={`${stats.conversionRate}%`}
          icon={
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
        />
        <StatsCard
          title="Avg Response Time"
          value={`${stats.avgResponseTime}h`}
          icon={
            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Stale Quotes Alert */}
      {stats.staleQuotes.length > 0 && (
        <div className="mb-8 bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Stale Quotes Alert
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  You have {stats.staleQuotes.length} quote{stats.staleQuotes.length !== 1 ? 's' : ''} that{' '}
                  {stats.staleQuotes.length === 1 ? 'has' : 'have'} been pending for more than 7 days.{' '}
                  <Link href="/admin/quotes?staleOnly=true" className="font-medium underline hover:text-yellow-600">
                    View stale quotes →
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Quotes */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Quotes</h2>
          <Link
            href="/admin/quotes"
            className="text-sm font-medium text-navy-primary hover:text-navy-primary/80 transition-colors"
          >
            View all →
          </Link>
        </div>
        <div className="bg-white shadow border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Route
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.recentQuotesWithStatus.map((quote) => (
                <tr key={quote.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{quote.fullName}</div>
                    <div className="text-sm text-gray-500">{quote.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {quote.origin} → {quote.destination}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={quote.currentStatus} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(quote.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Contacts */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Contacts</h2>
          <Link
            href="/admin/contacts"
            className="text-sm font-medium text-navy-primary hover:text-navy-primary/80 transition-colors"
          >
            View all →
          </Link>
        </div>
        <div className="bg-white shadow border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.recentContacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {contact.fullName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {contact.email}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">
                    {contact.subject || 'No subject'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(contact.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Email Status Summary */}
      {stats.emailStats && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Email Status Summary</h2>
            <Link
              href="/admin/emails"
              className="text-sm font-medium text-navy-primary hover:text-navy-primary/80 transition-colors"
            >
              View details →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
            <div className="bg-white shadow border border-gray-200 rounded-lg p-6">
              <p className="text-sm font-medium text-gray-600">Total Sent</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">
                {stats.emailStats.totalSent?.toLocaleString() || 0}
              </p>
            </div>
            <div className="bg-white shadow border border-gray-200 rounded-lg p-6">
              <p className="text-sm font-medium text-gray-600">Delivered</p>
              <p className="mt-2 text-3xl font-semibold text-green-600">
                {stats.emailStats.delivered?.toLocaleString() || 0}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {stats.emailStats.deliveryRate?.toFixed(1) || 0}% success
              </p>
            </div>
            <div className="bg-white shadow border border-gray-200 rounded-lg p-6">
              <p className="text-sm font-medium text-gray-600">Bounced</p>
              <p className="mt-2 text-3xl font-semibold text-red-600">
                {stats.emailStats.bounced?.toLocaleString() || 0}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {stats.emailStats.bounceRate?.toFixed(1) || 0}% rate
              </p>
            </div>
            <div className="bg-white shadow border border-gray-200 rounded-lg p-6">
              <p className="text-sm font-medium text-gray-600">Failed</p>
              <p className="mt-2 text-3xl font-semibold text-red-600">
                {stats.emailStats.failed?.toLocaleString() || 0}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
