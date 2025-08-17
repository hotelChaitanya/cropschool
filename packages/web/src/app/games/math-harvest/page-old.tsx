'use client';

import { useEffect, useRef, useState } from 'react';
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

interface GameState {
  running: boolean;
  paused: boolean;
  score: number;
  currentProblem: MathProblem | null;
  draggedElement: GameEntity | null;
  entities: GameEntity[];
  canvas: HTMLCanvasElement | null;
  ctx: CanvasRenderingContext2D | null;
}

export default function MathAdventurePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>({
    running: false,
    paused: false,
    score: 0,
    currentProblem: null,
    draggedElement: null,
    entities: [],
    canvas: null,
    ctx: null,
  });
  const [status, setStatus] = useState(
    '🎲 Ready to start your math adventure! Click "Start Game" to begin!'
  );
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Simple canvas setup for crisp graphics
  const setupCanvas = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Set canvas size to match display size for crisp rendering
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    ctx.scale(dpr, dpr);

    // Enable crisp text rendering
    ctx.textBaseline = 'alphabetic';
    ctx.imageSmoothingEnabled = false;

    return ctx;
  };

  const updateScore = (points: number = 0) => {
    setGameState(prev => ({ ...prev, score: prev.score + points }));
  };

  const generateMathProblem = (): MathProblem => {
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
  };

  const createNumberEntity = (
    number: number,
    x: number,
    y: number,
    id: number
  ): GameEntity => {
    return {
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
    };
  };

  const drawGame = () => {
    if (!gameState.ctx || !gameState.canvas) return;

    const { ctx, canvas } = gameState;

    // Get actual drawing dimensions (CSS dimensions)
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Clear canvas with gradient background
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#B0E0E6');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    if (!gameState.currentProblem) return;

    const centerX = width / 2;
    const centerY = height / 2;

    // Draw equation framework
    ctx.fillStyle = '#2E5984';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';

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
    ctx.fillText('+', centerX - 50, centerY + 10);
    ctx.fillText('=', centerX + 200, centerY + 10);

    // Draw slot labels
    ctx.font = '16px Arial';
    ctx.fillStyle = '#666';
    ctx.fillText('First Number', centerX - 150, centerY - 60);
    ctx.fillText('Second Number', centerX + 100, centerY - 60);
    ctx.fillText('Answer', centerX + 350, centerY - 60);

    // Draw draggable numbers
    gameState.entities.forEach(entity => {
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
        entity.y + entity.height / 2 + 12
      );
    });

    // Draw instructions
    ctx.fillStyle = '#2E5984';
    ctx.font = '18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Drag the numbers to solve the equation!', centerX, 50);
  };

  const isPointInEntity = (
    x: number,
    y: number,
    entity: GameEntity
  ): boolean => {
    return (
      x >= entity.x &&
      x <= entity.x + entity.width &&
      y >= entity.y &&
      y <= entity.y + entity.height
    );
  };

  const checkDropPosition = (entity: GameEntity) => {
    if (!gameState.canvas || !gameState.currentProblem) return;

    const rect = gameState.canvas.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Check if dropped in left slot (first number)
    if (
      entity.x > centerX - 200 &&
      entity.x < centerX - 100 &&
      entity.y > centerY - 50 &&
      entity.y < centerY + 50
    ) {
      if (entity.number === gameState.currentProblem.num1) {
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
      if (entity.number === gameState.currentProblem.num2) {
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
      if (entity.number === gameState.currentProblem.result) {
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
  };

  const resetEntityPosition = (entity: GameEntity) => {
    entity.x = entity.originalX;
    entity.y = entity.originalY;
    entity.color = '#FF6B9D';
  };

  const checkSolution = () => {
    const correctPositions = gameState.entities.filter(
      e => e.color === '#4CAF50'
    ).length;
    if (correctPositions >= 3) {
      setStatus(
        '🎉 Fantastic! Problem solved! Click "New Problem" to continue!'
      );
      updateScore(10);
      setGameState(prev => ({
        ...prev,
        currentProblem: prev.currentProblem
          ? { ...prev.currentProblem, solved: true }
          : null,
      }));
    }
  };

  const startGame = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = setupCanvas(canvas);
    if (!ctx) return;

    setGameState(prev => ({
      ...prev,
      canvas,
      ctx,
      running: true,
      score: 0,
    }));

    newProblem(canvas, ctx);
    setStatus('🎮 Math Adventure started! Drag numbers to solve the equation!');

    // Start game loop
    gameLoop();

    // Add event listeners
    setupEventListeners(canvas);
  };

  const newProblem = (
    canvas?: HTMLCanvasElement,
    ctx?: CanvasRenderingContext2D
  ) => {
    const currentCanvas = canvas || gameState.canvas;
    if (!currentCanvas) return;

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
      const rect = currentCanvas.getBoundingClientRect();
      const x = 50 + (i % 5) * 120;
      const y = rect.height - 150 + Math.floor(i / 5) * 80;
      entities.push(createNumberEntity(num, x, y, i));
    });

    setGameState(prev => ({
      ...prev,
      currentProblem: problem,
      entities,
    }));

    setStatus(`🎯 New problem: ${problem.num1} + ${problem.num2} = ?`);
  };

  const setupEventListeners = (canvas: HTMLCanvasElement) => {
    const handleMouseDown = (e: MouseEvent) => {
      if (!gameState.running || gameState.paused) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Find clicked entity
      for (const entity of gameState.entities) {
        if (isPointInEntity(x, y, entity)) {
          setGameState(prev => ({ ...prev, draggedElement: entity }));
          entity.dragging = true;
          entity.offsetX = x - entity.x;
          entity.offsetY = y - entity.y;
          setStatus(`🔄 Dragging number ${entity.number}...`);
          break;
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!gameState.draggedElement) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      gameState.draggedElement.x = x - (gameState.draggedElement.offsetX || 0);
      gameState.draggedElement.y = y - (gameState.draggedElement.offsetY || 0);
    };

    const handleMouseUp = () => {
      if (!gameState.draggedElement) return;

      gameState.draggedElement.dragging = false;
      checkDropPosition(gameState.draggedElement);
      setGameState(prev => ({ ...prev, draggedElement: null }));
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
    };
  };

  const gameLoop = () => {
    if (!gameState.running) return;

    if (!gameState.paused) {
      drawGame();
    }

    requestAnimationFrame(gameLoop);
  };

  const resetGame = () => {
    setGameState({
      running: false,
      paused: false,
      score: 0,
      currentProblem: null,
      draggedElement: null,
      entities: [],
      canvas: null,
      ctx: null,
    });

    setStatus('🔄 Game reset! Click "Start Game" to play again!');

    if (gameState.ctx && gameState.canvas) {
      gameState.ctx.clearRect(
        0,
        0,
        gameState.canvas.width,
        gameState.canvas.height
      );
    }
  };

  const togglePause = () => {
    setGameState(prev => ({ ...prev, paused: !prev.paused }));
    setStatus(gameState.paused ? '▶️ Game resumed' : '⏸️ Game paused');
  };

  if (!isClient) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
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
              Score: {gameState.score} 🌟
            </div>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Game Info */}
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Math Adventure Game
          </h1>
          <p className="text-lg text-gray-600">
            Drag numbers to solve math problems! Learn addition while having
            fun!
          </p>
        </div>

        {/* Game Canvas */}
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

        {/* Game Controls */}
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          <button
            onClick={startGame}
            disabled={gameState.running}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🚀 Start Game
          </button>

          <button
            onClick={() => newProblem()}
            disabled={!gameState.running || !gameState.currentProblem?.solved}
            className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ➕ New Problem
          </button>

          <button
            onClick={togglePause}
            disabled={!gameState.running}
            className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {gameState.paused ? '▶️ Resume' : '⏸️ Pause'}
          </button>

          <button
            onClick={resetGame}
            className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            🔄 Reset
          </button>
        </div>

        {/* Game Instructions */}
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

        {/* Game Status */}
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
