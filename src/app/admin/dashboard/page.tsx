import Link from 'next/link';
import { StatsCard } from '@/components/admin/StatsCard';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { SeedTestDataButton } from '@/components/admin/SeedTestDataButton';
import { QuoteStatusService } from '@/lib/quotes/QuoteStatusService';
import { prisma } from '@/lib/database/prisma';

export const revalidate = 60; // Revalidate every 60 seconds

async function getDashboardStats() {
  try {
    // Get quote statistics
    const statusStats = await QuoteStatusService.getStatusStatistics();
    const totalQuotes = Object.values(statusStats).reduce((sum, count) => sum + count, 0);
    const newRequests = statusStats.new_request || 0;
    const paymentPending = statusStats.payment_pending || 0;
    const awaitingConfirmation = statusStats.awaiting_confirmation || 0;

    // Calculate conversion rate (completed / quote_sent * 100)
    const quoteSent = statusStats.quote_sent || 0;
    const completed = statusStats.completed || 0;
    const conversionRate = quoteSent > 0
      ? ((completed / quoteSent) * 100).toFixed(1)
      : '0.0';

    // Get stale quotes (>7 days in early stages)
    const staleQuotes = await QuoteStatusService.getStaleQuotes(7);

    // Get urgent alerts
    const urgentAlerts = {
      paymentPending,
      awaitingConfirmation,
      newRequests,
      staleCount: staleQuotes.length,
    };

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

    // Get email stats directly from database
    const emailStats = await prisma.emailDelivery.aggregate({
      _count: {
        id: true,
      },
      where: {
        status: {
          in: ['sent', 'delivered', 'bounced', 'failed'],
        },
      },
    });

    const deliveredCount = await prisma.emailDelivery.count({
      where: { status: 'delivered' },
    });

    const bouncedCount = await prisma.emailDelivery.count({
      where: { status: 'bounced' },
    });

    const failedCount = await prisma.emailDelivery.count({
      where: { status: 'failed' },
    });

    const totalSent = emailStats._count.id;
    const deliveryRate = totalSent > 0 ? ((deliveredCount / totalSent) * 100).toFixed(1) : '0.0';
    const bounceRate = totalSent > 0 ? ((bouncedCount / totalSent) * 100).toFixed(1) : '0.0';

    // Calculate average response time (simplified - would need status change events for accuracy)
    const avgResponseTime = '2.5'; // Placeholder - would calculate from status change events

    return {
      totalQuotes,
      newRequests,
      paymentPending,
      conversionRate,
      avgResponseTime,
      urgentAlerts,
      staleQuotes,
      recentQuotesWithStatus,
      recentContacts,
      emailStats: {
        totalSent,
        delivered: deliveredCount,
        bounced: bouncedCount,
        failed: failedCount,
        deliveryRate: parseFloat(deliveryRate),
        bounceRate: parseFloat(bounceRate),
      },
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
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start">
            <svg className="h-6 w-6 text-red-600 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-red-900 mb-1">Error Loading Dashboard</h3>
              <p className="text-red-700 text-sm">
                Unable to load dashboard statistics. Please check your database connection and try refreshing the page.
              </p>
              <a
                href="/admin/dashboard"
                className="mt-4 inline-block px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Refresh Dashboard
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const hasUrgentItems =
    stats.urgentAlerts.paymentPending > 0 ||
    stats.urgentAlerts.awaitingConfirmation > 0 ||
    stats.urgentAlerts.newRequests > 0 ||
    stats.urgentAlerts.staleCount > 0;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 shadow-md">
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 010 2H6v2a1 1 0 01-2 0V5zM4 13a1 1 0 011-1h2a1 1 0 110 2H5a1 1 0 01-1-1zM4 17a1 1 0 011-1h2a1 1 0 110 2H5a1 1 0 01-1-1zM12 3a1 1 0 011 1v2a1 1 0 11-2 0V4a1 1 0 011-1zM16 3a1 1 0 011 1v2a1 1 0 11-2 0V4a1 1 0 011-1zM20 5a1 1 0 00-1-1h-4a1 1 0 000 2h3v2a1 1 0 102 0V5zM20 13a1 1 0 00-1-1h-2a1 1 0 100 2h2a1 1 0 001-1zM20 17a1 1 0 00-1-1h-2a1 1 0 100 2h2a1 1 0 001-1z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-1 text-sm text-gray-600">
              Welcome back! Here's what's happening with your business.
            </p>
          </div>
        </div>
      </div>

      {/* Test Data Seeder */}
      {stats.totalQuotes === 0 && (
        <div className="mb-8">
          <SeedTestDataButton />
        </div>
      )}

      {/* Urgent Alerts Banner */}
      {hasUrgentItems && (
        <div className="mb-8 bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-orange-500 rounded-lg shadow-sm">
          <div className="p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-orange-900 mb-3">
                  Urgent Actions Required
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {stats.urgentAlerts.paymentPending > 0 && (
                    <Link
                      href="/admin/quotes?status=payment_pending"
                      className="bg-white rounded-lg p-4 border-2 border-orange-200 hover:border-orange-400 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Payment Pending</p>
                          <p className="text-2xl font-bold text-orange-600 mt-1">
                            {stats.urgentAlerts.paymentPending}
                          </p>
                        </div>
                        <svg className="h-8 w-8 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </Link>
                  )}
                  {stats.urgentAlerts.awaitingConfirmation > 0 && (
                    <Link
                      href="/admin/quotes?status=awaiting_confirmation"
                      className="bg-white rounded-lg p-4 border-2 border-yellow-200 hover:border-yellow-400 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Awaiting Confirmation</p>
                          <p className="text-2xl font-bold text-yellow-600 mt-1">
                            {stats.urgentAlerts.awaitingConfirmation}
                          </p>
                        </div>
                        <svg className="h-8 w-8 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </Link>
                  )}
                  {stats.urgentAlerts.newRequests > 0 && (
                    <Link
                      href="/admin/quotes?status=new_request"
                      className="bg-white rounded-lg p-4 border-2 border-blue-200 hover:border-blue-400 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">New Requests</p>
                          <p className="text-2xl font-bold text-blue-600 mt-1">
                            {stats.urgentAlerts.newRequests}
                          </p>
                        </div>
                        <svg className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    </Link>
                  )}
                  {stats.urgentAlerts.staleCount > 0 && (
                    <Link
                      href="/admin/quotes?stale=true"
                      className="bg-white rounded-lg p-4 border-2 border-red-200 hover:border-red-400 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Stale Quotes (7+ days)</p>
                          <p className="text-2xl font-bold text-red-600 mt-1">
                            {stats.urgentAlerts.staleCount}
                          </p>
                        </div>
                        <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
          title="New Requests"
          value={stats.newRequests.toLocaleString()}
          icon={
            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatsCard
          title="Payment Pending"
          value={stats.paymentPending.toLocaleString()}
          icon={
            <svg className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
      </div>

      {/* Remove old stale quotes alert since it's now in the urgent banner */}
      {false && stats.staleQuotes.length > 0 && (
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
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h2 className="text-lg font-bold text-gray-900">Recent Quotes</h2>
          </div>
          <Link
            href="/admin/quotes"
            className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            View all
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
          {stats.recentQuotesWithStatus.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No quotes yet</h3>
              <p className="mt-2 text-sm text-gray-500">
                Quote requests will appear here once customers submit them.
              </p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Customer
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Route
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {stats.recentQuotesWithStatus.map((quote) => (
                  <tr key={quote.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">{quote.fullName}</div>
                      <div className="text-xs text-gray-500">{quote.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <span className="font-medium">{quote.origin}</span>
                        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                        <span className="font-medium">{quote.destination}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={quote.currentStatus} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(quote.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Recent Contacts */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>
            <h2 className="text-lg font-bold text-gray-900">Recent Contacts</h2>
          </div>
          <Link
            href="/admin/contacts"
            className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            View all
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
          {stats.recentContacts.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No contact messages yet</h3>
              <p className="mt-2 text-sm text-gray-500">
                Contact form submissions will appear here.
              </p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Subject
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {stats.recentContacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {contact.fullName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {contact.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 truncate max-w-xs">
                      {contact.subject || <span className="italic text-gray-400">No subject</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(contact.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Email Status Summary */}
      {stats.emailStats && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h2 className="text-lg font-bold text-gray-900">Email Delivery Status</h2>
            </div>
            <Link
              href="/admin/emails"
              className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              View details
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="relative bg-white shadow-sm border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Total Sent</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {stats.emailStats.totalSent?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="relative bg-white shadow-sm border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Delivered</p>
                  <p className="mt-2 text-3xl font-bold text-green-600">
                    {stats.emailStats.delivered?.toLocaleString() || 0}
                  </p>
                  <p className="mt-1 text-xs font-medium text-green-700 bg-green-50 inline-block px-2 py-1 rounded-full">
                    {stats.emailStats.deliveryRate?.toFixed(1) || 0}% success
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="relative bg-white shadow-sm border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Bounced</p>
                  <p className="mt-2 text-3xl font-bold text-orange-600">
                    {stats.emailStats.bounced?.toLocaleString() || 0}
                  </p>
                  <p className="mt-1 text-xs font-medium text-orange-700 bg-orange-50 inline-block px-2 py-1 rounded-full">
                    {stats.emailStats.bounceRate?.toFixed(1) || 0}% rate
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100">
                  <svg className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="relative bg-white shadow-sm border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Failed</p>
                  <p className="mt-2 text-3xl font-bold text-red-600">
                    {stats.emailStats.failed?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100">
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
