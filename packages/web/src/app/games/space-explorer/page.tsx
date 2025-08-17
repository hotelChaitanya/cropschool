'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';

interface Planet {
  id: string;
  name: string;
  emoji: string;
  distance: string; // Distance from Sun
  size: string;
  temperature: string;
  moons: number;
  facts: string[];
  color: string;
}

interface SpaceQuiz {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  planet?: string;
}

const planets: Planet[] = [
  {
    id: 'mercury',
    name: 'Mercury',
    emoji: '☿️',
    distance: '57.9 million km',
    size: '4,879 km diameter',
    temperature: '427°C (day), -173°C (night)',
    moons: 0,
    color: 'bg-gray-400',
    facts: [
      'Closest planet to the Sun',
      'Has extreme temperature differences',
      'A year on Mercury is only 88 Earth days',
      'No atmosphere to protect from meteors',
    ],
  },
  {
    id: 'venus',
    name: 'Venus',
    emoji: '♀️',
    distance: '108.2 million km',
    size: '12,104 km diameter',
    temperature: '462°C (hottest planet)',
    moons: 0,
    color: 'bg-yellow-400',
    facts: [
      'Hottest planet in our solar system',
      'Spins backwards compared to most planets',
      'Called Earth\'s "twin" because of similar size',
      'Has a thick, toxic atmosphere',
    ],
  },
  {
    id: 'earth',
    name: 'Earth',
    emoji: '🌍',
    distance: '149.6 million km',
    size: '12,756 km diameter',
    temperature: '15°C average',
    moons: 1,
    color: 'bg-blue-400',
    facts: [
      'The only known planet with life',
      'About 71% of surface is covered by water',
      'Has a protective magnetic field',
      'One moon that causes ocean tides',
    ],
  },
  {
    id: 'mars',
    name: 'Mars',
    emoji: '♂️',
    distance: '227.9 million km',
    size: '6,792 km diameter',
    temperature: '-65°C average',
    moons: 2,
    color: 'bg-red-400',
    facts: [
      'Called the "Red Planet" due to iron oxide',
      'Has the largest volcano in the solar system',
      'A day on Mars is about 24 hours and 37 minutes',
      'Has polar ice caps made of water and carbon dioxide',
    ],
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    emoji: '♃',
    distance: '778.5 million km',
    size: '142,984 km diameter',
    temperature: '-110°C average',
    moons: 79,
    color: 'bg-orange-400',
    facts: [
      'Largest planet in our solar system',
      'Has a Great Red Spot storm larger than Earth',
      'Made mostly of hydrogen and helium gas',
      'Acts like a "vacuum cleaner" protecting inner planets',
    ],
  },
  {
    id: 'saturn',
    name: 'Saturn',
    emoji: '🪐',
    distance: '1.43 billion km',
    size: '120,536 km diameter',
    temperature: '-140°C average',
    moons: 82,
    color: 'bg-yellow-300',
    facts: [
      'Famous for its beautiful ring system',
      'Less dense than water - it would float!',
      'Has hexagonal storm at its north pole',
      'Second largest planet in our solar system',
    ],
  },
];

const spaceQuizzes: SpaceQuiz[] = [
  {
    question: 'Which planet is closest to the Sun?',
    options: ['Venus', 'Mercury', 'Earth', 'Mars'],
    correct: 1,
    explanation:
      'Mercury is the closest planet to the Sun at about 58 million km away.',
    planet: 'mercury',
  },
  {
    question: 'Which planet is known as the "Red Planet"?',
    options: ['Mars', 'Venus', 'Jupiter', 'Saturn'],
    correct: 0,
    explanation:
      'Mars is called the Red Planet because of iron oxide (rust) on its surface.',
    planet: 'mars',
  },
  {
    question: 'Which planet has the most spectacular rings?',
    options: ['Jupiter', 'Uranus', 'Saturn', 'Neptune'],
    correct: 2,
    explanation:
      'Saturn is famous for its beautiful and prominent ring system.',
    planet: 'saturn',
  },
  {
    question: 'How many moons does Earth have?',
    options: ['0', '1', '2', '3'],
    correct: 1,
    explanation:
      'Earth has one moon, which is relatively large compared to Earth itself.',
    planet: 'earth',
  },
  {
    question: 'Which is the largest planet in our solar system?',
    options: ['Saturn', 'Jupiter', 'Neptune', 'Uranus'],
    correct: 1,
    explanation:
      'Jupiter is the largest planet and could fit all other planets inside it.',
    planet: 'jupiter',
  },
];

