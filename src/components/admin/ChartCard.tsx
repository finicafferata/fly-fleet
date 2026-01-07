'use client';

import React from 'react';
import { TimeRange } from '@/lib/analytics/AnalyticsService';

interface ChartCardProps {
  title: string;
  description?: string;
  timeRange: TimeRange;
  onTimeRangeChange?: (timeRange: TimeRange) => void;
  onExport?: () => void;
  loading?: boolean;
  children: React.ReactNode;
}

const timeRangeOptions: { label: string; value: TimeRange }[] = [
  { label: '7 Days', value: '7d' },
  { label: '30 Days', value: '30d' },
  { label: '90 Days', value: '90d' },
  { label: 'All Time', value: 'all' },
];

export function ChartCard({
  title,
  description,
  timeRange,
  onTimeRangeChange,
  onExport,
  loading = false,
  children,
}: ChartCardProps) {
  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {description && (
              <p className="mt-1 text-sm text-gray-500">{description}</p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {/* Time Range Selector */}
            {onTimeRangeChange && (
              <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                {timeRangeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => onTimeRangeChange(option.value)}
                    className={`
                      px-3 py-1 text-xs font-medium transition-colors
                      ${
                        timeRange === option.value
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }
                      ${option.value !== timeRangeOptions[timeRangeOptions.length - 1].value ? 'border-r border-gray-300' : ''}
                    `}
                    disabled={loading}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}

            {/* Export Button */}
            {onExport && (
              <button
                onClick={onExport}
                disabled={loading}
                className="inline-flex items-center px-3 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Export to CSV"
              >
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Export
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Chart Content */}
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-gray-500">Loading data...</span>
            </div>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading ? (
          <div className="h-80 bg-gray-100 rounded-lg animate-pulse" />
        ) : (
          <div className="min-h-[320px]">{children}</div>
        )}
      </div>
    </div>
  );
}
