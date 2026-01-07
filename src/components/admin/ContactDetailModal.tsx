'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge, ContactStatus } from './StatusBadge';
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
  fromStatus: ContactStatus;
  toStatus: ContactStatus;
  adminEmail: string;
  adminNote?: string;
  changedAt: Date | string;
}

interface Contact {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  contactViaWhatsApp?: boolean;
  locale: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  createdAt: Date | string;
  currentStatus: ContactStatus;
  statusHistory: StatusChangeEvent[];
  emailDeliveries: EmailDelivery[];
}

interface ContactDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  contactId: string;
  onStatusUpdate?: () => void;
}

export function ContactDetailModal({
  isOpen,
  onClose,
  contactId,
  onStatusUpdate,
}: ContactDetailModalProps) {
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<ContactStatus>('pending');
  const [statusNote, setStatusNote] = useState('');

  // Fetch contact details
  useEffect(() => {
    if (isOpen && contactId) {
      fetchContactDetails();
    }
  }, [isOpen, contactId]);

  const fetchContactDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/admin/contacts/${contactId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch contact details');
      }
      const data = await response.json();
      setContact(data.contact);
      setSelectedStatus(data.contact.currentStatus);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading contact');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!contact || selectedStatus === contact.currentStatus) {
      return;
    }

    setUpdating(true);
    try {
      const response = await fetch(`/api/admin/contacts/${contactId}`, {
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

      // Refresh contact details
      await fetchContactDetails();
      setStatusNote('');
      onStatusUpdate?.();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error updating status');
    } finally {
      setUpdating(false);
    }
  };

  const handleExport = () => {
    if (!contact) return;

    const csvData = [
      ['Field', 'Value'],
      ['ID', contact.id],
      ['Name', contact.fullName],
      ['Email', contact.email],
      ['Phone', contact.phone || ''],
      ['Subject', contact.subject || ''],
      ['Message', contact.message],
      ['Contact via WhatsApp', contact.contactViaWhatsApp ? 'Yes' : 'No'],
      ['Locale', contact.locale],
      ['Status', contact.currentStatus],
      ['Created At', new Date(contact.createdAt).toLocaleString()],
    ];

    const csv = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contact-${contact.id}.csv`;
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

  const availableStatuses: ContactStatus[] = ['pending', 'responded', 'closed'];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Contact Details" size="xl">
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

      {contact && !loading && (
        <div>
          {/* Header with status */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{contact.fullName}</h3>
              <p className="text-sm text-gray-500">ID: {contact.id.substring(0, 8)}</p>
            </div>
            <StatusBadge status={contact.currentStatus} />
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
                {/* Contact Information */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Contact Information</h4>
                  <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <dt className="text-xs font-medium text-gray-500">Full Name</dt>
                      <dd className="mt-1 text-sm text-gray-900">{contact.fullName}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-gray-500">Email</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        <a href={`mailto:${contact.email}`} className="text-navy-primary hover:underline">
                          {contact.email}
                        </a>
                      </dd>
                    </div>
                    {contact.phone && (
                      <div>
                        <dt className="text-xs font-medium text-gray-500">Phone</dt>
                        <dd className="mt-1 text-sm text-gray-900 flex items-center">
                          <a href={`tel:${contact.phone}`} className="text-navy-primary hover:underline">
                            {contact.phone}
                          </a>
                          {contact.contactViaWhatsApp && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              WhatsApp
                            </span>
                          )}
                        </dd>
                      </div>
                    )}
                    <div>
                      <dt className="text-xs font-medium text-gray-500">Locale</dt>
                      <dd className="mt-1 text-sm text-gray-900">{contact.locale.toUpperCase()}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-gray-500">Received</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {formatDate(contact.createdAt)}
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* Subject */}
                {contact.subject && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Subject</h4>
                    <p className="text-sm text-gray-700">{contact.subject}</p>
                  </div>
                )}

                {/* Message */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Message</h4>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{contact.message}</p>
                  </div>
                </div>

                {/* UTM Tracking */}
                {(contact.utmSource || contact.utmMedium || contact.utmCampaign) && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">UTM Tracking</h4>
                    <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      {contact.utmSource && (
                        <div>
                          <dt className="text-xs font-medium text-gray-500">Source</dt>
                          <dd className="mt-1 text-sm text-gray-900">{contact.utmSource}</dd>
                        </div>
                      )}
                      {contact.utmMedium && (
                        <div>
                          <dt className="text-xs font-medium text-gray-500">Medium</dt>
                          <dd className="mt-1 text-sm text-gray-900">{contact.utmMedium}</dd>
                        </div>
                      )}
                      {contact.utmCampaign && (
                        <div>
                          <dt className="text-xs font-medium text-gray-500">Campaign</dt>
                          <dd className="mt-1 text-sm text-gray-900">{contact.utmCampaign}</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                )}

                {/* Email Deliveries */}
                {contact.emailDeliveries.length > 0 && (
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
                          {contact.emailDeliveries.map((email) => (
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
                  {contact.statusHistory.length === 0 ? (
                    <p className="text-sm text-gray-500">No status changes yet</p>
                  ) : (
                    <div className="flow-root">
                      <ul className="-mb-8">
                        {contact.statusHistory.map((event, eventIdx) => (
                          <li key={event.id}>
                            <div className="relative pb-8">
                              {eventIdx !== contact.statusHistory.length - 1 && (
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
                  {/* Quick Response */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-4">Quick Response</h4>
                    <div className="space-y-3">
                      <button
                        onClick={() => {
                          setSelectedStatus('responded');
                          setStatusNote('Customer inquiry responded to via email');
                        }}
                        className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy-primary transition-colors"
                      >
                        <svg className="mr-2 h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Mark as Responded
                      </button>
                      <button
                        onClick={() => {
                          setSelectedStatus('closed');
                          setStatusNote('Inquiry resolved and closed');
                        }}
                        className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy-primary transition-colors"
                      >
                        <svg className="mr-2 h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Mark as Closed
                      </button>
                    </div>
                  </div>

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
                          onChange={(e) => setSelectedStatus(e.target.value as ContactStatus)}
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
                        disabled={updating || selectedStatus === contact.currentStatus}
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
