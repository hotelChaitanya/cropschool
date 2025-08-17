'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';

interface Country {
  name: string;
  capital: string;
  continent: string;
  flag: string;
  landmarks: string[];
}

const countries: Country[] = [
  {
    name: 'France',
    capital: 'Paris',
    continent: 'Europe',
    flag: '🇫🇷',
    landmarks: ['Eiffel Tower', 'Louvre Museum', 'Notre-Dame'],
  },
  {
    name: 'Japan',
    capital: 'Tokyo',
    continent: 'Asia',
    flag: '🇯🇵',
    landmarks: ['Mount Fuji', 'Tokyo Tower', 'Golden Pavilion'],
  },
  {
    name: 'Egypt',
    capital: 'Cairo',
    continent: 'Africa',
    flag: '🇪🇬',
    landmarks: ['Great Pyramid', 'Sphinx', 'Valley of the Kings'],
  },
  {
    name: 'Brazil',
    capital: 'Brasília',
    continent: 'South America',
    flag: '🇧🇷',
    landmarks: [
      'Christ the Redeemer',
      'Amazon Rainforest',
      'Sugarloaf Mountain',
    ],
  },
  {
    name: 'Australia',
    capital: 'Canberra',
    continent: 'Oceania',
    flag: '🇦🇺',
    landmarks: ['Sydney Opera House', 'Uluru', 'Great Barrier Reef'],
  },
];

interface Question {
  type: 'capital' | 'continent' | 'landmark';
  country: Country;
  question: string;
  options: string[];
  correct: number;
}

