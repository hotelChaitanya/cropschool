import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  message,
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6 border-2',
    md: 'h-12 w-12 border-3',
    lg: 'h-16 w-16 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-gray-300 border-t-blue-600`}
        role="status"
        aria-label="loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
      {message && <p className="mt-4 text-sm text-gray-600">{message}</p>}
    </div>
  );
};
