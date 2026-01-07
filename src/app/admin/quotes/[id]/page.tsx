'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { StatusBadge } from '@/components/admin/StatusBadge';
import type { QuoteStatus } from '@/lib/quotes/QuoteStatusService';

interface QuoteDetail {
  id: string;
  serviceType: string;
  fullName: string;
  email: string;
  phone?: string;
  passengers: number;
  origin: string;
  destination: string;
  departureDate: string;
  departureTime: string;
  standardBagsCount?: number;
  specialItems?: string;
  hasPets: boolean;
  petSpecies?: string;
  petSize?: string;
  petDocuments?: boolean;
  additionalServices?: string;
  comments?: string;
  locale: string;
  privacyConsent: boolean;
  contactWhatsapp: boolean;
  ipAddress?: string;
  userAgent?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  createdAt: string;
  updatedAt: string;
  currentStatus: QuoteStatus;
  statusHistory: Array<{
    id: string;
    fromStatus: QuoteStatus;
    toStatus: QuoteStatus;
    adminEmail: string;
    adminNote?: string;
    changedAt: string;
  }>;
  emailDeliveries?: Array<{
    id: string;
    recipientEmail: string;
    subject: string;
    status: string;
    createdAt: string;
    sentAt?: string;
    deliveredAt?: string;
    bouncedAt?: string;
    failedAt?: string;
    errorMessage?: string;
  }>;
}

