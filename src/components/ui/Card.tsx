'use client';

import React, { forwardRef } from 'react';
import { clsx } from 'clsx';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  as?: 'div' | 'article' | 'section';
  interactive?: boolean;
  children: React.ReactNode;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({
    variant = 'default',
    padding = 'md',
    as: Component = 'div',
    interactive = false,
    className,
    children,
    ...props
  }, ref) => {
    const baseClasses = [
      'bg-white rounded-lg transition-all duration-200',
      // Navy blue borders as specified in requirements
      'border border-navy-primary border-opacity-10',
    ];

    const variantClasses = {
      default: [],
      elevated: ['shadow-medium hover:shadow-large'],
      outlined: ['border-navy-primary border-opacity-20'],
    };

    const paddingClasses = {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
    };

    const interactiveClasses = interactive
      ? [
          'cursor-pointer',
          'hover:shadow-medium hover:border-opacity-20',
          'focus:outline-none focus:ring-2 focus:ring-accent-blue focus:ring-offset-2',
          'active:transform active:scale-98',
        ]
      : [];

    const cardClasses = clsx(
      baseClasses,
      variantClasses[variant],
      paddingClasses[padding],
      interactiveClasses,
      className
    );

    const cardProps = {
      ref,
      className: cardClasses,
      ...(interactive && {
        tabIndex: 0,
        role: 'button',
      }),
      ...props,
    };

    return React.createElement(Component, cardProps, children);
  }
);

Card.displayName = 'Card';

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  headingLevel?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  children?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  headingLevel: HeadingLevel = 'h3',
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={clsx(
        'border-b border-neutral-light pb-3 mb-4',
        className
      )}
      {...props}
    >
      {title && (
        <HeadingLevel className="text-lg font-semibold text-navy-primary">
          {title}
        </HeadingLevel>
      )}
      {subtitle && (
        <p className="text-sm text-neutral-medium mt-1">
          {subtitle}
        </p>
      )}
      {children}
    </div>
  );
};

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardContent: React.FC<CardContentProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={clsx('text-navy-primary', className)}
      {...props}
    >
      {children}
    </div>
  );
};

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right' | 'between';
}

export const CardFooter: React.FC<CardFooterProps> = ({
  align = 'right',
  className,
  children,
  ...props
}) => {
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between',
  };

  return (
    <div
      className={clsx(
        'border-t border-neutral-light pt-3 mt-4',
        'flex items-center',
        alignClasses[align],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// Preset card layouts for common use cases
export interface FeatureCardProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  action,
  className,
}) => {
  return (
    <Card
      variant="elevated"
      className={clsx('text-center', className)}
      as="article"
      role="article"
    >
      {icon && (
        <div className="flex justify-center mb-4 text-accent-blue">
          {icon}
        </div>
      )}
      <CardHeader title={title} headingLevel="h3" />
      <CardContent>
        <p className="text-neutral-medium mb-4">
          {description}
        </p>
      </CardContent>
      {action && (
        <CardFooter align="center">
          {action}
        </CardFooter>
      )}
    </Card>
  );
};

export interface StatsCardProps {
  label: string;
  value: string | number;
  change?: {
    value: string | number;
    type: 'increase' | 'decrease' | 'neutral';
  };
  icon?: React.ReactNode;
  className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  label,
  value,
  change,
  icon,
  className,
}) => {
  const changeColors = {
    increase: 'text-green-600',
    decrease: 'text-red-600',
    neutral: 'text-neutral-medium',
  };

  return (
    <Card
      variant="outlined"
      className={className}
      as="article"
      role="region"
      aria-labelledby={`stats-${label.replace(/\s+/g, '-').toLowerCase()}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p
            id={`stats-${label.replace(/\s+/g, '-').toLowerCase()}`}
            className="text-sm font-medium text-neutral-medium"
          >
            {label}
          </p>
          <p className="text-2xl font-semibold text-navy-primary mt-1">
            {value}
          </p>
          {change && (
            <p className={clsx('text-sm mt-1', changeColors[change.type])}>
              {change.type === 'increase' && '↗ '}
              {change.type === 'decrease' && '↘ '}
              {change.value}
            </p>
          )}
        </div>
        {icon && (
          <div className="text-accent-blue" aria-hidden="true">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};