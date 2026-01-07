'use client';

import { useState } from 'react';
import { PaymentMethod, PaymentStatus } from '@prisma/client';
import { CreditCardIcon, DocumentTextIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { RefundModal } from './RefundModal';

interface Payment {
  id: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  transactionReference?: string;
  receiptUrl?: string;
  notes?: string;
  paidAt?: Date;
  processedBy?: string;
  refundAmount?: number;
  refundedAt?: Date;
  refundReason?: string;
  createdAt: Date;
}

interface PaymentListProps {
  payments: Payment[];
  onPaymentUpdated: () => void;
}

export function PaymentList({ payments, onPaymentUpdated }: PaymentListProps) {
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const getStatusColor = (status: PaymentStatus) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800',
      partially_refunded: 'bg-orange-100 text-orange-800',
    };
    return colors[status];
  };

  const getMethodLabel = (method: PaymentMethod) => {
    const labels = {
      wire_transfer: 'Wire Transfer',
      credit_card: 'Credit Card',
      bank_transfer: 'Bank Transfer',
      check: 'Check',
      cash: 'Cash',
      other: 'Other',
    };
    return labels[method];
  };

  const handleRefund = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsRefundModalOpen(true);
  };

  if (payments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <CreditCardIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
        <p>No payments recorded yet</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {payments.map((payment) => (
          <div
            key={payment.id}
            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-lg font-semibold text-gray-900">
                    {formatCurrency(payment.amount, payment.currency)}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.paymentStatus)}`}>
                    {payment.paymentStatus.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">Method:</span>{' '}
                    <span className="text-gray-900">{getMethodLabel(payment.paymentMethod)}</span>
                  </div>

                  {payment.transactionReference && (
                    <div>
                      <span className="text-gray-500">Reference:</span>{' '}
                      <span className="text-gray-900 font-mono text-xs">{payment.transactionReference}</span>
                    </div>
                  )}

                  <div>
                    <span className="text-gray-500">Created:</span>{' '}
                    <span className="text-gray-900">{formatDate(payment.createdAt)}</span>
                  </div>

                  {payment.paidAt && (
                    <div>
                      <span className="text-gray-500">Paid:</span>{' '}
                      <span className="text-gray-900">{formatDate(payment.paidAt)}</span>
                    </div>
                  )}

                  {payment.refundAmount && (
                    <>
                      <div>
                        <span className="text-gray-500">Refunded:</span>{' '}
                        <span className="text-red-600 font-medium">
                          {formatCurrency(payment.refundAmount, payment.currency)}
                        </span>
                      </div>
                      {payment.refundedAt && (
                        <div>
                          <span className="text-gray-500">Refund Date:</span>{' '}
                          <span className="text-gray-900">{formatDate(payment.refundedAt)}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {payment.notes && (
                  <div className="mt-2 text-sm text-gray-600 bg-gray-50 rounded p-2">
                    <span className="font-medium">Notes:</span> {payment.notes}
                  </div>
                )}

                {payment.refundReason && (
                  <div className="mt-2 text-sm text-red-600 bg-red-50 rounded p-2">
                    <span className="font-medium">Refund Reason:</span> {payment.refundReason}
                  </div>
                )}
              </div>

              <div className="flex gap-2 ml-4">
                {payment.receiptUrl && (
                  <a
                    href={payment.receiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                    title="View Receipt"
                  >
                    <DocumentTextIcon className="h-5 w-5" />
                  </a>
                )}

                {payment.paymentStatus === 'completed' && !payment.refundAmount && (
                  <button
                    onClick={() => handleRefund(payment)}
                    className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg"
                    title="Process Refund"
                  >
                    <ArrowPathIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedPayment && (
        <RefundModal
          isOpen={isRefundModalOpen}
          onClose={() => {
            setIsRefundModalOpen(false);
            setSelectedPayment(null);
          }}
          payment={selectedPayment}
          onSuccess={() => {
            onPaymentUpdated();
            setIsRefundModalOpen(false);
            setSelectedPayment(null);
          }}
        />
      )}
    </>
  );
}
