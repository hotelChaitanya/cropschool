'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '../../../lib/auth/ProtectedRoute';
import { useAuth } from '../../../lib/auth/AuthContext';

interface GameSession {
  id: string;
  gameId: string;
  gameName: string;
  date: string;
  duration: number; // in minutes
  score: number;
  completed: boolean;
  skillsImproved: string[];
}

interface ChildProfile {
  id: string;
  name: string;
  age: number;
  grade: string;
  avatar: string;
  totalPlayTime: number; // in minutes
  gamesCompleted: number;
  currentStreak: number;
  favoriteSubject: string;
  skillLevels: {
    math: number;
    reading: number;
    science: number;
    creativity: number;
  };
}

interface WeeklyProgress {
  week: string;
  totalMinutes: number;
  gamesPlayed: number;
  skillsImproved: number;
}

export default function ParentDashboard() {
  const [selectedChild, setSelectedChild] = useState<string>('child1');
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');
  const [isClient, setIsClient] = useState(false);
  const { user, logout } = useAuth();

  // Mock data - in real app, this would come from API
  const children: ChildProfile[] = [
    {
      id: 'child1',
      name: 'Emma',
      age: 8,
      grade: '3rd Grade',
      avatar: '👧',
      totalPlayTime: 240,
      gamesCompleted: 15,
      currentStreak: 5,
      favoriteSubject: 'Math',
      skillLevels: {
        math: 75,
        reading: 60,
        science: 45,
        creativity: 80,
      },
    },
    {
      id: 'child2',
      name: 'Alex',
      age: 6,
      grade: '1st Grade',
      avatar: '👦',
      totalPlayTime: 180,
      gamesCompleted: 8,
      currentStreak: 3,
      favoriteSubject: 'Science',
      skillLevels: {
        math: 55,
        reading: 70,
        science: 85,
        creativity: 65,
      },
    },
  ];

  const recentSessions: GameSession[] = [
    {
      id: '1',
      gameId: 'math-adventure',
      gameName: 'Math Adventure',
      date: '2024-01-20',
      duration: 25,
      score: 150,
      completed: true,
      skillsImproved: ['Addition', 'Problem Solving'],
    },
    {
      id: '2',
      gameId: 'word-explorer',
      gameName: 'Word Explorer',
      date: '2024-01-19',
      duration: 20,
      score: 120,
      completed: true,
      skillsImproved: ['Vocabulary', 'Reading'],
    },
    {
      id: '3',
      gameId: 'science-lab',
      gameName: 'Science Lab',
      date: '2024-01-18',
      duration: 30,
      score: 200,
      completed: false,
      skillsImproved: ['Scientific Method', 'Observation'],
    },
  ];

  const weeklyProgress: WeeklyProgress[] = [
    { week: 'Week 1', totalMinutes: 120, gamesPlayed: 8, skillsImproved: 12 },
    { week: 'Week 2', totalMinutes: 150, gamesPlayed: 10, skillsImproved: 15 },
    { week: 'Week 3', totalMinutes: 90, gamesPlayed: 6, skillsImproved: 8 },
    { week: 'Week 4', totalMinutes: 180, gamesPlayed: 12, skillsImproved: 18 },
  ];

  const currentChild =
    children.find(child => child.id === selectedChild) || children[0];

  useEffect(() => {
    setIsClient(true);
  }, []);

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getSkillColor = (level: number): string => {
    if (level >= 80) return 'bg-green-500';
    if (level >= 60) return 'bg-yellow-500';
    if (level >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getProgressColor = (level: number): string => {
    if (level >= 80) return 'text-green-600';
    if (level >= 60) return 'text-yellow-600';
    if (level >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  if (!isClient) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <ProtectedRoute requiredRole="parent">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <nav className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg">🌱</span>
                </div>
                <span className="text-xl font-bold text-gray-900">
                  CropSchool
                </span>
              </Link>

              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Welcome, {user?.username}
                </span>
                <Link
                  href="/games"
                  className="text-gray-600 hover:text-blue-600"
                >
                  Games
                </Link>
                <Link
                  href="/settings"
                  className="text-gray-600 hover:text-blue-600 flex items-center space-x-1"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span>Settings</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-700 flex items-center space-x-1 transition-colors"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </nav>
        </header>

        <main className="container mx-auto px-4 py-8">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Parent Dashboard
            </h1>
            <p className="text-lg text-gray-600">
              Track your child's learning progress and achievements
            </p>
          </div>

          {/* Child Selector */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Select Child
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {children.map(child => (
                <div
                  key={child.id}
                  onClick={() => setSelectedChild(child.id)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                    selectedChild === child.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-4xl">{child.avatar}</div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {child.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {child.grade} • Age {child.age}
                      </p>
                      <p className="text-sm text-blue-600">
                        {child.gamesCompleted} games completed
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Total Play Time</p>
                  <p className="text-2xl font-bold">
                    {formatDuration(currentChild.totalPlayTime)}
                  </p>
                </div>
                <svg
                  className="h-8 w-8 text-blue-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Games Completed</p>
                  <p className="text-2xl font-bold">
                    {currentChild.gamesCompleted}
                  </p>
                </div>
                <svg
                  className="h-8 w-8 text-green-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  />
                </svg>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Current Streak</p>
                  <p className="text-2xl font-bold">
                    {currentChild.currentStreak} days
                  </p>
                </div>
                <svg
                  className="h-8 w-8 text-purple-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100">Favorite Subject</p>
                  <p className="text-2xl font-bold">
                    {currentChild.favoriteSubject}
                  </p>
                </div>
                <svg
                  className="h-8 w-8 text-orange-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 14l9-5-9-5-9 5 9 5z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Skill Progress */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Skill Progress
              </h3>
              <div className="space-y-4">
                {Object.entries(currentChild.skillLevels).map(
                  ([skill, level]) => (
                    <div key={skill}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium capitalize text-gray-700">
                          {skill}
                        </span>
                        <span
                          className={`font-bold ${getProgressColor(level)}`}
                        >
                          {level}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all duration-500 ${getSkillColor(level)}`}
                          style={{ width: `${level}%` }}
                        />
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Weekly Progress Chart */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Weekly Activity
              </h3>
              <div className="space-y-4">
                {weeklyProgress.map((week, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">{week.week}</p>
                      <p className="text-sm text-gray-600">
                        {week.gamesPlayed} games played
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600">
                        {formatDuration(week.totalMinutes)}
                      </p>
                      <p className="text-sm text-green-600">
                        {week.skillsImproved} skills improved
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Sessions */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Recent Game Sessions
              </h3>
              <Link
                href="/games"
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15M9 10v4a2 2 0 002 2h2a2 2 0 002-2v-4M9 10V9a2 2 0 012-2h2a2 2 0 012 2v1"
                  />
                </svg>
                <span>Play Games</span>
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Game
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Duration
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Score
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Skills
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentSessions.map(session => (
                    <tr
                      key={session.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">
                          {session.gameName}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {new Date(session.date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {formatDuration(session.duration)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-blue-600">
                          {session.score}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            session.completed
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {session.completed ? 'Completed' : 'In Progress'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {session.skillsImproved.map(skill => (
                            <span
                              key={skill}
                              className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
