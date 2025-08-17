'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { fetchChildren } from '@/lib/redux/slices/dashboardSlice';

export default function ParentDashboard() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { children, isLoading, error } = useAppSelector(
    state => state.dashboard
  );
  const { user } = useAppSelector(state => state.auth);

  useEffect(() => {
    if (!user || user.role !== 'parent') {
      router.push('/login');
      return;
    }

    dispatch(fetchChildren());
  }, [dispatch, user, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600">
          <p>Error: {error}</p>
          <button
            onClick={() => dispatch(fetchChildren())}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Update the children cards section to use real data */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {children.map(child => (
          <div key={child.id} className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{child.name}</h3>
              <span className="text-sm text-gray-500">Level {child.level}</span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Points</span>
                <span className="font-medium">{child.points}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Streak</span>
                <span className="font-medium">{child.streakDays} days</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Progress</span>
                <span className="font-medium">
                  {child.completedLessons}/{child.totalLessons} lessons
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{
                    width: `${(child.completedLessons / child.totalLessons) * 100}%`,
                  }}
                />
              </div>

              <div className="text-xs text-gray-500">
                Last active: {new Date(child.lastActive).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
