'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';

// Game state types for Alphabet Farm
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
  borderColor: string;
  offsetX?: number;
  offsetY?: number;
}

interface WordChallenge {
  word: string;
  definition: string;
  solved: boolean;
  letters: string[];
}

export default function AlphabetFarmPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const animationRef = useRef<number>();
  const entitiesRef = useRef<LetterEntity[]>([]);
  const draggedElementRef = useRef<LetterEntity | null>(null);

  const [gameRunning, setGameRunning] = useState(false);
  const [gamePaused, setGamePaused] = useState(false);
  const [score, setScore] = useState(0);
  const [currentChallenge, setCurrentChallenge] =
    useState<WordChallenge | null>(null);
  const [status, setStatus] = useState(
    '🌾 Welcome to Alphabet Farm! Click "Start Game" to begin learning letters!'
  );
  const [isClient, setIsClient] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSpeechSupported(true);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Speech functions
  const speakText = useCallback(
    (text: string, rate: number = 1) => {
      if (!speechSupported || speaking) return;
      setSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      utterance.pitch = 1.2;
      utterance.volume = 0.8;
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      speechSynthesis.speak(utterance);
    },
    [speechSupported, speaking]
  );

  const speakLetter = useCallback(
    (letter: string) => speakText(`The letter ${letter}`, 0.8),
    [speakText]
  );
  const speakWord = useCallback(
    (word: string) => speakText(word, 0.6),
    [speakText]
  );

  // Game setup functions
  const setupCanvas = useCallback((canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // High DPI support for crisp rendering
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    ctx.scale(dpr, dpr);
    ctx.imageSmoothingEnabled = false;

    return ctx;
  }, []);

  const generateWordChallenge = useCallback((): WordChallenge => {
    const words = [
      { word: 'CAT', definition: 'A furry pet that says meow 🐱' },
      { word: 'DOG', definition: 'A loyal pet that barks 🐕' },
      { word: 'COW', definition: 'A farm animal that gives milk 🐄' },
      { word: 'PIG', definition: 'A pink farm animal that oinks 🐷' },
      { word: 'HEN', definition: 'A bird that lays eggs 🐔' },
    ];

    const selectedWord = words[Math.floor(Math.random() * words.length)];
    return {
      word: selectedWord.word,
      definition: selectedWord.definition,
      solved: false,
      letters: selectedWord.word.split(''),
    };
  }, []);

  const createLetterEntity = useCallback(
    (letter: string, x: number, y: number, id: number): LetterEntity => ({
      id,
      letter,
      x,
      y,
      width: 60,
      height: 60,
      dragging: false,
      originalX: x,
      originalY: y,
      color: '#4CAF50',
      borderColor: '#2E7D32',
    }),
    []
  );

  // Drawing function
  const drawGame = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!ctx || !canvas || !currentChallenge) return;

    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Background
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#98FB98');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;

    // Word definition
    ctx.fillStyle = '#2E5984';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`Definition: ${currentChallenge.definition}`, centerX, 80);

    // Letter slots
    const slotWidth = 80;
    const totalWidth = currentChallenge.letters.length * slotWidth;
    const startX = centerX - totalWidth / 2;

    currentChallenge.letters.forEach((_, index) => {
      const slotX = startX + index * slotWidth;
      const slotY = centerY - 50;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillRect(slotX, slotY, 70, 70);
      ctx.strokeStyle = '#4CAF50';
      ctx.lineWidth = 3;
      ctx.strokeRect(slotX, slotY, 70, 70);

      ctx.fillStyle = '#666';
      ctx.font = '14px Arial';
      ctx.fillText(`${index + 1}`, slotX + 35, slotY - 20);
    });

    // Draggable letters
    entitiesRef.current.forEach(entity => {
      // Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(entity.x + 3, entity.y + 3, entity.width, entity.height);

      // Background
      ctx.fillStyle = entity.dragging ? '#FFE066' : entity.color;
      ctx.fillRect(entity.x, entity.y, entity.width, entity.height);

      // Border
      ctx.strokeStyle = entity.borderColor;
      ctx.lineWidth = entity.dragging ? 4 : 2;
      ctx.strokeRect(entity.x, entity.y, entity.width, entity.height);

      // Letter
      ctx.fillStyle = 'white';
      ctx.font = 'bold 32px Arial';
      ctx.fillText(
        entity.letter,
        entity.x + entity.width / 2,
        entity.y + entity.height / 2
      );
    });

    // Instructions
    ctx.fillStyle = '#2E5984';
    ctx.font = '18px Arial';
    ctx.fillText('Drag the letters to spell the word!', centerX, height - 50);
  }, [currentChallenge]);

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
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    },
    []
  );

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      if (!gameRunning || !canvasRef.current) return;

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

        if (speechSupported) {
          speakLetter(entity.letter);
        }

        setStatus(`🔄 Dragging letter ${entity.letter}...`);
      }
    },
    [gameRunning, getMousePos, speechSupported, speakLetter]
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
    if (!draggedElementRef.current || !currentChallenge || !canvasRef.current)
      return;

    const entity = draggedElementRef.current;
    entity.dragging = false;

    // Check drop position
    const rect = canvasRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const slotWidth = 80;
    const totalWidth = currentChallenge.letters.length * slotWidth;
    const startX = centerX - totalWidth / 2;

    let validDrop = false;
    for (let i = 0; i < currentChallenge.letters.length; i++) {
      const slotX = startX + i * slotWidth;
      const slotY = centerY - 50;

      if (
        entity.x > slotX &&
        entity.x < slotX + 70 &&
        entity.y > slotY &&
        entity.y < slotY + 70
      ) {
        if (entity.letter === currentChallenge.letters[i]) {
          setStatus('✅ Correct letter placement!');
          entity.x = slotX + 5;
          entity.y = slotY + 5;
          entity.color = '#4CAF50';
          validDrop = true;

          setTimeout(() => checkSolution(), 100);
        } else {
          setStatus('❌ Wrong letter! Try again.');
          resetEntityPosition(entity);
          validDrop = true;
        }
        break;
      }
    }

    if (!validDrop) {
      resetEntityPosition(entity);
    }

    draggedElementRef.current = null;
  }, [currentChallenge]);

  const resetEntityPosition = useCallback((entity: LetterEntity) => {
    entity.x = entity.originalX;
    entity.y = entity.originalY;
    entity.color = '#4CAF50';
  }, []);

  const checkSolution = useCallback(() => {
    if (!currentChallenge) return;

    const correctPlacements = entitiesRef.current.filter(
      e => e.color === '#4CAF50' && e.x !== e.originalX
    ).length;

    if (correctPlacements >= currentChallenge.letters.length) {
      setStatus('🎉 Word completed! Great job!');

      if (speechSupported) {
        setTimeout(() => {
          speakWord(currentChallenge.word);
        }, 500);
      }

      setScore(prev => prev + 10);
      setCurrentChallenge(prev => (prev ? { ...prev, solved: true } : null));
    }
  }, [currentChallenge, speechSupported, speakWord]);

  // Game control functions
  const startGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = setupCanvas(canvas);
    if (!ctx) return;

    ctxRef.current = ctx;

    // Create challenge
    const challenge = generateWordChallenge();
    const entities: LetterEntity[] = [];

    // Create letters
    const allLetters = challenge.letters.concat(['A', 'B', 'C', 'D', 'E', 'F']);
    const shuffledLetters = allLetters
      .sort(() => Math.random() - 0.5)
      .slice(0, 8);

    shuffledLetters.forEach((letter, i) => {
      const x = 50 + (i % 4) * 120;
      const y = 450 + Math.floor(i / 4) * 80;
      entities.push(createLetterEntity(letter, x, y, i));
    });

    entitiesRef.current = entities;
    setGameRunning(true);
    setScore(0);
    setCurrentChallenge(challenge);
    setStatus('🌾 Alphabet Farm started! Drag letters to spell the word!');

    // Setup event listeners
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);

    // Start game loop
    if (!animationRef.current) {
      animationRef.current = requestAnimationFrame(gameLoop);
    }
  }, [
    setupCanvas,
    generateWordChallenge,
    createLetterEntity,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    gameLoop,
  ]);

  const newChallenge = useCallback(() => {
    const challenge = generateWordChallenge();
    const entities: LetterEntity[] = [];

    const allLetters = challenge.letters.concat(['A', 'B', 'C', 'D', 'E', 'F']);
    const shuffledLetters = allLetters
      .sort(() => Math.random() - 0.5)
      .slice(0, 8);

    shuffledLetters.forEach((letter, i) => {
      const x = 50 + (i % 4) * 120;
      const y = 450 + Math.floor(i / 4) * 80;
      entities.push(createLetterEntity(letter, x, y, i));
    });

    entitiesRef.current = entities;
    setCurrentChallenge(challenge);
    setStatus(`🌾 New word: ${challenge.definition}`);
  }, [generateWordChallenge, createLetterEntity]);

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
    setCurrentChallenge(null);
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
              <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">🌾</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                Alphabet Farm
              </span>
            </div>
            <div className="text-lg font-semibold text-green-600">
              Score: {score} 🌟
            </div>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
            Alphabet Farm Game
          </h1>
          <p className="text-lg text-gray-600">
            Learn letters and spelling! Drag letters to spell words and grow
            your vocabulary!
          </p>
        </div>

        <div className="flex justify-center mb-6">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="border-4 border-green-400 rounded-2xl shadow-2xl bg-white cursor-pointer"
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
            onClick={newChallenge}
            disabled={!gameRunning || !currentChallenge?.solved}
            className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            📝 New Word
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

          {speechSupported && currentChallenge && (
            <button
              onClick={() => speakWord(currentChallenge.word)}
              disabled={speaking}
              className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🔊 Say Word
            </button>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            🌾 How to Play:
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-gray-700">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">1️⃣</span>
              <p>Read the definition to understand the word</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">2️⃣</span>
              <p>Drag letters from the bottom to spell the word</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">3️⃣</span>
              <p>Place each letter in the correct position</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">4️⃣</span>
              <p>Complete words to earn points and learn!</p>
            </div>
            {speechSupported && (
              <>
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">🔊</span>
                  <p>Click letters to hear their pronunciation</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">🎵</span>
                  <p>Use "Say Word" button to hear the target word</p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl p-6 border border-green-200">
          <div className="text-center">
            <h4 className="text-lg font-semibold text-green-800 mb-2">
              Game Status
            </h4>
            <p className="text-green-700 leading-relaxed">{status}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
