'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Logo from '../components/Logo';
import { useAuth } from '../lib/auth/AuthContext';

// Sample games data
const games = [
  {
    id: 'math-adventure',
    title: 'Math Adventure',
    description: 'Learn arithmetic through fun drag-and-drop challenges',
    category: 'Math',
    ageRange: '6-12',
    color: 'from-blue-500 to-cyan-600',
  },
  {
    id: 'science-sprouts-adventure',
    title: 'Science Sprouts',
    description: 'Discover plant growth and scientific concepts',
    category: 'Science',
    ageRange: '5-10',
    color: 'from-green-500 to-emerald-600',
  },
  {
    id: 'art-studio-adventure',
    title: 'Art Studio',
    description: 'Express creativity through digital painting and colors',
    category: 'Art',
    ageRange: '4-12',
    color: 'from-purple-500 to-pink-600',
  },
  {
    id: 'reading-quest',
    title: 'Reading Quest',
    description:
      'Build vocabulary and reading skills through interactive stories',
    category: 'Reading',
    ageRange: '5-11',
    color: 'from-orange-500 to-red-600',
  },
  {
    id: 'number-ninjas',
    title: 'Number Ninjas',
    description:
      'Master multiplication and division with ninja-themed challenges',
    category: 'Math',
    ageRange: '7-13',
    color: 'from-indigo-500 to-purple-600',
  },
  {
    id: 'geography-explorer',
    title: 'Geography Explorer',
    description: 'Explore countries, capitals, and landmarks around the world',
    category: 'Geography',
    ageRange: '8-14',
    color: 'from-teal-500 to-green-600',
  },
  {
    id: 'coding-camp',
    title: 'Coding Camp',
    description: 'Learn programming basics through visual coding challenges',
    category: 'Programming',
    ageRange: '9-15',
    color: 'from-gray-700 to-gray-900',
  },
  {
    id: 'music-maker',
    title: 'Music Maker',
    description: 'Compose melodies and learn about rhythm and notes',
    category: 'Music',
    ageRange: '6-12',
    color: 'from-pink-500 to-rose-600',
  },
  {
    id: 'history-heroes',
    title: 'History Heroes',
    description: 'Travel through time and meet famous historical figures',
    category: 'History',
    ageRange: '8-14',
    color: 'from-amber-500 to-orange-600',
  },
  {
    id: 'puzzle-palace',
    title: 'Puzzle Palace',
    description: 'Solve brain teasers and logic puzzles to unlock new levels',
    category: 'Logic',
    ageRange: '6-13',
    color: 'from-violet-500 to-purple-600',
  },
  {
    id: 'chemistry-lab',
    title: 'Chemistry Lab',
    description: 'Conduct safe virtual experiments and learn about elements',
    category: 'Science',
    ageRange: '10-16',
    color: 'from-lime-500 to-green-600',
  },
  {
    id: 'space-explorer',
    title: 'Space Explorer',
    description: 'Journey through the solar system and discover planets',
    category: 'Astronomy',
    ageRange: '7-14',
    color: 'from-slate-600 to-blue-800',
  },
];

const features = [
  {
    title: 'Interactive Learning',
    description:
      'Hands-on educational experiences that make learning fun and engaging',
  },
  {
    title: 'Progress Tracking',
    description:
      "Monitor your child's learning journey with detailed analytics",
  },
  {
    title: 'Parent Dashboard',
    description: "Stay connected with your child's educational progress",
  },
  {
    title: 'Curriculum Aligned',
    description: 'Content designed to complement school learning objectives',
  },
];

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="relative overflow-hidden">
        <nav className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Logo width={48} height={48} />
              <span className="text-xl font-bold text-gray-900">
                CropSchool
              </span>
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              <Link
                href="/games"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Games
              </Link>
              <Link
                href="/dashboard/parent"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                For Parents
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-sm text-gray-600">
                    Welcome, {user.username}
                  </span>
                  <Link
                    href="/dashboard/parent"
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => logout()}
                    className="text-red-600 hover:text-red-700 transition-colors"
                  >
                    Logout
                  </button>
                  <Link
                    href="/games"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                  >
                    Start Playing
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
              Learning Made Fun!
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Interactive educational games that make learning an adventure.
              Perfect for kids aged 5-14 to explore math, science, reading, and
              more!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/games"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
              >
                ▶️ Start Playing Now
              </Link>
            </div>
          </div>
        </section>
      </header>

      {/* Featured Games */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Popular Games
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover our collection of educational games designed to make
              learning exciting
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map(game => (
              <div key={game.id} className="group">
                <Link href={`/games/${game.id}`}>
                  <div className="bg-white rounded-2xl border-2 border-gray-100 p-6 hover:border-blue-200 hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer">
                    <div
                      className={`w-16 h-16 bg-gradient-to-r ${game.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}
                    >
                      <span className="text-2xl text-white">🎮</span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {game.title}
                    </h3>
                    <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                      {game.description}
                    </p>

                    <div className="flex items-center justify-between text-sm">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                        {game.category}
                      </span>
                      <span className="text-gray-500">
                        Ages {game.ageRange}
                      </span>
                    </div>

                    <div className="flex items-center mt-4 text-blue-600 font-medium group-hover:translate-x-1 transition-transform duration-200">
                      Play Now →
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why Choose CropSchool?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We combine cutting-edge technology with educational expertise to
              create the best learning experience
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                  <span className="text-2xl text-white">✨</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Ready to Start Learning?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of families already making learning fun with
            CropSchool
          </p>
          <Link
            href="/games"
            className="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 inline-flex items-center gap-2"
          >
            ▶️ Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Logo width={32} height={32} />
                <span className="text-xl font-bold">CropSchool</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Making learning fun and accessible for children everywhere.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Games</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link
                    href="/games/math"
                    className="hover:text-white transition-colors"
                  >
                    Math Games
                  </Link>
                </li>
                <li>
                  <Link
                    href="/games/science"
                    className="hover:text-white transition-colors"
                  >
                    Science Games
                  </Link>
                </li>
                <li>
                  <Link
                    href="/games/reading"
                    className="hover:text-white transition-colors"
                  >
                    Reading Games
                  </Link>
                </li>
                <li>
                  <Link
                    href="/games/puzzles"
                    className="hover:text-white transition-colors"
                  >
                    Puzzle Games
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Parents</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link
                    href="/progress"
                    className="hover:text-white transition-colors"
                  >
                    Progress Tracking
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard"
                    className="hover:text-white transition-colors"
                  >
                    Parent Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    href="/settings"
                    className="hover:text-white transition-colors"
                  >
                    Settings
                  </Link>
                </li>
                <li>
                  <Link
                    href="/support"
                    className="hover:text-white transition-colors"
                  >
                    Support
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link
                    href="/about"
                    className="hover:text-white transition-colors"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="hover:text-white transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="hover:text-white transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-white transition-colors"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>
              &copy; 2024 CropSchool. All rights reserved. Made with ❤️ for
              young learners.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
