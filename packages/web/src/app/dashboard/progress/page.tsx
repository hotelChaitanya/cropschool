'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Logo from '../../../components/Logo';

interface ProgressData {
  totalGamesPlayed: number;
  totalScore: number;
  achievementsUnlocked: number;
  currentStreak: number;
  favoriteGame: string;
  timeSpent: number; // in minutes
  skillLevels: {
    math: number;
    reading: number;
    science: number;
  };
  recentActivities: Array<{
    id: string;
    game: string;
    score: number;
    date: string;
    duration: number;
  }>;
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    unlocked: boolean;
    date?: string;
    icon: string;
  }>;
}

export default function ProgressPage() {
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<
    'week' | 'month' | 'all'
  >('week');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    loadProgressData();
  }, []);

  const loadProgressData = () => {
    // Simulate loading progress data - in a real app, this would come from localStorage or an API
    const mockData: ProgressData = {
      totalGamesPlayed: 42,
      totalScore: 1850,
      achievementsUnlocked: 8,
      currentStreak: 5,
      favoriteGame: 'Math Harvest',
      timeSpent: 127, // minutes
      skillLevels: {
        math: 75,
        reading: 68,
        science: 82,
      },
      recentActivities: [
        {
          id: '1',
          game: 'Math Harvest',
          score: 120,
          date: '2024-01-10',
          duration: 15,
        },
        {
          id: '2',
          game: 'Alphabet Farm',
          score: 95,
          date: '2024-01-09',
          duration: 12,
        },
        {
          id: '3',
          game: 'Science Sprouts',
          score: 180,
          date: '2024-01-09',
          duration: 20,
        },
        {
          id: '4',
          game: 'Math Harvest',
          score: 140,
          date: '2024-01-08',
          duration: 18,
        },
        {
          id: '5',
          game: 'Alphabet Farm',
          score: 110,
          date: '2024-01-07',
          duration: 14,
        },
      ],
      achievements: [
        {
          id: '1',
          title: 'First Steps',
          description: 'Complete your first game',
          unlocked: true,
          date: '2024-01-01',
          icon: '👶',
        },
        {
          id: '2',
          title: 'Math Whiz',
          description: 'Score 100+ in Math Harvest',
          unlocked: true,
          date: '2024-01-03',
          icon: '🧮',
        },
        {
          id: '3',
          title: 'Word Master',
          description: 'Complete 10 words in Alphabet Farm',
          unlocked: true,
          date: '2024-01-05',
          icon: '📚',
        },
        {
          id: '4',
          title: 'Science Explorer',
          description: 'Grow a plant to full bloom',
          unlocked: true,
          date: '2024-01-06',
          icon: '🌸',
        },
        {
          id: '5',
          title: 'Streak Starter',
          description: 'Play for 3 days in a row',
          unlocked: true,
          date: '2024-01-07',
          icon: '🔥',
        },
        {
          id: '6',
          title: 'Score Champion',
          description: 'Reach 1000 total points',
          unlocked: true,
          date: '2024-01-08',
          icon: '🏆',
        },
        {
          id: '7',
          title: 'Time Traveler',
          description: 'Play for 2 hours total',
          unlocked: true,
          date: '2024-01-09',
          icon: '⏰',
        },
        {
          id: '8',
          title: 'Multi-Talented',
          description: 'Play all three games',
          unlocked: true,
          date: '2024-01-10',
          icon: '🌟',
        },
        {
          id: '9',
          title: 'Perfect Score',
          description: 'Get a perfect score in any game',
          unlocked: false,
          icon: '💯',
        },
        {
          id: '10',
          title: 'Marathon Player',
          description: 'Play for 30 minutes straight',
          unlocked: false,
          icon: '🏃',
        },
        {
          id: '11',
          title: 'Week Warrior',
          description: 'Play for 7 days in a row',
          unlocked: false,
          icon: '📅',
        },
        {
          id: '12',
          title: 'Master Learner',
          description: 'Reach level 10 in all skills',
          unlocked: false,
          icon: '🎓',
        },
      ],
    };

    setProgressData(mockData);
  };

  const getSkillColor = (level: number) => {
    if (level >= 80) return 'from-green-500 to-emerald-600';
    if (level >= 60) return 'from-blue-500 to-cyan-600';
    if (level >= 40) return 'from-yellow-500 to-orange-600';
    return 'from-red-500 to-pink-600';
  };

  const getSkillLevel = (level: number) => {
    if (level >= 80) return 'Expert';
    if (level >= 60) return 'Advanced';
    if (level >= 40) return 'Intermediate';
    return 'Beginner';
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  if (!isClient || !progressData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading your progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center space-x-2 text-purple-600 hover:text-purple-700"
            >
              <span>← Back to Home</span>
            </Link>

            <div className="flex items-center space-x-2">
              <Logo className="w-8 h-8" />
              <span className="text-xl font-bold text-gray-900">
                Progress Dashboard
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <select
                value={selectedTimeframe}
                onChange={e =>
                  setSelectedTimeframe(
                    e.target.value as 'week' | 'month' | 'all'
                  )
                }
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Your Learning Progress 📈
          </h1>
          <p className="text-lg text-gray-600">
            Track your achievements and see how much you've grown!
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {progressData.totalGamesPlayed}
            </div>
            <div className="text-sm text-gray-600">Games Played</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-pink-100 text-center">
            <div className="text-3xl font-bold text-pink-600 mb-2">
              {progressData.totalScore.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Score</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-indigo-100 text-center">
            <div className="text-3xl font-bold text-indigo-600 mb-2">
              {progressData.achievementsUnlocked}
            </div>
            <div className="text-sm text-gray-600">Achievements</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100 text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {progressData.currentStreak}
            </div>
            <div className="text-sm text-gray-600">Day Streak 🔥</div>
          </div>
        </div>

        {/* Skill Levels */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            📊 Skill Progress
          </h3>

          <div className="grid md:grid-cols-3 gap-6">
            {Object.entries(progressData.skillLevels).map(([skill, level]) => (
              <div key={skill} className="text-center">
                <div className="mb-4">
                  <div
                    className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-r ${getSkillColor(level)} flex items-center justify-center text-white text-2xl font-bold mb-2`}
                  >
                    {level}%
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 capitalize">
                    {skill}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {getSkillLevel(level)}
                  </p>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full bg-gradient-to-r ${getSkillColor(level)} transition-all duration-500`}
                    style={{ width: `${level}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Activities */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              📚 Recent Activities
            </h3>

            <div className="space-y-4">
              {progressData.recentActivities.map(activity => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">
                        {activity.game === 'Math Harvest'
                          ? '🧮'
                          : activity.game === 'Alphabet Farm'
                            ? '🌾'
                            : '🌱'}
                      </span>
                    </div>

                    <div>
                      <p className="font-semibold text-gray-900">
                        {activity.game}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatDate(activity.date)} •{' '}
                        {formatDuration(activity.duration)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-bold text-purple-600">
                      {activity.score}
                    </p>
                    <p className="text-xs text-gray-500">points</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              🏆 Achievements
            </h3>

            <div className="grid grid-cols-1 gap-4">
              {progressData.achievements.map(achievement => (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    achievement.unlocked
                      ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200'
                      : 'bg-gray-50 border-gray-200 opacity-60'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div
                      className={`text-3xl ${achievement.unlocked ? '' : 'grayscale'}`}
                    >
                      {achievement.icon}
                    </div>

                    <div className="flex-1">
                      <h4
                        className={`font-semibold ${achievement.unlocked ? 'text-gray-900' : 'text-gray-500'}`}
                      >
                        {achievement.title}
                      </h4>
                      <p
                        className={`text-sm ${achievement.unlocked ? 'text-gray-600' : 'text-gray-400'}`}
                      >
                        {achievement.description}
                      </p>
                      {achievement.unlocked && achievement.date && (
                        <p className="text-xs text-yellow-600 mt-1">
                          Unlocked {formatDate(achievement.date)}
                        </p>
                      )}
                    </div>

                    {achievement.unlocked && (
                      <div className="text-yellow-500">
                        <svg
                          className="w-6 h-6"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid md:grid-cols-2 gap-8 mt-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              ⭐ Fun Facts
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <span className="text-gray-700">Favorite Game</span>
                <span className="font-semibold text-purple-600">
                  {progressData.favoriteGame}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-pink-50 rounded-lg">
                <span className="text-gray-700">Time Spent Learning</span>
                <span className="font-semibold text-pink-600">
                  {formatDuration(progressData.timeSpent)}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                <span className="text-gray-700">Average Score</span>
                <span className="font-semibold text-indigo-600">
                  {Math.round(
                    progressData.totalScore / progressData.totalGamesPlayed
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              🎯 Next Goals
            </h3>

            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                <h4 className="font-semibold text-purple-900 mb-2">
                  Perfect Score Challenge
                </h4>
                <p className="text-sm text-purple-700 mb-3">
                  Get a perfect score in any game to unlock the Perfect Score
                  achievement!
                </p>
                <div className="w-full bg-purple-200 rounded-full h-2">
                  <div
                    className="h-2 bg-purple-500 rounded-full"
                    style={{ width: '70%' }}
                  ></div>
                </div>
                <p className="text-xs text-purple-600 mt-1">70% towards goal</p>
              </div>

              <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-100">
                <h4 className="font-semibold text-blue-900 mb-2">
                  Week Warrior
                </h4>
                <p className="text-sm text-blue-700 mb-3">
                  Play for 7 days in a row to become a Week Warrior!
                </p>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div
                    className="h-2 bg-blue-500 rounded-full"
                    style={{
                      width: `${(progressData.currentStreak / 7) * 100}%`,
                    }}
                  ></div>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  {progressData.currentStreak}/7 days
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-8 text-center text-white mt-8">
          <h3 className="text-2xl font-bold mb-4">Keep Learning! 🚀</h3>
          <p className="text-lg mb-6">
            You're doing amazing! Continue your learning journey to unlock more
            achievements.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/games"
              className="bg-white text-purple-600 px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              Play Games 🎮
            </Link>

            <Link
              href="/dashboard/parent"
              className="bg-purple-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105 border-2 border-white"
            >
              Parent Dashboard 👪
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
