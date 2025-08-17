'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import Link from 'next/link';

interface LetterEntity {
  id: number;
  letter: string;
  x: number;
  y: number;
  width: number;
  height: number;
  dragging: boolean;
  originalX: number;
  originalY: number;
  color: string;
}

export default function AlphabetFarmSimplePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const animationRef = useRef<number>();

  const [gameRunning, setGameRunning] = useState(false);
  const [letters, setLetters] = useState<LetterEntity[]>([]);
  const [currentWord] = useState('CAT');
  const [draggedLetter, setDraggedLetter] = useState<LetterEntity | null>(null);
  const [status, setStatus] = useState('Click Start Game to begin!');

  // Simple canvas setup
  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return false;

    const ctx = canvas.getContext('2d');
    if (!ctx) return false;

    // Set fixed size
    canvas.width = 800;
    canvas.height = 600;
    ctxRef.current = ctx;

    // Draw initial background
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, 800, 600);

    console.log('✅ Canvas setup complete');
    return true;
  }, []);

  // Draw everything
  const draw = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;

    // Clear and background
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, 800, 600);

    // Title
    ctx.fillStyle = '#2E5984';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Spell: ' + currentWord, 400, 100);

    // Letter slots
    for (let i = 0; i < currentWord.length; i++) {
      const x = 300 + i * 80;
      const y = 200;

      ctx.fillStyle = 'white';
      ctx.fillRect(x, y, 70, 70);
      ctx.strokeStyle = '#4CAF50';
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, 70, 70);
    }

    // Draw letters
    letters.forEach(letter => {
      // Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(letter.x + 2, letter.y + 2, letter.width, letter.height);

      // Background
      ctx.fillStyle = letter.dragging ? '#FFE066' : letter.color;
      ctx.fillRect(letter.x, letter.y, letter.width, letter.height);

      // Border
      ctx.strokeStyle = '#2E7D32';
      ctx.lineWidth = letter.dragging ? 4 : 2;
      ctx.strokeRect(letter.x, letter.y, letter.width, letter.height);

      // Letter text
      ctx.fillStyle = 'white';
      ctx.font = 'bold 28px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(letter.letter, letter.x + 30, letter.y + 40);
    });

    // Instructions
    ctx.fillStyle = '#2E5984';
    ctx.font = '18px Arial';
    ctx.fillText('Drag letters to spell the word!', 400, 550);
  }, [letters, currentWord]);

  // Game loop
  const gameLoop = useCallback(() => {
    if (gameRunning) {
      draw();
    }
    animationRef.current = requestAnimationFrame(gameLoop);
  }, [gameRunning, draw]);

  // Mouse handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!gameRunning) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (800 / rect.width);
      const y = (e.clientY - rect.top) * (600 / rect.height);

      // Find clicked letter
      const clickedLetter = letters.find(
        letter =>
          x >= letter.x &&
          x <= letter.x + letter.width &&
          y >= letter.y &&
          y <= letter.y + letter.height
      );

      if (clickedLetter) {
        clickedLetter.dragging = true;
        setDraggedLetter(clickedLetter);
        setStatus(`Dragging ${clickedLetter.letter}...`);
      }
    },
    [letters, gameRunning]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!draggedLetter) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (800 / rect.width);
      const y = (e.clientY - rect.top) * (600 / rect.height);

      draggedLetter.x = x - 30;
      draggedLetter.y = y - 30;
    },
    [draggedLetter]
  );

  const handleMouseUp = useCallback(() => {
    if (!draggedLetter) return;

    draggedLetter.dragging = false;

    // Simple drop check
    if (draggedLetter.y < 300) {
      setStatus('✅ Good drop!');
    } else {
      setStatus('Try dropping in the letter slots!');
      // Reset position
      draggedLetter.x = draggedLetter.originalX;
      draggedLetter.y = draggedLetter.originalY;
    }

    setDraggedLetter(null);
  }, [draggedLetter]);

  // Start game
  const startGame = useCallback(() => {
    if (!setupCanvas()) {
      setStatus('❌ Canvas setup failed!');
      return;
    }

    // Create letters
    const gameLetters: LetterEntity[] = [
      {
        id: 1,
        letter: 'C',
        x: 100,
        y: 400,
        width: 60,
        height: 60,
        dragging: false,
        originalX: 100,
        originalY: 400,
        color: '#4CAF50',
      },
      {
        id: 2,
        letter: 'A',
        x: 200,
        y: 400,
        width: 60,
        height: 60,
        dragging: false,
        originalX: 200,
        originalY: 400,
        color: '#4CAF50',
      },
      {
        id: 3,
        letter: 'T',
        x: 300,
        y: 400,
        width: 60,
        height: 60,
        dragging: false,
        originalX: 300,
        originalY: 400,
        color: '#4CAF50',
      },
      {
        id: 4,
        letter: 'B',
        x: 400,
        y: 400,
        width: 60,
        height: 60,
        dragging: false,
        originalX: 400,
        originalY: 400,
        color: '#4CAF50',
      },
    ];

    setLetters(gameLetters);
    setGameRunning(true);
    setStatus('Game started! Drag letters to spell CAT!');

    // Start animation loop
    if (!animationRef.current) {
      animationRef.current = requestAnimationFrame(gameLoop);
    }
  }, [setupCanvas, gameLoop]);

  // Reset game
  const resetGame = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = undefined;
    }
    setGameRunning(false);
    setLetters([]);
    setDraggedLetter(null);
    setStatus('Click Start Game to begin!');

    // Clear canvas
    const ctx = ctxRef.current;
    if (ctx) {
      ctx.fillStyle = '#87CEEB';
      ctx.fillRect(0, 0, 800, 600);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-lime-50 to-emerald-50">
      <header className="bg-white shadow-sm">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/games"
              className="flex items-center space-x-2 text-green-600 hover:text-green-700"
            >
              <span>← Back to Games</span>
            </Link>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold text-gray-900">
                Simple Alphabet Farm
              </span>
            </div>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Simple Alphabet Game
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            Simplified version to test drag and drop functionality
          </p>
        </div>

        <div className="flex justify-center mb-6">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            className="border-4 border-green-400 rounded-lg shadow-lg bg-white cursor-pointer"
            style={{
              width: '800px',
              height: '600px',
              maxWidth: '100%',
            }}
          />
        </div>

        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={startGame}
            disabled={gameRunning}
            className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 disabled:opacity-50"
          >
            🚀 Start Game
          </button>

          <button
            onClick={resetGame}
            className="bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600"
          >
            🔄 Reset
          </button>
        </div>

        <div className="bg-white rounded-lg p-4 shadow text-center">
          <p className="text-lg font-semibold text-gray-800">
            Status: {status}
          </p>
        </div>
      </main>
    </div>
  );
}
