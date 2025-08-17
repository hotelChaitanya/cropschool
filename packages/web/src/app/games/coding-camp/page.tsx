'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';

interface CodeChallenge {
  id: string;
  title: string;
  description: string;
  blocks: CodeBlock[];
  targetSequence: string[];
  difficulty: 'easy' | 'medium' | 'hard';
}

interface CodeBlock {
  id: string;
  text: string;
  type: 'action' | 'loop' | 'condition';
  color: string;
}

const availableBlocks: CodeBlock[] = [
  {
    id: 'move-forward',
    text: 'Move Forward',
    type: 'action',
    color: 'bg-blue-500',
  },
  { id: 'turn-left', text: 'Turn Left', type: 'action', color: 'bg-green-500' },
  {
    id: 'turn-right',
    text: 'Turn Right',
    type: 'action',
    color: 'bg-yellow-500',
  },
  {
    id: 'pick-up',
    text: 'Pick Up Item',
    type: 'action',
    color: 'bg-purple-500',
  },
  {
    id: 'repeat-3',
    text: 'Repeat 3 times',
    type: 'loop',
    color: 'bg-orange-500',
  },
  {
    id: 'if-wall',
    text: 'If wall ahead',
    type: 'condition',
    color: 'bg-red-500',
  },
];

const challenges: CodeChallenge[] = [
  {
    id: 'robot-walk',
    title: 'Robot Walk',
    description: 'Help the robot walk forward 3 steps',
    blocks: availableBlocks.filter(b =>
      ['move-forward', 'repeat-3'].includes(b.id)
    ),
    targetSequence: ['repeat-3', 'move-forward'],
    difficulty: 'easy',
  },
  {
    id: 'square-path',
    title: 'Square Path',
    description: 'Make the robot walk in a square',
    blocks: availableBlocks.filter(b =>
      ['move-forward', 'turn-right', 'repeat-3'].includes(b.id)
    ),
    targetSequence: ['repeat-3', 'move-forward', 'turn-right'],
    difficulty: 'medium',
  },
  {
    id: 'treasure-hunt',
    title: 'Treasure Hunt',
    description: 'Navigate to the treasure and pick it up',
    blocks: availableBlocks.filter(b =>
      ['move-forward', 'turn-left', 'pick-up', 'if-wall'].includes(b.id)
    ),
    targetSequence: [
      'move-forward',
      'move-forward',
      'turn-left',
      'move-forward',
      'pick-up',
    ],
    difficulty: 'hard',
  },
];

