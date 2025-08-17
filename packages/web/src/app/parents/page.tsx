'use client';

import Link from 'next/link';

export default function ParentsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Parent Resources
            </h1>
            <p className="text-xl text-gray-600">
              Tools and resources to support your child's learning journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                Dashboard
              </h3>
              <p className="text-gray-600 mb-4">
                Monitor your child's progress and achievements
              </p>
              <Link
                href="/parent-dashboard"
                className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
              >
                View Dashboard
              </Link>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                Learning Guide
              </h3>
              <p className="text-gray-600 mb-4">
                Tips and strategies for supporting learning at home
              </p>
              <button className="inline-block bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors">
                Coming Soon
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                Settings
              </h3>
              <p className="text-gray-600 mb-4">
                Manage account and learning preferences
              </p>
              <Link
                href="/settings"
                className="inline-block bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition-colors"
              >
                Manage Settings
              </Link>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/"
              className="inline-block bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
