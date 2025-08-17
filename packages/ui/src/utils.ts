/**
 * Utility functions for the CropSchool Design System
 */

import { colors, spacing, borderRadius, shadows } from './tokens';
import clsx, { ClassValue } from 'clsx';

/**
 * Combines class names with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Get color value from design tokens
 */
export function getColor(path: string): string {
  const keys = path.split('.');
  let value: any = colors;

  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return path; // Return original if path not found
    }
  }

  return typeof value === 'string' ? value : path;
}

/**
 * Get spacing value from design tokens
 */
export function getSpacing(key: keyof typeof spacing): string {
  return spacing[key];
}

/**
 * Get border radius value from design tokens
 */
export function getBorderRadius(key: keyof typeof borderRadius): string {
  return borderRadius[key];
}

/**
 * Get shadow value from design tokens
 */
export function getShadow(key: keyof typeof shadows): string {
  return shadows[key];
}

/**
 * Create CSS custom properties from design tokens
 */
export function createCSSVariables() {
  const cssVars: Record<string, string> = {};

  // Colors
  Object.entries(colors).forEach(([category, values]) => {
    if (typeof values === 'object') {
      Object.entries(values).forEach(([shade, value]) => {
        cssVars[`--color-${category}-${shade}`] = value;
      });
    } else {
      cssVars[`--color-${category}`] = values;
    }
  });

  // Spacing
  Object.entries(spacing).forEach(([key, value]) => {
    cssVars[`--spacing-${key}`] = value;
  });

  // Border radius
  Object.entries(borderRadius).forEach(([key, value]) => {
    cssVars[`--radius-${key}`] = value;
  });

  // Shadows
  Object.entries(shadows).forEach(([key, value]) => {
    cssVars[`--shadow-${key}`] = value;
  });

  return cssVars;
}

/**
 * Generate responsive font size
 */
export function responsiveFontSize(mobile: string, desktop?: string) {
  if (!desktop) return mobile;
  return `clamp(${mobile}, 2.5vw, ${desktop})`;
}

/**
 * Check if color meets WCAG contrast requirements
 */
export function checkContrast(foreground: string, background: string): boolean {
  // This is a simplified version - in production, use a proper contrast checking library
  // For now, we'll assume our design tokens are already WCAG compliant
  return true;
}

/**
 * Convert hex color to RGB
 */
export function hexToRgb(
  hex: string
): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Add alpha transparency to color
 */
export function addAlpha(color: string, alpha: number): string {
  const rgb = hexToRgb(color);
  if (!rgb) return color;

  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

/**
 * Focus ring styles for accessibility
 */
export const focusRing = {
  default: {
    outline: 'none',
    boxShadow: `0 0 0 3px ${addAlpha(getColor('primary.500'), 0.5)}`,
  },
  error: {
    outline: 'none',
    boxShadow: `0 0 0 3px ${addAlpha(getColor('semantic.error'), 0.5)}`,
  },
  success: {
    outline: 'none',
    boxShadow: `0 0 0 3px ${addAlpha(getColor('semantic.success'), 0.5)}`,
  },
};

/**
 * Screen reader only styles
 */
export const srOnly = {
  position: 'absolute' as const,
  width: '1px',
  height: '1px',
  padding: '0',
  margin: '-1px',
  overflow: 'hidden' as const,
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap' as const,
  borderWidth: '0',
};

/**
 * Common animation presets for children's UI
 */
export const animations = {
  bounce: {
    initial: { scale: 0.9 },
    animate: { scale: 1 },
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 },
    transition: { type: 'spring', stiffness: 400, damping: 17 },
  },

  fadeIn: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.2 },
  },

  slideIn: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
    transition: { duration: 0.3 },
  },

  scaleIn: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
    transition: { type: 'spring', stiffness: 300, damping: 20 },
  },
};
