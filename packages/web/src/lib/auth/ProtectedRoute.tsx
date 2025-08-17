'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../auth/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'parent' | 'student' | 'teacher' | 'admin';
}

export function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Redirect to login if not authenticated
        router.push('/login');
        return;
      }

      if (requiredRole && user.role !== requiredRole) {
        // Redirect to unauthorized page if wrong role
        router.push('/unauthorized');
        return;
      }
    }
  }, [user, loading, router, requiredRole]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
            <svg
              className="animate-spin h-8 w-8 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Loading...
          </h2>
          <p className="text-gray-600">Checking your authentication status</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated or wrong role
  if (!user || (requiredRole && user.role !== requiredRole)) {
    return null;
  }

  return <>{children}</>;
}
