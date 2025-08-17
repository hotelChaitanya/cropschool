'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';

interface MathProblem {
  id: string;
  question: string;
  answer: number;
  options: number[];
}

export default function MathAdventurePage() {
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [currentProblem, setCurrentProblem] = useState<MathProblem | null>(
    null
  );
  const [gameStatus, setGameStatus] = useState<
    'menu' | 'playing' | 'completed'
  >('menu');
  const [showCelebration, setShowCelebration] = useState(false);

  const generateProblem = useCallback((level: number): MathProblem => {
    const maxNum = Math.min(10 + level * 2, 50);
    const num1 = Math.floor(Math.random() * maxNum) + 1;
    const num2 = Math.floor(Math.random() * maxNum) + 1;
    const operations = ['+', '-', '×'];
    const operation = operations[Math.floor(Math.random() * operations.length)];

    let answer: number;
    let question: string;

    switch (operation) {
      case '+':
        answer = num1 + num2;
        question = `${num1} + ${num2}`;
        break;
      case '-':
        // Ensure positive result
        const larger = Math.max(num1, num2);
        const smaller = Math.min(num1, num2);
        answer = larger - smaller;
        question = `${larger} - ${smaller}`;
        break;
      case '×':
        const smallNum1 = Math.floor(Math.random() * 10) + 1;
        const smallNum2 = Math.floor(Math.random() * 10) + 1;
        answer = smallNum1 * smallNum2;
        question = `${smallNum1} × ${smallNum2}`;
        break;
      default:
        answer = num1 + num2;
        question = `${num1} + ${num2}`;
    }

    // Generate wrong options
    const options = [answer];
    while (options.length < 4) {
      const wrongAnswer = answer + Math.floor(Math.random() * 20) - 10;
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
      id: `problem-${Date.now()}`,
      question,
      answer,
      options,
    };
  }, []);

  const startGame = useCallback(() => {
    setGameStatus('playing');
    setScore(0);
    setLevel(1);
    setCurrentProblem(generateProblem(1));
  }, [generateProblem]);

  const handleAnswer = useCallback(
    (selectedAnswer: number) => {
      if (!currentProblem) return;

      if (selectedAnswer === currentProblem.answer) {
        setScore(prev => prev + 10 * level);
        setShowCelebration(true);

        setTimeout(() => {
          setShowCelebration(false);
          if (score >= level * 50) {
            setLevel(prev => prev + 1);
          }
          setCurrentProblem(generateProblem(level));
        }, 1500);
      } else {
        // Wrong answer - show correct answer briefly
        setTimeout(() => {
          setCurrentProblem(generateProblem(level));
        }, 1000);
      }
    },
    [currentProblem, level, score, generateProblem]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-yellow-50">
      <header className="bg-white shadow-sm">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/games"
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
            >
              <span>← Back to Games</span>
            </Link>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Score: <span className="font-bold text-blue-600">{score}</span>
              </div>
              <div className="text-sm text-gray-600">
                Level: <span className="font-bold text-green-600">{level}</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                🔢 Math Adventure
              </span>
            </div>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🔢 Math Adventure
          </h1>
          <p className="text-lg text-gray-600">
            Solve math problems and become a number hero!
          </p>
        </div>

        {gameStatus === 'menu' && (
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">🧮</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Start?
            </h2>
            <p className="text-gray-600 mb-6">
              Choose the correct answer to each math problem. Get points for
              each correct answer!
            </p>
            <button
              onClick={startGame}
              className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-8 py-4 rounded-lg font-bold text-lg hover:shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              🚀 Start Adventure!
            </button>
          </div>
        )}

        {gameStatus === 'playing' && currentProblem && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8 text-center mb-6">
              <div className="text-6xl mb-6">🤔</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                What is {currentProblem.question}?
              </h2>

              <div className="grid grid-cols-2 gap-4">
                {currentProblem.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(option)}
                    className="bg-gradient-to-r from-blue-400 to-purple-500 text-white p-6 rounded-lg font-bold text-2xl hover:shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {showCelebration && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                <div className="bg-white rounded-lg p-8 text-center">
                  <div className="text-6xl mb-4">🎉</div>
                  <h3 className="text-2xl font-bold text-green-600 mb-2">
                    Correct!
                  </h3>
                  <p className="text-gray-600">Great job! Keep it up!</p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
