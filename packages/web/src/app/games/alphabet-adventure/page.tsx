'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import Link from 'next/link';

// Game entities and types
interface GameEntity {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scale: number;
}

interface Letter extends GameEntity {
  letter: string;
  color: string;
  isDragging: boolean;
  isPlaced: boolean;
  targetSlot: number | null;
  originalX: number;
  originalY: number;
  animationOffset: number;
  bouncePhase: number;
}

interface DropSlot extends GameEntity {
  slotIndex: number;
  isOccupied: boolean;
  targetLetter: string;
  glowIntensity: number;
}

interface Particle extends GameEntity {
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
}

// Game state
interface GameState {
  letters: Letter[];
  dropSlots: DropSlot[];
  particles: Particle[];
  currentWord: string;
  score: number;
  level: number;
  gameStatus: 'menu' | 'playing' | 'completed' | 'paused';
  draggedLetter: Letter | null;
  mouseX: number;
  mouseY: number;
  showCelebration: boolean;
  animationTime: number;
}

const WORDS = ['CAT', 'DOG', 'BAT', 'SUN', 'FUN', 'HAT', 'RAT', 'BIG'];
const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 700;

export default function AlphabetAdventurePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const gameStateRef = useRef<GameState | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const [gameUIState, setGameUIState] = useState<{
    score: number;
    level: number;
    status: 'menu' | 'playing' | 'completed' | 'paused';
    currentWord: string;
    showInstructions: boolean;
  }>({
    score: 0,
    level: 1,
    status: 'menu',
    currentWord: '',
    showInstructions: true,
  });

  // Initialize audio context
  const initAudio = useCallback(() => {
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
      } catch (e) {
        console.log('Audio not supported');
      }
    }
  }, []);

  // Play sound effect
  const playSound = useCallback(
    (
      frequency: number,
      duration: number,
      type: 'sine' | 'square' | 'triangle' = 'sine'
    ) => {
      const audioContext = audioContextRef.current;
      if (!audioContext) return;

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = type;

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + duration
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    },
    []
  );

  // Create particles
  const createParticles = useCallback(
    (x: number, y: number, count: number = 10, color: string = '#FFD700') => {
      const state = gameStateRef.current;
      if (!state) return;

      for (let i = 0; i < count; i++) {
        const particle: Particle = {
          id: `particle-${Date.now()}-${i}`,
          x: x + (Math.random() - 0.5) * 20,
          y: y + (Math.random() - 0.5) * 20,
          width: 4,
          height: 4,
          rotation: Math.random() * Math.PI * 2,
          scale: 0.5 + Math.random() * 0.5,
          vx: (Math.random() - 0.5) * 6,
          vy: (Math.random() - 0.5) * 6 - 2,
          life: 1,
          maxLife: 1,
          color,
        };
        state.particles.push(particle);
      }
    },
    []
  );

  // Initialize game state
  const initGameState = useCallback((word: string): GameState => {
    const letters: Letter[] = [];
    const dropSlots: DropSlot[] = [];

    // Create drop slots
    const slotStartX = (CANVAS_WIDTH - word.length * 80) / 2;
    for (let i = 0; i < word.length; i++) {
      dropSlots.push({
        id: `slot-${i}`,
        x: slotStartX + i * 90,
        y: 200,
        width: 80,
        height: 80,
        rotation: 0,
        scale: 1,
        slotIndex: i,
        isOccupied: false,
        targetLetter: word[i],
        glowIntensity: 0,
      });
    }

    // Create letters (add extra letters for challenge)
    const wordLetters = word.split('');
    const extraLetters = [
      'B',
      'F',
      'G',
      'H',
      'J',
      'K',
      'L',
      'M',
      'N',
      'P',
      'Q',
      'R',
      'S',
      'V',
      'W',
      'X',
      'Y',
      'Z',
    ];
    const allLetters = [...wordLetters];

    // Add 2-3 extra letters randomly
    for (let i = 0; i < 3; i++) {
      const extraLetter =
        extraLetters[Math.floor(Math.random() * extraLetters.length)];
      allLetters.push(extraLetter);
    }

    // Shuffle letters
    for (let i = allLetters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allLetters[i], allLetters[j]] = [allLetters[j], allLetters[i]];
    }

    // Create letter entities
    const letterStartX = (CANVAS_WIDTH - allLetters.length * 70) / 2;
    allLetters.forEach((letter, index) => {
      const x = letterStartX + index * 80;
      const y = 500;
      letters.push({
        id: `letter-${letter}-${index}`,
        letter,
        x,
        y,
        width: 70,
        height: 70,
        rotation: 0,
        scale: 1,
        color: wordLetters.includes(letter) ? '#4CAF50' : '#FF9800',
        isDragging: false,
        isPlaced: false,
        targetSlot: null,
        originalX: x,
        originalY: y,
        animationOffset: index * 0.5,
        bouncePhase: 0,
      });
    });

    return {
      letters,
      dropSlots,
      particles: [],
      currentWord: word,
      score: 0,
      level: 1,
      gameStatus: 'playing',
      draggedLetter: null,
      mouseX: 0,
      mouseY: 0,
      showCelebration: false,
      animationTime: 0,
    };
  }, []);

  // Setup canvas
  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return false;

    const ctx = canvas.getContext('2d');
    if (!ctx) return false;

    // Set canvas size
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    // Enable high DPI
    const devicePixelRatio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * devicePixelRatio;
    canvas.height = rect.height * devicePixelRatio;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';

    ctx.scale(devicePixelRatio, devicePixelRatio);

    // Set font rendering
    ctx.textBaseline = 'middle';
    ctx.imageSmoothingEnabled = true;

    ctxRef.current = ctx;
    return true;
  }, []);

  // Draw background
  const drawBackground = useCallback(
    (ctx: CanvasRenderingContext2D, animationTime: number) => {
      // Sky gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      gradient.addColorStop(0, '#87CEEB');
      gradient.addColorStop(0.7, '#98FB98');
      gradient.addColorStop(1, '#90EE90');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Animated clouds
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      for (let i = 0; i < 3; i++) {
        const x = ((animationTime * 0.5 + i * 300) % (CANVAS_WIDTH + 100)) - 50;
        const y = 50 + i * 30;

        // Cloud shape
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.arc(x + 20, y, 25, 0, Math.PI * 2);
        ctx.arc(x + 40, y, 20, 0, Math.PI * 2);
        ctx.arc(x + 20, y - 15, 20, 0, Math.PI * 2);
        ctx.fill();
      }

      // Farm elements
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(0, CANVAS_HEIGHT - 100, CANVAS_WIDTH, 20); // Ground

      // Animated grass
      ctx.fillStyle = '#228B22';
      for (let i = 0; i < CANVAS_WIDTH; i += 10) {
        const height = 15 + Math.sin(animationTime * 0.002 + i * 0.1) * 3;
        ctx.fillRect(i, CANVAS_HEIGHT - 80, 3, height);
      }
    },
    []
  );

  // Draw letter with effects
  const drawLetter = useCallback(
    (ctx: CanvasRenderingContext2D, letter: Letter, animationTime: number) => {
      ctx.save();

      // Apply transformations
      ctx.translate(letter.x + letter.width / 2, letter.y + letter.height / 2);
      ctx.rotate(letter.rotation);
      ctx.scale(letter.scale, letter.scale);

      // Bounce animation when not dragging
      if (!letter.isDragging && !letter.isPlaced) {
        const bounce =
          Math.sin(animationTime * 0.003 + letter.animationOffset) * 5;
        ctx.translate(0, bounce);
      }

      // Glow effect when dragging
      if (letter.isDragging) {
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 20;
      }

      // Letter background with gradient
      const gradient = ctx.createLinearGradient(
        0,
        -letter.height / 2,
        0,
        letter.height / 2
      );
      gradient.addColorStop(0, letter.color);
      gradient.addColorStop(1, letter.color + '88');

      ctx.fillStyle = gradient;
      ctx.fillRect(
        -letter.width / 2,
        -letter.height / 2,
        letter.width,
        letter.height
      );

      // Border
      ctx.strokeStyle = letter.isDragging ? '#FFD700' : '#2E7D32';
      ctx.lineWidth = letter.isDragging ? 4 : 2;
      ctx.strokeRect(
        -letter.width / 2,
        -letter.height / 2,
        letter.width,
        letter.height
      );

      // Letter text with shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      ctx.shadowBlur = 4;

      ctx.fillStyle = 'white';
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(letter.letter, 0, 0);

      ctx.restore();
    },
    []
  );

  // Draw drop slot with effects
  const drawDropSlot = useCallback(
    (ctx: CanvasRenderingContext2D, slot: DropSlot, animationTime: number) => {
      ctx.save();

      ctx.translate(slot.x + slot.width / 2, slot.y + slot.height / 2);

      // Glow effect
      if (slot.glowIntensity > 0) {
        ctx.shadowColor = '#4CAF50';
        ctx.shadowBlur = slot.glowIntensity * 20;
      }

      // Slot background
      ctx.fillStyle = slot.isOccupied ? '#C8E6C9' : 'rgba(255, 255, 255, 0.9)';
      ctx.fillRect(-slot.width / 2, -slot.height / 2, slot.width, slot.height);

      // Animated border
      const borderOffset = Math.sin(animationTime * 0.005) * 2;
      ctx.strokeStyle = slot.isOccupied ? '#4CAF50' : '#2196F3';
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 4]);
      ctx.lineDashOffset = borderOffset;
      ctx.strokeRect(
        -slot.width / 2,
        -slot.height / 2,
        slot.width,
        slot.height
      );
      ctx.setLineDash([]);

      // Target letter hint
      if (!slot.isOccupied) {
        ctx.fillStyle = 'rgba(33, 150, 243, 0.3)';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(slot.targetLetter, 0, 0);
      }

      ctx.restore();
    },
    []
  );

  // Draw particles
  const drawParticles = useCallback(
    (ctx: CanvasRenderingContext2D, particles: Particle[]) => {
      particles.forEach(particle => {
        ctx.save();

        ctx.globalAlpha = particle.life;
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.rotation);
        ctx.scale(particle.scale, particle.scale);

        ctx.fillStyle = particle.color;
        ctx.fillRect(
          -particle.width / 2,
          -particle.height / 2,
          particle.width,
          particle.height
        );

        ctx.restore();
      });
    },
    []
  );

  // Main render function
  const render = useCallback(() => {
    const ctx = ctxRef.current;
    const state = gameStateRef.current;
    if (!ctx || !state) return;

    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw background
    drawBackground(ctx, state.animationTime);

    // Draw title
    ctx.fillStyle = '#2E5984';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.shadowBlur = 4;
    ctx.fillText(`Spell: ${state.currentWord}`, CANVAS_WIDTH / 2, 80);

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 0;

    // Draw drop slots
    state.dropSlots.forEach(slot =>
      drawDropSlot(ctx, slot, state.animationTime)
    );

    // Draw letters (non-dragging first, then dragging letter on top)
    state.letters
      .filter(letter => !letter.isDragging)
      .forEach(letter => drawLetter(ctx, letter, state.animationTime));

    if (state.draggedLetter) {
      drawLetter(ctx, state.draggedLetter, state.animationTime);
    }

    // Draw particles
    drawParticles(ctx, state.particles);

    // Draw celebration
    if (state.showCelebration) {
      ctx.fillStyle = 'rgba(255, 215, 0, 0.8)';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('🎉 GREAT JOB! 🎉', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    }

    // Draw instructions
    ctx.fillStyle = '#2E5984';
    ctx.font = '18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(
      'Drag the correct letters to spell the word!',
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT - 40
    );
  }, [drawBackground, drawLetter, drawDropSlot, drawParticles]);

  // Update game logic
  const update = useCallback(
    (deltaTime: number) => {
      const state = gameStateRef.current;
      if (!state || state.gameStatus !== 'playing') return;

      state.animationTime += deltaTime;

      // Update particles
      state.particles = state.particles.filter(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.2; // gravity
        particle.life -= deltaTime / 1000;
        particle.rotation += 0.1;
        return particle.life > 0;
      });

      // Update drop slot glow
      state.dropSlots.forEach(slot => {
        slot.glowIntensity = Math.max(0, slot.glowIntensity - deltaTime / 100);
      });

      // Check for word completion
      const isWordComplete = state.dropSlots.every(slot => slot.isOccupied);
      if (isWordComplete && !state.showCelebration) {
        state.showCelebration = true;
        state.score += 100;
        playSound(523, 0.2); // C note
        createParticles(CANVAS_WIDTH / 2, 200, 20, '#FFD700');

        // Update UI
        setGameUIState(prev => ({
          ...prev,
          score: state.score,
          status: 'completed',
        }));

        setTimeout(() => {
          nextLevel();
        }, 2000);
      }
    },
    [playSound, createParticles]
  );

  // Game loop
  const gameLoop = useCallback(
    (currentTime: number) => {
      const deltaTime = currentTime - (gameLoop as any).lastTime || 0;
      (gameLoop as any).lastTime = currentTime;

      update(deltaTime);
      render();

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    },
    [update, render]
  );

  // Start game
  const startGame = useCallback(() => {
    if (!setupCanvas()) return;

    initAudio();
    const word = WORDS[Math.floor(Math.random() * WORDS.length)];
    gameStateRef.current = initGameState(word);

    setGameUIState(prev => ({
      ...prev,
      status: 'playing',
      currentWord: word,
      showInstructions: false,
    }));

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [setupCanvas, initAudio, initGameState, gameLoop]);

  // Next level
  const nextLevel = useCallback(() => {
    const word = WORDS[Math.floor(Math.random() * WORDS.length)];
    gameStateRef.current = initGameState(word);

    setGameUIState(prev => ({
      ...prev,
      status: 'playing',
      currentWord: word,
      level: prev.level + 1,
    }));
  }, [initGameState]);

  // Mouse event handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const state = gameStateRef.current;
      if (!state || state.gameStatus !== 'playing') return;

      const canvas = canvasRef.current!;
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (CANVAS_WIDTH / rect.width);
      const y = (e.clientY - rect.top) * (CANVAS_HEIGHT / rect.height);

      // Find clicked letter
      for (const letter of state.letters) {
        if (
          !letter.isPlaced &&
          x >= letter.x &&
          x <= letter.x + letter.width &&
          y >= letter.y &&
          y <= letter.y + letter.height
        ) {
          letter.isDragging = true;
          letter.scale = 1.1;
          state.draggedLetter = letter;
          playSound(440, 0.1); // A note
          break;
        }
      }
    },
    [playSound]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const state = gameStateRef.current;
      if (!state) return;

      const canvas = canvasRef.current!;
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (CANVAS_WIDTH / rect.width);
      const y = (e.clientY - rect.top) * (CANVAS_HEIGHT / rect.height);

      state.mouseX = x;
      state.mouseY = y;

      if (state.draggedLetter) {
        state.draggedLetter.x = x - state.draggedLetter.width / 2;
        state.draggedLetter.y = y - state.draggedLetter.height / 2;

        // Check slot proximity for glow effect
        state.dropSlots.forEach(slot => {
          const distance = Math.sqrt(
            Math.pow(x - (slot.x + slot.width / 2), 2) +
              Math.pow(y - (slot.y + slot.height / 2), 2)
          );
          slot.glowIntensity = Math.max(0, 1 - distance / 100);
        });
      }
    },
    []
  );

  const handleMouseUp = useCallback(() => {
    const state = gameStateRef.current;
    if (!state || !state.draggedLetter) return;

    const letter = state.draggedLetter;
    let placed = false;

    // Check if dropped on correct slot
    for (const slot of state.dropSlots) {
      if (
        !slot.isOccupied &&
        letter.x + letter.width / 2 >= slot.x &&
        letter.x + letter.width / 2 <= slot.x + slot.width &&
        letter.y + letter.height / 2 >= slot.y &&
        letter.y + letter.height / 2 <= slot.y + slot.height
      ) {
        if (letter.letter === slot.targetLetter) {
          // Correct placement
          letter.x = slot.x + (slot.width - letter.width) / 2;
          letter.y = slot.y + (slot.height - letter.height) / 2;
          letter.isPlaced = true;
          slot.isOccupied = true;
          slot.glowIntensity = 0;
          placed = true;

          playSound(659, 0.2); // E note
          createParticles(
            slot.x + slot.width / 2,
            slot.y + slot.height / 2,
            8,
            '#4CAF50'
          );
        } else {
          // Wrong letter
          playSound(196, 0.3, 'square'); // Error sound
        }
        break;
      }
    }

    if (!placed) {
      // Return to original position
      letter.x = letter.originalX;
      letter.y = letter.originalY;
    }

    letter.isDragging = false;
    letter.scale = 1;
    state.draggedLetter = null;

    // Reset slot glow
    state.dropSlots.forEach(slot => {
      slot.glowIntensity = 0;
    });
  }, [playSound, createParticles]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
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
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Score:{' '}
                <span className="font-bold text-green-600">
                  {gameUIState.score}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                Level:{' '}
                <span className="font-bold text-blue-600">
                  {gameUIState.level}
                </span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                🌾 Alphabet Farm Adventure
              </span>
            </div>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎮 Alphabet Farm Adventure
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            Help the farm animals spell words by dragging letters to the correct
            spots!
          </p>
        </div>

        <div className="flex justify-center mb-6">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            className="border-4 border-green-400 rounded-lg shadow-2xl bg-white cursor-pointer"
            style={{
              width: `${CANVAS_WIDTH}px`,
              height: `${CANVAS_HEIGHT}px`,
              maxWidth: '100%',
            }}
          />
        </div>

        <div className="flex justify-center gap-4 mb-6">
          {gameUIState.status === 'menu' && (
            <button
              onClick={startGame}
              className="bg-green-500 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-green-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              🚀 Start Adventure!
            </button>
          )}

          {gameUIState.status === 'playing' && (
            <button
              onClick={() => {
                if (animationFrameRef.current) {
                  cancelAnimationFrame(animationFrameRef.current);
                }
                setGameUIState(prev => ({
                  ...prev,
                  status: 'menu',
                  showInstructions: true,
                }));
              }}
              className="bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors"
            >
              🏠 Back to Menu
            </button>
          )}

          {gameUIState.status === 'completed' && (
            <button
              onClick={nextLevel}
              className="bg-blue-500 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              🎯 Next Level!
            </button>
          )}
        </div>

        {gameUIState.showInstructions && (
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-2xl mx-auto">
            <h3 className="text-xl font-bold mb-4 text-center">
              🎯 How to Play
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <p className="flex items-center">
                  <span className="mr-2">🖱️</span> Click and drag letters
                </p>
                <p className="flex items-center">
                  <span className="mr-2">🎯</span> Drop them in the correct
                  slots
                </p>
                <p className="flex items-center">
                  <span className="mr-2">✨</span> Match all letters to complete
                  the word
                </p>
              </div>
              <div className="space-y-2">
                <p className="flex items-center">
                  <span className="mr-2">🌟</span> Green letters belong in the
                  word
                </p>
                <p className="flex items-center">
                  <span className="mr-2">🧡</span> Orange letters are extras
                </p>
                <p className="flex items-center">
                  <span className="mr-2">🏆</span> Complete words to earn
                  points!
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
