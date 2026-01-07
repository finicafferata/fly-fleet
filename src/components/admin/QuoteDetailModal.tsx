'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge, QuoteStatus } from './StatusBadge';
import { Tab } from '@headlessui/react';
import { clsx } from 'clsx';

interface EmailDelivery {
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
}

interface StatusChangeEvent {
  id: string;
  fromStatus: QuoteStatus;
  toStatus: QuoteStatus;
  adminEmail: string;
  adminNote?: string;
  changedAt: Date | string;
}

interface Quote {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  passengers: number;
  origin: string;
  destination: string;
  departureDate: Date | string;
  departureTime: string;
  serviceType: string;
  hasPets?: boolean;
  petDetails?: string;
  hasSpecialItems?: boolean;
  specialItemsDetails?: string;
  additionalServices?: any;
  comments?: string;
  locale: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  createdAt: Date | string;
  currentStatus: QuoteStatus;
  statusHistory: StatusChangeEvent[];
  emailDeliveries: EmailDelivery[];
}

interface QuoteDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  quoteId: string;
  onStatusUpdate?: () => void;
}

export function QuoteDetailModal({
  isOpen,
  onClose,
  quoteId,
  onStatusUpdate,
}: QuoteDetailModalProps) {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<QuoteStatus>('pending');
  const [statusNote, setStatusNote] = useState('');

  // Fetch quote details
  useEffect(() => {
    if (isOpen && quoteId) {
      fetchQuoteDetails();
    }
  }, [isOpen, quoteId]);

  const fetchQuoteDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/admin/quotes/${quoteId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch quote details');
      }
      const data = await response.json();
      setQuote(data.quote);
      setSelectedStatus(data.quote.currentStatus);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading quote');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!quote || selectedStatus === quote.currentStatus) {
      return;
    }

    setUpdating(true);
    try {
      const response = await fetch(`/api/admin/quotes/${quoteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: selectedStatus,
          note: statusNote || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update status');
      }

      // Refresh quote details
      await fetchQuoteDetails();
      setStatusNote('');
      onStatusUpdate?.();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error updating status');
    } finally {
      setUpdating(false);
    }
  };

  const handleExport = () => {
    if (!quote) return;

    const csvData = [
      ['Field', 'Value'],
      ['ID', quote.id],
      ['Name', quote.fullName],
      ['Email', quote.email],
      ['Phone', quote.phone || ''],
      ['Passengers', quote.passengers.toString()],
      ['Origin', quote.origin],
      ['Destination', quote.destination],
      ['Departure Date', new Date(quote.departureDate).toLocaleDateString()],
      ['Departure Time', quote.departureTime],
      ['Service Type', quote.serviceType],
      ['Has Pets', quote.hasPets ? 'Yes' : 'No'],
      ['Pet Details', quote.petDetails || ''],
      ['Has Special Items', quote.hasSpecialItems ? 'Yes' : 'No'],
      ['Special Items', quote.specialItemsDetails || ''],
      ['Comments', quote.comments || ''],
      ['Status', quote.currentStatus],
      ['Created At', new Date(quote.createdAt).toLocaleString()],
    ];

    const csv = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quote-${quote.id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const availableStatuses: QuoteStatus[] = ['pending', 'processing', 'quoted', 'converted', 'closed'];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Quote Details" size="xl">
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-primary" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {quote && !loading && (
        <div>
          {/* Header with status */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{quote.fullName}</h3>
              <p className="text-sm text-gray-500">ID: {quote.id.substring(0, 8)}</p>
            </div>
            <StatusBadge status={quote.currentStatus} />
          </div>

          {/* Tabs */}
          <Tab.Group>
            <Tab.List className="flex space-x-1 rounded-xl bg-gray-100 p-1 mb-6">
              {['Details', 'History', 'Actions'].map((tab) => (
                <Tab
                  key={tab}
                  className={({ selected }) =>
                    clsx(
                      'w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-colors',
                      'focus:outline-none focus:ring-2 ring-offset-2 ring-offset-navy-primary ring-white ring-opacity-60',
                      selected
                        ? 'bg-white text-navy-primary shadow'
                        : 'text-gray-700 hover:bg-white/[0.12] hover:text-navy-primary'
                    )
                  }
                >
                  {tab}
                </Tab>
              ))}
            </Tab.List>
            <Tab.Panels>
              {/* Details Tab */}
              <Tab.Panel className="space-y-6">
                {/* Customer Information */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Customer Information</h4>
                  <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <dt className="text-xs font-medium text-gray-500">Full Name</dt>
                      <dd className="mt-1 text-sm text-gray-900">{quote.fullName}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-gray-500">Email</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        <a href={`mailto:${quote.email}`} className="text-navy-primary hover:underline">
                          {quote.email}
                        </a>
                      </dd>
                    </div>
                    {quote.phone && (
                      <div>
                        <dt className="text-xs font-medium text-gray-500">Phone</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          <a href={`tel:${quote.phone}`} className="text-navy-primary hover:underline">
                            {quote.phone}
                          </a>
                        </dd>
                      </div>
                    )}
                    <div>
                      <dt className="text-xs font-medium text-gray-500">Locale</dt>
                      <dd className="mt-1 text-sm text-gray-900">{quote.locale.toUpperCase()}</dd>
                    </div>
                  </dl>
                </div>

                {/* Flight Details */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Flight Details</h4>
                  <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <dt className="text-xs font-medium text-gray-500">Origin</dt>
                      <dd className="mt-1 text-sm text-gray-900">{quote.origin}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-gray-500">Destination</dt>
                      <dd className="mt-1 text-sm text-gray-900">{quote.destination}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-gray-500">Departure Date</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(quote.departureDate).toLocaleDateString()}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-gray-500">Departure Time</dt>
                      <dd className="mt-1 text-sm text-gray-900">{quote.departureTime}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-gray-500">Service Type</dt>
                      <dd className="mt-1 text-sm text-gray-900 capitalize">{quote.serviceType}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-gray-500">Passengers</dt>
                      <dd className="mt-1 text-sm text-gray-900">{quote.passengers}</dd>
                    </div>
                  </dl>
                </div>

                {/* Pet Information */}
                {quote.hasPets && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Pet Information</h4>
                    <p className="text-sm text-gray-700">{quote.petDetails || 'No details provided'}</p>
                  </div>
                )}

                {/* Special Items */}
                {quote.hasSpecialItems && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Special Items</h4>
                    <p className="text-sm text-gray-700">{quote.specialItemsDetails || 'No details provided'}</p>
                  </div>
                )}

                {/* Additional Services */}
                {quote.additionalServices && Object.keys(quote.additionalServices).length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Additional Services</h4>
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                      {Object.entries(quote.additionalServices)
                        .filter(([_, value]) => value)
                        .map(([key]) => (
                          <li key={key} className="capitalize">{key.replace(/_/g, ' ')}</li>
                        ))}
                    </ul>
                  </div>
                )}

                {/* Comments */}
                {quote.comments && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Comments</h4>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{quote.comments}</p>
                  </div>
                )}

                {/* UTM Tracking */}
                {(quote.utmSource || quote.utmMedium || quote.utmCampaign) && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">UTM Tracking</h4>
                    <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      {quote.utmSource && (
                        <div>
                          <dt className="text-xs font-medium text-gray-500">Source</dt>
                          <dd className="mt-1 text-sm text-gray-900">{quote.utmSource}</dd>
                        </div>
                      )}
                      {quote.utmMedium && (
                        <div>
                          <dt className="text-xs font-medium text-gray-500">Medium</dt>
                          <dd className="mt-1 text-sm text-gray-900">{quote.utmMedium}</dd>
                        </div>
                      )}
                      {quote.utmCampaign && (
                        <div>
                          <dt className="text-xs font-medium text-gray-500">Campaign</dt>
                          <dd className="mt-1 text-sm text-gray-900">{quote.utmCampaign}</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                )}

                {/* Email Deliveries */}
                {quote.emailDeliveries.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Related Emails</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Subject</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Sent</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {quote.emailDeliveries.map((email) => (
                            <tr key={email.id}>
                              <td className="px-4 py-2 text-sm text-gray-900">{email.subject}</td>
                              <td className="px-4 py-2 text-sm">
                                <span className={clsx(
                                  'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                                  email.status === 'delivered' && 'bg-green-100 text-green-800',
                                  email.status === 'sent' && 'bg-blue-100 text-blue-800',
                                  email.status === 'bounced' && 'bg-red-100 text-red-800',
                                  email.status === 'failed' && 'bg-red-100 text-red-800',
                                  email.status === 'pending' && 'bg-yellow-100 text-yellow-800'
                                )}>
                                  {email.status}
                                </span>
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-500">
                                {email.sentAt ? formatDate(email.sentAt) : '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </Tab.Panel>

              {/* History Tab */}
              <Tab.Panel>
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-900">Status History</h4>
                  {quote.statusHistory.length === 0 ? (
                    <p className="text-sm text-gray-500">No status changes yet</p>
                  ) : (
                    <div className="flow-root">
                      <ul className="-mb-8">
                        {quote.statusHistory.map((event, eventIdx) => (
                          <li key={event.id}>
                            <div className="relative pb-8">
                              {eventIdx !== quote.statusHistory.length - 1 && (
                                <span
                                  className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                                  aria-hidden="true"
                                />
                              )}
                              <div className="relative flex space-x-3">
                                <div>
                                  <span className="h-8 w-8 rounded-full bg-navy-primary flex items-center justify-center ring-8 ring-white">
                                    <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  </span>
                                </div>
                                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                                  <div>
                                    <p className="text-sm text-gray-500">
                                      Status changed from{' '}
                                      <StatusBadge status={event.fromStatus} className="mx-1" />{' '}
                                      to{' '}
                                      <StatusBadge status={event.toStatus} className="mx-1" />
                                    </p>
                                    <p className="mt-1 text-xs text-gray-500">
                                      By {event.adminEmail}
                                    </p>
                                    {event.adminNote && (
                                      <p className="mt-2 text-sm text-gray-700 italic">"{event.adminNote}"</p>
                                    )}
                                  </div>
                                  <div className="whitespace-nowrap text-right text-sm text-gray-500">
                                    {formatDate(event.changedAt)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </Tab.Panel>

              {/* Actions Tab */}
              <Tab.Panel>
                <div className="space-y-6">
                  {/* Status Update */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-4">Update Status</h4>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                          New Status
                        </label>
                        <select
                          id="status"
                          value={selectedStatus}
                          onChange={(e) => setSelectedStatus(e.target.value as QuoteStatus)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-navy-primary focus:ring-navy-primary sm:text-sm"
                        >
                          {availableStatuses.map((status) => (
                            <option key={status} value={status}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
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
                          rows={3}
                          value={statusNote}
                          onChange={(e) => setStatusNote(e.target.value)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-navy-primary focus:ring-navy-primary sm:text-sm"
                          placeholder="Add a note about this status change..."
                        />
                      </div>
                      <button
                        onClick={handleStatusUpdate}
                        disabled={updating || selectedStatus === quote.currentStatus}
                        className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-navy-primary hover:bg-navy-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {updating ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Updating...
                          </>
                        ) : (
                          'Update Status'
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Export */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-4">Export</h4>
                    <button
                      onClick={handleExport}
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy-primary transition-colors"
                    >
                      <svg className="mr-2 h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Export to CSV
                    </button>
                  </div>
                </div>
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>
      )}
    </Modal>
  );
}
