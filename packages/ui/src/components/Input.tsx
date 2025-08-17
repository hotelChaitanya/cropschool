/**
 * Input Component - Child-friendly form input with validation
 */

import React, { forwardRef, useState } from 'react';
import { InputProps } from '../types';
import { cn, focusRing } from '../utils';
import {
  colors,
  spacing,
  borderRadius,
  typography,
  touchTarget,
} from '../tokens';

const sizeStyles = {
  sm: {
    padding: `${spacing[2]} ${spacing[3]}`,
    fontSize: typography.fontSize.sm,
    minHeight: spacing[10],
  },
  md: {
    padding: `${spacing[3]} ${spacing[4]}`,
    fontSize: typography.fontSize.base,
    minHeight: touchTarget.minimum, // 48px minimum
  },
  lg: {
    padding: `${spacing[4]} ${spacing[5]}`,
    fontSize: typography.fontSize.lg,
    minHeight: touchTarget.comfortable, // 64px
  },
  xl: {
    padding: `${spacing[5]} ${spacing[6]}`,
    fontSize: typography.fontSize.xl,
    minHeight: touchTarget.large, // 80px
  },
};

const variantStyles = {
  outline: {
    backgroundColor: colors.background.primary,
    border: `2px solid ${colors.neutral[300]}`,
    '&:hover': {
      borderColor: colors.neutral[400],
    },
    '&:focus': {
      borderColor: colors.primary[500],
      ...focusRing.default,
    },
  },
  filled: {
    backgroundColor: colors.neutral[100],
    border: '2px solid transparent',
    '&:hover': {
      backgroundColor: colors.neutral[200],
    },
    '&:focus': {
      backgroundColor: colors.background.primary,
      borderColor: colors.primary[500],
      ...focusRing.default,
    },
  },
  flushed: {
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: `2px solid ${colors.neutral[300]}`,
    borderRadius: 0,
    '&:focus': {
      borderBottomColor: colors.primary[500],
      ...focusRing.default,
    },
  },
};

/**
 * Input component for forms with child-friendly design
 *
 * @example
 * ```tsx
 * <Input
 *   label="Your Name"
 *   placeholder="Enter your name"
 *   size="lg"
 *   required
 *   leftIcon={<UserIcon />}
 *   helperText="This will be your display name in the game"
 * />
 * ```
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      size = 'md',
      variant = 'outline',
      error = false,
      success = false,
      helperText,
      errorMessage,
      label,
      required = false,
      icon,
      iconPosition = 'left',
      className,
      style,
      testId,
      id,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    const sizeStyle = sizeStyles[size];
    const variantStyle = variantStyles[variant];

    const getInputStyles = (): React.CSSProperties => {
      let borderColor: string = colors.neutral[300];
      let backgroundColor = variantStyle.backgroundColor;

      if (error) {
        borderColor = colors.semantic.error;
      } else if (success) {
        borderColor = colors.semantic.success;
      } else if (isFocused) {
        borderColor = colors.primary[500];
      }

      return {
        width: '100%',
        fontFamily: typography.fontFamily.primary,
        fontSize: sizeStyle.fontSize,
        fontWeight: typography.fontWeight.normal,
        lineHeight: typography.lineHeight.normal,
        color: colors.neutral[900],
        backgroundColor,
        border: variant === 'flushed' ? 'none' : `2px solid ${borderColor}`,
        borderBottom:
          variant === 'flushed' ? `2px solid ${borderColor}` : undefined,
        borderRadius: variant === 'flushed' ? 0 : borderRadius.md,
        padding: sizeStyle.padding,
        minHeight: sizeStyle.minHeight,
        outline: 'none',
        transition: 'all 0.2s ease-in-out',
      };
    };

    const containerStyles: React.CSSProperties = {
      position: 'relative',
      width: '100%',
      ...style,
    };

    const labelStyles: React.CSSProperties = {
      display: 'block',
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      color: error ? colors.semantic.error : colors.neutral[700],
      marginBottom: spacing[1],
      lineHeight: typography.lineHeight.normal,
    };

    const helperStyles: React.CSSProperties = {
      fontSize: typography.fontSize.xs,
      color: error
        ? colors.semantic.error
        : success
          ? colors.semantic.success
          : colors.neutral[600],
      marginTop: spacing[1],
      lineHeight: typography.lineHeight.normal,
    };

    const iconStyles: React.CSSProperties = {
      position: 'absolute',
      top: '50%',
      transform: 'translateY(-50%)',
      [iconPosition === 'left' ? 'left' : 'right']: spacing[3],
      color: colors.neutral[500],
      pointerEvents: 'none',
      display: 'flex',
      alignItems: 'center',
      fontSize: sizeStyle.fontSize,
    };

    const inputPadding = icon
      ? {
          [iconPosition === 'left' ? 'paddingLeft' : 'paddingRight']:
            `calc(${sizeStyle.padding.split(' ')[1]} + 1.5em + ${spacing[2]})`,
        }
      : {};

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    return (
      <div
        style={containerStyles}
        className={cn('cropschool-input-container', className)}
      >
        {label && (
          <label htmlFor={inputId} style={labelStyles}>
            {label}
            {required && (
              <span
                style={{ color: colors.semantic.error, marginLeft: spacing[1] }}
              >
                *
              </span>
            )}
          </label>
        )}

        <div style={{ position: 'relative' }}>
          {icon && (
            <span style={iconStyles} aria-hidden="true">
              {icon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            style={{
              ...getInputStyles(),
              ...inputPadding,
            }}
            className={cn('cropschool-input', {
              'cropschool-input--error': error,
              'cropschool-input--success': success,
              'cropschool-input--focused': isFocused,
            })}
            onFocus={handleFocus}
            onBlur={handleBlur}
            data-testid={testId}
            aria-invalid={error}
            aria-describedby={
              helperText || errorMessage ? `${inputId}-help` : undefined
            }
            {...props}
          />
        </div>

        {(helperText || errorMessage) && (
          <div
            id={`${inputId}-help`}
            style={helperStyles}
            role={error ? 'alert' : 'description'}
          >
            {error && errorMessage ? errorMessage : helperText}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
