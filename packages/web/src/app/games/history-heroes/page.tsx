'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';

interface HistoricalFigure {
  id: string;
  name: string;
  period: string;
  achievement: string;
  emoji: string;
  facts: string[];
  quiz: {
    question: string;
    options: string[];
    correct: number;
  };
}

const historicalFigures: HistoricalFigure[] = [
  {
    id: 'cleopatra',
    name: 'Cleopatra VII',
    period: '69-30 BCE',
    achievement: 'Last Pharaoh of Egypt',
    emoji: '👑',
    facts: [
      'She could speak nine languages',
      'She was highly educated and intelligent',
      'She ruled Egypt for nearly three decades',
      'She met Julius Caesar and Mark Antony',
    ],
    quiz: {
      question: 'What was Cleopatra famous for?',
      options: [
        'Being the last Pharaoh of Egypt',
        'Discovering America',
        'Building the Great Wall',
        'Inventing the telephone',
      ],
      correct: 0,
    },
  },
  {
    id: 'leonardo',
    name: 'Leonardo da Vinci',
    period: '1452-1519',
    achievement: 'Renaissance genius - artist, inventor, scientist',
    emoji: '🎨',
    facts: [
      'He painted the Mona Lisa',
      'He designed flying machines centuries before airplanes',
      'He studied human anatomy by dissecting bodies',
      'He wrote backwards in mirror writing',
    ],
    quiz: {
      question: 'What famous painting did Leonardo da Vinci create?',
      options: [
        'The Starry Night',
        'The Mona Lisa',
        'The Scream',
        'Girl with a Pearl Earring',
      ],
      correct: 1,
    },
  },
  {
    id: 'marie-curie',
    name: 'Marie Curie',
    period: '1867-1934',
    achievement: 'First woman to win a Nobel Prize',
    emoji: '🔬',
    facts: [
      'She discovered the elements radium and polonium',
      'She won Nobel Prizes in both Physics and Chemistry',
      'She was the first female professor at the University of Paris',
      'Her notebooks are still radioactive today',
    ],
    quiz: {
      question: 'Marie Curie was the first woman to win what?',
      options: ['An Oscar', 'A Nobel Prize', 'An Olympic medal', 'A Grammy'],
      correct: 1,
    },
  },
  {
    id: 'napoleon',
    name: 'Napoleon Bonaparte',
    period: '1769-1821',
    achievement: 'French Emperor and military genius',
    emoji: '⚔️',
    facts: [
      'He conquered much of Europe',
      'He created the Napoleonic Code of laws',
      'He was exiled to the island of Elba, then later to St. Helena',
      'He was known for his short stature, though he was average height for his time',
    ],
    quiz: {
      question:
        'What did Napoleon create that influenced legal systems worldwide?',
      options: [
        'The Napoleonic Code',
        'The French Revolution',
        'The Eiffel Tower',
        'The metric system',
      ],
      correct: 0,
    },
  },
  {
    id: 'amelia-earhart',
    name: 'Amelia Earhart',
    period: '1897-1937',
    achievement: 'Aviation pioneer',
    emoji: '✈️',
    facts: [
      'She was the first woman to fly solo across the Atlantic Ocean',
      'She disappeared during an attempt to fly around the world',
      'She set many aviation records',
      'She inspired women to pursue careers in aviation',
    ],
    quiz: {
      question: 'What was Amelia Earhart the first woman to do?',
      options: [
        'Drive a car',
        'Fly solo across the Atlantic',
        'Climb Mount Everest',
        'Go to space',
      ],
      correct: 1,
    },
  },
];

interface TimelineEvent {
  year: string;
  event: string;
  figure: string;
}

const timelineEvents: TimelineEvent[] = [
  { year: '69 BCE', event: 'Cleopatra VII born', figure: 'cleopatra' },
  { year: '1452', event: 'Leonardo da Vinci born', figure: 'leonardo' },
  { year: '1769', event: 'Napoleon Bonaparte born', figure: 'napoleon' },
  { year: '1867', event: 'Marie Curie born', figure: 'marie-curie' },
  { year: '1897', event: 'Amelia Earhart born', figure: 'amelia-earhart' },
];

