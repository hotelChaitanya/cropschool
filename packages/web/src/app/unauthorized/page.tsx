import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        {/* Logo and Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
              <span className="text-white text-2xl">⚠️</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">CropSchool</span>
          </Link>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600">
            You don't have permission to access this page
          </p>
        </div>

        {/* Error Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-red-100 mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="h-8 w-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>

          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Unauthorized Access
          </h2>
          <p className="text-gray-600 mb-6">
            This page requires specific permissions that your account doesn't
            have. Please contact an administrator or log in with the appropriate
            account.
          </p>

          <div className="space-y-3">
            <Link
              href="/login"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            >
              Login with Different Account
            </Link>

            <Link
              href="/"
              className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Go Back Home
            </Link>
          </div>
        </div>

        {/* Help Text */}
        <div className="text-sm text-gray-500">
          <p>
            Need help?{' '}
            <Link href="/contact" className="text-blue-600 hover:text-blue-500">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
