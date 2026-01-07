'use client';

import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface RefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: {
    id: string;
    amount: number;
    currency: string;
  };
  onSuccess: () => void;
}

export function RefundModal({ isOpen, onClose, payment, onSuccess }: RefundModalProps) {
  const [refundAmount, setRefundAmount] = useState(payment.amount.toString());
  const [refundReason, setRefundReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isPartialRefund = parseFloat(refundAmount) < payment.amount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const amount = parseFloat(refundAmount);
    if (isNaN(amount) || amount <= 0 || amount > payment.amount) {
      setError(`Refund amount must be between 0 and ${payment.amount}`);
      setIsSubmitting(false);
      return;
    }

    if (!refundReason.trim()) {
      setError('Please provide a reason for the refund');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`/api/admin/payments/${payment.id}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refundAmount: amount,
          refundReason: refundReason.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process refund');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: payment.currency || 'USD',
    }).format(amount);
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      {/* Full-screen container */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-md w-full bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                <ExclamationTriangleIcon className="h-6 w-6 text-orange-600" />
              </div>
              <Dialog.Title className="text-lg font-semibold text-gray-900">
                Process Refund
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
            {/* Payment Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="text-sm text-gray-600">Original Payment Amount</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(payment.amount)}
              </div>
            </div>

            <div className="space-y-4">
              {/* Refund Amount */}
              <div>
                <label htmlFor="refundAmount" className="block text-sm font-medium text-gray-700 mb-1">
                  Refund Amount *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">
                    {payment.currency || 'USD'}
                  </span>
                  <input
                    type="number"
                    id="refundAmount"
                    step="0.01"
                    min="0.01"
                    max={payment.amount}
                    required
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 pl-16 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="0.00"
                  />
                </div>
                {isPartialRefund && (
                  <p className="mt-1 text-sm text-orange-600">
                    This will be a partial refund
                  </p>
                )}
              </div>

              {/* Refund Reason */}
              <div>
                <label htmlFor="refundReason" className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Refund *
                </label>
                <textarea
                  id="refundReason"
                  rows={3}
                  required
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Explain why this refund is being processed..."
                />
              </div>

              {/* Warning */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <div className="flex gap-2">
                  <ExclamationTriangleIcon className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-orange-800">
                    <strong>Warning:</strong> This action cannot be undone. Make sure all details are correct before proceeding.
                  </div>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-800">
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
                className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Processing...' : 'Process Refund'}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
