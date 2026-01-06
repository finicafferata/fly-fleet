'use client';

import React, { useState, useRef, useEffect, useId, forwardRef } from 'react';
import { clsx } from 'clsx';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  helpText?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export const Select = forwardRef<HTMLButtonElement, SelectProps>(
  ({
    label,
    placeholder = 'Select an option',
    options,
    value,
    onChange,
    error,
    helpText,
    required,
    disabled,
    className,
    id,
  }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeOptionIndex, setActiveOptionIndex] = useState(-1);
    const selectId = useId();
    const finalId = id || selectId;
    const listboxId = `${finalId}-listbox`;
    const helpTextId = `${finalId}-help`;
    const errorId = `${finalId}-error`;

    const triggerRef = useRef<HTMLButtonElement>(null);
    const listboxRef = useRef<HTMLUListElement>(null);

    const hasError = Boolean(error);
    const selectedOption = options.find(option => option.value === value);

    // Handle keyboard navigation
    useEffect(() => {
      if (!isOpen) return;

      const handleKeyDown = (event: KeyboardEvent) => {
        switch (event.key) {
          case 'ArrowDown':
            event.preventDefault();
            setActiveOptionIndex(prev => {
              const nextIndex = prev < options.length - 1 ? prev + 1 : 0;
              return options[nextIndex].disabled ? (nextIndex < options.length - 1 ? nextIndex + 1 : 0) : nextIndex;
            });
            break;
          case 'ArrowUp':
            event.preventDefault();
            setActiveOptionIndex(prev => {
              const nextIndex = prev > 0 ? prev - 1 : options.length - 1;
              return options[nextIndex].disabled ? (nextIndex > 0 ? nextIndex - 1 : options.length - 1) : nextIndex;
            });
            break;
          case 'Enter':
          case ' ':
            event.preventDefault();
            if (activeOptionIndex >= 0 && !options[activeOptionIndex].disabled) {
              onChange?.(options[activeOptionIndex].value);
              setIsOpen(false);
              setActiveOptionIndex(-1);
              triggerRef.current?.focus();
            }
            break;
          case 'Escape':
            setIsOpen(false);
            setActiveOptionIndex(-1);
            triggerRef.current?.focus();
            break;
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, activeOptionIndex, options, onChange]);

    // Handle clicks outside
    useEffect(() => {
      if (!isOpen) return;

      const handleClickOutside = (event: MouseEvent) => {
        if (
          triggerRef.current &&
          listboxRef.current &&
          !triggerRef.current.contains(event.target as Node) &&
          !listboxRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
          setActiveOptionIndex(-1);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const handleToggle = () => {
      if (disabled) return;
      setIsOpen(!isOpen);
      setActiveOptionIndex(-1);
    };

    const handleOptionClick = (optionValue: string) => {
      onChange?.(optionValue);
      setIsOpen(false);
      setActiveOptionIndex(-1);
      triggerRef.current?.focus();
    };

    const triggerClasses = clsx(
      // Base styles
      'w-full px-3 py-2.5 text-left',
      'border rounded-lg bg-white',
      'transition-colors duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-1',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'flex items-center justify-between',

      // Minimum touch target
      'min-h-[44px]',

      // Variant styles
      {
        'border-neutral-medium text-black focus:border-navy-primary focus:ring-navy-primary':
          !hasError,
        'border-red-500 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-500':
          hasError,
      },

      className
    );

    const listboxClasses = clsx(
      'absolute z-50 w-full mt-1',
      'bg-white border border-neutral-medium rounded-lg shadow-medium',
      'max-h-60 overflow-auto',
      'py-1'
    );

    const optionClasses = (option: SelectOption, index: number) => clsx(
      'px-3 py-2 cursor-pointer transition-colors duration-150',
      'text-left w-full',
      {
        'text-neutral-medium cursor-not-allowed': option.disabled,
        'text-black hover:bg-neutral-light': !option.disabled,
        'bg-navy-primary text-white': index === activeOptionIndex && !option.disabled,
        'bg-neutral-light': value === option.value && index !== activeOptionIndex,
      }
    );

    return (
      <div className="space-y-1">
        {label && (
          <label
            htmlFor={finalId}
            className={clsx(
              'block text-sm font-medium',
              hasError ? 'text-red-700' : 'text-navy-primary'
            )}
          >
            {label}
            {required && (
              <span className="text-red-500 ml-1" aria-label="required">
                *
              </span>
            )}
          </label>
        )}

        <div className="relative">
          <button
            ref={triggerRef}
            id={finalId}
            type="button"
            className={triggerClasses}
            onClick={handleToggle}
            disabled={disabled}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            aria-labelledby={label ? undefined : finalId}
            aria-describedby={clsx({
              [helpTextId]: helpText,
              [errorId]: hasError,
            })}
            aria-activedescendant={
              isOpen && activeOptionIndex >= 0
                ? `${listboxId}-option-${activeOptionIndex}`
                : undefined
            }
            role="combobox"
          >
            <span className={clsx(
              selectedOption ? 'text-black' : 'text-neutral-medium'
            )}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <svg
              className={clsx(
                'w-3 h-3 ml-2 transition-transform duration-200',
                isOpen && 'rotate-180'
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {isOpen && (
            <ul
              ref={listboxRef}
              id={listboxId}
              className={listboxClasses}
              role="listbox"
              aria-labelledby={finalId}
            >
              {options.map((option, index) => (
                <li
                  key={option.value}
                  id={`${listboxId}-option-${index}`}
                  className={optionClasses(option, index)}
                  role="option"
                  aria-selected={value === option.value}
                  aria-disabled={option.disabled}
                  onClick={() => !option.disabled && handleOptionClick(option.value)}
                  onMouseEnter={() => !option.disabled && setActiveOptionIndex(index)}
                >
                  {option.label}
                </li>
              ))}
            </ul>
          )}
        </div>

        {helpText && !hasError && (
          <p
            id={helpTextId}
            className="text-sm text-neutral-medium"
          >
            {helpText}
          </p>
        )}

        {hasError && (
          <p
            id={errorId}
            className="text-sm text-red-600"
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';