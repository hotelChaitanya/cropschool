'use client';

import { useState } from 'react';
import Link from 'next/link';
import Logo from '../../components/Logo';

const games = [
  {
    id: 'math-adventure',
    title: 'Math Adventure',
    description: 'Learn arithmetic through fun drag-and-drop challenges',
    category: 'Math',
    ageRange: '6-12',
    difficulty: 'Easy',
    duration: '15-20 min',
    image: '🔢',
  },
  {
    id: 'science-sprouts-adventure',
    title: 'Science Sprouts Adventure',
    description: 'Discover plant growth and scientific concepts',
    category: 'Science',
    ageRange: '5-10',
    difficulty: 'Medium',
    duration: '20-25 min',
    image: '🌱',
  },
  {
    id: 'art-studio-adventure',
    title: 'Art Studio Adventure',
    description: 'Express creativity through digital painting and colors',
    category: 'Art',
    ageRange: '4-12',
    difficulty: 'Easy',
    duration: '10-30 min',
    image: '🎨',
  },
  {
    id: 'reading-quest',
    title: 'Reading Quest',
    description:
      'Build vocabulary and reading skills through interactive stories',
    category: 'Reading',
    ageRange: '5-11',
    difficulty: 'Medium',
    duration: '25-30 min',
    image: '📚',
  },
  {
    id: 'number-ninjas',
    title: 'Number Ninjas',
    description:
      'Master multiplication and division with ninja-themed challenges',
    category: 'Math',
    ageRange: '7-13',
    difficulty: 'Hard',
    duration: '20-25 min',
    image: '🥷',
  },
  {
    id: 'geography-explorer',
    title: 'Geography Explorer',
    description: 'Explore countries, capitals, and landmarks around the world',
    category: 'Geography',
    ageRange: '8-14',
    difficulty: 'Medium',
    duration: '30-35 min',
    image: '🌍',
  },
  {
    id: 'coding-camp',
    title: 'Coding Camp',
    description: 'Learn programming basics through visual coding challenges',
    category: 'Programming',
    ageRange: '9-15',
    difficulty: 'Hard',
    duration: '40-45 min',
    image: '💻',
  },
  {
    id: 'music-maker',
    title: 'Music Maker',
    description: 'Compose melodies and learn about rhythm and notes',
    category: 'Music',
    ageRange: '6-12',
    difficulty: 'Easy',
    duration: '15-25 min',
    image: '🎵',
  },
  {
    id: 'history-heroes',
    title: 'History Heroes',
    description: 'Travel through time and meet famous historical figures',
    category: 'History',
    ageRange: '8-14',
    difficulty: 'Medium',
    duration: '25-30 min',
    image: '🏛️',
  },
  {
    id: 'puzzle-palace',
    title: 'Puzzle Palace',
    description: 'Solve brain teasers and logic puzzles to unlock new levels',
    category: 'Logic',
    ageRange: '6-13',
    difficulty: 'Medium',
    duration: '20-30 min',
    image: '🧩',
  },
  {
    id: 'chemistry-lab',
    title: 'Chemistry Lab',
    description: 'Conduct safe virtual experiments and learn about elements',
    category: 'Science',
    ageRange: '10-16',
    difficulty: 'Hard',
    duration: '35-40 min',
    image: '🧪',
  },
  {
    id: 'space-explorer',
    title: 'Space Explorer',
    description: 'Journey through the solar system and discover planets',
    category: 'Astronomy',
    ageRange: '7-14',
    difficulty: 'Medium',
    duration: '30-35 min',
    image: '🚀',
  },
];

export default function GamesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = [
    'All',
    'Math',
    'Science',
    'Art',
    'Reading',
    'Geography',
    'Programming',
    'Music',
    'History',
    'Logic',
    'Astronomy',
  ];

  const filteredGames = games.filter(game => {
    const matchesSearch =
      game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      game.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || game.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <header className="bg-white shadow-sm">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Logo width={32} height={32} />
              <span className="text-xl font-bold text-gray-900">
                CropSchool
              </span>
            </Link>
            <Link
              href="/dashboard/parent"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Parent Dashboard
            </Link>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Educational Games
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover fun and engaging games that make learning an adventure!
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search games..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Games Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGames.map(game => (
            <Link key={game.id} href={`/games/${game.id}`}>
              <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden">
                <div className="p-6">
                  <div className="text-6xl mb-4 text-center">{game.image}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {game.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{game.description}</p>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Category:</span>
                      <span className="font-medium text-blue-600">
                        {game.category}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Age Range:</span>
                      <span className="font-medium">{game.ageRange}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Duration:</span>
                      <span className="font-medium">{game.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Difficulty:</span>
                      <span
                        className={`font-medium ${
                          game.difficulty === 'Easy'
                            ? 'text-green-600'
                            : game.difficulty === 'Medium'
                              ? 'text-yellow-600'
                              : 'text-red-600'
                        }`}
                      >
                        {game.difficulty}
                      </span>
                    </div>
                  </div>

                  <button className="w-full mt-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:shadow-lg transition-all duration-200">
                    Play Now →
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredGames.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No games found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
