'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { DataTable, ColumnDef, ActionItem } from '@/components/admin/DataTable';
import { FilterBar } from '@/components/admin/FilterBar';
import { StatusBadge, ContactStatus } from '@/components/admin/StatusBadge';
import { BulkActionBar } from '@/components/admin/BulkActionBar';
import { ContactDetailModal } from '@/components/admin/ContactDetailModal';

interface Contact {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  contactViaWhatsApp?: boolean;
  createdAt: string;
  currentStatus: ContactStatus;
}

const statusFilterOptions = [
  { label: 'All Statuses', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Responded', value: 'responded' },
  { label: 'Closed', value: 'closed' },
];

export default function ContactsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Pagination
  const limit = 50;
  const offset = parseInt(searchParams.get('offset') || '0');

  // Fetch contacts
  useEffect(() => {
    fetchContacts();
  }, [searchParams]);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      // Add filter params from URL
      const status = searchParams.get('status');
      const search = searchParams.get('search');
      const dateFrom = searchParams.get('dateFrom');
      const dateTo = searchParams.get('dateTo');

      if (status) params.set('status', status);
      if (search) params.set('search', search);
      if (dateFrom) params.set('dateFrom', dateFrom);
      if (dateTo) params.set('dateTo', dateTo);

      params.set('limit', limit.toString());
      params.set('offset', offset.toString());

      const response = await fetch(`/api/admin/contacts?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch contacts');
      }

      const data = await response.json();
      setContacts(data.contacts || []);
      setTotalCount(data.pagination?.total || 0);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      setContacts([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newOffset: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('offset', newOffset.toString());
    router.push(`/admin/contacts?${params.toString()}`);
  };

  const handleViewDetails = (contact: Contact) => {
    setSelectedContactId(contact.id);
    setIsModalOpen(true);
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
  };

  const handleBulkStatusUpdate = async (newStatus: string) => {
    if (selectedContacts.length === 0) return;

    try {
      const response = await fetch('/api/admin/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'bulk_status_update',
          contactIds: selectedContacts,
          status: newStatus,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update contacts');
      }

      // Refresh contacts
      await fetchContacts();
      setSelectedContacts([]);
    } catch (error) {
      console.error('Error updating contacts:', error);
      alert('Failed to update contacts. Please try again.');
    }
  };

  const handleExportSelected = () => {
    if (selectedContacts.length === 0) return;

    const selectedContactData = contacts.filter(c => selectedContacts.includes(c.id));
    const csvData = [
      ['ID', 'Name', 'Email', 'Phone', 'Subject', 'Message', 'WhatsApp', 'Status', 'Created'],
      ...selectedContactData.map(c => [
        c.id,
        c.fullName,
        c.email,
        c.phone || '',
        c.subject || '',
        c.message.substring(0, 100), // Truncate message for CSV
        c.contactViaWhatsApp ? 'Yes' : 'No',
        c.currentStatus,
        new Date(c.createdAt).toLocaleString(),
      ]),
    ];

    const csv = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contacts-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Define table columns
  const columns: ColumnDef<Contact>[] = [
    {
      key: 'createdAt',
      header: 'Date',
      sortable: true,
      width: 'w-32',
      render: (contact) => (
        <div className="text-sm whitespace-nowrap">
          {new Date(contact.createdAt).toLocaleDateString()}
        </div>
      ),
    },
    {
      key: 'fullName',
      header: 'Name',
      sortable: true,
      render: (contact) => (
        <div className="text-sm font-medium text-gray-900">{contact.fullName}</div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      render: (contact) => (
        <div className="text-sm text-gray-500">{contact.email}</div>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (contact) => (
        <div className="flex items-center text-sm text-gray-500">
          {contact.phone || '-'}
          {contact.contactViaWhatsApp && contact.phone && (
            <svg className="ml-1 h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
          )}
        </div>
      ),
    },
    {
      key: 'subject',
      header: 'Subject',
      render: (contact) => (
        <div className="text-sm text-gray-900 truncate max-w-xs">
          {contact.subject || <span className="text-gray-400 italic">No subject</span>}
        </div>
      ),
    },
    {
      key: 'currentStatus',
      header: 'Status',
      sortable: true,
      render: (contact) => <StatusBadge status={contact.currentStatus} />,
    },
  ];

  // Define row actions
  const actions: ActionItem<Contact>[] = [
    {
      label: 'View Details',
      onClick: handleViewDetails,
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
    },
    {
      label: 'Copy ID',
      onClick: (contact) => handleCopyId(contact.id),
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
    },
  ];

  // Bulk actions
  const bulkActions = [
    {
      label: 'Mark as Responded',
      value: 'responded',
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      requiresConfirmation: true,
      confirmationMessage: `Are you sure you want to mark ${selectedContacts.length} contact${selectedContacts.length !== 1 ? 's' : ''} as responded?`,
    },
    {
      label: 'Mark as Closed',
      value: 'closed',
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      requiresConfirmation: true,
      confirmationMessage: `Are you sure you want to mark ${selectedContacts.length} contact${selectedContacts.length !== 1 ? 's' : ''} as closed?`,
    },
    {
      label: 'Export Selected',
      value: 'export',
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
  ];

  const handleBulkAction = async (actionValue: string) => {
    if (actionValue === 'export') {
      handleExportSelected();
    } else {
      await handleBulkStatusUpdate(actionValue);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Contact Management</h1>
        <p className="mt-2 text-sm text-gray-600">
          View and manage all contact form submissions
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <FilterBar
          statusOptions={statusFilterOptions}
          showServiceTypeFilter={false}
          showDateFilter={true}
          showSearch={true}
          showStaleToggle={false}
          placeholder="Search by name, email, subject, or message..."
          onFilterChange={fetchContacts}
        />
      </div>

      {/* Bulk Action Bar */}
      <BulkActionBar
        selectedCount={selectedContacts.length}
        actions={bulkActions}
        onAction={handleBulkAction}
        onDeselect={() => setSelectedContacts([])}
      />

      {/* Data Table */}
      <DataTable
        data={contacts}
        columns={columns}
        pagination={{
          total: totalCount,
          limit,
          offset,
          onPageChange: handlePageChange,
        }}
        onRowSelect={setSelectedContacts}
        loading={loading}
        emptyMessage="No contacts found. Try adjusting your filters."
        actions={actions}
        showSelection={true}
      />

      {/* Contact Detail Modal */}
      {selectedContactId && (
        <ContactDetailModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedContactId(null);
          }}
          contactId={selectedContactId}
          onStatusUpdate={fetchContacts}
        />
      )}
    </div>
  );
}
