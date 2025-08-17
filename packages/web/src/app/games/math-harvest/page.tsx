'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';

// Game state types
interface GameEntity {
  id: number;
  number: number;
  x: number;
  y: number;
  width: number;
  height: number;
  dragging: boolean;
  originalX: number;
  originalY: number;
  color: string;
  borderColor: string;
  offsetX?: number;
  offsetY?: number;
}

interface MathProblem {
  num1: number;
  num2: number;
  result: number;
  operation: string;
  solved: boolean;
}

export default function MathAdventurePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const animationRef = useRef<number>();
  const entitiesRef = useRef<GameEntity[]>([]);
  const draggedElementRef = useRef<GameEntity | null>(null);

  const [gameRunning, setGameRunning] = useState(false);
  const [gamePaused, setGamePaused] = useState(false);
  const [score, setScore] = useState(0);
  const [currentProblem, setCurrentProblem] = useState<MathProblem | null>(
    null
  );
  const [status, setStatus] = useState(
    '🎲 Ready to start your math adventure! Click "Start Game" to begin!'
  );
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Canvas setup
  const setupCanvas = useCallback((canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Simple canvas setup without DPI scaling to avoid coordinate issues
    canvas.width = 800;
    canvas.height = 600;

    ctx.imageSmoothingEnabled = false;

    // Initial clear to make canvas visible
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, 800, 600);

    return ctx;
  }, []);

  const generateMathProblem = useCallback((): MathProblem => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const result = num1 + num2;

    return {
      num1,
      num2,
      result,
      operation: '+',
      solved: false,
    };
  }, []);

  const createNumberEntity = useCallback(
    (number: number, x: number, y: number, id: number): GameEntity => ({
      id,
      number,
      x,
      y,
      width: 60,
      height: 60,
      dragging: false,
      originalX: x,
      originalY: y,
      color: '#FF6B9D',
      borderColor: '#FF1744',
    }),
    []
  );

  // Drawing function
  // Drawing function
  const drawGame = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!ctx || !canvas || !currentProblem) return;

    const width = 800;
    const height = 600;

    // Clear canvas with gradient background
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#B0E0E6');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;

    // Draw equation framework
    ctx.fillStyle = '#2E5984';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Draw the math equation slots
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillRect(centerX - 200, centerY - 50, 100, 100); // Left slot
    ctx.fillRect(centerX + 50, centerY - 50, 100, 100); // Right slot
    ctx.fillRect(centerX + 300, centerY - 50, 100, 100); // Result slot

    // Draw slot borders
    ctx.strokeStyle = '#FFE066';
    ctx.lineWidth = 3;
    ctx.strokeRect(centerX - 200, centerY - 50, 100, 100);
    ctx.strokeRect(centerX + 50, centerY - 50, 100, 100);
    ctx.strokeRect(centerX + 300, centerY - 50, 100, 100);

    // Draw operation symbols
    ctx.fillStyle = '#2E5984';
    ctx.font = 'bold 36px Arial';
    ctx.fillText('+', centerX - 50, centerY);
    ctx.fillText('=', centerX + 200, centerY);

    // Draw slot labels
    ctx.font = '16px Arial';
    ctx.fillStyle = '#666';
    ctx.fillText('First Number', centerX - 150, centerY - 70);
    ctx.fillText('Second Number', centerX + 100, centerY - 70);
    ctx.fillText('Answer', centerX + 350, centerY - 70);

    // Draw draggable numbers
    entitiesRef.current.forEach(entity => {
      // Entity shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(entity.x + 3, entity.y + 3, entity.width, entity.height);

      // Entity background
      const entityGradient = ctx.createLinearGradient(
        entity.x,
        entity.y,
        entity.x,
        entity.y + entity.height
      );
      entityGradient.addColorStop(0, entity.color);
      entityGradient.addColorStop(1, entity.borderColor);
      ctx.fillStyle = entityGradient;
      ctx.fillRect(entity.x, entity.y, entity.width, entity.height);

      // Entity border
      ctx.strokeStyle = entity.dragging ? '#FFE066' : entity.borderColor;
      ctx.lineWidth = entity.dragging ? 4 : 2;
      ctx.strokeRect(entity.x, entity.y, entity.width, entity.height);

      // Number text
      ctx.fillStyle = 'white';
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(
        entity.number.toString(),
        entity.x + entity.width / 2,
        entity.y + entity.height / 2
      );
    });

    // Draw instructions
    ctx.fillStyle = '#2E5984';
    ctx.font = '18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(
      'Drag the numbers to solve the equation!',
      centerX,
      height - 30
    );
  }, [currentProblem]);

  // Game loop
  const gameLoop = useCallback(() => {
    if (gameRunning && !gamePaused) {
      drawGame();
    }
    animationRef.current = requestAnimationFrame(gameLoop);
  }, [gameRunning, gamePaused, drawGame]);

  // Event handlers
  const getMousePos = useCallback(
    (e: MouseEvent, canvas: HTMLCanvasElement) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = 800 / rect.width;
      const scaleY = 600 / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    },
    []
  );

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      if (!gameRunning || gamePaused || !canvasRef.current) return;

      const pos = getMousePos(e, canvasRef.current);
      const entity = entitiesRef.current.find(
        ent =>
          pos.x >= ent.x &&
          pos.x <= ent.x + ent.width &&
          pos.y >= ent.y &&
          pos.y <= ent.y + ent.height
      );

      if (entity) {
        entity.dragging = true;
        entity.offsetX = pos.x - entity.x;
        entity.offsetY = pos.y - entity.y;
        draggedElementRef.current = entity;
        setStatus(`🔄 Dragging number ${entity.number}...`);
      }
    },
    [gameRunning, gamePaused, getMousePos]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!draggedElementRef.current || !canvasRef.current) return;

      const pos = getMousePos(e, canvasRef.current);
      draggedElementRef.current.x =
        pos.x - (draggedElementRef.current.offsetX || 0);
      draggedElementRef.current.y =
        pos.y - (draggedElementRef.current.offsetY || 0);
    },
    [getMousePos]
  );

  const handleMouseUp = useCallback(() => {
    if (!draggedElementRef.current || !currentProblem || !canvasRef.current)
      return;

    const entity = draggedElementRef.current;
    entity.dragging = false;

    // Check drop position
    const centerX = 400; // Fixed canvas center
    const centerY = 300; // Fixed canvas center

    // Check if dropped in left slot (first number)
    if (
      entity.x > centerX - 200 &&
      entity.x < centerX - 100 &&
      entity.y > centerY - 50 &&
      entity.y < centerY + 50
    ) {
      if (entity.number === currentProblem.num1) {
        setStatus('✅ Correct! First number is right!');
        entity.x = centerX - 175;
        entity.y = centerY - 25;
        entity.color = '#4CAF50';
        checkSolution();
      } else {
        setStatus("❌ Try again! That's not the first number.");
        resetEntityPosition(entity);
      }
    }
    // Check if dropped in right slot (second number)
    else if (
      entity.x > centerX + 50 &&
      entity.x < centerX + 150 &&
      entity.y > centerY - 50 &&
      entity.y < centerY + 50
    ) {
      if (entity.number === currentProblem.num2) {
        setStatus('✅ Correct! Second number is right!');
        entity.x = centerX + 75;
        entity.y = centerY - 25;
        entity.color = '#4CAF50';
        checkSolution();
      } else {
        setStatus("❌ Try again! That's not the second number.");
        resetEntityPosition(entity);
      }
    }
    // Check if dropped in result slot
    else if (
      entity.x > centerX + 300 &&
      entity.x < centerX + 400 &&
      entity.y > centerY - 50 &&
      entity.y < centerY + 50
    ) {
      if (entity.number === currentProblem.result) {
        setStatus('✅ Excellent! You got the answer right!');
        entity.x = centerX + 325;
        entity.y = centerY - 25;
        entity.color = '#4CAF50';
        checkSolution();
      } else {
        setStatus("❌ Try again! That's not the correct answer.");
        resetEntityPosition(entity);
      }
    } else {
      resetEntityPosition(entity);
    }

    draggedElementRef.current = null;
  }, [currentProblem]);

  const resetEntityPosition = useCallback((entity: GameEntity) => {
    entity.x = entity.originalX;
    entity.y = entity.originalY;
    entity.color = '#FF6B9D';
  }, []);

  const checkSolution = useCallback(() => {
    const correctPositions = entitiesRef.current.filter(
      e => e.color === '#4CAF50'
    ).length;
    if (correctPositions >= 3) {
      setStatus(
        '🎉 Fantastic! Problem solved! Click "New Problem" to continue!'
      );
      setScore(prev => prev + 10);
      setCurrentProblem(prev => (prev ? { ...prev, solved: true } : null));
    }
  }, []);

  // Game control functions
  const startGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = setupCanvas(canvas);
    if (!ctx) return;

    ctxRef.current = ctx;

    setGameRunning(true);
    setScore(0);
    newProblem();
    setStatus('🎮 Math Adventure started! Drag numbers to solve the equation!');

    // Setup event listeners
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);

    // Start game loop
    if (!animationRef.current) {
      animationRef.current = requestAnimationFrame(gameLoop);
    }

    // Force initial draw to make canvas visible
    setTimeout(() => drawGame(), 50);
  }, [setupCanvas, handleMouseDown, handleMouseMove, handleMouseUp, gameLoop]);

  const newProblem = useCallback(() => {
    const problem = generateMathProblem();
    const entities: GameEntity[] = [];

    // Create number entities for all possible numbers (1-20)
    const numbers = [
      problem.num1,
      problem.num2,
      problem.result,
      ...Array.from({ length: 7 }, () => Math.floor(Math.random() * 20) + 1),
    ];

    // Shuffle numbers
    for (let i = numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }

    // Create entities
    numbers.slice(0, 10).forEach((num, i) => {
      const x = 50 + (i % 5) * 120;
      const y = 450 + Math.floor(i / 5) * 80;
      entities.push(createNumberEntity(num, x, y, i));
    });

    entitiesRef.current = entities;
    setCurrentProblem(problem);
    setStatus(`🎯 New problem: ${problem.num1} + ${problem.num2} = ?`);
  }, [generateMathProblem, createNumberEntity]);

  const resetGame = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = undefined;
    }

    // Remove event listeners
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
    }

    setGameRunning(false);
    setGamePaused(false);
    setScore(0);
    setCurrentProblem(null);
    entitiesRef.current = [];
    draggedElementRef.current = null;
    setStatus('🔄 Game reset! Click "Start Game" to play again!');

    if (ctxRef.current && canvas) {
      const rect = canvas.getBoundingClientRect();
      ctxRef.current.clearRect(0, 0, rect.width, rect.height);
    }
  }, [handleMouseDown, handleMouseMove, handleMouseUp]);

  const togglePause = useCallback(() => {
    setGamePaused(prev => !prev);
    setStatus(gamePaused ? '▶️ Game resumed' : '⏸️ Game paused');
  }, [gamePaused]);

  if (!isClient) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <header className="bg-white shadow-sm">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/games"
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
            >
              <span>← Back to Games</span>
            </Link>

            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">🧮</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                Math Adventure
              </span>
            </div>

            <div className="text-lg font-semibold text-purple-600">
              Score: {score} 🌟
            </div>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Math Adventure Game
          </h1>
          <p className="text-lg text-gray-600">
            Drag numbers to solve math problems! Learn addition while having
            fun!
          </p>
        </div>

        <div className="flex justify-center mb-6">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="border-4 border-yellow-400 rounded-2xl shadow-2xl bg-gradient-to-br from-sky-200 to-blue-300 cursor-pointer"
            style={{
              width: '800px',
              height: '600px',
              maxWidth: '100%',
              imageRendering: 'crisp-edges',
            }}
          />
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-6">
          <button
            onClick={startGame}
            disabled={gameRunning}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🚀 Start Game
          </button>

          <button
            onClick={newProblem}
            disabled={!gameRunning || !currentProblem?.solved}
            className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ➕ New Problem
          </button>

          <button
            onClick={togglePause}
            disabled={!gameRunning}
            className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {gamePaused ? '▶️ Resume' : '⏸️ Pause'}
          </button>

          <button
            onClick={resetGame}
            className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            🔄 Reset
          </button>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            🎮 How to Play:
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-gray-700">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">1️⃣</span>
              <p>Click and drag numbers from the bottom of the screen</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">2️⃣</span>
              <p>Drop them into the correct equation slots</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">3️⃣</span>
              <p>Solve the math problem to earn points</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">4️⃣</span>
              <p>Complete as many problems as you can!</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6 border border-purple-200">
          <div className="text-center">
            <h4 className="text-lg font-semibold text-purple-800 mb-2">
              Game Status
            </h4>
            <p className="text-purple-700 leading-relaxed">{status}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
