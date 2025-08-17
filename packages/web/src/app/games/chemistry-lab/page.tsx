'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';

interface Element {
  symbol: string;
  name: string;
  atomicNumber: number;
  group: string;
  color: string;
}

interface Experiment {
  id: string;
  name: string;
  description: string;
  elements: string[];
  reaction: string;
  result: string;
  safetyTip: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

const elements: Element[] = [
  {
    symbol: 'H',
    name: 'Hydrogen',
    atomicNumber: 1,
    group: 'nonmetal',
    color: 'bg-red-200',
  },
  {
    symbol: 'He',
    name: 'Helium',
    atomicNumber: 2,
    group: 'noble-gas',
    color: 'bg-purple-200',
  },
  {
    symbol: 'Li',
    name: 'Lithium',
    atomicNumber: 3,
    group: 'alkali-metal',
    color: 'bg-yellow-200',
  },
  {
    symbol: 'Be',
    name: 'Beryllium',
    atomicNumber: 4,
    group: 'alkaline-earth',
    color: 'bg-orange-200',
  },
  {
    symbol: 'B',
    name: 'Boron',
    atomicNumber: 5,
    group: 'metalloid',
    color: 'bg-green-200',
  },
  {
    symbol: 'C',
    name: 'Carbon',
    atomicNumber: 6,
    group: 'nonmetal',
    color: 'bg-gray-200',
  },
  {
    symbol: 'N',
    name: 'Nitrogen',
    atomicNumber: 7,
    group: 'nonmetal',
    color: 'bg-blue-200',
  },
  {
    symbol: 'O',
    name: 'Oxygen',
    atomicNumber: 8,
    group: 'nonmetal',
    color: 'bg-red-300',
  },
  {
    symbol: 'F',
    name: 'Fluorine',
    atomicNumber: 9,
    group: 'halogen',
    color: 'bg-green-300',
  },
  {
    symbol: 'Ne',
    name: 'Neon',
    atomicNumber: 10,
    group: 'noble-gas',
    color: 'bg-purple-300',
  },
];

const experiments: Experiment[] = [
  {
    id: 'water-formation',
    name: 'Making Water',
    description: 'Combine hydrogen and oxygen to create water molecules',
    elements: ['H', 'H', 'O'],
    reaction: '2H + O → H₂O',
    result: 'Water is formed! The most important molecule for life.',
    safetyTip: 'Always handle gases carefully in real labs!',
    difficulty: 'easy',
  },
  {
    id: 'carbon-dioxide',
    name: 'Carbon Dioxide Creation',
    description: 'Mix carbon and oxygen to make the gas we breathe out',
    elements: ['C', 'O', 'O'],
    reaction: 'C + 2O → CO₂',
    result:
      'Carbon dioxide gas forms! This is what plants use for photosynthesis.',
    safetyTip: 'Good ventilation is important when working with gases!',
    difficulty: 'medium',
  },
  {
    id: 'methane-formation',
    name: 'Natural Gas Formation',
    description: 'Create methane, the main component of natural gas',
    elements: ['C', 'H', 'H', 'H', 'H'],
    reaction: 'C + 4H → CH₄',
    result: 'Methane forms! This is a common fuel and greenhouse gas.',
    safetyTip: 'Methane is flammable - handle with extreme care!',
    difficulty: 'hard',
  },
];

interface Quiz {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

const quizzes: Quiz[] = [
  {
    question: 'What is the chemical symbol for Oxygen?',
    options: ['O', 'Ox', 'Og', 'Om'],
    correct: 0,
    explanation: 'Oxygen\'s symbol is O, from the Latin "oxygenium".',
  },
  {
    question: 'How many atoms are in a water molecule?',
    options: ['1', '2', '3', '4'],
    correct: 2,
    explanation: 'Water (H₂O) has 3 atoms: 2 hydrogen and 1 oxygen.',
  },
  {
    question:
      'What do we call elements in the same column of the periodic table?',
    options: ['Periods', 'Groups', 'Families', 'Columns'],
    correct: 1,
    explanation: 'Elements in the same column are called groups or families.',
  },
];

export default function ChemistryLabPage() {
  const [gameStatus, setGameStatus] = useState<
    'menu' | 'periodic-table' | 'experiment' | 'quiz' | 'result'
  >('menu');
  const [currentExperiment, setCurrentExperiment] = useState<Experiment | null>(
    null
  );
  const [selectedElements, setSelectedElements] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [completedExperiments, setCompletedExperiments] = useState<string[]>(
    []
  );
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [resultMessage, setResultMessage] = useState('');

  const startExperiment = useCallback((experiment: Experiment) => {
    setCurrentExperiment(experiment);
    setSelectedElements([]);
    setGameStatus('experiment');
  }, []);

  const addElement = useCallback(
    (symbol: string) => {
      if (
        currentExperiment &&
        selectedElements.length < currentExperiment.elements.length
      ) {
        setSelectedElements(prev => [...prev, symbol]);
      }
    },
    [currentExperiment, selectedElements]
  );

  const removeElement = useCallback((index: number) => {
    setSelectedElements(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearElements = useCallback(() => {
    setSelectedElements([]);
  }, []);

  const runExperiment = useCallback(() => {
    if (!currentExperiment) return;

    // Check if the selected elements match the required elements
    const requiredElements = [...currentExperiment.elements].sort();
    const selectedElementsSorted = [...selectedElements].sort();

    const isCorrect =
      JSON.stringify(requiredElements) ===
      JSON.stringify(selectedElementsSorted);

    setIsCorrect(isCorrect);
    setShowResult(true);

    if (isCorrect) {
      const points =
        currentExperiment.difficulty === 'easy'
          ? 30
          : currentExperiment.difficulty === 'medium'
            ? 50
            : 70;
      setScore(prev => prev + points);
      setCompletedExperiments(prev => [...prev, currentExperiment.id]);
      setResultMessage(currentExperiment.result);
    } else {
      setResultMessage(
        "That combination doesn't match the experiment. Try again!"
      );
    }

    setTimeout(() => {
      setShowResult(false);
      if (isCorrect) {
        setGameStatus('result');
      }
    }, 3000);
  }, [currentExperiment, selectedElements]);

  const startQuiz = useCallback(() => {
    setGameStatus('quiz');
    setCurrentQuizIndex(0);
    setCurrentQuiz(quizzes[0]);
  }, []);

  const handleQuizAnswer = useCallback(
    (selectedIndex: number) => {
      if (!currentQuiz) return;

      const correct = selectedIndex === currentQuiz.correct;
      setIsCorrect(correct);
      setResultMessage(currentQuiz.explanation);
      setShowResult(true);

      if (correct) {
        setScore(prev => prev + 20);
      }

      setTimeout(() => {
        setShowResult(false);
        if (currentQuizIndex < quizzes.length - 1) {
          const nextIndex = currentQuizIndex + 1;
          setCurrentQuizIndex(nextIndex);
          setCurrentQuiz(quizzes[nextIndex]);
        } else {
          setGameStatus('menu');
        }
      }, 2500);
    },
    [currentQuiz, currentQuizIndex]
  );

  const getElementBySymbol = (symbol: string) => {
    return elements.find(el => el.symbol === symbol);
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-50 via-green-50 to-emerald-50">
      <header className="bg-white shadow-sm">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/games"
              className="flex items-center space-x-2 text-lime-600 hover:text-lime-700"
            >
              <span>← Back to Games</span>
            </Link>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Score: <span className="font-bold text-lime-600">{score}</span>
              </div>
              <div className="text-sm text-gray-600">
                Experiments:{' '}
                <span className="font-bold text-green-600">
                  {completedExperiments.length}
                </span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                🧪 Chemistry Lab
              </span>
            </div>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🧪 Chemistry Lab
          </h1>
          <p className="text-lg text-gray-600">
            Conduct safe virtual experiments and learn about elements!
          </p>
        </div>

        {gameStatus === 'menu' && (
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">⚗️</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-8">
                Welcome to the Virtual Chemistry Lab
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                <div className="text-4xl mb-4">🔬</div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Virtual Experiments
                </h3>
                <p className="text-gray-600 mb-6">
                  Mix elements safely and see what compounds you can create!
                </p>
                <div className="space-y-3">
                  {experiments.map(experiment => (
                    <button
                      key={experiment.id}
                      onClick={() => startExperiment(experiment)}
                      className={`w-full text-left p-3 rounded-lg font-bold transition-all duration-200 transform hover:scale-105 ${
                        completedExperiments.includes(experiment.id)
                          ? 'bg-green-100 text-green-800 border-2 border-green-300'
                          : 'bg-gradient-to-r from-lime-400 to-green-500 text-white hover:shadow-lg'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span>{experiment.name}</span>
                        <span
                          className={`text-xs ${getDifficultyColor(experiment.difficulty)}`}
                        >
                          {completedExperiments.includes(experiment.id)
                            ? '✅'
                            : experiment.difficulty.toUpperCase()}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Periodic Table
                </h3>
                <p className="text-gray-600 mb-6">
                  Explore the first 10 elements and learn their properties.
                </p>
                <button
                  onClick={() => setGameStatus('periodic-table')}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-4 rounded-lg font-bold text-lg hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                  🔍 Explore Elements
                </button>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                <div className="text-4xl mb-4">🧠</div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Chemistry Quiz
                </h3>
                <p className="text-gray-600 mb-6">
                  Test your knowledge about elements, compounds, and reactions.
                </p>
                <button
                  onClick={startQuiz}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-4 rounded-lg font-bold text-lg hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                  🧠 Take Quiz
                </button>
              </div>
            </div>
          </div>
        )}

        {gameStatus === 'periodic-table' && (
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Periodic Table Explorer
                </h2>
                <button
                  onClick={() => setGameStatus('menu')}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg font-bold hover:shadow-lg transition-all duration-200"
                >
                  🏠 Back to Menu
                </button>
              </div>

              <div className="grid grid-cols-5 gap-2 mb-6">
                {elements.map(element => (
                  <div
                    key={element.symbol}
                    className={`${element.color} p-4 rounded-lg border-2 border-gray-300 text-center hover:shadow-lg transition-all duration-200 transform hover:scale-105 cursor-pointer`}
                    title={`${element.name} - Atomic Number: ${element.atomicNumber}`}
                  >
                    <div className="text-xs text-gray-600">
                      {element.atomicNumber}
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {element.symbol}
                    </div>
                    <div className="text-xs text-gray-700">{element.name}</div>
                  </div>
                ))}
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Element Groups:
                </h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    •{' '}
                    <span className="bg-red-200 px-2 py-1 rounded">
                      Nonmetals
                    </span>{' '}
                    - Essential for life
                  </div>
                  <div>
                    •{' '}
                    <span className="bg-yellow-200 px-2 py-1 rounded">
                      Alkali Metals
                    </span>{' '}
                    - Highly reactive
                  </div>
                  <div>
                    •{' '}
                    <span className="bg-purple-200 px-2 py-1 rounded">
                      Noble Gases
                    </span>{' '}
                    - Very stable
                  </div>
                  <div>
                    •{' '}
                    <span className="bg-green-200 px-2 py-1 rounded">
                      Metalloids
                    </span>{' '}
                    - Mixed properties
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {gameStatus === 'experiment' && currentExperiment && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  🧪 {currentExperiment.name}
                </h2>
                <button
                  onClick={() => setGameStatus('menu')}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg font-bold hover:shadow-lg transition-all duration-200"
                >
                  🏠 Back to Menu
                </button>
              </div>

              <div className="mb-6">
                <p className="text-lg text-gray-700 mb-2">
                  {currentExperiment.description}
                </p>
                <p className="text-md text-blue-600 font-bold mb-2">
                  Target Reaction: {currentExperiment.reaction}
                </p>
                <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
                  ⚠️ {currentExperiment.safetyTip}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Available Elements
                  </h3>
                  <div className="grid grid-cols-5 gap-2">
                    {elements.slice(0, 8).map(element => (
                      <button
                        key={element.symbol}
                        onClick={() => addElement(element.symbol)}
                        className={`${element.color} p-3 rounded-lg border-2 border-gray-300 text-center hover:shadow-lg transition-all duration-200 transform hover:scale-105`}
                        title={element.name}
                      >
                        <div className="text-xs text-gray-600">
                          {element.atomicNumber}
                        </div>
                        <div className="text-xl font-bold text-gray-900">
                          {element.symbol}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Your Mix
                  </h3>
                  <div className="min-h-[120px] bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4 mb-4">
                    {selectedElements.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">
                        Click elements to add them
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {selectedElements.map((symbol, index) => {
                          const element = getElementBySymbol(symbol);
                          return (
                            <button
                              key={index}
                              onClick={() => removeElement(index)}
                              className={`${element?.color} px-3 py-2 rounded-lg border-2 border-gray-400 font-bold hover:bg-red-100 transition-all duration-200`}
                              title="Click to remove"
                            >
                              {symbol}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={runExperiment}
                      disabled={selectedElements.length === 0}
                      className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-lg font-bold hover:shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ⚗️ Run Experiment
                    </button>
                    <button
                      onClick={clearElements}
                      className="bg-red-500 text-white px-4 py-3 rounded-lg font-bold hover:shadow-lg transition-all duration-200"
                    >
                      🗑️
                    </button>
                  </div>

                  <div className="mt-4 text-sm text-gray-600">
                    <strong>Required:</strong>{' '}
                    {currentExperiment.elements.join(', ')}
                  </div>
                </div>
              </div>
            </div>

            {showResult && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                <div className="bg-white rounded-lg p-8 text-center max-w-md">
                  <div className="text-6xl mb-4">{isCorrect ? '🎉' : '🤔'}</div>
                  <h3
                    className={`text-2xl font-bold mb-4 ${isCorrect ? 'text-green-600' : 'text-orange-600'}`}
                  >
                    {isCorrect ? 'Success!' : 'Try Again!'}
                  </h3>
                  <p className="text-gray-600">{resultMessage}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {gameStatus === 'quiz' && currentQuiz && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="text-4xl mb-4">🧠</div>
              <div className="text-sm text-gray-500 mb-4">
                Question {currentQuizIndex + 1} of {quizzes.length}
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-8">
                {currentQuiz.question}
              </h2>

              <div className="grid grid-cols-1 gap-4">
                {currentQuiz.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuizAnswer(index)}
                    className="bg-gradient-to-r from-purple-400 to-pink-500 text-white p-4 rounded-lg font-bold text-lg hover:shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {showResult && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                <div className="bg-white rounded-lg p-8 text-center max-w-md">
                  <div className="text-6xl mb-4">{isCorrect ? '🎉' : '📚'}</div>
                  <h3
                    className={`text-2xl font-bold mb-4 ${isCorrect ? 'text-green-600' : 'text-blue-600'}`}
                  >
                    {isCorrect ? 'Correct!' : 'Learning Time!'}
                  </h3>
                  <p className="text-gray-600">{resultMessage}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {gameStatus === 'result' && currentExperiment && (
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Experiment Complete!
            </h2>
            <p className="text-gray-600 mb-6">{currentExperiment.result}</p>
            <button
              onClick={() => setGameStatus('menu')}
              className="bg-gradient-to-r from-lime-500 to-green-500 text-white px-8 py-4 rounded-lg font-bold text-lg hover:shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              🧪 Try Another Experiment
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
