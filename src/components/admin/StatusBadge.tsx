import { clsx } from 'clsx';

export type QuoteStatus = 'new_request' | 'reviewing' | 'quote_sent' | 'awaiting_confirmation' | 'confirmed' | 'payment_pending' | 'paid' | 'completed' | 'cancelled';
export type ContactStatus = 'pending' | 'responded' | 'closed';
export type Status = QuoteStatus | ContactStatus;

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const statusConfig: Record<Status, { label: string; colorClasses: string }> = {
  // Quote statuses
  new_request: {
    label: 'New Request',
    colorClasses: 'bg-blue-100 text-blue-800 ring-blue-600/20',
  },
  reviewing: {
    label: 'Reviewing',
    colorClasses: 'bg-purple-100 text-purple-800 ring-purple-600/20',
  },
  quote_sent: {
    label: 'Quote Sent',
    colorClasses: 'bg-yellow-100 text-yellow-800 ring-yellow-600/20',
  },
  awaiting_confirmation: {
    label: 'Awaiting Confirmation',
    colorClasses: 'bg-yellow-100 text-yellow-800 ring-yellow-600/20',
  },
  confirmed: {
    label: 'Confirmed',
    colorClasses: 'bg-green-100 text-green-800 ring-green-600/20',
  },
  payment_pending: {
    label: 'Payment Pending',
    colorClasses: 'bg-orange-100 text-orange-800 ring-orange-600/20',
  },
  paid: {
    label: 'Paid',
    colorClasses: 'bg-green-100 text-green-800 ring-green-600/20',
  },
  completed: {
    label: 'Completed',
    colorClasses: 'bg-gray-100 text-gray-800 ring-gray-600/20',
  },
  cancelled: {
    label: 'Cancelled',
    colorClasses: 'bg-red-100 text-red-800 ring-red-600/20',
  },
  // Contact statuses
  pending: {
    label: 'Pending',
    colorClasses: 'bg-yellow-100 text-yellow-800 ring-yellow-600/20',
  },
  responded: {
    label: 'Responded',
    colorClasses: 'bg-green-100 text-green-800 ring-green-600/20',
  },
  closed: {
    label: 'Closed',
    colorClasses: 'bg-gray-100 text-gray-800 ring-gray-600/20',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset',
        config.colorClasses,
        className
      )}
    >
      {config.label}
    </span>
  );
}
