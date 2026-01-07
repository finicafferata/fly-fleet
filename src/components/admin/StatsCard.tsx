import { clsx } from 'clsx';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    trend: 'up' | 'down';
  };
  icon?: React.ReactNode;
  loading?: boolean;
  className?: string;
}

export function StatsCard({ title, value, change, icon, loading, className }: StatsCardProps) {
  if (loading) {
    return (
      <div className={clsx('bg-white rounded-lg shadow border border-gray-200 p-6', className)}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx('bg-white rounded-lg shadow border border-gray-200 p-6', className)}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
          {change && (
            <div className="mt-2 flex items-center text-sm">
              {change.trend === 'up' ? (
                <svg
                  className="h-4 w-4 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              ) : (
                <svg
                  className="h-4 w-4 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              )}
              <span
                className={clsx(
                  'ml-1 font-medium',
                  change.trend === 'up' ? 'text-green-600' : 'text-red-600'
                )}
              >
                {Math.abs(change.value)}%
              </span>
              <span className="ml-1 text-gray-500">vs last period</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="flex-shrink-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-navy-primary/10">
              {icon}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
