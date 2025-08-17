/**
 * Timer Component - Child-friendly countdown timer
 */

import React, { forwardRef, useEffect, useState, useCallback } from 'react';
import { TimerProps } from '../types';
import { cn } from '../utils';
import { colors, spacing, borderRadius, typography } from '../tokens';

const sizeStyles = {
  sm: {
    fontSize: typography.fontSize.lg,
    padding: `${spacing[2]} ${spacing[4]}`,
    circleSize: 60,
    strokeWidth: 4,
  },
  md: {
    fontSize: typography.fontSize.xl,
    padding: `${spacing[3]} ${spacing[6]}`,
    circleSize: 80,
    strokeWidth: 6,
  },
  lg: {
    fontSize: typography.fontSize['2xl'],
    padding: `${spacing[4]} ${spacing[8]}`,
    circleSize: 100,
    strokeWidth: 8,
  },
  xl: {
    fontSize: typography.fontSize['3xl'],
    padding: `${spacing[6]} ${spacing[10]}`,
    circleSize: 120,
    strokeWidth: 10,
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
 * Timer component for educational games with visual progress
 *
 * @example
 * ```tsx
 * <Timer
 *   duration={120}
 *   isRunning
 *   size="lg"
 *   color="warning"
 *   showProgress
 *   format="mm:ss"
 *   onComplete={() => console.log('Time up!')}
 *   onTick={(remaining) => console.log(`${remaining} seconds left`)}
 * />
 * ```
 */
export const Timer = forwardRef<HTMLDivElement, TimerProps>(
  (
    {
      duration,
      isRunning = false,
      onComplete,
      onTick,
      format = 'mm:ss',
      size = 'md',
      color = 'primary',
      showProgress = false,
      className,
      style,
      testId,
      ...props
    },
    ref
  ) => {
    const [remainingTime, setRemainingTime] = useState(duration);
    const [isActive, setIsActive] = useState(isRunning);

    const formatTime = useCallback(
      (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        const milliseconds = Math.floor((seconds % 1) * 100);

        switch (format) {
          case 'mm:ss':
            return `${mins.toString().padStart(2, '0')}:${Math.floor(secs).toString().padStart(2, '0')}`;
          case 'ss':
            return Math.floor(seconds).toString();
          case 'mm:ss:ms':
            return `${mins.toString().padStart(2, '0')}:${Math.floor(secs).toString().padStart(2, '0')}:${milliseconds.toString().padStart(2, '0')}`;
          default:
            return `${mins.toString().padStart(2, '0')}:${Math.floor(secs).toString().padStart(2, '0')}`;
        }
      },
      [format]
    );

    useEffect(() => {
      setIsActive(isRunning);
    }, [isRunning]);

    useEffect(() => {
      let interval: NodeJS.Timeout | null = null;

      if (isActive && remainingTime > 0) {
        interval = setInterval(() => {
          setRemainingTime(prevTime => {
            const newTime = Math.max(prevTime - 0.1, 0);

            // Call onTick with rounded seconds
            if (onTick) {
              onTick(Math.ceil(newTime));
            }

            // Check if timer completed
            if (newTime === 0) {
              setIsActive(false);
              if (onComplete) {
                onComplete();
              }
            }

            return newTime;
          });
        }, 100); // Update every 100ms for smooth animation
      } else if (interval) {
        clearInterval(interval);
      }

      return () => {
        if (interval) {
          clearInterval(interval);
        }
      };
    }, [isActive, remainingTime, onComplete, onTick]);

    // Reset timer when duration changes
    useEffect(() => {
      setRemainingTime(duration);
    }, [duration]);

    const sizeStyle = sizeStyles[size];
    const timerColor = colorMapping[color];
    const progress = (remainingTime / duration) * 100;

    // Determine color based on remaining time
    const getTimerColor = () => {
      if (progress > 50) return colorMapping[color];
      if (progress > 25) return colors.semantic.warning;
      return colors.semantic.error;
    };

    const currentColor = getTimerColor();

    // Calculate urgency for animations
    const isUrgent = progress <= 25;
    const isCritical = progress <= 10;

    const baseStyles: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: spacing[2],
      fontFamily: typography.fontFamily.mono,
      fontWeight: typography.fontWeight.bold,
      ...style,
    };

    if (showProgress) {
      const radius = sizeStyle.circleSize / 2 - sizeStyle.strokeWidth;
      const circumference = 2 * Math.PI * radius;
      const strokeDashoffset = circumference - (progress / 100) * circumference;

      return (
        <div
          ref={ref}
          style={baseStyles}
          className={cn('cropschool-timer-progress', className)}
          data-testid={testId}
          {...props}
        >
          <div style={{ position: 'relative', display: 'inline-flex' }}>
            <svg
              width={sizeStyle.circleSize}
              height={sizeStyle.circleSize}
              style={{
                transform: 'rotate(-90deg)',
                filter: isCritical
                  ? 'drop-shadow(0 0 8px currentColor)'
                  : 'none',
              }}
            >
              {/* Background circle */}
              <circle
                cx={sizeStyle.circleSize / 2}
                cy={sizeStyle.circleSize / 2}
                r={radius}
                stroke={colors.neutral[200]}
                strokeWidth={sizeStyle.strokeWidth}
                fill="transparent"
              />
              {/* Progress circle */}
              <circle
                cx={sizeStyle.circleSize / 2}
                cy={sizeStyle.circleSize / 2}
                r={radius}
                stroke={currentColor}
                strokeWidth={sizeStyle.strokeWidth}
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{
                  transition:
                    'stroke-dashoffset 0.1s ease-out, stroke 0.3s ease-out',
                  animation: isUrgent
                    ? 'timerPulse 1s ease-in-out infinite'
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
                fontSize: sizeStyle.fontSize,
                color: currentColor,
                textAlign: 'center',
                animation: isCritical
                  ? 'timerShake 0.5s ease-in-out infinite'
                  : 'none',
              }}
            >
              {formatTime(remainingTime)}
            </div>
          </div>
        </div>
      );
    }

    // Simple text timer
    return (
      <div
        ref={ref}
        style={{
          ...baseStyles,
          backgroundColor: colors.neutral[100],
          border: `2px solid ${currentColor}`,
          borderRadius: borderRadius.lg,
          padding: sizeStyle.padding,
          fontSize: sizeStyle.fontSize,
          color: currentColor,
          animation: isUrgent ? 'timerBlink 1s ease-in-out infinite' : 'none',
        }}
        className={cn('cropschool-timer-simple', className)}
        data-testid={testId}
        {...props}
      >
        {formatTime(remainingTime)}
        {isCritical && (
          <div
            style={{
              position: 'absolute',
              top: '-5px',
              right: '-5px',
              width: '10px',
              height: '10px',
              backgroundColor: colors.semantic.error,
              borderRadius: '50%',
              animation: 'timerAlert 0.8s ease-in-out infinite',
            }}
          />
        )}
      </div>
    );
  }
);

Timer.displayName = 'Timer';
