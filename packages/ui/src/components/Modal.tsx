/**
 * Modal Component - Child-friendly modal dialog
 */

import React, { forwardRef, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ModalProps } from '../types';
import { cn, animations } from '../utils';
import {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
  zIndex,
} from '../tokens';

const sizeStyles = {
  xs: { maxWidth: '320px' },
  sm: { maxWidth: '384px' },
  md: { maxWidth: '448px' },
  lg: { maxWidth: '512px' },
  xl: { maxWidth: '576px' },
  '2xl': { maxWidth: '672px' },
  '3xl': { maxWidth: '768px' },
  '4xl': { maxWidth: '896px' },
  '5xl': { maxWidth: '1024px' },
  '6xl': { maxWidth: '1152px' },
};

/**
 * Modal component for child-friendly dialogs
 *
 * @example
 * ```tsx
 * <Modal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Game Complete!"
 *   size="lg"
 *   animation="scaleIn"
 * >
 *   <p>Congratulations! You completed the level!</p>
 *   <Button onClick={() => setIsOpen(false)}>Continue</Button>
 * </Modal>
 * ```
 */
export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      isOpen,
      onClose,
      title,
      size = 'md',
      showCloseButton = true,
      closeOnOverlayClick = true,
      closeOnEsc = true,
      initialFocus,
      animation = 'scaleIn',
      children,
      className,
      style,
      testId,
      ...props
    },
    ref
  ) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const previousFocus = useRef<HTMLElement | null>(null);

    // Handle escape key
    useEffect(() => {
      if (!isOpen || !closeOnEsc) return;

      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, closeOnEsc, onClose]);

    // Handle focus management
    useEffect(() => {
      if (isOpen) {
        // Store the currently focused element
        previousFocus.current = document.activeElement as HTMLElement;

        // Focus the modal or initial focus element
        setTimeout(() => {
          if (initialFocus) {
            const focusElement = document.querySelector(
              initialFocus
            ) as HTMLElement;
            focusElement?.focus();
          } else {
            modalRef.current?.focus();
          }
        }, 100);
      } else {
        // Restore focus when modal closes
        previousFocus.current?.focus();
      }
    }, [isOpen, initialFocus]);

    // Prevent body scroll when modal is open
    useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'unset';
      }

      return () => {
        document.body.style.overflow = 'unset';
      };
    }, [isOpen]);

    if (!isOpen) return null;

    const overlayStyles: React.CSSProperties = {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing[4],
      zIndex: zIndex.modal,
      backdropFilter: 'blur(4px)',
    };

    const modalStyles: React.CSSProperties = {
      backgroundColor: colors.background.primary,
      borderRadius: borderRadius['2xl'],
      boxShadow: shadows.xl,
      padding: spacing[6],
      width: '100%',
      ...sizeStyles[size],
      maxHeight: '90vh',
      overflow: 'auto',
      position: 'relative',
      outline: 'none',
      ...style,
    };

    const headerStyles: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing[4],
      paddingBottom: spacing[4],
      borderBottom: `2px solid ${colors.neutral[100]}`,
    };

    const titleStyles: React.CSSProperties = {
      fontSize: typography.fontSize['2xl'],
      fontWeight: typography.fontWeight.bold,
      color: colors.neutral[900],
      margin: 0,
      fontFamily: typography.fontFamily.display,
    };

    const closeButtonStyles: React.CSSProperties = {
      backgroundColor: 'transparent',
      border: 'none',
      color: colors.neutral[600],
      cursor: 'pointer',
      padding: spacing[2],
      borderRadius: borderRadius.md,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: typography.fontSize.xl,
      minWidth: spacing[10],
      minHeight: spacing[10],
      transition: 'all 0.2s ease-in-out',
    };

    const contentStyles: React.CSSProperties = {
      color: colors.neutral[700],
      fontSize: typography.fontSize.base,
      lineHeight: typography.lineHeight.relaxed,
    };

    const handleOverlayClick = (event: React.MouseEvent) => {
      if (closeOnOverlayClick && event.target === event.currentTarget) {
        onClose();
      }
    };

    const animationProps = animation !== 'none' ? animations[animation] : {};

    const modalContent = (
      <div
        style={overlayStyles}
        onClick={handleOverlayClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        data-testid={testId}
      >
        <div
          ref={ref || modalRef}
          style={modalStyles}
          className={cn('cropschool-modal', className)}
          onClick={e => e.stopPropagation()}
          tabIndex={-1}
          {...animationProps}
          {...props}
        >
          {(title || showCloseButton) && (
            <div style={headerStyles}>
              {title && (
                <h2 id="modal-title" style={titleStyles}>
                  {title}
                </h2>
              )}
              {showCloseButton && (
                <button
                  style={closeButtonStyles}
                  onClick={onClose}
                  aria-label="Close modal"
                  type="button"
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = colors.neutral[100];
                    e.currentTarget.style.color = colors.neutral[800];
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = colors.neutral[600];
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          )}
          <div style={contentStyles}>{children}</div>
        </div>
      </div>
    );

    // Use portal to render modal at document body level
    return createPortal(modalContent, document.body);
  }
);

Modal.displayName = 'Modal';
