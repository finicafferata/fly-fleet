'use client';

import React, { useState } from 'react';
import { clsx } from 'clsx';
import { Dialog, Listbox } from '@headlessui/react';

interface BulkAction {
  label: string;
  value: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'danger';
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
}

interface BulkActionBarProps {
  selectedCount: number;
  actions?: BulkAction[];
  onAction: (actionValue: string) => Promise<void>;
  onDeselect: () => void;
  loading?: boolean;
  className?: string;
}

export function BulkActionBar({
  selectedCount,
  actions = [],
  onAction,
  onDeselect,
  loading = false,
  className,
}: BulkActionBarProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<BulkAction | null>(null);
  const [selectedAction, setSelectedAction] = useState<BulkAction | null>(null);

  if (selectedCount === 0) {
    return null;
  }

  const handleActionClick = (action: BulkAction) => {
    if (action.requiresConfirmation) {
      setPendingAction(action);
      setConfirmDialogOpen(true);
    } else {
      executeAction(action);
    }
  };

  const executeAction = async (action: BulkAction) => {
    setIsProcessing(true);
    setSelectedAction(action);
    try {
      await onAction(action.value);
    } finally {
      setIsProcessing(false);
      setSelectedAction(null);
      setConfirmDialogOpen(false);
      setPendingAction(null);
    }
  };

  const handleConfirm = () => {
    if (pendingAction) {
      executeAction(pendingAction);
    }
  };

  const handleCancel = () => {
    setConfirmDialogOpen(false);
    setPendingAction(null);
  };

  return (
    <>
      <div
        className={clsx(
          'sticky top-0 z-30 border-b border-gray-200 bg-white shadow-sm',
          className
        )}
      >
        <div className="flex items-center justify-between px-4 py-3 sm:px-6">
          {/* Left side: Selection count */}
          <div className="flex items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-primary text-white font-semibold text-sm">
              {selectedCount}
            </div>
            <span className="ml-3 text-sm font-medium text-gray-900">
              {selectedCount} {selectedCount === 1 ? 'item' : 'items'} selected
            </span>
          </div>

          {/* Right side: Actions */}
          <div className="flex items-center space-x-3">
            {/* Action buttons */}
            {actions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => handleActionClick(action)}
                disabled={isProcessing || loading}
                className={clsx(
                  'inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-offset-2',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  action.variant === 'danger'
                    ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
                    : 'bg-navy-primary text-white hover:bg-navy-primary/90 focus:ring-navy-primary'
                )}
              >
                {isProcessing && selectedAction === action ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    {action.icon && <span className="mr-2">{action.icon}</span>}
                    {action.label}
                  </>
                )}
              </button>
            ))}

            {/* Deselect button */}
            <button
              onClick={onDeselect}
              disabled={isProcessing || loading}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-navy-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Deselect All
            </button>
          </div>
        </div>

        {/* Progress bar (when processing) */}
        {isProcessing && (
          <div className="h-1 w-full bg-gray-200">
            <div className="h-full bg-navy-primary animate-pulse" style={{ width: '100%' }} />
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleCancel}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="flex items-start">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                  />
                </svg>
              </div>
              <div className="ml-4 flex-1">
                <Dialog.Title as="h3" className="text-lg font-semibold text-gray-900">
                  Confirm Action
                </Dialog.Title>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    {pendingAction?.confirmationMessage ||
                      `Are you sure you want to perform this action on ${selectedCount} ${
                        selectedCount === 1 ? 'item' : 'items'
                      }? This action cannot be undone.`}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-navy-primary focus:ring-offset-2 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className={clsx(
                  'rounded-md px-4 py-2 text-sm font-semibold text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors',
                  pendingAction?.variant === 'danger'
                    ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                    : 'bg-navy-primary hover:bg-navy-primary/90 focus:ring-navy-primary'
                )}
              >
                Confirm
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
}