export default function SpaceExplorerPage() {
  const [gameStatus, setGameStatus] = useState<
    'menu' | 'explore' | 'quiz' | 'planet-detail' | 'mission'
  >('menu');
  const [currentPlanet, setCurrentPlanet] = useState<Planet | null>(null);
  const [currentQuiz, setCurrentQuiz] = useState<SpaceQuiz | null>(null);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [exploredPlanets, setExploredPlanets] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [rocketPosition, setRocketPosition] = useState(0);
  const [missionProgress, setMissionProgress] = useState(0);

  const explorePlanet = useCallback(
    (planet: Planet) => {
      setCurrentPlanet(planet);
      setGameStatus('planet-detail');
      if (!exploredPlanets.includes(planet.id)) {
        setExploredPlanets(prev => [...prev, planet.id]);
        setScore(prev => prev + 15);
      }
    },
    [exploredPlanets]
  );

  const startQuiz = useCallback(() => {
    setGameStatus('quiz');
    setCurrentQuizIndex(0);
    setCurrentQuiz(spaceQuizzes[0]);
  }, []);

  const handleQuizAnswer = useCallback(
    (selectedIndex: number) => {
      if (!currentQuiz) return;

      const correct = selectedIndex === currentQuiz.correct;
      setIsCorrect(correct);
      setShowResult(true);

      if (correct) {
        setScore(prev => prev + 25);
      }

      setTimeout(() => {
        setShowResult(false);
        if (currentQuizIndex < spaceQuizzes.length - 1) {
          const nextIndex = currentQuizIndex + 1;
          setCurrentQuizIndex(nextIndex);
          setCurrentQuiz(spaceQuizzes[nextIndex]);
        } else {
          setGameStatus('menu');
        }
      }, 2500);
    },
    [currentQuiz, currentQuizIndex]
  );

  const startMission = useCallback(() => {
    setGameStatus('mission');
    setRocketPosition(0);
    setMissionProgress(0);
  }, []);

  const advanceRocket = useCallback(() => {
    if (rocketPosition < planets.length - 1) {
      setRocketPosition(prev => prev + 1);
      setMissionProgress(prev => prev + 100 / planets.length);
      setScore(prev => prev + 10);
    } else {
      // Mission complete
      setScore(prev => prev + 50);
      setTimeout(() => setGameStatus('menu'), 2000);
    }
  }, [rocketPosition]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white">
      <header className="bg-black bg-opacity-50 shadow-sm">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/games"
              className="flex items-center space-x-2 text-blue-300 hover:text-blue-200"
            >
              <span>← Back to Games</span>
            </Link>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-300">
                Score:{' '}
                <span className="font-bold text-yellow-400">{score}</span>
              </div>
              <div className="text-sm text-gray-300">
                Explored:{' '}
                <span className="font-bold text-green-400">
                  {exploredPlanets.length}
                </span>
              </div>
              <span className="text-xl font-bold text-white">
                🚀 Space Explorer
              </span>
            </div>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🚀 Space Explorer
          </h1>
          <p className="text-lg text-gray-300">
            Journey through the solar system and discover planets!
          </p>
        </div>

        {gameStatus === 'menu' && (
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🌌</div>
              <h2 className="text-2xl font-bold text-white mb-8">
                Choose Your Space Adventure
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-gray-800 bg-opacity-80 rounded-lg shadow-lg p-6 text-center border border-blue-500">
                <div className="text-4xl mb-4">🪐</div>
                <h3 className="text-xl font-bold text-white mb-4">
                  Explore Planets
                </h3>
                <p className="text-gray-300 mb-6">
                  Visit each planet and learn fascinating facts about our solar
                  system.
                </p>
                <button
                  onClick={() => setGameStatus('explore')}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-4 rounded-lg font-bold text-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-200 transform hover:scale-105"
                >
                  🌍 Start Exploring
                </button>
              </div>

              <div className="bg-gray-800 bg-opacity-80 rounded-lg shadow-lg p-6 text-center border border-purple-500">
                <div className="text-4xl mb-4">🧠</div>
                <h3 className="text-xl font-bold text-white mb-4">
                  Space Knowledge Quiz
                </h3>
                <p className="text-gray-300 mb-6">
                  Test your knowledge about planets, moons, and space facts.
                </p>
                <button
                  onClick={startQuiz}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-4 rounded-lg font-bold text-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-200 transform hover:scale-105"
                >
                  🧠 Take Quiz
                </button>
              </div>

              <div className="bg-gray-800 bg-opacity-80 rounded-lg shadow-lg p-6 text-center border border-green-500">
                <div className="text-4xl mb-4">🚀</div>
                <h3 className="text-xl font-bold text-white mb-4">
                  Rocket Mission
                </h3>
                <p className="text-gray-300 mb-6">
                  Guide your rocket through the solar system and visit each
                  planet.
                </p>
                <button
                  onClick={startMission}
                  className="w-full bg-gradient-to-r from-green-500 to-teal-600 text-white px-6 py-4 rounded-lg font-bold text-lg hover:shadow-lg hover:shadow-green-500/50 transition-all duration-200 transform hover:scale-105"
                >
                  🚀 Launch Mission
                </button>
              </div>
            </div>
          </div>
        )}

        {gameStatus === 'explore' && (
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-white">
                Solar System Map
              </h2>
              <button
                onClick={() => setGameStatus('menu')}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg font-bold hover:shadow-lg transition-all duration-200"
              >
                🏠 Back to Menu
              </button>
            </div>

            <div className="relative bg-gray-900 bg-opacity-80 rounded-lg p-8 border border-blue-500">
              <div className="text-center mb-6">
                <div className="text-4xl mb-2">☀️</div>
                <p className="text-yellow-400 font-bold">The Sun</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {planets.map((planet, index) => (
                  <button
                    key={planet.id}
                    onClick={() => explorePlanet(planet)}
                    className={`relative ${planet.color} bg-opacity-80 rounded-lg p-6 text-center hover:shadow-xl transition-all duration-200 transform hover:scale-105 border-2 ${
                      exploredPlanets.includes(planet.id)
                        ? 'border-green-400'
                        : 'border-gray-600'
                    }`}
                  >
                    <div className="text-4xl mb-2">{planet.emoji}</div>
                    <h3 className="text-lg font-bold text-white mb-1">
                      {planet.name}
                    </h3>
                    <p className="text-xs text-gray-200">
                      {planet.distance} from Sun
                    </p>
                    {exploredPlanets.includes(planet.id) && (
                      <div className="absolute top-2 right-2 text-green-400 text-xl">
                        ✅
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {gameStatus === 'planet-detail' && currentPlanet && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-800 bg-opacity-80 rounded-lg shadow-lg p-8 border border-blue-500">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center space-x-4">
                  <div className="text-6xl">{currentPlanet.emoji}</div>
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">
                      {currentPlanet.name}
                    </h2>
                    <div className="space-y-1 text-gray-300">
                      <p>
                        <strong>Distance from Sun:</strong>{' '}
                        {currentPlanet.distance}
                      </p>
                      <p>
                        <strong>Size:</strong> {currentPlanet.size}
                      </p>
                      <p>
                        <strong>Temperature:</strong>{' '}
                        {currentPlanet.temperature}
                      </p>
                      <p>
                        <strong>Moons:</strong> {currentPlanet.moons}
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setGameStatus('explore')}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg font-bold hover:shadow-lg transition-all duration-200"
                >
                  ← Back to Map
                </button>
              </div>

              <div className="mb-8">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Fascinating Facts:
                </h3>
                <div className="grid gap-4">
                  {currentPlanet.facts.map((fact, index) => (
                    <div
                      key={index}
                      className="bg-blue-900 bg-opacity-50 border-l-4 border-blue-400 p-4 rounded"
                    >
                      <p className="text-gray-200 text-lg">• {fact}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center">
                <p className="text-green-400 text-lg font-bold">
                  ✅ Planet Explored! +15 Points
                </p>
              </div>
            </div>
          </div>
        )}

        {gameStatus === 'quiz' && currentQuiz && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-gray-800 bg-opacity-80 rounded-lg shadow-lg p-8 text-center border border-purple-500">
              <div className="text-4xl mb-4">🌌</div>
              <div className="text-sm text-gray-400 mb-4">
                Question {currentQuizIndex + 1} of {spaceQuizzes.length}
              </div>

              <h2 className="text-2xl font-bold text-white mb-8">
                {currentQuiz.question}
              </h2>

              <div className="grid grid-cols-1 gap-4">
                {currentQuiz.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuizAnswer(index)}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-lg font-bold text-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-200 transform hover:scale-105 active:scale-95"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {showResult && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
                <div className="bg-gray-800 border border-blue-500 rounded-lg p-8 text-center max-w-md">
                  <div className="text-6xl mb-4">{isCorrect ? '🎉' : '🌟'}</div>
                  <h3
                    className={`text-2xl font-bold mb-4 ${isCorrect ? 'text-green-400' : 'text-blue-400'}`}
                  >
                    {isCorrect ? 'Correct!' : 'Good try!'}
                  </h3>
                  <p className="text-gray-300">{currentQuiz.explanation}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {gameStatus === 'mission' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-800 bg-opacity-80 rounded-lg shadow-lg p-8 border border-green-500">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-white">
                  Rocket Mission
                </h2>
                <button
                  onClick={() => setGameStatus('menu')}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg font-bold hover:shadow-lg transition-all duration-200"
                >
                  🏠 Back to Menu
                </button>
              </div>

              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-white font-bold">
                    Mission Progress:
                  </span>
                  <span className="text-green-400 font-bold">
                    {Math.round(missionProgress)}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-4">
                  <div
                    className="bg-gradient-to-r from-green-500 to-blue-500 h-4 rounded-full transition-all duration-500"
                    style={{ width: `${missionProgress}%` }}
                  ></div>
                </div>
              </div>

              <div className="text-center mb-8">
                <div className="text-6xl mb-4">🚀</div>
                <h3 className="text-xl text-white mb-4">
                  Current Location: {planets[rocketPosition]?.name || 'Space'}
                </h3>
                {rocketPosition < planets.length && (
                  <div className="bg-blue-900 bg-opacity-50 p-4 rounded-lg mb-6">
                    <p className="text-gray-300 mb-4">
                      {planets[rocketPosition]?.facts[0]}
                    </p>
                    <button
                      onClick={advanceRocket}
                      className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-8 py-3 rounded-lg font-bold text-lg hover:shadow-lg hover:shadow-green-500/50 transition-all duration-200 transform hover:scale-105"
                    >
                      {rocketPosition < planets.length - 1
                        ? '🚀 Continue Journey'
                        : '🏁 Complete Mission'}
                    </button>
                  </div>
                )}
              </div>

              {rocketPosition >= planets.length && (
                <div className="text-center">
                  <div className="text-6xl mb-4">🏆</div>
                  <h3 className="text-2xl font-bold text-white mb-4">
                    Mission Complete!
                  </h3>
                  <p className="text-gray-300 mb-6">
                    You've successfully traveled through the entire solar
                    system! Bonus: +50 Points
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