export default function GeographyExplorerPage() {
  const [score, setScore] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [gameStatus, setGameStatus] = useState<
    'menu' | 'playing' | 'completed'
  >('menu');
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [exploredCountries, setExploredCountries] = useState<string[]>([]);

  const generateQuestion = useCallback((): Question => {
    const country = countries[Math.floor(Math.random() * countries.length)];
    const questionTypes: ('capital' | 'continent' | 'landmark')[] = [
      'capital',
      'continent',
      'landmark',
    ];
    const type =
      questionTypes[Math.floor(Math.random() * questionTypes.length)];

    let question: string;
    let options: string[];
    let correct: number;

    switch (type) {
      case 'capital':
        question = `What is the capital of ${country.name} ${country.flag}?`;
        options = [country.capital];
        // Add wrong capitals
        const otherCapitals = countries
          .filter(c => c.name !== country.name)
          .map(c => c.capital);
        while (options.length < 4) {
          const randomCapital =
            otherCapitals[Math.floor(Math.random() * otherCapitals.length)];
          if (!options.includes(randomCapital)) {
            options.push(randomCapital);
          }
        }
        break;

      case 'continent':
        question = `Which continent is ${country.name} ${country.flag} located in?`;
        const continents = [
          'Europe',
          'Asia',
          'Africa',
          'North America',
          'South America',
          'Oceania',
          'Antarctica',
        ];
        options = [country.continent];
        while (options.length < 4) {
          const randomContinent =
            continents[Math.floor(Math.random() * continents.length)];
          if (!options.includes(randomContinent)) {
            options.push(randomContinent);
          }
        }
        break;

      case 'landmark':
        question = `Which landmark is found in ${country.name} ${country.flag}?`;
        options = [
          country.landmarks[
            Math.floor(Math.random() * country.landmarks.length)
          ],
        ];
        // Add landmarks from other countries
        const otherLandmarks = countries
          .filter(c => c.name !== country.name)
          .flatMap(c => c.landmarks);
        while (options.length < 4) {
          const randomLandmark =
            otherLandmarks[Math.floor(Math.random() * otherLandmarks.length)];
          if (!options.includes(randomLandmark)) {
            options.push(randomLandmark);
          }
        }
        break;
    }

    // Shuffle options
    correct = 0; // Remember correct answer position
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
      if (i === correct) correct = j;
      else if (j === correct) correct = i;
    }

    return {
      type,
      country,
      question,
      options,
      correct,
    };
  }, []);

  const startGame = useCallback(() => {
    setGameStatus('playing');
    setScore(0);
    setQuestionsAnswered(0);
    setExploredCountries([]);
    setCurrentQuestion(generateQuestion());
  }, [generateQuestion]);

  const handleAnswer = useCallback(
    (selectedIndex: number) => {
      if (!currentQuestion) return;

      const correct = selectedIndex === currentQuestion.correct;
      setIsCorrect(correct);
      setShowResult(true);

      if (correct) {
        setScore(prev => prev + 20);
        if (!exploredCountries.includes(currentQuestion.country.name)) {
          setExploredCountries(prev => [...prev, currentQuestion.country.name]);
        }
      }

      setTimeout(() => {
        setShowResult(false);
        setQuestionsAnswered(prev => prev + 1);

        if (questionsAnswered >= 9) {
          setGameStatus('completed');
        } else {
          setCurrentQuestion(generateQuestion());
        }
      }, 2000);
    },
    [currentQuestion, questionsAnswered, exploredCountries, generateQuestion]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-green-50 to-blue-50">
      <header className="bg-white shadow-sm">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/games"
              className="flex items-center space-x-2 text-teal-600 hover:text-teal-700"
            >
              <span>← Back to Games</span>
            </Link>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Score: <span className="font-bold text-teal-600">{score}</span>
              </div>
              <div className="text-sm text-gray-600">
                Countries:{' '}
                <span className="font-bold text-green-600">
                  {exploredCountries.length}
                </span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                🌍 Geography Explorer
              </span>
            </div>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🌍 Geography Explorer
          </h1>
          <p className="text-lg text-gray-600">
            Discover countries, capitals, and landmarks around the world!
          </p>
        </div>

        {gameStatus === 'menu' && (
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">🗺️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Explore?
            </h2>
            <p className="text-gray-600 mb-6">
              Test your knowledge of world geography! Answer questions about
              countries, capitals, continents, and famous landmarks.
            </p>
            <div className="mb-6">
              <div className="flex justify-center space-x-2 text-2xl">
                {countries.map((country, index) => (
                  <span
                    key={index}
                    className="animate-bounce"
                    style={{ animationDelay: `${index * 0.2}s` }}
                  >
                    {country.flag}
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={startGame}
              className="bg-gradient-to-r from-teal-500 to-green-500 text-white px-8 py-4 rounded-lg font-bold text-lg hover:shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              🚀 Start Exploring!
            </button>
          </div>
        )}

        {gameStatus === 'playing' && currentQuestion && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8 text-center mb-6">
              <div className="text-6xl mb-4">
                {currentQuestion.country.flag}
              </div>
              <div className="text-sm text-gray-500 mb-4">
                Question {questionsAnswered + 1} of 10
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-8">
                {currentQuestion.question}
              </h2>

              <div className="grid grid-cols-1 gap-4">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    className="bg-gradient-to-r from-blue-400 to-teal-500 text-white p-4 rounded-lg font-bold text-lg hover:shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-4">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Countries Explored:
              </h3>
              <div className="flex flex-wrap gap-2">
                {exploredCountries.map(country => {
                  const countryData = countries.find(c => c.name === country);
                  return (
                    <span
                      key={country}
                      className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {countryData?.flag} {country}
                    </span>
                  );
                })}
              </div>
            </div>

            {showResult && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                <div className="bg-white rounded-lg p-8 text-center">
                  <div className="text-6xl mb-4">{isCorrect ? '🎉' : '🌍'}</div>
                  <h3
                    className={`text-2xl font-bold mb-2 ${isCorrect ? 'text-green-600' : 'text-blue-600'}`}
                  >
                    {isCorrect ? 'Excellent!' : 'Good try!'}
                  </h3>
                  <p className="text-gray-600">
                    {isCorrect
                      ? "You're a great explorer!"
                      : 'Keep exploring to learn more!'}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {gameStatus === 'completed' && (
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Exploration Complete!
            </h2>
            <p className="text-gray-600 mb-6">
              Final Score:{' '}
              <span className="text-teal-600 font-bold">{score}</span>
              <br />
              Countries Explored:{' '}
              <span className="text-green-600 font-bold">
                {exploredCountries.length}
              </span>
              <br />
              You're becoming a geography expert!
            </p>
            <button
              onClick={startGame}
              className="bg-gradient-to-r from-teal-500 to-green-500 text-white px-8 py-4 rounded-lg font-bold text-lg hover:shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              🌍 Explore Again
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
