/**
 * Progress Component - Child-friendly progress indicators
 */

import React, { forwardRef } from 'react';
import { ProgressProps } from '../types';
import { cn } from '../utils';
import { colors, spacing, borderRadius } from '../tokens';

const sizeStyles = {
  sm: {
    height: spacing[2],
    fontSize: '0.75rem',
  },
  md: {
    height: spacing[3],
    fontSize: '0.875rem',
  },
  lg: {
    height: spacing[4],
    fontSize: '1rem',
  },
  xl: {
    height: spacing[6],
    fontSize: '1.125rem',
  },
};

const colorMapping = {
  primary: colors.primary[500],
  secondary: colors.secondary[500],
  success: colors.semantic.success,
  warning: colors.semantic.warning,
  error: colors.semantic.error,
  info: colors.semantic.info,
  neutral: colors.neutral[500],
};

/**
 * Progress component for showing completion status
 *
 * @example
 * ```tsx
 * <Progress
 *   value={75}
 *   color="success"
 *   size="lg"
 *   showLabel
 *   label="Level Progress"
 *   animated
 * />
 * ```
 */
export const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      value,
      max = 100,
      min = 0,
      size = 'md',
      color = 'primary',
      showLabel = false,
      label,
      variant = 'linear',
      animated = true,
      className,
      style,
      testId,
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(
      Math.max(((value - min) / (max - min)) * 100, 0),
      100
    );

    if (variant === 'circular') {
      const radius =
        size === 'sm' ? 20 : size === 'md' ? 30 : size === 'lg' ? 40 : 50;
      const circumference = 2 * Math.PI * radius;
      const strokeDashoffset =
        circumference - (percentage / 100) * circumference;

      return (
        <div
          ref={ref}
          className={cn('cropschool-progress-circular', className)}
          style={{
            display: 'inline-flex',
            flexDirection: 'column',
            alignItems: 'center',
            ...style,
          }}
          data-testid={testId}
          {...props}
        >
          <div style={{ position: 'relative', display: 'inline-flex' }}>
            <svg
              width={(radius + 10) * 2}
              height={(radius + 10) * 2}
              style={{ transform: 'rotate(-90deg)' }}
            >
              {/* Background circle */}
              <circle
                cx={radius + 10}
                cy={radius + 10}
                r={radius}
                stroke={colors.neutral[200]}
                strokeWidth="4"
                fill="transparent"
              />
              {/* Progress circle */}
              <circle
                cx={radius + 10}
                cy={radius + 10}
                r={radius}
                stroke={colorMapping[color]}
                strokeWidth="4"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{
                  transition: animated
                    ? 'stroke-dashoffset 0.5s ease-in-out'
                    : 'none',
                }}
              />
            </svg>
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontWeight: 600,
                fontSize: sizeStyles[size].fontSize,
                color: colorMapping[color],
              }}
            >
              {Math.round(percentage)}%
            </div>
          </div>
          {(showLabel || label) && (
            <div
              style={{
                marginTop: spacing[2],
                fontSize: sizeStyles[size].fontSize,
                color: colors.neutral[700],
                textAlign: 'center',
              }}
            >
              {label || `${value} / ${max}`}
            </div>
          )}
        </div>
      );
    }

    // Linear progress
    return (
      <div
        ref={ref}
        className={cn('cropschool-progress-linear', className)}
        style={{ width: '100%', ...style }}
        data-testid={testId}
        {...props}
      >
        {(showLabel || label) && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: spacing[1],
            }}
          >
            <span
              style={{
                fontSize: sizeStyles[size].fontSize,
                fontWeight: 500,
                color: colors.neutral[700],
              }}
            >
              {label || 'Progress'}
            </span>
            <span
              style={{
                fontSize: sizeStyles[size].fontSize,
                fontWeight: 600,
                color: colorMapping[color],
              }}
            >
              {Math.round(percentage)}%
            </span>
          </div>
        )}
        <div
          style={{
            width: '100%',
            height: sizeStyles[size].height,
            backgroundColor: colors.neutral[200],
            borderRadius: borderRadius.full,
            overflow: 'hidden',
            position: 'relative',
          }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-label={label || 'Progress'}
        >
          <div
            style={{
              width: `${percentage}%`,
              height: '100%',
              backgroundColor: colorMapping[color],
              borderRadius: borderRadius.full,
              transition: animated ? 'width 0.5s ease-in-out' : 'none',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {animated && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  backgroundImage: `linear-gradient(
                  45deg,
                  rgba(255, 255, 255, 0.15) 25%,
                  transparent 25%,
                  transparent 50%,
                  rgba(255, 255, 255, 0.15) 50%,
                  rgba(255, 255, 255, 0.15) 75%,
                  transparent 75%,
                  transparent
                )`,
                  backgroundSize: '1rem 1rem',
                  animation: 'progress-stripes 1s linear infinite',
                }}
              />
            )}
          </div>
        </div>
      </div>
    );
  }
);

Progress.displayName = 'Progress';
