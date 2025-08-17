/**
 * Typography Component - Child-friendly text component
 */

import React, { forwardRef } from 'react';
import { TypographyProps } from '../types';
import { cn } from '../utils';
import { colors, typography } from '../tokens';

const variantStyles = {
  display: {
    fontFamily: typography.fontFamily.display,
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.lineHeight.tight,
  },
  heading: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.semibold,
    lineHeight: typography.lineHeight.snug,
  },
  subheading: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.medium,
    lineHeight: typography.lineHeight.normal,
  },
  body: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.normal,
    lineHeight: typography.lineHeight.relaxed,
  },
  caption: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.normal,
    lineHeight: typography.lineHeight.normal,
  },
  overline: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: typography.lineHeight.normal,
    textTransform: 'uppercase' as const,
    letterSpacing: typography.letterSpacing.wide,
  },
};

const sizeMapping = {
  xs: typography.fontSize.xs,
  sm: typography.fontSize.sm,
  md: typography.fontSize.base,
  lg: typography.fontSize.lg,
  xl: typography.fontSize.xl,
  '2xl': typography.fontSize['2xl'],
  '3xl': typography.fontSize['3xl'],
  '4xl': typography.fontSize['4xl'],
  '5xl': typography.fontSize['5xl'],
  '6xl': typography.fontSize['6xl'],
};

const weightMapping = {
  light: typography.fontWeight.light,
  normal: typography.fontWeight.normal,
  medium: typography.fontWeight.medium,
  semibold: typography.fontWeight.semibold,
  bold: typography.fontWeight.bold,
  extrabold: typography.fontWeight.extrabold,
};

const lineHeightMapping = {
  tight: typography.lineHeight.tight,
  snug: typography.lineHeight.snug,
  normal: typography.lineHeight.normal,
  relaxed: typography.lineHeight.relaxed,
  loose: typography.lineHeight.loose,
};

const colorMapping = {
  primary: colors.primary[500],
  secondary: colors.secondary[500],
  success: colors.semantic.success,
  warning: colors.semantic.warning,
  error: colors.semantic.error,
  info: colors.semantic.info,
  neutral: colors.neutral[900],
  inherit: 'inherit',
};

/**
 * Typography component for consistent text styling
 *
 * @example
 * ```tsx
 * <Typography variant="heading" size="2xl" color="primary">
 *   Welcome to CropSchool!
 * </Typography>
 *
 * <Typography variant="body" size="lg" lineHeight="relaxed">
 *   Learn about farming while having fun!
 * </Typography>
 * ```
 */
export const Typography = forwardRef<HTMLElement, TypographyProps>(
  (
    {
      as: Component = 'p',
      variant = 'body',
      size,
      weight,
      color = 'neutral',
      align = 'left',
      truncate = false,
      lineHeight,
      children,
      className,
      style,
      testId,
      ...props
    },
    ref
  ) => {
    const baseStyles: React.CSSProperties = {
      margin: 0,
      padding: 0,
      ...variantStyles[variant],
    };

    // Override with specific props
    if (size) {
      baseStyles.fontSize = sizeMapping[size];
    }

    if (weight) {
      baseStyles.fontWeight = weightMapping[weight];
    }

    if (color) {
      baseStyles.color = colorMapping[color];
    }

    if (align) {
      baseStyles.textAlign = align;
    }

    if (lineHeight) {
      baseStyles.lineHeight = lineHeightMapping[lineHeight];
    }

    if (truncate) {
      baseStyles.overflow = 'hidden';
      baseStyles.textOverflow = 'ellipsis';
      baseStyles.whiteSpace = 'nowrap';
    }

    const combinedStyles = {
      ...baseStyles,
      ...style,
    };

    return (
      <Component
        ref={ref as any}
        style={combinedStyles}
        className={cn('cropschool-typography', className)}
        data-testid={testId}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Typography.displayName = 'Typography';
