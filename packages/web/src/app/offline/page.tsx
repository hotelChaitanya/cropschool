'use client';

import Link from 'next/link';

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
      <div className="text-center px-4">
        <div className="mb-8">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl text-white">🌱</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            You're Offline
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-md mx-auto">
            No internet connection detected. Don't worry, you can still access
            some games and features!
          </p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-lg border border-blue-100 max-w-lg mx-auto mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Available Offline
          </h2>
          <div className="space-y-3 text-left">
            <div className="flex items-center space-x-3">
              <span className="text-green-500">✓</span>
              <span className="text-gray-700">Previously played games</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-green-500">✓</span>
              <span className="text-gray-700">Saved game progress</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-green-500">✓</span>
              <span className="text-gray-700">Settings and preferences</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-green-500">✓</span>
              <span className="text-gray-700">Offline practice mode</span>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 rounded-2xl p-6 border border-yellow-200 max-w-lg mx-auto mb-8">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            What to do:
          </h3>
          <ul className="text-yellow-700 text-left space-y-1">
            <li>• Check your internet connection</li>
            <li>• Try refreshing the page</li>
            <li>• Play available offline games</li>
            <li>• Your progress will sync when you're back online</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            Try Again
          </button>

          <Link
            href="/games"
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105 text-center"
          >
            Play Offline Games
          </Link>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          <p>CropSchool works great offline too! 🚀</p>
        </div>
      </div>
    </div>
  );
}
