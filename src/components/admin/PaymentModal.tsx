'use client';

import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { PaymentMethod, PaymentStatus } from '@prisma/client';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  quoteRequestId: string;
  onSuccess: () => void;
  existingPayment?: {
    id: string;
    amount: number;
    currency: string;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    transactionReference?: string;
    receiptUrl?: string;
    notes?: string;
  };
}

export function PaymentModal({
  isOpen,
  onClose,
  quoteRequestId,
  onSuccess,
  existingPayment
}: PaymentModalProps) {
  const isEditMode = !!existingPayment;

  const [formData, setFormData] = useState({
    amount: existingPayment?.amount?.toString() || '',
    currency: existingPayment?.currency || 'USD',
    paymentMethod: existingPayment?.paymentMethod || 'wire_transfer',
    paymentStatus: existingPayment?.paymentStatus || 'pending',
    transactionReference: existingPayment?.transactionReference || '',
    receiptUrl: existingPayment?.receiptUrl || '',
    notes: existingPayment?.notes || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const endpoint = isEditMode
        ? `/api/admin/payments/${existingPayment.id}`
        : '/api/admin/payments';

      const method = isEditMode ? 'PATCH' : 'POST';

      const body = isEditMode
        ? {
            paymentStatus: formData.paymentStatus,
            notes: formData.notes || undefined,
            transactionReference: formData.transactionReference || undefined,
            receiptUrl: formData.receiptUrl || undefined,
          }
        : {
            quoteRequestId,
            amount: parseFloat(formData.amount),
            currency: formData.currency,
            paymentMethod: formData.paymentMethod,
            transactionReference: formData.transactionReference || undefined,
            receiptUrl: formData.receiptUrl || undefined,
            notes: formData.notes || undefined,
          };

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save payment');
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const paymentMethods: { value: PaymentMethod; label: string }[] = [
    { value: 'wire_transfer', label: 'Wire Transfer' },
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'check', label: 'Check' },
    { value: 'cash', label: 'Cash' },
    { value: 'other', label: 'Other' },
  ];

  const paymentStatuses: { value: PaymentStatus; label: string }[] = [
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' },
  ];

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      {/* Full-screen container */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-2xl w-full bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />
              </div>
              <Dialog.Title className="text-lg font-semibold text-gray-900">
                {isEditMode ? 'Update Payment' : 'Record Payment'}
              </Dialog.Title>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-4">
            <div className="space-y-4">
              {/* Amount and Currency */}
              {!isEditMode && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                      Amount *
                    </label>
                    <input
                      type="number"
                      id="amount"
                      step="0.01"
                      min="0"
                      required
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
                      Currency
                    </label>
                    <select
                      id="currency"
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="BRL">BRL</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Payment Method */}
              {!isEditMode && (
                <div>
                  <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Method *
                  </label>
                  <select
                    id="paymentMethod"
                    required
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {paymentMethods.map(method => (
                      <option key={method.value} value={method.value}>
                        {method.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Payment Status */}
              <div>
                <label htmlFor="paymentStatus" className="block text-sm font-medium text-gray-700 mb-1">
                  Status *
                </label>
                <select
                  id="paymentStatus"
                  required
                  value={formData.paymentStatus}
                  onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value as PaymentStatus })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {paymentStatuses.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Transaction Reference */}
              <div>
                <label htmlFor="transactionReference" className="block text-sm font-medium text-gray-700 mb-1">
                  Transaction Reference
                </label>
                <input
                  type="text"
                  id="transactionReference"
                  value={formData.transactionReference}
                  onChange={(e) => setFormData({ ...formData, transactionReference: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., TRX-12345"
                />
              </div>

              {/* Receipt URL */}
              <div>
                <label htmlFor="receiptUrl" className="block text-sm font-medium text-gray-700 mb-1">
                  Receipt URL
                </label>
                <input
                  type="url"
                  id="receiptUrl"
                  value={formData.receiptUrl}
                  onChange={(e) => setFormData({ ...formData, receiptUrl: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://..."
                />
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Internal notes about this payment..."
                />
              </div>

              {/* Error message */}
              {error && (
                <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800">
                  {error}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-6 flex justify-end gap-3 border-t border-gray-200 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : isEditMode ? 'Update Payment' : 'Record Payment'}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
