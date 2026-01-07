'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Listbox } from '@headlessui/react';
import { clsx } from 'clsx';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterBarProps {
  statusOptions?: FilterOption[];
  showServiceTypeFilter?: boolean;
  showDateFilter?: boolean;
  showSearch?: boolean;
  showStaleToggle?: boolean;
  placeholder?: string;
  onFilterChange?: () => void;
}

const serviceTypeOptions: FilterOption[] = [
  { label: 'All Service Types', value: '' },
  { label: 'Charter', value: 'charter' },
  { label: 'Multi-city', value: 'multicity' },
  { label: 'Helicopter', value: 'helicopter' },
  { label: 'Medical', value: 'medical' },
  { label: 'Cargo', value: 'cargo' },
  { label: 'Other', value: 'other' },
];

export function FilterBar({
  statusOptions = [],
  showServiceTypeFilter = false,
  showDateFilter = false,
  showSearch = true,
  showStaleToggle = false,
  placeholder = 'Search...',
  onFilterChange,
}: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Local state for search input (debounced)
  const [searchValue, setSearchValue] = useState(searchParams.get('search') || '');
  const [selectedStatus, setSelectedStatus] = useState(
    statusOptions.find((opt) => opt.value === searchParams.get('status')) || statusOptions[0]
  );
  const [selectedServiceType, setSelectedServiceType] = useState(
    serviceTypeOptions.find((opt) => opt.value === searchParams.get('serviceType')) || serviceTypeOptions[0]
  );
  const [dateFrom, setDateFrom] = useState(searchParams.get('dateFrom') || '');
  const [dateTo, setDateTo] = useState(searchParams.get('dateTo') || '');
  const [staleOnly, setStaleOnly] = useState(searchParams.get('staleOnly') === 'true');

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      updateURL({ search: searchValue || undefined });
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue]);

  // Update URL with new params
  const updateURL = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams);

      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });

      router.push(`${pathname}?${params.toString()}`);
      onFilterChange?.();
    },
    [pathname, router, searchParams, onFilterChange]
  );

  // Handle status change
  const handleStatusChange = (option: FilterOption) => {
    setSelectedStatus(option);
    updateURL({ status: option.value || undefined });
  };

  // Handle service type change
  const handleServiceTypeChange = (option: FilterOption) => {
    setSelectedServiceType(option);
    updateURL({ serviceType: option.value || undefined });
  };

  // Handle date changes
  const handleDateFromChange = (value: string) => {
    setDateFrom(value);
    updateURL({ dateFrom: value || undefined });
  };

  const handleDateToChange = (value: string) => {
    setDateTo(value);
    updateURL({ dateTo: value || undefined });
  };

  // Handle stale toggle
  const handleStaleToggle = () => {
    const newValue = !staleOnly;
    setStaleOnly(newValue);
    updateURL({ staleOnly: newValue ? 'true' : undefined });
  };

  // Reset all filters
  const handleReset = () => {
    setSearchValue('');
    setSelectedStatus(statusOptions[0]);
    setSelectedServiceType(serviceTypeOptions[0]);
    setDateFrom('');
    setDateTo('');
    setStaleOnly(false);
    router.push(pathname);
    onFilterChange?.();
  };

  // Count active filters
  const activeFilterCount = [
    searchValue,
    selectedStatus?.value,
    selectedServiceType?.value,
    dateFrom,
    dateTo,
    staleOnly,
  ].filter(Boolean).length;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex flex-col gap-4">
        {/* First row: Search and Status */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          {showSearch && (
            <div className="flex-1">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="block w-full rounded-md border-gray-300 pl-10 pr-3 py-2 text-sm focus:border-navy-primary focus:ring-navy-primary"
                  placeholder={placeholder}
                />
              </div>
            </div>
          )}

          {/* Status Filter */}
          {statusOptions.length > 0 && (
            <div className="w-full sm:w-48">
              <Listbox value={selectedStatus} onChange={handleStatusChange}>
                <div className="relative">
                  <Listbox.Button className="relative w-full cursor-pointer rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left text-sm focus:border-navy-primary focus:outline-none focus:ring-1 focus:ring-navy-primary">
                    <span className="block truncate">{selectedStatus?.label}</span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                      </svg>
                    </span>
                  </Listbox.Button>
                  <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    {statusOptions.map((option) => (
                      <Listbox.Option
                        key={option.value}
                        value={option}
                        className={({ active }) =>
                          clsx(
                            'relative cursor-pointer select-none py-2 pl-3 pr-9',
                            active ? 'bg-navy-primary text-white' : 'text-gray-900'
                          )
                        }
                      >
                        {({ selected }) => (
                          <>
                            <span className={clsx('block truncate', selected ? 'font-semibold' : 'font-normal')}>
                              {option.label}
                            </span>
                            {selected && (
                              <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </span>
                            )}
                          </>
                        )}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </div>
              </Listbox>
            </div>
          )}

          {/* Service Type Filter */}
          {showServiceTypeFilter && (
            <div className="w-full sm:w-48">
              <Listbox value={selectedServiceType} onChange={handleServiceTypeChange}>
                <div className="relative">
                  <Listbox.Button className="relative w-full cursor-pointer rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left text-sm focus:border-navy-primary focus:outline-none focus:ring-1 focus:ring-navy-primary">
                    <span className="block truncate">{selectedServiceType?.label}</span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                      </svg>
                    </span>
                  </Listbox.Button>
                  <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    {serviceTypeOptions.map((option) => (
                      <Listbox.Option
                        key={option.value}
                        value={option}
                        className={({ active }) =>
                          clsx(
                            'relative cursor-pointer select-none py-2 pl-3 pr-9',
                            active ? 'bg-navy-primary text-white' : 'text-gray-900'
                          )
                        }
                      >
                        {({ selected }) => (
                          <>
                            <span className={clsx('block truncate', selected ? 'font-semibold' : 'font-normal')}>
                              {option.label}
                            </span>
                            {selected && (
                              <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </span>
                            )}
                          </>
                        )}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </div>
              </Listbox>
            </div>
          )}
        </div>

        {/* Second row: Date filters and Stale toggle */}
        {(showDateFilter || showStaleToggle) && (
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Date From */}
            {showDateFilter && (
              <div className="flex-1">
                <label htmlFor="dateFrom" className="block text-xs font-medium text-gray-700 mb-1">
                  From Date
                </label>
                <input
                  type="date"
                  id="dateFrom"
                  value={dateFrom}
                  onChange={(e) => handleDateFromChange(e.target.value)}
                  className="block w-full rounded-md border-gray-300 text-sm focus:border-navy-primary focus:ring-navy-primary"
                />
              </div>
            )}

            {/* Date To */}
            {showDateFilter && (
              <div className="flex-1">
                <label htmlFor="dateTo" className="block text-xs font-medium text-gray-700 mb-1">
                  To Date
                </label>
                <input
                  type="date"
                  id="dateTo"
                  value={dateTo}
                  onChange={(e) => handleDateToChange(e.target.value)}
                  className="block w-full rounded-md border-gray-300 text-sm focus:border-navy-primary focus:ring-navy-primary"
                />
              </div>
            )}

            {/* Stale Only Toggle */}
            {showStaleToggle && (
              <div className="flex items-end">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={staleOnly}
                    onChange={handleStaleToggle}
                    className="h-4 w-4 rounded border-gray-300 text-navy-primary focus:ring-navy-primary"
                  />
                  <span className="ml-2 text-sm text-gray-700">Stale only (7+ days)</span>
                </label>
              </div>
            )}
          </div>
        )}

        {/* Bottom row: Active filter count and Reset button */}
        {activeFilterCount > 0 && (
          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
            <div className="flex items-center text-sm text-gray-600">
              <span className="inline-flex items-center rounded-full bg-navy-primary px-2.5 py-0.5 text-xs font-medium text-white">
                {activeFilterCount}
              </span>
              <span className="ml-2">
                {activeFilterCount === 1 ? 'filter active' : 'filters active'}
              </span>
            </div>
            <button
              onClick={handleReset}
              className="text-sm font-medium text-navy-primary hover:text-navy-primary/80 transition-colors"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
