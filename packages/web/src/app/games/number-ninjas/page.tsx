'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';

interface NinjaMission {
  id: string;
  operation: 'multiply' | 'divide';
  num1: number;
  num2: number;
  answer: number;
  options: number[];
}

export default function NumberNinjasPage() {
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [currentMission, setCurrentMission] = useState<NinjaMission | null>(
    null
  );
  const [gameStatus, setGameStatus] = useState<
    'menu' | 'playing' | 'gameOver' | 'victory'
  >('menu');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isTimerActive, setIsTimerActive] = useState(false);

  const generateMission = useCallback((level: number): NinjaMission => {
    const operations: ('multiply' | 'divide')[] = ['multiply', 'divide'];
    const operation = operations[Math.floor(Math.random() * operations.length)];

    let num1: number, num2: number, answer: number;

    if (operation === 'multiply') {
      const maxFactor = Math.min(3 + level, 12);
      num1 = Math.floor(Math.random() * maxFactor) + 1;
      num2 = Math.floor(Math.random() * maxFactor) + 1;
      answer = num1 * num2;
    } else {
      // Division - ensure clean division
      const divisor = Math.floor(Math.random() * Math.min(5 + level, 12)) + 2;
      const quotient = Math.floor(Math.random() * Math.min(5 + level, 15)) + 1;
      num1 = divisor * quotient;
      num2 = divisor;
      answer = quotient;
    }

    // Generate wrong options
    const options = [answer];
    while (options.length < 4) {
      let wrongAnswer: number;
      if (operation === 'multiply') {
        wrongAnswer = answer + Math.floor(Math.random() * 20) - 10;
      } else {
        wrongAnswer = answer + Math.floor(Math.random() * 10) - 5;
      }

      if (wrongAnswer > 0 && !options.includes(wrongAnswer)) {
        options.push(wrongAnswer);
      }
    }

    // Shuffle options
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }

    return {
      id: `mission-${Date.now()}`,
      operation,
      num1,
      num2,
      answer,
      options,
    };
  }, []);

  const startGame = useCallback(() => {
    setGameStatus('playing');
    setScore(0);
    setLevel(1);
    setLives(3);
    setTimeLeft(30);
    setIsTimerActive(true);
    setCurrentMission(generateMission(1));
  }, [generateMission]);

  const handleAnswer = useCallback(
    (selectedAnswer: number) => {
      if (!currentMission) return;

      setIsTimerActive(false);
      const correct = selectedAnswer === currentMission.answer;
      setIsCorrect(correct);
      setShowResult(true);

      if (correct) {
        setScore(prev => prev + 15 * level);
        setTimeLeft(prev => Math.min(prev + 5, 30)); // Bonus time
      } else {
        setLives(prev => prev - 1);
      }

      setTimeout(() => {
        setShowResult(false);
        if (lives > 1 || correct) {
          if (score >= level * 100) {
            setLevel(prev => prev + 1);
          }
          setCurrentMission(generateMission(level));
          setIsTimerActive(true);
          setTimeLeft(30);
        } else {
          setGameStatus('gameOver');
        }
      }, 1500);
    },
    [currentMission, level, score, lives, generateMission]
  );

  // Timer effect
  useEffect(() => {
    if (isTimerActive && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && isTimerActive) {
      setLives(prev => prev - 1);
      setIsTimerActive(false);
      if (lives > 1) {
        setCurrentMission(generateMission(level));
        setTimeLeft(30);
        setIsTimerActive(true);
      } else {
        setGameStatus('gameOver');
      }
    }
    return undefined;
  }, [timeLeft, isTimerActive, lives, level, generateMission]);

  const getOperationSymbol = (operation: string) => {
    return operation === 'multiply' ? '×' : '÷';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900">
      <header className="bg-black bg-opacity-50 shadow-sm">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/games"
              className="flex items-center space-x-2 text-purple-300 hover:text-purple-200"
            >
              <span>← Back to Games</span>
            </Link>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-300">
                Score:{' '}
                <span className="font-bold text-yellow-400">{score}</span>
              </div>
              <div className="text-sm text-gray-300">
                Level:{' '}
                <span className="font-bold text-purple-400">{level}</span>
              </div>
              <div className="text-sm text-gray-300">
                Lives:{' '}
                <span className="font-bold text-red-400">
                  {'❤️'.repeat(lives)}
                </span>
              </div>
              {isTimerActive && (
                <div className="text-sm text-gray-300">
                  Time:{' '}
                  <span
                    className={`font-bold ${timeLeft <= 10 ? 'text-red-400' : 'text-green-400'}`}
                  >
                    {timeLeft}s
                  </span>
                </div>
              )}
              <span className="text-xl font-bold text-white">
                🥷 Number Ninjas
              </span>
            </div>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🥷 Number Ninjas
          </h1>
          <p className="text-lg text-gray-300">
            Master multiplication and division with lightning speed!
          </p>
        </div>

        {gameStatus === 'menu' && (
          <div className="max-w-md mx-auto bg-black bg-opacity-50 rounded-lg shadow-lg p-8 text-center border border-purple-500">
            <div className="text-6xl mb-4">🥷</div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Ready for Ninja Training?
            </h2>
            <p className="text-gray-300 mb-6">
              Solve multiplication and division problems before time runs out.
              You have 3 lives and 30 seconds per problem!
            </p>
            <button
              onClick={startGame}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-200 transform hover:scale-105"
            >
              ⚡ Begin Training!
            </button>
          </div>
        )}

        {gameStatus === 'playing' && currentMission && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-black bg-opacity-50 rounded-lg shadow-lg p-8 text-center mb-6 border border-purple-500">
              <div className="text-6xl mb-6">🎯</div>
              <div className="mb-4">
                <div
                  className={`text-2xl font-bold mb-2 ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-green-400'}`}
                >
                  ⏱️ {timeLeft}s
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-1000 ${timeLeft <= 10 ? 'bg-red-500' : 'bg-green-500'}`}
                    style={{ width: `${(timeLeft / 30) * 100}%` }}
                  ></div>
                </div>
              </div>

              <h2 className="text-3xl font-bold text-white mb-8">
                {currentMission.num1}{' '}
                {getOperationSymbol(currentMission.operation)}{' '}
                {currentMission.num2} = ?
              </h2>

              <div className="grid grid-cols-2 gap-4">
                {currentMission.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(option)}
                    className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white p-6 rounded-lg font-bold text-2xl hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-200 transform hover:scale-105 active:scale-95 border border-purple-400"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {showResult && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
                <div className="bg-gray-900 border border-purple-500 rounded-lg p-8 text-center">
                  <div className="text-6xl mb-4">{isCorrect ? '⚡' : '💨'}</div>
                  <h3
                    className={`text-2xl font-bold mb-2 ${isCorrect ? 'text-green-400' : 'text-orange-400'}`}
                  >
                    {isCorrect ? 'Ninja Strike!' : 'Miss!'}
                  </h3>
                  <p className="text-gray-300">
                    {isCorrect ? 'Lightning fast!' : 'Train harder, ninja!'}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {gameStatus === 'gameOver' && (
          <div className="max-w-md mx-auto bg-black bg-opacity-50 rounded-lg shadow-lg p-8 text-center border border-red-500">
            <div className="text-6xl mb-4">💥</div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Training Complete
            </h2>
            <p className="text-gray-300 mb-6">
              Final Score:{' '}
              <span className="text-yellow-400 font-bold">{score}</span>
              <br />
              Level Reached:{' '}
              <span className="text-purple-400 font-bold">{level}</span>
              <br />
              Keep training to become a true Number Ninja!
            </p>
            <button
              onClick={startGame}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-200 transform hover:scale-105"
            >
              🥷 Train Again
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
