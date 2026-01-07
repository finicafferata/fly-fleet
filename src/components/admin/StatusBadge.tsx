import { clsx } from 'clsx';

export type QuoteStatus = 'pending' | 'processing' | 'quoted' | 'converted' | 'closed';
export type ContactStatus = 'pending' | 'responded' | 'closed';
export type Status = QuoteStatus | ContactStatus;

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const statusConfig: Record<Status, { label: string; colorClasses: string }> = {
  // Quote statuses
  pending: {
    label: 'Pending',
    colorClasses: 'bg-yellow-100 text-yellow-800 ring-yellow-600/20',
  },
  processing: {
    label: 'Processing',
    colorClasses: 'bg-blue-100 text-blue-800 ring-blue-600/20',
  },
  quoted: {
    label: 'Quoted',
    colorClasses: 'bg-purple-100 text-purple-800 ring-purple-600/20',
  },
  converted: {
    label: 'Converted',
    colorClasses: 'bg-green-100 text-green-800 ring-green-600/20',
  },
  closed: {
    label: 'Closed',
    colorClasses: 'bg-gray-100 text-gray-800 ring-gray-600/20',
  },
  // Contact statuses
  responded: {
    label: 'Responded',
    colorClasses: 'bg-green-100 text-green-800 ring-green-600/20',
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