export default function HistoryHeroesPage() {
  const [gameStatus, setGameStatus] = useState<
    'menu' | 'learning' | 'quiz' | 'timeline' | 'completed'
  >('menu');
  const [currentFigure, setCurrentFigure] = useState<HistoricalFigure | null>(
    null
  );
  const [score, setScore] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [learnedFigures, setLearnedFigures] = useState<string[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);

  const startLearning = useCallback((figure: HistoricalFigure) => {
    setCurrentFigure(figure);
    setGameStatus('learning');
  }, []);

  const startQuiz = useCallback(() => {
    setGameStatus('quiz');
    setScore(0);
    setQuestionsAnswered(0);
    setCurrentQuizIndex(0);
    // Shuffle the figures for quiz
    const shuffledFigures = [...historicalFigures].sort(
      () => Math.random() - 0.5
    );
    setCurrentFigure(shuffledFigures[0]);
  }, []);

  const handleQuizAnswer = useCallback(
    (selectedIndex: number) => {
      if (!currentFigure) return;

      const correct = selectedIndex === currentFigure.quiz.correct;
      setIsCorrect(correct);
      setShowResult(true);

      if (correct) {
        setScore(prev => prev + 25);
      }

      setTimeout(() => {
        setShowResult(false);
        setQuestionsAnswered(prev => prev + 1);

        if (questionsAnswered >= 4) {
          setGameStatus('completed');
        } else {
          const nextIndex = (currentQuizIndex + 1) % historicalFigures.length;
          setCurrentQuizIndex(nextIndex);
          setCurrentFigure(historicalFigures[nextIndex]);
        }
      }, 2000);
    },
    [currentFigure, questionsAnswered, currentQuizIndex]
  );

  const markAsLearned = useCallback(() => {
    if (currentFigure && !learnedFigures.includes(currentFigure.id)) {
      setLearnedFigures(prev => [...prev, currentFigure.id]);
      setScore(prev => prev + 10);
    }
  }, [currentFigure, learnedFigures]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      <header className="bg-white shadow-sm">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/games"
              className="flex items-center space-x-2 text-amber-600 hover:text-amber-700"
            >
              <span>← Back to Games</span>
            </Link>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Score: <span className="font-bold text-amber-600">{score}</span>
              </div>
              <div className="text-sm text-gray-600">
                Learned:{' '}
                <span className="font-bold text-orange-600">
                  {learnedFigures.length}
                </span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                🏛️ History Heroes
              </span>
            </div>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🏛️ History Heroes
          </h1>
          <p className="text-lg text-gray-600">
            Travel through time and meet famous historical figures!
          </p>
        </div>

        {gameStatus === 'menu' && (
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">⏰</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-8">
                Choose Your Adventure
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                <div className="text-4xl mb-4">📚</div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Meet the Heroes
                </h3>
                <p className="text-gray-600 mb-6">
                  Learn about famous people from history and their amazing
                  achievements.
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {historicalFigures.map(figure => (
                    <button
                      key={figure.id}
                      onClick={() => startLearning(figure)}
                      className={`w-full text-left p-3 rounded-lg font-bold transition-all duration-200 transform hover:scale-105 ${
                        learnedFigures.includes(figure.id)
                          ? 'bg-green-100 text-green-800 border-2 border-green-300'
                          : 'bg-gradient-to-r from-amber-400 to-orange-500 text-white hover:shadow-lg'
                      }`}
                    >
                      <span className="text-2xl mr-2">{figure.emoji}</span>
                      {figure.name}
                      {learnedFigures.includes(figure.id) && (
                        <span className="float-right">✅</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                <div className="text-4xl mb-4">🧠</div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  History Quiz
                </h3>
                <p className="text-gray-600 mb-6">
                  Test your knowledge about historical figures and their
                  achievements.
                </p>
                <button
                  onClick={startQuiz}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-4 rounded-lg font-bold text-lg hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                  🧠 Take Quiz
                </button>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                <div className="text-4xl mb-4">📅</div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Timeline Explorer
                </h3>
                <p className="text-gray-600 mb-6">
                  Explore when these historical figures lived and their major
                  events.
                </p>
                <button
                  onClick={() => setGameStatus('timeline')}
                  className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white px-6 py-4 rounded-lg font-bold text-lg hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                  📅 View Timeline
                </button>
              </div>
            </div>
          </div>
        )}

        {gameStatus === 'learning' && currentFigure && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {currentFigure.emoji} {currentFigure.name}
                  </h2>
                  <p className="text-lg text-gray-600 mb-2">
                    {currentFigure.period}
                  </p>
                  <p className="text-xl text-amber-600 font-bold">
                    {currentFigure.achievement}
                  </p>
                </div>
                <button
                  onClick={() => setGameStatus('menu')}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg font-bold hover:shadow-lg transition-all duration-200"
                >
                  🏠 Back to Menu
                </button>
              </div>

              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Amazing Facts:
                </h3>
                <div className="grid gap-4">
                  {currentFigure.facts.map((fact, index) => (
                    <div
                      key={index}
                      className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded"
                    >
                      <p className="text-gray-800 text-lg">• {fact}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={markAsLearned}
                  disabled={learnedFigures.includes(currentFigure.id)}
                  className={`px-8 py-4 rounded-lg font-bold text-lg transition-all duration-200 transform hover:scale-105 ${
                    learnedFigures.includes(currentFigure.id)
                      ? 'bg-green-500 text-white cursor-not-allowed'
                      : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-lg'
                  }`}
                >
                  {learnedFigures.includes(currentFigure.id)
                    ? '✅ Learned!'
                    : '📚 Mark as Learned'}
                </button>
              </div>
            </div>
          </div>
        )}

        {gameStatus === 'quiz' && currentFigure && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="text-4xl mb-4">{currentFigure.emoji}</div>
              <div className="text-sm text-gray-500 mb-4">
                Question {questionsAnswered + 1} of 5
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-8">
                {currentFigure.quiz.question}
              </h2>

              <div className="grid grid-cols-1 gap-4">
                {currentFigure.quiz.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuizAnswer(index)}
                    className="bg-gradient-to-r from-blue-400 to-purple-500 text-white p-4 rounded-lg font-bold text-lg hover:shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {showResult && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                <div className="bg-white rounded-lg p-8 text-center">
                  <div className="text-6xl mb-4">{isCorrect ? '🎉' : '📚'}</div>
                  <h3
                    className={`text-2xl font-bold mb-2 ${isCorrect ? 'text-green-600' : 'text-blue-600'}`}
                  >
                    {isCorrect ? 'Excellent!' : 'Good try!'}
                  </h3>
                  <p className="text-gray-600">
                    {isCorrect
                      ? 'You know your history!'
                      : 'Keep learning about history!'}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {gameStatus === 'timeline' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900">
                  Historical Timeline
                </h2>
                <button
                  onClick={() => setGameStatus('menu')}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg font-bold hover:shadow-lg transition-all duration-200"
                >
                  🏠 Back to Menu
                </button>
              </div>

              <div className="space-y-6">
                {timelineEvents.map((event, index) => {
                  const figure = historicalFigures.find(
                    f => f.id === event.figure
                  );
                  return (
                    <div
                      key={index}
                      className="flex items-center space-x-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border-l-4 border-amber-500"
                    >
                      <div className="text-3xl">{figure?.emoji}</div>
                      <div className="flex-1">
                        <div className="text-xl font-bold text-amber-600">
                          {event.year}
                        </div>
                        <div className="text-lg text-gray-900">
                          {event.event}
                        </div>
                        {figure && (
                          <div className="text-sm text-gray-600">
                            {figure.achievement}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {gameStatus === 'completed' && (
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              History Master!
            </h2>
            <p className="text-gray-600 mb-6">
              Final Score:{' '}
              <span className="text-amber-600 font-bold">{score}</span>
              <br />
              You've learned about amazing historical figures! Keep exploring
              history.
            </p>
            <button
              onClick={() => setGameStatus('menu')}
              className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-4 rounded-lg font-bold text-lg hover:shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              🏛️ Explore More History
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
