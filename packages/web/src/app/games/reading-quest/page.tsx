'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';

interface Story {
  id: string;
  title: string;
  content: string;
  questions: {
    question: string;
    options: string[];
    correct: number;
  }[];
}

const stories: Story[] = [
  {
    id: 'brave-knight',
    title: 'The Brave Knight',
    content:
      'Once upon a time, there was a brave knight named Sir Arthur. He lived in a beautiful castle and always helped people in need. One day, he heard about a dragon that was frightening the villagers. Sir Arthur decided to help them.',
    questions: [
      {
        question: "What was the knight's name?",
        options: ['Sir John', 'Sir Arthur', 'Sir David', 'Sir Michael'],
        correct: 1,
      },
      {
        question: 'What problem did the villagers have?',
        options: ['A flood', 'A dragon', 'A storm', 'A fire'],
        correct: 1,
      },
    ],
  },
  {
    id: 'magic-garden',
    title: 'The Magic Garden',
    content:
      "Emma discovered a secret garden behind her grandmother's house. The garden was full of colorful flowers that could talk! The roses told her stories, and the sunflowers shared jokes. Emma loved spending time with her new flower friends.",
    questions: [
      {
        question: 'Who discovered the garden?',
        options: ['Emma', 'Sarah', 'Lucy', 'Anna'],
        correct: 0,
      },
      {
        question: 'What was special about the flowers?',
        options: [
          'They were big',
          'They could talk',
          'They were colorful',
          'They smelled nice',
        ],
        correct: 1,
      },
    ],
  },
];

export default function ReadingQuestPage() {
  const [currentStory, setCurrentStory] = useState<Story | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [gameStatus, setGameStatus] = useState<
    'menu' | 'reading' | 'questions' | 'completed'
  >('menu');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const startStory = useCallback((story: Story) => {
    setCurrentStory(story);
    setCurrentQuestion(0);
    setGameStatus('reading');
  }, []);

  const startQuestions = useCallback(() => {
    setGameStatus('questions');
  }, []);

  const handleAnswer = useCallback(
    (selectedIndex: number) => {
      if (!currentStory) return;

      const question = currentStory.questions[currentQuestion];
      const correct = selectedIndex === question.correct;
      setIsCorrect(correct);
      setShowResult(true);

      if (correct) {
        setScore(prev => prev + 10);
      }

      setTimeout(() => {
        setShowResult(false);
        if (currentQuestion < currentStory.questions.length - 1) {
          setCurrentQuestion(prev => prev + 1);
        } else {
          setGameStatus('completed');
        }
      }, 2000);
    },
    [currentStory, currentQuestion]
  );

  const resetGame = useCallback(() => {
    setCurrentStory(null);
    setCurrentQuestion(0);
    setScore(0);
    setGameStatus('menu');
    setShowResult(false);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <header className="bg-white shadow-sm">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/games"
              className="flex items-center space-x-2 text-purple-600 hover:text-purple-700"
            >
              <span>← Back to Games</span>
            </Link>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Score:{' '}
                <span className="font-bold text-purple-600">{score}</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                📚 Reading Quest
              </span>
            </div>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            📚 Reading Quest
          </h1>
          <p className="text-lg text-gray-600">
            Read stories and answer questions to improve your comprehension!
          </p>
        </div>

        {gameStatus === 'menu' && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">📖</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Choose a Story to Read
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {stories.map(story => (
                <div
                  key={story.id}
                  className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {story.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {story.content.substring(0, 100)}...
                  </p>
                  <button
                    onClick={() => startStory(story)}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-bold hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                  >
                    📚 Read Story
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {gameStatus === 'reading' && currentStory && (
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {currentStory.title}
              </h2>
            </div>

            <div className="prose prose-lg mx-auto mb-8">
              <p className="text-gray-700 leading-relaxed text-lg">
                {currentStory.content}
              </p>
            </div>

            <div className="text-center">
              <button
                onClick={startQuestions}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-4 rounded-lg font-bold text-lg hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                ✅ Answer Questions
              </button>
            </div>
          </div>
        )}

        {gameStatus === 'questions' && currentStory && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="text-4xl mb-4">❓</div>
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Question {currentQuestion + 1} of{' '}
                {currentStory.questions.length}
              </h3>

              <h2 className="text-2xl font-bold text-gray-900 mb-8">
                {currentStory.questions[currentQuestion].question}
              </h2>

              <div className="grid grid-cols-1 gap-4">
                {currentStory.questions[currentQuestion].options.map(
                  (option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswer(index)}
                      className="bg-gradient-to-r from-green-400 to-blue-500 text-white p-4 rounded-lg font-bold text-lg hover:shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
                    >
                      {option}
                    </button>
                  )
                )}
              </div>
            </div>

            {showResult && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                <div className="bg-white rounded-lg p-8 text-center">
                  <div className="text-6xl mb-4">{isCorrect ? '🎉' : '😊'}</div>
                  <h3
                    className={`text-2xl font-bold mb-2 ${isCorrect ? 'text-green-600' : 'text-orange-600'}`}
                  >
                    {isCorrect ? 'Correct!' : 'Good try!'}
                  </h3>
                  <p className="text-gray-600">
                    {isCorrect
                      ? 'Great reading comprehension!'
                      : 'Keep practicing!'}
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
              Story Complete!
            </h2>
            <p className="text-gray-600 mb-6">
              You scored {score} points! Great job reading and understanding the
              story.
            </p>
            <button
              onClick={resetGame}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-lg font-bold text-lg hover:shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              📚 Read Another Story
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