export default function CodingCampPage() {
  const [score, setScore] = useState(0);
  const [currentChallenge, setCurrentChallenge] =
    useState<CodeChallenge | null>(null);
  const [gameStatus, setGameStatus] = useState<
    'menu' | 'challenge' | 'coding' | 'testing' | 'success'
  >('menu');
  const [playerCode, setPlayerCode] = useState<CodeBlock[]>([]);
  const [challengesCompleted, setChallengesCompleted] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [robotPosition, setRobotPosition] = useState({
    x: 0,
    y: 0,
    direction: 'right',
  });

  const startChallenge = useCallback((challenge: CodeChallenge) => {
    setCurrentChallenge(challenge);
    setPlayerCode([]);
    setGameStatus('challenge');
    setRobotPosition({ x: 0, y: 0, direction: 'right' });
  }, []);

  const addCodeBlock = useCallback((block: CodeBlock) => {
    setPlayerCode(prev => [...prev, block]);
  }, []);

  const removeCodeBlock = useCallback((index: number) => {
    setPlayerCode(prev => prev.filter((_, i) => i !== index));
  }, []);

  const runCode = useCallback(() => {
    if (!currentChallenge) return;

    setGameStatus('testing');

    // Simple validation - check if the code matches the target sequence
    const codeSequence = playerCode.map(block => block.id);
    const targetSequence = currentChallenge.targetSequence;

    setTimeout(() => {
      const isCorrect =
        JSON.stringify(codeSequence) === JSON.stringify(targetSequence);

      if (isCorrect) {
        const points =
          currentChallenge.difficulty === 'easy'
            ? 50
            : currentChallenge.difficulty === 'medium'
              ? 75
              : 100;
        setScore(prev => prev + points);
        setChallengesCompleted(prev => [...prev, currentChallenge.id]);
        setGameStatus('success');
      } else {
        setShowResult(true);
        setTimeout(() => {
          setShowResult(false);
          setGameStatus('coding');
        }, 2000);
      }
    }, 1500);
  }, [currentChallenge, playerCode]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'hard':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getBlockIcon = (type: string) => {
    switch (type) {
      case 'action':
        return '🤖';
      case 'loop':
        return '🔄';
      case 'condition':
        return '❓';
      default:
        return '📦';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-blue-50 to-purple-50">
      <header className="bg-white shadow-sm">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/games"
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-700"
            >
              <span>← Back to Games</span>
            </Link>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Score:{' '}
                <span className="font-bold text-purple-600">{score}</span>
              </div>
              <div className="text-sm text-gray-600">
                Completed:{' '}
                <span className="font-bold text-green-600">
                  {challengesCompleted.length}
                </span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                💻 Coding Camp
              </span>
            </div>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            💻 Coding Camp
          </h1>
          <p className="text-lg text-gray-600">
            Learn programming basics through visual coding challenges!
          </p>
        </div>

        {gameStatus === 'menu' && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🤖</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Choose Your Coding Challenge
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {challenges.map(challenge => (
                <div
                  key={challenge.id}
                  className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-bold text-gray-900">
                      {challenge.title}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded text-sm font-bold ${getDifficultyColor(challenge.difficulty)}`}
                    >
                      {challenge.difficulty.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{challenge.description}</p>
                  <div className="mb-4">
                    <div className="text-sm text-gray-500 mb-2">
                      Available blocks:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {challenge.blocks.map(block => (
                        <span
                          key={block.id}
                          className="text-xs bg-gray-100 px-2 py-1 rounded"
                        >
                          {getBlockIcon(block.type)} {block.text}
                        </span>
                      ))}
                    </div>
                  </div>
                  {challengesCompleted.includes(challenge.id) && (
                    <div className="text-green-600 font-bold mb-2">
                      ✅ Completed!
                    </div>
                  )}
                  <button
                    onClick={() => startChallenge(challenge)}
                    className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-3 rounded-lg font-bold hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                  >
                    💻 Start Challenge
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {(gameStatus === 'challenge' || gameStatus === 'coding') &&
          currentChallenge && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {currentChallenge.title}
                </h2>
                <p className="text-gray-600 mb-4">
                  {currentChallenge.description}
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">
                      Available Blocks
                    </h3>
                    <div className="space-y-2">
                      {currentChallenge.blocks.map(block => (
                        <button
                          key={block.id}
                          onClick={() => addCodeBlock(block)}
                          className={`w-full ${block.color} text-white p-3 rounded-lg font-bold hover:shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2`}
                        >
                          <span>{getBlockIcon(block.type)}</span>
                          <span>{block.text}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">
                      Your Code
                    </h3>
                    <div className="min-h-[200px] bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4">
                      {playerCode.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">
                          Drag blocks here to build your code
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {playerCode.map((block, index) => (
                            <div
                              key={`${block.id}-${index}`}
                              className={`${block.color} text-white p-2 rounded flex items-center justify-between`}
                            >
                              <span className="flex items-center space-x-2">
                                <span>{getBlockIcon(block.type)}</span>
                                <span>{block.text}</span>
                              </span>
                              <button
                                onClick={() => removeCodeBlock(index)}
                                className="text-white hover:text-red-200"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 space-y-2">
                      <button
                        onClick={runCode}
                        disabled={playerCode.length === 0}
                        className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-lg font-bold hover:shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        ▶️ Run Code
                      </button>
                      <button
                        onClick={() => setGameStatus('menu')}
                        className="w-full bg-gray-500 text-white px-6 py-3 rounded-lg font-bold hover:shadow-lg transition-all duration-200"
                      >
                        🏠 Back to Menu
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        {gameStatus === 'testing' && (
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-6xl mb-4 animate-spin">⚙️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Running Your Code...
            </h2>
            <p className="text-gray-600">
              Let's see if your robot follows the instructions!
            </p>
          </div>
        )}

        {gameStatus === 'success' && (
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Success!</h2>
            <p className="text-gray-600 mb-6">
              Your code worked perfectly! The robot completed the challenge.
            </p>
            <button
              onClick={() => setGameStatus('menu')}
              className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-8 py-4 rounded-lg font-bold text-lg hover:shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              🏠 Next Challenge
            </button>
          </div>
        )}

        {showResult && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg p-8 text-center">
              <div className="text-6xl mb-4">🤔</div>
              <h3 className="text-2xl font-bold text-orange-600 mb-2">
                Not quite right!
              </h3>
              <p className="text-gray-600">
                Try adjusting your code blocks and run again.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
