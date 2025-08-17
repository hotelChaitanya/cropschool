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

interface GameState {
  running: boolean;
  paused: boolean;
  score: number;
  currentChallenge: WordChallenge | null;
  draggedElement: LetterEntity | null;
  entities: LetterEntity[];
  canvas: HTMLCanvasElement | null;
  ctx: CanvasRenderingContext2D | null;
}

export default function AlphabetFarmPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const animationRef = useRef<number>();
  const gameStateRef = useRef<{
    running: boolean;
    paused: boolean;
    score: number;
    currentChallenge: WordChallenge | null;
    draggedElement: LetterEntity | null;
    entities: LetterEntity[];
  }>({
    running: false,
    paused: false,
    score: 0,
    currentChallenge: null,
    draggedElement: null,
    entities: [],
  });

  const [gameState, setGameState] = useState<GameState>({
    running: false,
    paused: false,
    score: 0,
    currentChallenge: null,
    draggedElement: null,
    entities: [],
    canvas: null,
    ctx: null,
  });
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

  // Simple game loop
  const gameLoop = () => {
    if (
      gameState.running &&
      !gameState.paused &&
      gameState.ctx &&
      gameState.canvas &&
      gameState.currentChallenge
    ) {
      drawGame();
    }
    animationRef.current = requestAnimationFrame(gameLoop);
  };

  const startGameLoop = () => {
    if (!animationRef.current) {
      animationRef.current = requestAnimationFrame(gameLoop);
    }
  };

  const stopGameLoop = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = undefined;
    }
  };

  const generateWordChallenge = (): WordChallenge => {
    const words = [
      { word: 'CAT', definition: 'A furry pet that says meow 🐱' },
      { word: 'DOG', definition: 'A loyal pet that barks 🐕' },
      { word: 'COW', definition: 'A farm animal that gives milk 🐄' },
      { word: 'PIG', definition: 'A pink farm animal that oinks 🐷' },
      { word: 'HEN', definition: 'A bird that lays eggs 🐔' },
      { word: 'SHEEP', definition: 'A woolly farm animal 🐑' },
      { word: 'HORSE', definition: 'A strong animal you can ride 🐎' },
      { word: 'DUCK', definition: 'A water bird that quacks 🦆' },
      { word: 'GOAT', definition: 'A farm animal with horns 🐐' },
      { word: 'SUN', definition: 'A bright star in the sky ☀️' },
      { word: 'TREE', definition: 'A tall plant with leaves 🌳' },
      { word: 'FARM', definition: 'A place where crops grow 🌾' },
      { word: 'APPLE', definition: 'A red or green fruit 🍎' },
      { word: 'CORN', definition: 'A yellow vegetable 🌽' },
      { word: 'BARN', definition: 'A building where animals live 🏚️' },
    ];

    const selectedWord = words[Math.floor(Math.random() * words.length)];

    return {
      word: selectedWord.word,
      definition: selectedWord.definition,
      solved: false,
      letters: selectedWord.word.split(''),
    };
  };

  // Web Speech API functions
  const speakText = (text: string, rate: number = 1) => {
    if (!speechSupported || speaking) return;

    setSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = 1.2;
    utterance.volume = 0.8;

    utterance.onend = () => {
      setSpeaking(false);
    };

    utterance.onerror = () => {
      setSpeaking(false);
    };

    speechSynthesis.speak(utterance);
  };

  const speakLetter = (letter: string) => {
    speakText(`The letter ${letter}`, 0.8);
  };

  const speakWord = (word: string) => {
    speakText(word, 0.6);
  };

  const speakDefinition = (definition: string) => {
    speakText(definition, 0.8);
  };

  const createLetterEntity = (
    letter: string,
    x: number,
    y: number,
    id: number
  ): LetterEntity => {
    return {
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
    };
  };

  const drawGame = () => {
    if (!gameState.ctx || !gameState.canvas || !gameState.currentChallenge)
      return;

    const ctx = gameState.ctx;
    const challenge = gameState.currentChallenge;
    const entities = gameState.entities;

    // Clear and draw background
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, 800, 600);

    const centerX = 400;
    const centerY = 300;

    // Draw word definition
    ctx.fillStyle = '#2E5984';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Definition: ${challenge.definition}`, centerX, 50);

    // Draw letter slots
    const slotWidth = 80;
    const totalWidth = challenge.letters.length * slotWidth;
    const startX = centerX - totalWidth / 2;

    challenge.letters.forEach((_, index) => {
      const slotX = startX + index * slotWidth;
      const slotY = centerY - 50;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillRect(slotX, slotY, 70, 70);
      ctx.strokeStyle = '#4CAF50';
      ctx.lineWidth = 3;
      ctx.strokeRect(slotX, slotY, 70, 70);

      ctx.fillStyle = '#666';
      ctx.font = '14px Arial';
      ctx.fillText(`${index + 1}`, slotX + 35, slotY - 10);
    });

    // Draw draggable letters
    entities.forEach(entity => {
      // Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(entity.x + 3, entity.y + 3, entity.width, entity.height);

      // Letter background
      ctx.fillStyle = entity.dragging ? '#FFE066' : entity.color;
      ctx.fillRect(entity.x, entity.y, entity.width, entity.height);

      // Border
      ctx.strokeStyle = entity.borderColor;
      ctx.lineWidth = entity.dragging ? 4 : 2;
      ctx.strokeRect(entity.x, entity.y, entity.width, entity.height);

      // Letter text
      ctx.fillStyle = 'white';
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(
        entity.letter,
        entity.x + entity.width / 2,
        entity.y + entity.height / 2 + 10
      );
    });

    // Instructions
    ctx.fillStyle = '#2E5984';
    ctx.font = '18px Arial';
    ctx.fillText('Drag the letters to spell the word!', centerX, 550);
  };

  const drawGameFrame = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    challenge: WordChallenge,
    entities: LetterEntity[]
  ) => {
    // Get actual drawing dimensions (CSS dimensions)
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Clear canvas with farm background
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#98FB98');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;

    // Draw word definition
    ctx.fillStyle = '#2E5984';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Definition: ${challenge.definition}`, centerX, 50);

    // Draw pronunciation button area
    if (speechSupported) {
      ctx.fillStyle = '#FF6B35';
      ctx.fillRect(centerX + 250, 20, 80, 40);
      ctx.fillStyle = 'white';
      ctx.font = '16px Arial';
      ctx.fillText('🔊 Hear', centerX + 290, 45);
    }

    // Draw letter slots for the word
    const slotWidth = 80;
    const totalWidth = challenge.letters.length * slotWidth;
    const startX = centerX - totalWidth / 2;

    challenge.letters.forEach((letter, index) => {
      const slotX = startX + index * slotWidth;
      const slotY = centerY - 50;

      // Draw slot background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillRect(slotX, slotY, 70, 70);

      // Draw slot border
      ctx.strokeStyle = '#4CAF50';
      ctx.lineWidth = 3;
      ctx.strokeRect(slotX, slotY, 70, 70);

      // Draw slot label
      ctx.fillStyle = '#666';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`Letter ${index + 1}`, slotX + 35, slotY - 10);
    });

    // Draw draggable letters
    entities.forEach(entity => {
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

      // Letter text
      ctx.fillStyle = 'white';
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(
        entity.letter,
        entity.x + entity.width / 2,
        entity.y + entity.height / 2 + 12
      );
    });

    // Draw instructions
    ctx.fillStyle = '#2E5984';
    ctx.font = '18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Drag the letters to spell the word!', centerX, height - 30);
  };

  const startGame = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = setupCanvas(canvas);
    if (!ctx) return;

    // Create initial challenge
    const challenge = generateWordChallenge();
    const entities: LetterEntity[] = [];

    // Get canvas display dimensions for positioning
    const rect = canvas.getBoundingClientRect();

    // Create letter entities with extra random letters
    const allLetters = challenge.letters.concat(['A', 'B', 'C', 'D', 'E', 'F']);
    const shuffledLetters = allLetters
      .sort(() => Math.random() - 0.5)
      .slice(0, 8);

    // Create entities
    shuffledLetters.forEach((letter, i) => {
      const x = 50 + (i % 4) * 120;
      const y = rect.height - 150 + Math.floor(i / 4) * 80;
      entities.push(createLetterEntity(letter, x, y, i));
    });

    // Update game state
    setGameState(prev => ({
      ...prev,
      canvas,
      ctx,
      running: true,
      score: 0,
      currentChallenge: challenge,
      entities,
    }));

    setStatus('🌾 Alphabet Farm started! Drag letters to spell the word!');

    // Setup event listeners
    setupEventListeners(canvas);

    // Start game loop
    startGameLoop();

    // Initial draw
    drawGameFrame(ctx, canvas, challenge, entities);
  };

  const newChallenge = () => {
    if (!gameState.canvas) return;

    const challenge = generateWordChallenge();
    const entities: LetterEntity[] = [];

    // Get canvas display dimensions for positioning
    const rect = gameState.canvas.getBoundingClientRect();

    // Create letter entities with extra random letters
    const allLetters = challenge.letters.concat(['A', 'B', 'C', 'D', 'E', 'F']);
    const shuffledLetters = allLetters
      .sort(() => Math.random() - 0.5)
      .slice(0, 8);

    // Create entities
    shuffledLetters.forEach((letter, i) => {
      const x = 50 + (i % 4) * 120;
      const y = rect.height - 150 + Math.floor(i / 4) * 80;
      entities.push(createLetterEntity(letter, x, y, i));
    });

    setGameState(prev => ({
      ...prev,
      currentChallenge: challenge,
      entities,
    }));

    setStatus(`🌾 New word: ${challenge.definition}`);
  };

  const setupEventListeners = (canvas: HTMLCanvasElement) => {
    const getCanvasCoordinates = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const handleMouseDown = (e: MouseEvent) => {
      const { x, y } = getCanvasCoordinates(e);

      // Check if pronunciation button was clicked
      if (speechSupported && gameState.currentChallenge) {
        const rect = canvas.getBoundingClientRect();
        const centerX = rect.width / 2;
        if (x >= centerX + 250 && x <= centerX + 330 && y >= 20 && y <= 60) {
          speakDefinition(gameState.currentChallenge.definition);
          setStatus('🔊 Playing pronunciation...');
          return;
        }
      }

      // Find clicked entity and set up dragging
      const clickedEntity = gameState.entities.find(entity =>
        isPointInEntity(x, y, entity)
      );

      if (clickedEntity) {
        clickedEntity.dragging = true;
        clickedEntity.offsetX = x - clickedEntity.x;
        clickedEntity.offsetY = y - clickedEntity.y;

        setGameState(prev => ({
          ...prev,
          draggedElement: clickedEntity,
        }));

        // Speak the letter when picked up
        if (speechSupported) {
          speakLetter(clickedEntity.letter);
        }

        setStatus(`🔄 Dragging letter ${clickedEntity.letter}...`);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!gameState.draggedElement) return;

      const { x, y } = getCanvasCoordinates(e);
      const draggedEntity = gameState.entities.find(
        entity => entity.id === gameState.draggedElement!.id
      );

      if (draggedEntity) {
        draggedEntity.x = x - (draggedEntity.offsetX || 0);
        draggedEntity.y = y - (draggedEntity.offsetY || 0);
      }
    };

    const handleMouseUp = () => {
      if (!gameState.draggedElement) return;

      const draggedEntity = gameState.entities.find(
        entity => entity.id === gameState.draggedElement!.id
      );

      if (draggedEntity) {
        draggedEntity.dragging = false;
        checkDropPosition(draggedEntity);
      }

      setGameState(prev => ({
        ...prev,
        draggedElement: null,
      }));
    };

    // Store event listeners for cleanup
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
  };

  const isPointInEntity = (
    x: number,
    y: number,
    entity: LetterEntity
  ): boolean => {
    return (
      x >= entity.x &&
      x <= entity.x + entity.width &&
      y >= entity.y &&
      y <= entity.y + entity.height
    );
  };

  const checkDropPosition = (entity: LetterEntity) => {
    if (!gameState.canvas || !gameState.currentChallenge) return;

    const rect = gameState.canvas.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const slotWidth = 80;
    const totalWidth = gameState.currentChallenge.letters.length * slotWidth;
    const startX = centerX - totalWidth / 2;

    // Check which slot the letter was dropped into
    for (let i = 0; i < gameState.currentChallenge.letters.length; i++) {
      const slotX = startX + i * slotWidth;
      const slotY = centerY - 50;

      if (
        entity.x > slotX &&
        entity.x < slotX + 70 &&
        entity.y > slotY &&
        entity.y < slotY + 70
      ) {
        if (entity.letter === gameState.currentChallenge.letters[i]) {
          setStatus('✅ Correct letter placement!');
          entity.x = slotX + 5;
          entity.y = slotY + 5;
          entity.color = '#4CAF50';

          // Check if word is complete
          setTimeout(() => checkSolution(), 100);
        } else {
          setStatus('❌ Wrong letter! Try again.');
          resetEntityPosition(entity);
        }
        return;
      }
    }

    resetEntityPosition(entity);
  };

  const resetEntityPosition = (entity: LetterEntity) => {
    entity.x = entity.originalX;
    entity.y = entity.originalY;
    entity.color = '#4CAF50';
  };

  const checkSolution = () => {
    if (!gameState.currentChallenge) return;

    const correctPlacements = gameState.entities.filter(
      e => e.color === '#4CAF50' && e.x !== e.originalX
    ).length;

    if (correctPlacements >= gameState.currentChallenge.letters.length) {
      setStatus('🎉 Word completed! Great job!');

      // Pronounce the completed word
      if (speechSupported) {
        setTimeout(() => {
          speakWord(gameState.currentChallenge!.word);
        }, 500);
      }

      setGameState(prev => ({
        ...prev,
        score: prev.score + 10,
        currentChallenge: prev.currentChallenge
          ? { ...prev.currentChallenge, solved: true }
          : null,
      }));
    }
  };

  const resetGame = () => {
    // Stop game loop
    stopGameLoop();

    // Clear canvas
    if (gameState.ctx && gameState.canvas) {
      const rect = gameState.canvas.getBoundingClientRect();
      gameState.ctx.clearRect(0, 0, rect.width, rect.height);
    }

    setGameState({
      running: false,
      paused: false,
      score: 0,
      currentChallenge: null,
      draggedElement: null,
      entities: [],
      canvas: null,
      ctx: null,
    });

    setStatus('🔄 Game reset! Click "Start Game" to play again!');
  };

  const togglePause = () => {
    setGameState(prev => ({ ...prev, paused: !prev.paused }));
    setStatus(gameState.paused ? '▶️ Game resumed' : '⏸️ Game paused');
  };

  if (!isClient) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-lime-50 to-emerald-50">
      {/* Header */}
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
              Score: {gameState.score} 🌟
            </div>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Game Info */}
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
            Alphabet Farm Game
          </h1>
          <p className="text-lg text-gray-600">
            Learn letters and spelling! Drag letters to spell words and grow
            your vocabulary!
          </p>
        </div>

        {/* Game Canvas */}
        <div className="flex justify-center mb-6">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="border-4 border-green-400 rounded-2xl shadow-2xl bg-gradient-to-br from-green-100 to-lime-200 cursor-pointer"
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
            onClick={() => newChallenge()}
            disabled={!gameState.running || !gameState.currentChallenge?.solved}
            className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            📝 New Word
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

          {speechSupported && gameState.currentChallenge && (
            <button
              onClick={() => speakWord(gameState.currentChallenge!.word)}
              disabled={speaking}
              className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🔊 Say Word
            </button>
          )}
        </div>

        {/* Game Instructions */}
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

        {/* Game Status */}
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
