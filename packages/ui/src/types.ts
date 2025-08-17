/**
 * Base types for CropSchool UI components
 */

import {
  ReactNode,
  HTMLAttributes,
  ButtonHTMLAttributes,
  InputHTMLAttributes,
} from 'react';

/**
 * Common component props
 */
export interface BaseComponentProps {
  /** Additional CSS classes */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
  /** Test ID for automated testing */
  testId?: string;
  /** Children content */
  children?: ReactNode;
}

/**
 * Size variants for components
 */
export type Size = 'sm' | 'md' | 'lg' | 'xl';

/**
 * Color variants for components
 */
export type ColorVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'neutral';

/**
 * Component variants
 */
export type Variant = 'solid' | 'outline' | 'ghost' | 'soft';

/**
 * Animation types for child-friendly interactions
 */
export type AnimationType =
  | 'bounce'
  | 'fadeIn'
  | 'slideIn'
  | 'scaleIn'
  | 'none';

/**
 * Button component props
 */
export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'size'>,
    BaseComponentProps {
  /** Button variant */
  variant?: Variant;
  /** Button size - minimum 'md' for touch accessibility */
  size?: Size;
  /** Color scheme */
  color?: ColorVariant;
  /** Loading state */
  loading?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Full width button */
  fullWidth?: boolean;
  /** Icon to display before text */
  leftIcon?: ReactNode;
  /** Icon to display after text */
  rightIcon?: ReactNode;
  /** Animation type */
  animation?: AnimationType;
}

/**
 * Card component props
 */
export interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    BaseComponentProps {
  /** Card variant */
  variant?: 'elevated' | 'outlined' | 'filled';
  /** Padding size */
  padding?: Size;
  /** Whether card is interactive */
  interactive?: boolean;
  /** Card color scheme */
  color?: ColorVariant;
}

/**
 * Input component props
 */
export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>,
    BaseComponentProps {
  /** Input size */
  size?: Size;
  /** Input variant */
  variant?: 'outline' | 'filled' | 'flushed';
  /** Error state */
  error?: boolean;
  /** Success state */
  success?: boolean;
  /** Help text */
  helperText?: string;
  /** Error message */
  errorMessage?: string;
  /** Label text */
  label?: string;
  /** Whether label is required */
  required?: boolean;
  /** Icon to display in input */
  icon?: ReactNode;
  /** Icon position */
  iconPosition?: 'left' | 'right';
}

/**
 * Modal component props
 */
export interface ModalProps extends BaseComponentProps {
  /** Whether modal is open */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** Modal title */
  title?: string;
  /** Modal size */
  size?: Size | 'xs' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
  /** Whether to show close button */
  showCloseButton?: boolean;
  /** Whether clicking overlay closes modal */
  closeOnOverlayClick?: boolean;
  /** Whether pressing escape closes modal */
  closeOnEsc?: boolean;
  /** Initial focus element selector */
  initialFocus?: string;
  /** Animation type */
  animation?: AnimationType;
}

/**
 * Progress component props
 */
export interface ProgressProps extends BaseComponentProps {
  /** Current value (0-100) */
  value: number;
  /** Maximum value */
  max?: number;
  /** Minimum value */
  min?: number;
  /** Progress size */
  size?: Size;
  /** Color scheme */
  color?: ColorVariant;
  /** Whether to show label */
  showLabel?: boolean;
  /** Custom label */
  label?: string;
  /** Progress variant */
  variant?: 'linear' | 'circular';
  /** Whether progress is animated */
  animated?: boolean;
}

/**
 * Timer component props
 */
export interface TimerProps extends BaseComponentProps {
  /** Duration in seconds */
  duration: number;
  /** Whether timer is running */
  isRunning?: boolean;
  /** Timer completion callback */
  onComplete?: () => void;
  /** Timer tick callback */
  onTick?: (remainingTime: number) => void;
  /** Timer format */
  format?: 'mm:ss' | 'ss' | 'mm:ss:ms';
  /** Timer size */
  size?: Size;
  /** Color scheme */
  color?: ColorVariant;
  /** Whether to show progress ring */
  showProgress?: boolean;
}

/**
 * Score display component props
 */
export interface ScoreDisplayProps extends BaseComponentProps {
  /** Current score */
  score: number;
  /** Maximum score */
  maxScore?: number;
  /** Score change animation */
  showChange?: boolean;
  /** Previous score for animation */
  previousScore?: number;
  /** Size variant */
  size?: Size;
  /** Color scheme */
  color?: ColorVariant;
  /** Custom icon */
  icon?: ReactNode;
  /** Label text */
  label?: string;
}

/**
 * Typography component props
 */
export interface TypographyProps
  extends HTMLAttributes<HTMLElement>,
    BaseComponentProps {
  /** HTML element to render */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div' | 'label';
  /** Typography variant */
  variant?:
    | 'display'
    | 'heading'
    | 'subheading'
    | 'body'
    | 'caption'
    | 'overline';
  /** Font size */
  size?: Size | 'xs' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
  /** Font weight */
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  /** Text color */
  color?: ColorVariant | 'inherit';
  /** Text alignment */
  align?: 'left' | 'center' | 'right' | 'justify';
  /** Whether text should truncate */
  truncate?: boolean;
  /** Line height */
  lineHeight?: 'tight' | 'snug' | 'normal' | 'relaxed' | 'loose';
}

/**
 * Form validation rule
 */
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
}

/**
 * Form field props
 */
export interface FormFieldProps extends BaseComponentProps {
  /** Field name */
  name: string;
  /** Field label */
  label?: string;
  /** Help text */
  helperText?: string;
  /** Whether field is required */
  required?: boolean;
  /** Validation rules */
  validation?: ValidationRule;
  /** Field size */
  size?: Size;
}

/**
 * Animation configuration
 */
export interface AnimationConfig {
  /** Animation type */
  type: AnimationType;
  /** Animation duration */
  duration?: number;
  /** Animation delay */
  delay?: number;
  /** Animation easing */
  easing?: string;
  /** Whether animation repeats */
  repeat?: boolean;
}
