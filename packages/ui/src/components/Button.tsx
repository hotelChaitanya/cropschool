/**
 * Button Component - Child-friendly button with accessibility features
 */

import React, { forwardRef, MouseEvent, FocusEvent } from 'react';
import { motion } from 'framer-motion';
import { ButtonProps } from '../types';
import {
  cn,
  getColor,
  getBorderRadius,
  getSpacing,
  animations,
  focusRing,
} from '../utils';
import {
  colors,
  spacing,
  borderRadius,
  typography,
  touchTarget,
} from '../tokens';

const buttonVariants = {
  solid: {
    primary: {
      backgroundColor: colors.primary[500],
      color: colors.neutral[0],
      border: `2px solid ${colors.primary[500]}`,
      '&:hover': {
        backgroundColor: colors.primary[600],
        borderColor: colors.primary[600],
      },
      '&:active': {
        backgroundColor: colors.primary[700],
        borderColor: colors.primary[700],
      },
    },
    secondary: {
      backgroundColor: colors.secondary[500],
      color: colors.neutral[0],
      border: `2px solid ${colors.secondary[500]}`,
      '&:hover': {
        backgroundColor: colors.secondary[600],
        borderColor: colors.secondary[600],
      },
    },
    success: {
      backgroundColor: colors.semantic.success,
      color: colors.neutral[0],
      border: `2px solid ${colors.semantic.success}`,
    },
    warning: {
      backgroundColor: colors.semantic.warning,
      color: colors.neutral[0],
      border: `2px solid ${colors.semantic.warning}`,
    },
    error: {
      backgroundColor: colors.semantic.error,
      color: colors.neutral[0],
      border: `2px solid ${colors.semantic.error}`,
    },
  },
  outline: {
    primary: {
      backgroundColor: 'transparent',
      color: colors.primary[500],
      border: `2px solid ${colors.primary[500]}`,
      '&:hover': {
        backgroundColor: colors.primary[50],
      },
    },
    secondary: {
      backgroundColor: 'transparent',
      color: colors.secondary[500],
      border: `2px solid ${colors.secondary[500]}`,
      '&:hover': {
        backgroundColor: colors.secondary[50],
      },
    },
  },
  ghost: {
    primary: {
      backgroundColor: 'transparent',
      color: colors.primary[500],
      border: '2px solid transparent',
      '&:hover': {
        backgroundColor: colors.primary[50],
      },
    },
  },
  soft: {
    primary: {
      backgroundColor: colors.primary[50],
      color: colors.primary[700],
      border: '2px solid transparent',
      '&:hover': {
        backgroundColor: colors.primary[100],
      },
    },
  },
};

const sizeStyles = {
  sm: {
    padding: `${spacing[2]} ${spacing[4]}`,
    fontSize: typography.fontSize.sm,
    minHeight: spacing[10], // Still accessible
    minWidth: spacing[16],
  },
  md: {
    padding: `${spacing[3]} ${spacing[6]}`,
    fontSize: typography.fontSize.base,
    minHeight: touchTarget.minimum, // 48px minimum
    minWidth: spacing[20],
  },
  lg: {
    padding: `${spacing[4]} ${spacing[8]}`,
    fontSize: typography.fontSize.lg,
    minHeight: touchTarget.comfortable, // 64px
    minWidth: spacing[24],
  },
  xl: {
    padding: `${spacing[5]} ${spacing[10]}`,
    fontSize: typography.fontSize.xl,
    minHeight: touchTarget.large, // 80px
    minWidth: spacing[32],
  },
};

/**
 * Child-friendly Button component with accessibility features
 *
 * Features:
 * - Large touch targets for children
 * - High contrast colors
 * - Fun animations
 * - Screen reader support
 * - Keyboard navigation
 *
 * @example
 * ```tsx
 * <Button
 *   variant="solid"
 *   color="primary"
 *   size="lg"
 *   leftIcon={<StarIcon />}
 *   onClick={() => console.log('Button clicked!')}
 * >
 *   Play Game
 * </Button>
 * ```
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'solid',
      size = 'md',
      color = 'primary',
      loading = false,
      disabled = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      animation = 'bounce',
      className,
      style,
      testId,
      onClick,
      ...props
    },
    ref
  ) => {
    const baseStyles: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing[2],
      fontFamily: typography.fontFamily.primary,
      fontWeight: typography.fontWeight.semibold,
      borderRadius: borderRadius.lg,
      cursor: disabled || loading ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s ease-in-out',
      textDecoration: 'none',
      outline: 'none',
      position: 'relative',
      overflow: 'hidden',
      userSelect: 'none',
      width: fullWidth ? '100%' : 'auto',
      opacity: disabled ? 0.6 : 1,
      ...sizeStyles[size],
      ...buttonVariants[variant]?.[
        color as keyof (typeof buttonVariants)[typeof variant]
      ],
    };

    const focusStyles = disabled ? {} : focusRing.default;

    const combinedStyles = {
      ...baseStyles,
      ...style,
    };

    const animationProps = animation !== 'none' ? animations[animation] : {};

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || loading) {
        event.preventDefault();
        return;
      }
      onClick?.(event);
    };

    const buttonContent = (
      <>
        {loading && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            style={{
              width: '1em',
              height: '1em',
              border: '2px solid currentColor',
              borderTop: '2px solid transparent',
              borderRadius: '50%',
            }}
            aria-hidden="true"
          />
        )}
        {leftIcon && !loading && (
          <span
            style={{ display: 'flex', alignItems: 'center' }}
            aria-hidden="true"
          >
            {leftIcon}
          </span>
        )}
        {children && <span>{children}</span>}
        {rightIcon && !loading && (
          <span
            style={{ display: 'flex', alignItems: 'center' }}
            aria-hidden="true"
          >
            {rightIcon}
          </span>
        )}
      </>
    );

    const {
      onDrag,
      onDragEnd,
      onDragStart,
      onAnimationStart,
      onAnimationEnd,
      onAnimationIteration,
      ...restProps
    } = props;

    return (
      <motion.button
        ref={ref}
        type="button"
        style={combinedStyles}
        className={cn('cropschool-button', className)}
        disabled={disabled || loading}
        onClick={handleClick}
        data-testid={testId}
        aria-disabled={disabled || loading}
        aria-busy={loading}
        onFocus={(e: FocusEvent<HTMLButtonElement>) => {
          Object.assign(e.target.style, focusStyles);
        }}
        onBlur={(e: FocusEvent<HTMLButtonElement>) => {
          Object.assign(e.target.style, { boxShadow: 'none' });
        }}
        {...animationProps}
        {...restProps}
      >
        {buttonContent}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
