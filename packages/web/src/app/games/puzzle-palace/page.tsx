'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';

interface PuzzlePiece {
  id: number;
  value: number | null;
  isFixed: boolean;
}

interface Puzzle {
  id: string;
  name: string;
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'sudoku' | 'logic' | 'pattern';
  description: string;
  grid?: PuzzlePiece[][];
  sequence?: number[];
  target?: number[];
}

const sudokuEasy: PuzzlePiece[][] = [
  [
    { id: 0, value: 5, isFixed: true },
    { id: 1, value: 3, isFixed: true },
    { id: 2, value: null, isFixed: false },
    { id: 3, value: null, isFixed: false },
  ],
  [
    { id: 4, value: 6, isFixed: true },
    { id: 5, value: null, isFixed: false },
    { id: 6, value: null, isFixed: false },
    { id: 7, value: 2, isFixed: true },
  ],
  [
    { id: 8, value: null, isFixed: false },
    { id: 9, value: 4, isFixed: true },
    { id: 10, value: null, isFixed: false },
    { id: 11, value: 3, isFixed: true },
  ],
  [
    { id: 12, value: null, isFixed: false },
    { id: 13, value: null, isFixed: false },
    { id: 14, value: 1, isFixed: true },
    { id: 15, value: 6, isFixed: true },
  ],
];

const puzzles: Puzzle[] = [
  {
    id: 'mini-sudoku',
    name: 'Mini Sudoku',
    difficulty: 'easy',
    type: 'sudoku',
    description:
      'Fill the 4x4 grid so each row and column contains numbers 1-4',
    grid: sudokuEasy,
  },
  {
    id: 'number-sequence',
    name: 'Number Pattern',
    difficulty: 'medium',
    type: 'pattern',
    description: 'Find the next number in the sequence: 2, 4, 6, 8, ?',
    sequence: [2, 4, 6, 8],
    target: [10],
  },
  {
    id: 'logic-gates',
    name: 'Logic Challenge',
    difficulty: 'hard',
    type: 'logic',
    description:
      'If all cats are animals, and Fluffy is a cat, what is Fluffy?',
    sequence: [1], // Simplified for demonstration
    target: [1],
  },
];

