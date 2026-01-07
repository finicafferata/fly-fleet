'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { DataTable, ColumnDef, ActionItem } from '@/components/admin/DataTable';
import { FilterBar } from '@/components/admin/FilterBar';
import { StatusBadge, QuoteStatus } from '@/components/admin/StatusBadge';
import { BulkActionBar } from '@/components/admin/BulkActionBar';

interface Quote {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  origin: string;
  destination: string;
  serviceType: string;
  passengers: number;
  createdAt: string;
  currentStatus: QuoteStatus;
}

const statusFilterOptions = [
  { label: 'All Statuses', value: '' },
  { label: 'New Request', value: 'new_request' },
  { label: 'Reviewing', value: 'reviewing' },
  { label: 'Quote Sent', value: 'quote_sent' },
  { label: 'Awaiting Confirmation', value: 'awaiting_confirmation' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Payment Pending', value: 'payment_pending' },
  { label: 'Paid', value: 'paid' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];

export default function QuotesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedQuotes, setSelectedQuotes] = useState<string[]>([]);

  // Pagination
  const limit = 50;
  const offset = parseInt(searchParams.get('offset') || '0');

  // Fetch quotes
  useEffect(() => {
    fetchQuotes();
  }, [searchParams]);

  const fetchQuotes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      // Add filter params from URL
      const status = searchParams.get('status');
      const search = searchParams.get('search');
      const serviceType = searchParams.get('serviceType');
      const dateFrom = searchParams.get('dateFrom');
      const dateTo = searchParams.get('dateTo');
      const staleOnly = searchParams.get('staleOnly');

      if (status) params.set('status', status);
      if (search) params.set('search', search);
      if (serviceType) params.set('serviceType', serviceType);
      if (dateFrom) params.set('dateFrom', dateFrom);
      if (dateTo) params.set('dateTo', dateTo);
      if (staleOnly === 'true') params.set('stale', 'true');

      params.set('limit', limit.toString());
      params.set('offset', offset.toString());

      const response = await fetch(`/api/admin/quotes?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch quotes');
      }

      const data = await response.json();

      if (staleOnly === 'true') {
        setQuotes(data.quotes || []);
        setTotalCount(data.total || 0);
      } else {
        setQuotes(data.quotes || []);
        setTotalCount(data.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Error fetching quotes:', error);
      setQuotes([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newOffset: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('offset', newOffset.toString());
    router.push(`/admin/quotes?${params.toString()}`);
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    // Could add a toast notification here
  };

  const handleBulkStatusUpdate = async (newStatus: string) => {
    if (selectedQuotes.length === 0) return;

    try {
      const response = await fetch('/api/admin/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'bulk_status_update',
          quoteIds: selectedQuotes,
          status: newStatus,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update quotes');
      }

      // Refresh quotes
      await fetchQuotes();
      setSelectedQuotes([]);
    } catch (error) {
      console.error('Error updating quotes:', error);
      alert('Failed to update quotes. Please try again.');
    }
  };

  const handleExportSelected = () => {
    if (selectedQuotes.length === 0) return;

    const selectedQuoteData = quotes.filter(q => selectedQuotes.includes(q.id));
    const csvData = [
      ['ID', 'Name', 'Email', 'Phone', 'Origin', 'Destination', 'Service Type', 'Passengers', 'Status', 'Created'],
      ...selectedQuoteData.map(q => [
        q.id,
        q.fullName,
        q.email,
        q.phone || '',
        q.origin,
        q.destination,
        q.serviceType,
        q.passengers.toString(),
        q.currentStatus,
        new Date(q.createdAt).toLocaleString(),
      ]),
    ];

    const csv = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quotes-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Define table columns
  const columns: ColumnDef<Quote>[] = [
    {
      key: 'id',
      header: 'ID',
      width: 'w-32',
      render: (quote) => (
        <span className="font-mono text-xs">{quote.id.substring(0, 8)}</span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Date',
      sortable: true,
      render: (quote) => (
        <div className="text-sm">
          {new Date(quote.createdAt).toLocaleDateString()}
        </div>
      ),
    },
    {
      key: 'fullName',
      header: 'Customer',
      sortable: true,
      render: (quote) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{quote.fullName}</div>
          <div className="text-xs text-gray-500">{quote.email}</div>
        </div>
      ),
    },
    {
      key: 'route',
      header: 'Route',
      render: (quote) => (
        <div className="text-sm whitespace-nowrap">
          {quote.origin} → {quote.destination}
        </div>
      ),
    },
    {
      key: 'serviceType',
      header: 'Service',
      render: (quote) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
          {quote.serviceType}
        </span>
      ),
    },
    {
      key: 'passengers',
      header: 'PAX',
      render: (quote) => (
        <div className="text-sm text-center">{quote.passengers}</div>
      ),
    },
    {
      key: 'currentStatus',
      header: 'Status',
      sortable: true,
      render: (quote) => <StatusBadge status={quote.currentStatus} />,
    },
  ];

  // Define row actions
  const actions: ActionItem<Quote>[] = [
    {
      label: 'Copy ID',
      onClick: (quote) => handleCopyId(quote.id),
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
      label: 'Mark as Reviewing',
      value: 'reviewing',
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
      requiresConfirmation: true,
      confirmationMessage: `Are you sure you want to mark ${selectedQuotes.length} quote${selectedQuotes.length !== 1 ? 's' : ''} as reviewing?`,
    },
    {
      label: 'Mark as Quote Sent',
      value: 'quote_sent',
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      requiresConfirmation: true,
      confirmationMessage: `Are you sure you want to mark ${selectedQuotes.length} quote${selectedQuotes.length !== 1 ? 's' : ''} as quote sent?`,
    },
    {
      label: 'Mark as Confirmed',
      value: 'confirmed',
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      requiresConfirmation: true,
      confirmationMessage: `Are you sure you want to mark ${selectedQuotes.length} quote${selectedQuotes.length !== 1 ? 's' : ''} as confirmed?`,
    },
    {
      label: 'Mark as Cancelled',
      value: 'cancelled',
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      requiresConfirmation: true,
      confirmationMessage: `Are you sure you want to mark ${selectedQuotes.length} quote${selectedQuotes.length !== 1 ? 's' : ''} as cancelled?`,
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
        <h1 className="text-xl font-bold text-gray-900">Quote Management</h1>
        <p className="mt-2 text-sm text-gray-600">
          View and manage all quote requests from customers
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <FilterBar
          statusOptions={statusFilterOptions}
          showServiceTypeFilter={true}
          showDateFilter={true}
          showSearch={true}
          showStaleToggle={true}
          placeholder="Search by name, email, origin, or destination..."
          onFilterChange={fetchQuotes}
        />
      </div>

      {/* Bulk Action Bar */}
      <BulkActionBar
        selectedCount={selectedQuotes.length}
        actions={bulkActions}
        onAction={handleBulkAction}
        onDeselect={() => setSelectedQuotes([])}
      />

      {/* Data Table */}
      <DataTable
        data={quotes}
        columns={columns}
        pagination={{
          total: totalCount,
          limit,
          offset,
          onPageChange: handlePageChange,
        }}
        onRowSelect={setSelectedQuotes}
        onRowClick={(quote) => router.push(`/admin/quotes/${quote.id}`)}
        loading={loading}
        emptyMessage="No quotes found. Try adjusting your filters."
        actions={actions}
        showSelection={true}
      />
    </div>
  );
}
