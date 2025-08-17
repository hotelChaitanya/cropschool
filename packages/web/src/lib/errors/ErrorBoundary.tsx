'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to error reporting service if available
    if (
      process.env.NODE_ENV === 'production' &&
      typeof window !== 'undefined'
    ) {
      // Optional Sentry integration
      try {
        // Properly type cast for Sentry availability
        if ((window as any).Sentry) {
          (window as any).Sentry.captureException(error, {
            contexts: {
              react: {
                componentStack: errorInfo.componentStack,
              },
            },
          });
        }
      } catch (e) {
        // Sentry not available, continue silently
      }
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Uncaught error:', error, errorInfo);
    }

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  public override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
          <div className="max-w-md w-full bg-white shadow-xl rounded-2xl p-8 border border-red-100">
            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-center text-gray-900 mb-2">
              Oops! Something went wrong 😅
            </h2>
            <p className="text-center text-gray-600 mb-6">
              Don't worry! Even the best games have bugs. Let's try again!
            </p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                🔄 Try Again
              </button>
              <button
                onClick={() => window.history.back()}
                className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                ← Go Back
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