export default function PuzzlePalacePage() {
  const [gameStatus, setGameStatus] = useState<
    'menu' | 'playing' | 'completed'
  >('menu');
  const [currentPuzzle, setCurrentPuzzle] = useState<Puzzle | null>(null);
  const [score, setScore] = useState(0);
  const [currentGrid, setCurrentGrid] = useState<PuzzlePiece[][]>([]);
  const [selectedCell, setSelectedCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [completedPuzzles, setCompletedPuzzles] = useState<string[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');

  const startPuzzle = useCallback((puzzle: Puzzle) => {
    setCurrentPuzzle(puzzle);
    setGameStatus('playing');
    setSelectedCell(null);
    setCurrentAnswer('');

    if (puzzle.grid) {
      // Deep copy the grid
      setCurrentGrid(puzzle.grid.map(row => row.map(cell => ({ ...cell }))));
    }
  }, []);

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      if (
        currentGrid[row] &&
        currentGrid[row][col] &&
        !currentGrid[row][col].isFixed
      ) {
        setSelectedCell({ row, col });
      }
    },
    [currentGrid]
  );

  const handleNumberInput = useCallback(
    (number: number) => {
      if (
        selectedCell &&
        currentGrid[selectedCell.row] &&
        currentGrid[selectedCell.row][selectedCell.col]
      ) {
        const newGrid = [...currentGrid];
        newGrid[selectedCell.row][selectedCell.col].value = number;
        setCurrentGrid(newGrid);
        setSelectedCell(null);
      }
    },
    [selectedCell, currentGrid]
  );

  const clearCell = useCallback(() => {
    if (
      selectedCell &&
      currentGrid[selectedCell.row] &&
      currentGrid[selectedCell.row][selectedCell.col]
    ) {
      const newGrid = [...currentGrid];
      newGrid[selectedCell.row][selectedCell.col].value = null;
      setCurrentGrid(newGrid);
    }
  }, [selectedCell, currentGrid]);

  const checkSudokuSolution = useCallback(() => {
    if (!currentGrid || currentGrid.length !== 4) return false;

    // Check if all cells are filled
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        if (currentGrid[row][col].value === null) return false;
      }
    }

    // Check rows
    for (let row = 0; row < 4; row++) {
      const rowValues = currentGrid[row]
        .map(cell => cell.value)
        .filter(val => val !== null) as number[];
      const uniqueValues = new Set(rowValues);
      if (
        uniqueValues.size !== 4 ||
        !rowValues.every(val => val >= 1 && val <= 4)
      ) {
        return false;
      }
    }

    // Check columns
    for (let col = 0; col < 4; col++) {
      const colValues = currentGrid
        .map(row => row[col].value)
        .filter(val => val !== null) as number[];
      const uniqueValues = new Set(colValues);
      if (
        uniqueValues.size !== 4 ||
        !colValues.every(val => val >= 1 && val <= 4)
      ) {
        return false;
      }
    }

    return true;
  }, [currentGrid]);

  const submitSudoku = useCallback(() => {
    const isValid = checkSudokuSolution();
    setIsCorrect(isValid);
    setShowResult(true);

    if (isValid) {
      const points =
        currentPuzzle?.difficulty === 'easy'
          ? 50
          : currentPuzzle?.difficulty === 'medium'
            ? 75
            : 100;
      setScore(prev => prev + points);
      if (currentPuzzle) {
        setCompletedPuzzles(prev => [...prev, currentPuzzle.id]);
      }
    }

    setTimeout(() => {
      setShowResult(false);
      if (isValid) {
        setGameStatus('completed');
      }
    }, 2000);
  }, [checkSudokuSolution, currentPuzzle]);

  const submitPatternAnswer = useCallback(() => {
    if (!currentPuzzle || !currentAnswer) return;

    const isValid =
      currentPuzzle.target &&
      currentPuzzle.target[0] === parseInt(currentAnswer);
    setIsCorrect(!!isValid);
    setShowResult(true);

    if (isValid) {
      const points =
        currentPuzzle.difficulty === 'easy'
          ? 50
          : currentPuzzle.difficulty === 'medium'
            ? 75
            : 100;
      setScore(prev => prev + points);
      setCompletedPuzzles(prev => [...prev, currentPuzzle.id]);
    }

    setTimeout(() => {
      setShowResult(false);
      if (isValid) {
        setGameStatus('completed');
      }
    }, 2000);
  }, [currentPuzzle, currentAnswer]);

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

  const getPuzzleIcon = (type: string) => {
    switch (type) {
      case 'sudoku':
        return '🔢';
      case 'pattern':
        return '🔍';
      case 'logic':
        return '🧠';
      default:
        return '🧩';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50">
      <header className="bg-white shadow-sm">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/games"
              className="flex items-center space-x-2 text-violet-600 hover:text-violet-700"
            >
              <span>← Back to Games</span>
            </Link>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Score:{' '}
                <span className="font-bold text-violet-600">{score}</span>
              </div>
              <div className="text-sm text-gray-600">
                Completed:{' '}
                <span className="font-bold text-purple-600">
                  {completedPuzzles.length}
                </span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                🧩 Puzzle Palace
              </span>
            </div>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🧩 Puzzle Palace
          </h1>
          <p className="text-lg text-gray-600">
            Solve brain teasers and logic puzzles to unlock new levels!
          </p>
        </div>

        {gameStatus === 'menu' && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🏰</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-8">
                Choose Your Puzzle Challenge
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {puzzles.map(puzzle => (
                <div
                  key={puzzle.id}
                  className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-3xl">{getPuzzleIcon(puzzle.type)}</div>
                    <span
                      className={`px-2 py-1 rounded text-sm font-bold ${getDifficultyColor(puzzle.difficulty)}`}
                    >
                      {puzzle.difficulty.toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {puzzle.name}
                  </h3>
                  <p className="text-gray-600 mb-4">{puzzle.description}</p>
                  {completedPuzzles.includes(puzzle.id) && (
                    <div className="text-green-600 font-bold mb-2">
                      ✅ Completed!
                    </div>
                  )}
                  <button
                    onClick={() => startPuzzle(puzzle)}
                    className="w-full bg-gradient-to-r from-violet-500 to-purple-500 text-white px-4 py-3 rounded-lg font-bold hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                  >
                    🧩 Start Puzzle
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {gameStatus === 'playing' && currentPuzzle && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {getPuzzleIcon(currentPuzzle.type)} {currentPuzzle.name}
                </h2>
                <button
                  onClick={() => setGameStatus('menu')}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg font-bold hover:shadow-lg transition-all duration-200"
                >
                  🏠 Back to Menu
                </button>
              </div>

              <p className="text-gray-600 mb-6 text-lg">
                {currentPuzzle.description}
              </p>

              {currentPuzzle.type === 'sudoku' && (
                <div className="flex flex-col items-center space-y-6">
                  <div className="grid grid-cols-4 gap-1 bg-gray-800 p-2 rounded-lg">
                    {currentGrid.map((row, rowIndex) =>
                      row.map((cell, colIndex) => (
                        <button
                          key={cell.id}
                          onClick={() => handleCellClick(rowIndex, colIndex)}
                          className={`w-16 h-16 flex items-center justify-center text-xl font-bold rounded ${
                            cell.isFixed
                              ? 'bg-gray-200 text-gray-800 cursor-not-allowed'
                              : selectedCell?.row === rowIndex &&
                                  selectedCell?.col === colIndex
                                ? 'bg-yellow-300 text-gray-900'
                                : 'bg-white text-gray-900 hover:bg-gray-50 cursor-pointer'
                          }`}
                          disabled={cell.isFixed}
                        >
                          {cell.value || ''}
                        </button>
                      ))
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 justify-center">
                    {[1, 2, 3, 4].map(number => (
                      <button
                        key={number}
                        onClick={() => handleNumberInput(number)}
                        disabled={!selectedCell}
                        className="w-12 h-12 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
                      >
                        {number}
                      </button>
                    ))}
                    <button
                      onClick={clearCell}
                      disabled={!selectedCell}
                      className="w-12 h-12 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
                    >
                      ✗
                    </button>
                  </div>

                  <button
                    onClick={submitSudoku}
                    className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-3 rounded-lg font-bold text-lg hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                  >
                    ✅ Check Solution
                  </button>
                </div>
              )}

              {currentPuzzle.type === 'pattern' && (
                <div className="flex flex-col items-center space-y-6">
                  <div className="bg-purple-50 p-6 rounded-lg border-2 border-purple-200">
                    <div className="flex items-center justify-center space-x-4 text-3xl font-bold">
                      {currentPuzzle.sequence?.map((num, index) => (
                        <span
                          key={index}
                          className="bg-white px-4 py-2 rounded-lg shadow"
                        >
                          {num}
                        </span>
                      ))}
                      <span className="text-purple-600">?</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <label className="text-lg font-bold text-gray-900">
                      Your answer:
                    </label>
                    <input
                      type="number"
                      value={currentAnswer}
                      onChange={e => setCurrentAnswer(e.target.value)}
                      className="w-20 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                      placeholder="?"
                    />
                  </div>

                  <button
                    onClick={submitPatternAnswer}
                    disabled={!currentAnswer}
                    className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-8 py-3 rounded-lg font-bold text-lg hover:shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ✅ Submit Answer
                  </button>
                </div>
              )}

              {currentPuzzle.type === 'logic' && (
                <div className="flex flex-col items-center space-y-6">
                  <div className="bg-indigo-50 p-6 rounded-lg border-2 border-indigo-200 text-center">
                    <p className="text-lg text-gray-800 mb-4">
                      "If all cats are animals, and Fluffy is a cat, what is
                      Fluffy?"
                    </p>
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          setIsCorrect(true);
                          setShowResult(true);
                          setScore(prev => prev + 100);
                          if (currentPuzzle) {
                            setCompletedPuzzles(prev => [
                              ...prev,
                              currentPuzzle.id,
                            ]);
                          }
                          setTimeout(() => {
                            setShowResult(false);
                            setGameStatus('completed');
                          }, 2000);
                        }}
                        className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-lg font-bold hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                      >
                        An animal
                      </button>
                      <button
                        onClick={() => {
                          setIsCorrect(false);
                          setShowResult(true);
                          setTimeout(() => setShowResult(false), 2000);
                        }}
                        className="w-full bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-3 rounded-lg font-bold hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                      >
                        A plant
                      </button>
                      <button
                        onClick={() => {
                          setIsCorrect(false);
                          setShowResult(true);
                          setTimeout(() => setShowResult(false), 2000);
                        }}
                        className="w-full bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-3 rounded-lg font-bold hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                      >
                        A mineral
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {showResult && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                <div className="bg-white rounded-lg p-8 text-center">
                  <div className="text-6xl mb-4">{isCorrect ? '🎉' : '🤔'}</div>
                  <h3
                    className={`text-2xl font-bold mb-2 ${isCorrect ? 'text-green-600' : 'text-orange-600'}`}
                  >
                    {isCorrect ? 'Brilliant!' : 'Try Again!'}
                  </h3>
                  <p className="text-gray-600">
                    {isCorrect
                      ? 'You solved the puzzle!'
                      : 'Think it through and try again!'}
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
              Puzzle Solved!
            </h2>
            <p className="text-gray-600 mb-6">
              Excellent problem-solving! You earned points and expanded your
              logical thinking skills.
            </p>
            <button
              onClick={() => setGameStatus('menu')}
              className="bg-gradient-to-r from-violet-500 to-purple-500 text-white px-8 py-4 rounded-lg font-bold text-lg hover:shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              🧩 Try Another Puzzle
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