export default function QuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [quoteId, setQuoteId] = useState<string>('');
  const [quote, setQuote] = useState<QuoteDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<QuoteStatus>('new_request');
  const [statusNote, setStatusNote] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    params.then(p => setQuoteId(p.id));
  }, [params]);

  useEffect(() => {
    if (!quoteId) return;
    fetchQuoteDetails();
  }, [quoteId]);

  const fetchQuoteDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/quotes/${quoteId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch quote details');
      }

      const data = await response.json();
      setQuote(data.quote);
      setSelectedStatus(data.quote.currentStatus);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!quote || selectedStatus === quote.currentStatus) return;

    try {
      setUpdating(true);

      const response = await fetch(`/api/admin/quotes/${quoteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: selectedStatus,
          note: statusNote || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      // Refresh quote details
      await fetchQuoteDetails();
      setStatusNote('');

      // Show success message
      alert('Status updated successfully');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const validStatuses: QuoteStatus[] = [
    'new_request',
    'reviewing',
    'quote_sent',
    'awaiting_confirmation',
    'confirmed',
    'payment_pending',
    'paid',
    'completed',
    'cancelled'
  ];

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error || 'Quote not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/admin/quotes')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Quotes
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quote Details</h1>
            <p className="text-sm text-gray-500 mt-1">ID: {quote.id}</p>
          </div>
          <StatusBadge status={quote.currentStatus} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h2>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                <dd className="mt-1 text-sm text-gray-900">{quote.fullName}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{quote.email}</dd>
              </div>
              {quote.phone && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Phone</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {quote.phone}
                    {quote.contactWhatsapp && (
                      <span className="ml-2 text-green-600 text-xs">(WhatsApp)</span>
                    )}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-gray-500">Language</dt>
                <dd className="mt-1 text-sm text-gray-900">{quote.locale.toUpperCase()}</dd>
              </div>
            </dl>
          </div>

          {/* Flight Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Flight Details</h2>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Service Type</dt>
                <dd className="mt-1 text-sm text-gray-900 capitalize">{quote.serviceType.replace('_', ' ')}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Passengers</dt>
                <dd className="mt-1 text-sm text-gray-900">{quote.passengers}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Origin</dt>
                <dd className="mt-1 text-sm text-gray-900">{quote.origin}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Destination</dt>
                <dd className="mt-1 text-sm text-gray-900">{quote.destination}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Departure Date</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(quote.departureDate).toLocaleDateString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Departure Time</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(quote.departureTime).toLocaleTimeString()}
                </dd>
              </div>
              {quote.standardBagsCount !== undefined && quote.standardBagsCount > 0 && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Bags</dt>
                  <dd className="mt-1 text-sm text-gray-900">{quote.standardBagsCount}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Additional Details */}
          {(quote.hasPets || quote.specialItems || quote.additionalServices || quote.comments) && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Details</h2>
              <dl className="space-y-4">
                {quote.hasPets && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Pet Information</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {quote.petSpecies && <span className="capitalize">{quote.petSpecies}</span>}
                      {quote.petSize && <span> ({quote.petSize})</span>}
                      {quote.petDocuments && <span className="ml-2 text-green-600">✓ Documents ready</span>}
                    </dd>
                  </div>
                )}
                {quote.specialItems && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Special Items</dt>
                    <dd className="mt-1 text-sm text-gray-900">{quote.specialItems}</dd>
                  </div>
                )}
                {quote.additionalServices && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Additional Services</dt>
                    <dd className="mt-1 text-sm text-gray-900">{quote.additionalServices}</dd>
                  </div>
                )}
                {quote.comments && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Comments</dt>
                    <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{quote.comments}</dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          {/* Status History */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Status History</h2>
            <div className="space-y-4">
              {quote.statusHistory.map((event, index) => (
                <div key={event.id} className="flex items-start gap-4 relative">
                  {index !== quote.statusHistory.length - 1 && (
                    <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-200" />
                  )}
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center z-10">
                    <div className="w-3 h-3 rounded-full bg-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <StatusBadge status={event.fromStatus} />
                      <span className="text-gray-400">→</span>
                      <StatusBadge status={event.toStatus} />
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Changed by {event.adminEmail}
                    </p>
                    {event.adminNote && (
                      <p className="text-sm text-gray-500 mt-1 italic">"{event.adminNote}"</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(event.changedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Email Deliveries */}
          {quote.emailDeliveries && quote.emailDeliveries.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Email History</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {quote.emailDeliveries.map((email) => (
                      <tr key={email.id}>
                        <td className="px-4 py-2 text-sm text-gray-900">{email.subject}</td>
                        <td className="px-4 py-2 text-sm">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            email.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            email.status === 'failed' ? 'bg-red-100 text-red-800' :
                            email.status === 'bounced' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {email.status}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-500">
                          {new Date(email.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tracking Information */}
          {(quote.utmSource || quote.utmMedium || quote.utmCampaign || quote.ipAddress) && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Tracking Information</h2>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quote.utmSource && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">UTM Source</dt>
                    <dd className="mt-1 text-sm text-gray-900">{quote.utmSource}</dd>
                  </div>
                )}
                {quote.utmMedium && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">UTM Medium</dt>
                    <dd className="mt-1 text-sm text-gray-900">{quote.utmMedium}</dd>
                  </div>
                )}
                {quote.utmCampaign && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">UTM Campaign</dt>
                    <dd className="mt-1 text-sm text-gray-900">{quote.utmCampaign}</dd>
                  </div>
                )}
                {quote.ipAddress && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">IP Address</dt>
                    <dd className="mt-1 text-sm text-gray-900">{quote.ipAddress}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-gray-500">Created</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(quote.createdAt).toLocaleString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(quote.updatedAt).toLocaleString()}
                  </dd>
                </div>
              </dl>
            </div>
          )}
        </div>

        {/* Sidebar - 1/3 width */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Update Status</h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  New Status
                </label>
                <select
                  id="status"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as QuoteStatus)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {validStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-2">
                  Note (optional)
                </label>
                <textarea
                  id="note"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  rows={3}
                  placeholder="Add a note about this status change..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <button
                onClick={handleStatusUpdate}
                disabled={updating || selectedStatus === quote.currentStatus}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {updating ? 'Updating...' : 'Update Status'}
              </button>

              {selectedStatus === quote.currentStatus && (
                <p className="text-xs text-gray-500 text-center">
                  Select a different status to update
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
