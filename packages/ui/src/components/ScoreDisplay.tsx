/**
 * Score Display Component - Child-friendly score indicator
 */

import React, { forwardRef, useEffect, useState } from 'react';
import { ScoreDisplayProps } from '../types';
import { cn } from '../utils';
import { colors, spacing, borderRadius, typography } from '../tokens';

const sizeStyles = {
  sm: {
    padding: `${spacing[2]} ${spacing[4]}`,
    fontSize: typography.fontSize.lg,
    iconSize: '1.25rem',
  },
  md: {
    padding: `${spacing[3]} ${spacing[6]}`,
    fontSize: typography.fontSize.xl,
    iconSize: '1.5rem',
  },
  lg: {
    padding: `${spacing[4]} ${spacing[8]}`,
    fontSize: typography.fontSize['2xl'],
    iconSize: '2rem',
  },
  xl: {
    padding: `${spacing[6]} ${spacing[10]}`,
    fontSize: typography.fontSize['3xl'],
    iconSize: '2.5rem',
  },
};

const colorMapping = {
  primary: {
    background: colors.primary[50],
    color: colors.primary[700],
    border: colors.primary[200],
  },
  secondary: {
    background: colors.secondary[50],
    color: colors.secondary[700],
    border: colors.secondary[200],
  },
  success: {
    background: colors.neutral[50],
    color: colors.semantic.success,
    border: colors.neutral[200],
  },
  warning: {
    background: colors.neutral[50],
    color: colors.semantic.warning,
    border: colors.neutral[200],
  },
  error: {
    background: colors.neutral[50],
    color: colors.semantic.error,
    border: colors.neutral[200],
  },
  info: {
    background: colors.neutral[50],
    color: colors.semantic.info,
    border: colors.neutral[200],
  },
  neutral: {
    background: colors.neutral[50],
    color: colors.neutral[700],
    border: colors.neutral[200],
  },
};

/**
 * Score Display component for showing game scores with animations
 *
 * @example
 * ```tsx
 * <ScoreDisplay
 *   score={1250}
 *   previousScore={1000}
 *   showChange
 *   color="success"
 *   size="lg"
 *   icon={<StarIcon />}
 *   label="Total Score"
 * />
 * ```
 */
export const ScoreDisplay = forwardRef<HTMLDivElement, ScoreDisplayProps>(
  (
    {
      score,
      maxScore,
      showChange = false,
      previousScore,
      size = 'md',
      color = 'primary',
      icon,
      label,
      className,
      style,
      testId,
      ...props
    },
    ref
  ) => {
    const [displayScore, setDisplayScore] = useState(score);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
      if (
        showChange &&
        previousScore !== undefined &&
        previousScore !== score
      ) {
        setIsAnimating(true);

        // Animate score change
        const startScore = previousScore;
        const endScore = score;
        const duration = 1000; // 1 second
        const startTime = Date.now();

        const animateScore = () => {
          const now = Date.now();
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);

          // Easing function for smooth animation
          const easeOutQuart = 1 - Math.pow(1 - progress, 4);
          const currentScore = Math.round(
            startScore + (endScore - startScore) * easeOutQuart
          );

          setDisplayScore(currentScore);

          if (progress < 1) {
            requestAnimationFrame(animateScore);
          } else {
            setIsAnimating(false);
          }
        };

        requestAnimationFrame(animateScore);
      } else {
        setDisplayScore(score);
      }
    }, [score, previousScore, showChange]);

    const colorStyle = colorMapping[color];
    const sizeStyle = sizeStyles[size];

    const scoreChange = previousScore !== undefined ? score - previousScore : 0;
    const showChangeIndicator = showChange && scoreChange !== 0;

    const baseStyles: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      gap: spacing[2],
      backgroundColor: colorStyle.background,
      color: colorStyle.color,
      border: `2px solid ${colorStyle.border}`,
      borderRadius: borderRadius.xl,
      fontFamily: typography.fontFamily.primary,
      fontWeight: typography.fontWeight.bold,
      fontSize: sizeStyle.fontSize,
      padding: sizeStyle.padding,
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.3s ease-in-out',
      ...style,
    };

    const formatScore = (value: number): string => {
      if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
      } else if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K`;
      }
      return value.toLocaleString();
    };

    return (
      <div
        ref={ref}
        style={baseStyles}
        className={cn('cropschool-score-display', className)}
        data-testid={testId}
        {...props}
      >
        {icon && (
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: sizeStyle.iconSize,
            }}
            aria-hidden="true"
          >
            {icon}
          </span>
        )}

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
          }}
        >
          {label && (
            <span
              style={{
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                opacity: 0.8,
                lineHeight: 1,
              }}
            >
              {label}
            </span>
          )}

          <div
            style={{ display: 'flex', alignItems: 'baseline', gap: spacing[2] }}
          >
            <span
              style={{
                fontSize: sizeStyle.fontSize,
                fontWeight: typography.fontWeight.bold,
                transform: isAnimating ? 'scale(1.1)' : 'scale(1)',
                transition: 'transform 0.2s ease-in-out',
              }}
            >
              {formatScore(displayScore)}
            </span>

            {maxScore && (
              <span
                style={{
                  fontSize: typography.fontSize.sm,
                  opacity: 0.6,
                  fontWeight: typography.fontWeight.normal,
                }}
              >
                / {formatScore(maxScore)}
              </span>
            )}
          </div>
        </div>

        {showChangeIndicator && (
          <div
            style={{
              position: 'absolute',
              top: '-10px',
              right: '10px',
              backgroundColor:
                scoreChange > 0
                  ? colors.semantic.success
                  : colors.semantic.error,
              color: colors.neutral[0],
              padding: `${spacing[1]} ${spacing[2]}`,
              borderRadius: borderRadius.md,
              fontSize: typography.fontSize.xs,
              fontWeight: typography.fontWeight.semibold,
              animation: 'scoreChange 2s ease-out forwards',
            }}
          >
            {scoreChange > 0 ? '+' : ''}
            {scoreChange}
          </div>
        )}

        {isAnimating && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `linear-gradient(90deg, transparent, ${colors.neutral[0]}40, transparent)`,
              animation: 'scoreShimmer 1s ease-out',
            }}
          />
        )}
      </div>
    );
  }
);

ScoreDisplay.displayName = 'ScoreDisplay';
