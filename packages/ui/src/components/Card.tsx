/**
 * Card Component - Child-friendly card container
 */

import React, { forwardRef } from 'react';
import { CardProps } from '../types';
import { cn } from '../utils';
import { colors, spacing, borderRadius, shadows } from '../tokens';

const cardVariants = {
  elevated: {
    backgroundColor: colors.background.primary,
    boxShadow: shadows.md,
    border: 'none',
  },
  outlined: {
    backgroundColor: colors.background.primary,
    boxShadow: 'none',
    border: `2px solid ${colors.neutral[200]}`,
  },
  filled: {
    backgroundColor: colors.background.secondary,
    boxShadow: 'none',
    border: 'none',
  },
};

const paddingStyles = {
  sm: spacing[4],
  md: spacing[6],
  lg: spacing[8],
  xl: spacing[10],
};

/**
 * Card component for grouping content
 *
 * @example
 * ```tsx
 * <Card variant="elevated" padding="lg" interactive>
 *   <h3>Farm Progress</h3>
 *   <p>You've planted 5 crops today!</p>
 * </Card>
 * ```
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      variant = 'elevated',
      padding = 'md',
      interactive = false,
      color = 'neutral',
      className,
      style,
      testId,
      onClick,
      ...props
    },
    ref
  ) => {
    const baseStyles: React.CSSProperties = {
      borderRadius: borderRadius.xl,
      transition: 'all 0.2s ease-in-out',
      ...cardVariants[variant],
      padding: paddingStyles[padding],
    };

    const interactiveStyles: React.CSSProperties = interactive
      ? {
          cursor: 'pointer',
          transform: 'translateY(0)',
        }
      : {};

    const colorStyles: React.CSSProperties =
      color !== 'neutral'
        ? {
            borderLeftWidth: '4px',
            borderLeftStyle: 'solid',
            borderLeftColor: colors.primary[500], // Default to primary
          }
        : {};

    const combinedStyles = {
      ...baseStyles,
      ...interactiveStyles,
      ...colorStyles,
      ...style,
    };

    return (
      <div
        ref={ref}
        style={combinedStyles}
        className={cn('cropschool-card', className)}
        onClick={onClick}
        data-testid={testId}
        role={interactive ? 'button' : undefined}
        tabIndex={interactive ? 0 : undefined}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
