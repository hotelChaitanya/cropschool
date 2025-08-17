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

interface NumberTile extends GameEntity {
  number: number;
  color: string;
  isDragging: boolean;
  isPlaced: boolean;
  originalX: number;
  originalY: number;
  animationOffset: number;
  bouncePhase: number;
}

interface EquationSlot extends GameEntity {
  slotIndex: number;
  isOccupied: boolean;
  targetNumber: number | null;
  slotType: 'operand1' | 'operator' | 'operand2' | 'equals' | 'result';
  glowIntensity: number;
}

interface Particle extends GameEntity {
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
}

interface MathProblem {
  operand1: number;
  operator: '+' | '-' | '×';
  operand2: number;
  result: number;
}

// Game state
interface GameState {
  numberTiles: NumberTile[];
  equationSlots: EquationSlot[];
  particles: Particle[];
  currentProblem: MathProblem;
  score: number;
  level: number;
  gameStatus: 'menu' | 'playing' | 'completed' | 'paused';
  draggedTile: NumberTile | null;
  mouseX: number;
  mouseY: number;
  showCelebration: boolean;
  animationTime: number;
}

const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 700;

export default function MathHarvestPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const gameStateRef = useRef<GameState | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const [gameUIState, setGameUIState] = useState<{
    score: number;
    level: number;
    status: 'menu' | 'playing' | 'completed' | 'paused';
    currentProblem: string;
    showInstructions: boolean;
  }>({
    score: 0,
    level: 1,
    status: 'menu',
    currentProblem: '',
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

  // Generate math problem
  const generateMathProblem = useCallback((level: number): MathProblem => {
    const maxNumber = Math.min(5 + level * 2, 20);
    const operators: Array<'+' | '-' | '×'> = ['+', '-'];

    if (level > 2) operators.push('×');

    const operator = operators[Math.floor(Math.random() * operators.length)];
    let operand1 = Math.floor(Math.random() * maxNumber) + 1;
    let operand2 = Math.floor(Math.random() * maxNumber) + 1;

    // For subtraction, ensure positive result
    if (operator === '-' && operand2 > operand1) {
      [operand1, operand2] = [operand2, operand1];
    }

    // For multiplication, keep numbers smaller
    if (operator === '×') {
      operand1 = Math.floor(Math.random() * 5) + 1;
      operand2 = Math.floor(Math.random() * 5) + 1;
    }

    let result: number;
    switch (operator) {
      case '+':
        result = operand1 + operand2;
        break;
      case '-':
        result = operand1 - operand2;
        break;
      case '×':
        result = operand1 * operand2;
        break;
    }

    return { operand1, operator, operand2, result };
  }, []);

  // Initialize game state
  const initGameState = useCallback(
    (level: number): GameState => {
      const problem = generateMathProblem(level);
      const numberTiles: NumberTile[] = [];
      const equationSlots: EquationSlot[] = [];

      // Create equation slots
      const slotStartX = (CANVAS_WIDTH - 5 * 90) / 2;
      const slotTypes: Array<
        'operand1' | 'operator' | 'operand2' | 'equals' | 'result'
      > = ['operand1', 'operator', 'operand2', 'equals', 'result'];

      slotTypes.forEach((type, index) => {
        equationSlots.push({
          id: `slot-${index}`,
          x: slotStartX + index * 100,
          y: 250,
          width: 80,
          height: 80,
          rotation: 0,
          scale: 1,
          slotIndex: index,
          isOccupied: type === 'equals', // Equals sign is pre-filled
          targetNumber:
            type === 'operand1'
              ? problem.operand1
              : type === 'operand2'
                ? problem.operand2
                : type === 'result'
                  ? problem.result
                  : null,
          slotType: type,
          glowIntensity: 0,
        });
      });

      // Create number tiles (including correct numbers and some distractors)
      const correctNumbers = [
        problem.operand1,
        problem.operand2,
        problem.result,
      ];
      const allNumbers = [...correctNumbers];

      // Add distractor numbers
      for (let i = 0; i < 4; i++) {
        let distractor;
        do {
          distractor = Math.floor(Math.random() * 20) + 1;
        } while (correctNumbers.includes(distractor));
        allNumbers.push(distractor);
      }

      // Shuffle numbers
      for (let i = allNumbers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allNumbers[i], allNumbers[j]] = [allNumbers[j], allNumbers[i]];
      }

      // Create number tile entities
      const tileStartX = (CANVAS_WIDTH - allNumbers.length * 70) / 2;
      allNumbers.forEach((number, index) => {
        const x = tileStartX + index * 80;
        const y = 500;
        numberTiles.push({
          id: `tile-${number}-${index}`,
          number,
          x,
          y,
          width: 70,
          height: 70,
          rotation: 0,
          scale: 1,
          color: correctNumbers.includes(number) ? '#4CAF50' : '#FF9800',
          isDragging: false,
          isPlaced: false,
          originalX: x,
          originalY: y,
          animationOffset: index * 0.5,
          bouncePhase: 0,
        });
      });

      return {
        numberTiles,
        equationSlots,
        particles: [],
        currentProblem: problem,
        score: 0,
        level,
        gameStatus: 'playing',
        draggedTile: null,
        mouseX: 0,
        mouseY: 0,
        showCelebration: false,
        animationTime: 0,
      };
    },
    [generateMathProblem]
  );

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
      gradient.addColorStop(1, '#DEB887');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Animated farm elements
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(0, CANVAS_HEIGHT - 100, CANVAS_WIDTH, 20); // Ground

      // Animated wheat
      ctx.fillStyle = '#DAA520';
      for (let i = 0; i < CANVAS_WIDTH; i += 15) {
        const height = 20 + Math.sin(animationTime * 0.003 + i * 0.1) * 5;
        ctx.fillRect(i, CANVAS_HEIGHT - 80, 8, height);
      }

      // Floating math symbols
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.font = '24px Arial';
      const symbols = ['+', '-', '×', '='];
      symbols.forEach((symbol, i) => {
        const x = ((animationTime * 0.2 + i * 200) % (CANVAS_WIDTH + 50)) - 25;
        const y = 100 + Math.sin(animationTime * 0.002 + i) * 20;
        ctx.fillText(symbol, x, y);
      });
    },
    []
  );

  // Draw number tile with effects
  const drawNumberTile = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      tile: NumberTile,
      animationTime: number
    ) => {
      ctx.save();

      // Apply transformations
      ctx.translate(tile.x + tile.width / 2, tile.y + tile.height / 2);
      ctx.rotate(tile.rotation);
      ctx.scale(tile.scale, tile.scale);

      // Bounce animation when not dragging
      if (!tile.isDragging && !tile.isPlaced) {
        const bounce =
          Math.sin(animationTime * 0.003 + tile.animationOffset) * 5;
        ctx.translate(0, bounce);
      }

      // Glow effect when dragging
      if (tile.isDragging) {
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 20;
      }

      // Tile background with gradient
      const gradient = ctx.createLinearGradient(
        0,
        -tile.height / 2,
        0,
        tile.height / 2
      );
      gradient.addColorStop(0, tile.color);
      gradient.addColorStop(1, tile.color + '88');

      ctx.fillStyle = gradient;
      ctx.fillRect(-tile.width / 2, -tile.height / 2, tile.width, tile.height);

      // Border
      ctx.strokeStyle = tile.isDragging ? '#FFD700' : '#2E7D32';
      ctx.lineWidth = tile.isDragging ? 4 : 2;
      ctx.strokeRect(
        -tile.width / 2,
        -tile.height / 2,
        tile.width,
        tile.height
      );

      // Number text with shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      ctx.shadowBlur = 4;

      ctx.fillStyle = 'white';
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(tile.number.toString(), 0, 0);

      ctx.restore();
    },
    []
  );

  // Draw equation slot with effects
  const drawEquationSlot = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      slot: EquationSlot,
      animationTime: number,
      problem: MathProblem
    ) => {
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

      // Content
      ctx.fillStyle = slot.isOccupied ? '#2E7D32' : 'rgba(33, 150, 243, 0.5)';
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'center';

      if (slot.slotType === 'operator') {
        ctx.fillText(
          slot.isOccupied ? problem.operator : problem.operator,
          0,
          0
        );
      } else if (slot.slotType === 'equals') {
        ctx.fillText('=', 0, 0);
      } else if (!slot.isOccupied && slot.targetNumber !== null) {
        ctx.font = 'bold 24px Arial';
        ctx.fillText('?', 0, 0);
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
    ctx.fillText('Complete the Equation', CANVAS_WIDTH / 2, 80);

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 0;

    // Draw equation preview
    ctx.fillStyle = '#4A5568';
    ctx.font = 'bold 24px Arial';
    ctx.fillText(
      `${state.currentProblem.operand1} ${state.currentProblem.operator} ${state.currentProblem.operand2} = ${state.currentProblem.result}`,
      CANVAS_WIDTH / 2,
      150
    );

    // Draw equation slots
    state.equationSlots.forEach(slot =>
      drawEquationSlot(ctx, slot, state.animationTime, state.currentProblem)
    );

    // Draw number tiles (non-dragging first, then dragging tile on top)
    state.numberTiles
      .filter(tile => !tile.isDragging)
      .forEach(tile => drawNumberTile(ctx, tile, state.animationTime));

    if (state.draggedTile) {
      drawNumberTile(ctx, state.draggedTile, state.animationTime);
    }

    // Draw particles
    drawParticles(ctx, state.particles);

    // Draw celebration
    if (state.showCelebration) {
      ctx.fillStyle = 'rgba(255, 215, 0, 0.8)';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('🎉 EXCELLENT! 🎉', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    }

    // Draw instructions
    ctx.fillStyle = '#2E5984';
    ctx.font = '18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(
      'Drag the correct numbers to complete the math equation!',
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT - 40
    );
  }, [drawBackground, drawNumberTile, drawEquationSlot, drawParticles]);

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

      // Update slot glow
      state.equationSlots.forEach(slot => {
        slot.glowIntensity = Math.max(0, slot.glowIntensity - deltaTime / 100);
      });

      // Check for equation completion
      const numberSlots = state.equationSlots.filter(
        slot => slot.slotType !== 'operator' && slot.slotType !== 'equals'
      );
      const isEquationComplete = numberSlots.every(slot => slot.isOccupied);

      if (isEquationComplete && !state.showCelebration) {
        state.showCelebration = true;
        state.score += 150;
        playSound(523, 0.2); // C note
        createParticles(CANVAS_WIDTH / 2, 250, 20, '#FFD700');

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
    gameStateRef.current = initGameState(1);

    setGameUIState(prev => ({
      ...prev,
      status: 'playing',
      currentProblem: `${gameStateRef.current!.currentProblem.operand1} ${gameStateRef.current!.currentProblem.operator} ${gameStateRef.current!.currentProblem.operand2} = ${gameStateRef.current!.currentProblem.result}`,
      showInstructions: false,
    }));

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [setupCanvas, initAudio, initGameState, gameLoop]);

  // Next level
  const nextLevel = useCallback(() => {
    const newLevel = gameUIState.level + 1;
    gameStateRef.current = initGameState(newLevel);

    setGameUIState(prev => ({
      ...prev,
      status: 'playing',
      currentProblem: `${gameStateRef.current!.currentProblem.operand1} ${gameStateRef.current!.currentProblem.operator} ${gameStateRef.current!.currentProblem.operand2} = ${gameStateRef.current!.currentProblem.result}`,
      level: newLevel,
    }));
  }, [initGameState, gameUIState.level]);

  // Mouse event handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const state = gameStateRef.current;
      if (!state || state.gameStatus !== 'playing') return;

      const canvas = canvasRef.current!;
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (CANVAS_WIDTH / rect.width);
      const y = (e.clientY - rect.top) * (CANVAS_HEIGHT / rect.height);

      // Find clicked tile
      for (const tile of state.numberTiles) {
        if (
          !tile.isPlaced &&
          x >= tile.x &&
          x <= tile.x + tile.width &&
          y >= tile.y &&
          y <= tile.y + tile.height
        ) {
          tile.isDragging = true;
          tile.scale = 1.1;
          state.draggedTile = tile;
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

      if (state.draggedTile) {
        state.draggedTile.x = x - state.draggedTile.width / 2;
        state.draggedTile.y = y - state.draggedTile.height / 2;

        // Check slot proximity for glow effect
        state.equationSlots.forEach(slot => {
          if (slot.slotType !== 'operator' && slot.slotType !== 'equals') {
            const distance = Math.sqrt(
              Math.pow(x - (slot.x + slot.width / 2), 2) +
                Math.pow(y - (slot.y + slot.height / 2), 2)
            );
            slot.glowIntensity = Math.max(0, 1 - distance / 100);
          }
        });
      }
    },
    []
  );

  const handleMouseUp = useCallback(() => {
    const state = gameStateRef.current;
    if (!state || !state.draggedTile) return;

    const tile = state.draggedTile;
    let placed = false;

    // Check if dropped on correct slot
    for (const slot of state.equationSlots) {
      if (
        !slot.isOccupied &&
        slot.slotType !== 'operator' &&
        slot.slotType !== 'equals' &&
        tile.x + tile.width / 2 >= slot.x &&
        tile.x + tile.width / 2 <= slot.x + slot.width &&
        tile.y + tile.height / 2 >= slot.y &&
        tile.y + tile.height / 2 <= slot.y + slot.height
      ) {
        if (tile.number === slot.targetNumber) {
          // Correct placement
          tile.x = slot.x + (slot.width - tile.width) / 2;
          tile.y = slot.y + (slot.height - tile.height) / 2;
          tile.isPlaced = true;
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
          // Wrong number
          playSound(196, 0.3, 'square'); // Error sound
        }
        break;
      }
    }

    if (!placed) {
      // Return to original position
      tile.x = tile.originalX;
      tile.y = tile.originalY;
    }

    tile.isDragging = false;
    tile.scale = 1;
    state.draggedTile = null;

    // Reset slot glow
    state.equationSlots.forEach(slot => {
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-amber-50">
      <header className="bg-white shadow-sm">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/games"
              className="flex items-center space-x-2 text-orange-600 hover:text-orange-700"
            >
              <span>← Back to Games</span>
            </Link>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Score:{' '}
                <span className="font-bold text-orange-600">
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
                🧮 Math Harvest Adventure
              </span>
            </div>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🧮 Math Harvest Adventure
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            Help the farmer solve math problems by placing the correct numbers!
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
            className="border-4 border-orange-400 rounded-lg shadow-2xl bg-white cursor-pointer"
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
              className="bg-orange-500 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-orange-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              🚀 Start Math Adventure!
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
                  <span className="mr-2">🖱️</span> Click and drag number tiles
                </p>
                <p className="flex items-center">
                  <span className="mr-2">🎯</span> Drop them in the equation
                  slots
                </p>
                <p className="flex items-center">
                  <span className="mr-2">✨</span> Complete the math equation
                </p>
              </div>
              <div className="space-y-2">
                <p className="flex items-center">
                  <span className="mr-2">🌟</span> Green numbers are correct
                </p>
                <p className="flex items-center">
                  <span className="mr-2">🧡</span> Orange numbers are extras
                </p>
                <p className="flex items-center">
                  <span className="mr-2">🏆</span> Solve equations to earn
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
