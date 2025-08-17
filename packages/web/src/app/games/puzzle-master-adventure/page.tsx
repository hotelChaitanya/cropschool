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

interface PuzzlePiece extends GameEntity {
  color: string;
  pattern: string;
  isPlaced: boolean;
  isDragging: boolean;
  targetSlotId: string;
  originalX: number;
  originalY: number;
  animationOffset: number;
}

interface PuzzleSlot extends GameEntity {
  slotId: string;
  targetPieceId: string;
  isOccupied: boolean;
  glowIntensity: number;
  expectedPattern: string;
}

interface Particle extends GameEntity {
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
}

interface PuzzleLevel {
  id: number;
  name: string;
  difficulty: 'easy' | 'medium' | 'hard';
  gridSize: { rows: number; cols: number };
  patterns: string[];
  colors: string[];
}

// Game state
interface GameState {
  puzzlePieces: PuzzlePiece[];
  puzzleSlots: PuzzleSlot[];
  particles: Particle[];
  currentLevel: PuzzleLevel;
  score: number;
  level: number;
  gameStatus: 'menu' | 'playing' | 'completed' | 'paused';
  draggedPiece: PuzzlePiece | null;
  mouseX: number;
  mouseY: number;
  showCelebration: boolean;
  animationTime: number;
  piecesPlaced: number;
  totalPieces: number;
}

const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 700;

const PUZZLE_LEVELS: PuzzleLevel[] = [
  {
    id: 1,
    name: 'Simple Shapes',
    difficulty: 'easy',
    gridSize: { rows: 2, cols: 2 },
    patterns: ['circle', 'square', 'triangle', 'star'],
    colors: ['#FF5722', '#4CAF50', '#2196F3', '#FF9800'],
  },
  {
    id: 2,
    name: 'Color Patterns',
    difficulty: 'easy',
    gridSize: { rows: 2, cols: 3 },
    patterns: ['circle', 'square', 'triangle', 'hexagon', 'diamond', 'heart'],
    colors: ['#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#009688', '#4CAF50'],
  },
  {
    id: 3,
    name: 'Logic Grid',
    difficulty: 'medium',
    gridSize: { rows: 3, cols: 3 },
    patterns: [
      'circle',
      'square',
      'triangle',
      'star',
      'hexagon',
      'diamond',
      'heart',
      'cross',
      'pentagon',
    ],
    colors: [
      '#F44336',
      '#E91E63',
      '#9C27B0',
      '#673AB7',
      '#3F51B5',
      '#2196F3',
      '#00BCD4',
      '#009688',
      '#4CAF50',
    ],
  },
];

export default function PuzzleMasterAdventurePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const gameStateRef = useRef<GameState | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const [gameUIState, setGameUIState] = useState<{
    score: number;
    level: number;
    status: 'menu' | 'playing' | 'completed' | 'paused';
    currentLevelName: string;
    showInstructions: boolean;
  }>({
    score: 0,
    level: 1,
    status: 'menu',
    currentLevelName: '',
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
  const initGameState = useCallback((levelIndex: number): GameState => {
    const currentLevel =
      PUZZLE_LEVELS[Math.min(levelIndex - 1, PUZZLE_LEVELS.length - 1)];
    const puzzlePieces: PuzzlePiece[] = [];
    const puzzleSlots: PuzzleSlot[] = [];

    const { rows, cols } = currentLevel.gridSize;
    const totalPieces = rows * cols;

    // Create puzzle slots (target areas)
    const slotSize = 80;
    const gridStartX = (CANVAS_WIDTH - cols * (slotSize + 10)) / 2;
    const gridStartY = 200;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const slotIndex = row * cols + col;
        const slotId = `slot-${slotIndex}`;

        puzzleSlots.push({
          id: slotId,
          slotId,
          x: gridStartX + col * (slotSize + 10),
          y: gridStartY + row * (slotSize + 10),
          width: slotSize,
          height: slotSize,
          rotation: 0,
          scale: 1,
          targetPieceId: `piece-${slotIndex}`,
          isOccupied: false,
          glowIntensity: 0,
          expectedPattern:
            currentLevel.patterns[slotIndex % currentLevel.patterns.length],
        });
      }
    }

    // Create puzzle pieces (draggable items)
    const pieceSize = 70;
    const piecesStartY = 500;
    const piecesPerRow = Math.min(totalPieces, 6);
    const piecesStartX = (CANVAS_WIDTH - piecesPerRow * (pieceSize + 15)) / 2;

    // Shuffle the patterns for challenge
    const shuffledPatterns = [...currentLevel.patterns].sort(
      () => Math.random() - 0.5
    );

    for (let i = 0; i < totalPieces; i++) {
      const row = Math.floor(i / piecesPerRow);
      const col = i % piecesPerRow;
      const x = piecesStartX + col * (pieceSize + 15);
      const y = piecesStartY + row * (pieceSize + 15);

      puzzlePieces.push({
        id: `piece-${i}`,
        x,
        y,
        width: pieceSize,
        height: pieceSize,
        rotation: 0,
        scale: 1,
        color: currentLevel.colors[i % currentLevel.colors.length],
        pattern: shuffledPatterns[i % shuffledPatterns.length],
        isPlaced: false,
        isDragging: false,
        targetSlotId: `slot-${i}`,
        originalX: x,
        originalY: y,
        animationOffset: i * 0.3,
      });
    }

    return {
      puzzlePieces,
      puzzleSlots,
      particles: [],
      currentLevel,
      score: 0,
      level: levelIndex,
      gameStatus: 'playing',
      draggedPiece: null,
      mouseX: 0,
      mouseY: 0,
      showCelebration: false,
      animationTime: 0,
      piecesPlaced: 0,
      totalPieces,
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
      // Soft pastel gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      gradient.addColorStop(0, '#fef7ff');
      gradient.addColorStop(0.3, '#fae8ff');
      gradient.addColorStop(0.6, '#e0e7ff');
      gradient.addColorStop(1, '#dbeafe');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Gentle floating bubbles
      ctx.globalAlpha = 0.15;
      for (let i = 0; i < 12; i++) {
        const x = ((animationTime * 0.05 + i * 80) % (CANVAS_WIDTH + 60)) - 30;
        const y = 80 + i * 50 + Math.sin(animationTime * 0.002 + i) * 25;
        const size = 20 + Math.sin(animationTime * 0.003 + i) * 8;

        const bubbleGradient = ctx.createRadialGradient(x, y, 0, x, y, size);
        bubbleGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        bubbleGradient.addColorStop(0.7, 'rgba(168, 85, 247, 0.4)');
        bubbleGradient.addColorStop(1, 'transparent');

        ctx.fillStyle = bubbleGradient;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Soft geometric shapes floating in background
      ctx.globalAlpha = 0.08;
      for (let i = 0; i < 10; i++) {
        const x = ((animationTime * 0.08 + i * 120) % (CANVAS_WIDTH + 80)) - 40;
        const y = 60 + Math.sin(animationTime * 0.0015 + i) * 40;
        const rotation = animationTime * 0.0008 + i * 0.5;
        const size = 25 + Math.sin(animationTime * 0.002 + i) * 8;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);

        // Draw soft geometric shapes
        if (i % 3 === 0) {
          // Soft circle
          ctx.fillStyle = '#c084fc';
          ctx.beginPath();
          ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (i % 3 === 1) {
          // Soft square
          ctx.fillStyle = '#60a5fa';
          ctx.fillRect(-size / 2, -size / 2, size, size);
        } else {
          // Soft triangle
          ctx.fillStyle = '#34d399';
          ctx.beginPath();
          ctx.moveTo(0, -size / 2);
          ctx.lineTo(-size / 2, size / 2);
          ctx.lineTo(size / 2, size / 2);
          ctx.closePath();
          ctx.fill();
        }

        ctx.restore();
      }

      ctx.globalAlpha = 1;
    },
    []
  );

  // Draw shape pattern
  const drawPattern = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      pattern: string,
      x: number,
      y: number,
      size: number,
      color: string
    ) => {
      ctx.fillStyle = color;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;

      ctx.save();
      ctx.translate(x, y);

      switch (pattern) {
        case 'circle':
          ctx.beginPath();
          ctx.arc(0, 0, size / 2 - 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          break;

        case 'square':
          ctx.fillRect(-size / 2 + 5, -size / 2 + 5, size - 10, size - 10);
          ctx.strokeRect(-size / 2 + 5, -size / 2 + 5, size - 10, size - 10);
          break;

        case 'triangle':
          ctx.beginPath();
          ctx.moveTo(0, -size / 2 + 5);
          ctx.lineTo(-size / 2 + 5, size / 2 - 5);
          ctx.lineTo(size / 2 - 5, size / 2 - 5);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          break;

        case 'star':
          ctx.beginPath();
          for (let i = 0; i < 5; i++) {
            const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
            const radius = i % 2 === 0 ? size / 2 - 5 : size / 4;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          break;

        case 'hexagon':
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI * 2) / 6;
            const x = Math.cos(angle) * (size / 2 - 5);
            const y = Math.sin(angle) * (size / 2 - 5);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          break;

        case 'diamond':
          ctx.beginPath();
          ctx.moveTo(0, -size / 2 + 5);
          ctx.lineTo(size / 2 - 5, 0);
          ctx.lineTo(0, size / 2 - 5);
          ctx.lineTo(-size / 2 + 5, 0);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          break;

        case 'heart':
          ctx.beginPath();
          ctx.moveTo(0, size / 4);
          ctx.bezierCurveTo(
            -size / 2,
            -size / 4,
            -size / 4,
            -size / 2,
            0,
            -size / 8
          );
          ctx.bezierCurveTo(
            size / 4,
            -size / 2,
            size / 2,
            -size / 4,
            0,
            size / 4
          );
          ctx.fill();
          ctx.stroke();
          break;

        case 'cross':
          ctx.fillRect(-size / 6, -size / 2 + 5, size / 3, size - 10);
          ctx.fillRect(-size / 2 + 5, -size / 6, size - 10, size / 3);
          ctx.strokeRect(-size / 6, -size / 2 + 5, size / 3, size - 10);
          ctx.strokeRect(-size / 2 + 5, -size / 6, size - 10, size / 3);
          break;

        case 'pentagon':
          ctx.beginPath();
          for (let i = 0; i < 5; i++) {
            const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
            const x = Math.cos(angle) * (size / 2 - 5);
            const y = Math.sin(angle) * (size / 2 - 5);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          break;
      }

      ctx.restore();
    },
    []
  );

  // Draw puzzle piece
  const drawPuzzlePiece = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      piece: PuzzlePiece,
      animationTime: number
    ) => {
      ctx.save();

      ctx.translate(piece.x + piece.width / 2, piece.y + piece.height / 2);
      ctx.rotate(piece.rotation);
      ctx.scale(piece.scale, piece.scale);

      // Bounce animation when not dragging
      if (!piece.isDragging && !piece.isPlaced) {
        const bounce =
          Math.sin(animationTime * 0.003 + piece.animationOffset) * 3;
        ctx.translate(0, bounce);
      }

      // Glow effect when dragging
      if (piece.isDragging) {
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 20;
      }

      // Piece background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillRect(
        -piece.width / 2,
        -piece.height / 2,
        piece.width,
        piece.height
      );

      // Border
      ctx.strokeStyle = piece.isDragging ? '#FFD700' : '#666666';
      ctx.lineWidth = piece.isDragging ? 4 : 2;
      ctx.strokeRect(
        -piece.width / 2,
        -piece.height / 2,
        piece.width,
        piece.height
      );

      // Draw the pattern
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      drawPattern(ctx, piece.pattern, 0, 0, piece.width * 0.8, piece.color);

      ctx.restore();
    },
    [drawPattern]
  );

  // Draw puzzle slot
  const drawPuzzleSlot = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      slot: PuzzleSlot,
      animationTime: number
    ) => {
      ctx.save();

      ctx.translate(slot.x + slot.width / 2, slot.y + slot.height / 2);

      // Glow effect
      if (slot.glowIntensity > 0) {
        ctx.shadowColor = '#4CAF50';
        ctx.shadowBlur = slot.glowIntensity * 20;
      }

      // Slot background
      ctx.fillStyle = slot.isOccupied
        ? 'rgba(76, 175, 80, 0.3)'
        : 'rgba(255, 255, 255, 0.5)';
      ctx.fillRect(-slot.width / 2, -slot.height / 2, slot.width, slot.height);

      // Dashed border
      ctx.strokeStyle = slot.isOccupied ? '#4CAF50' : '#999999';
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 4]);
      const dashOffset = Math.sin(animationTime * 0.005) * 4;
      ctx.lineDashOffset = dashOffset;
      ctx.strokeRect(
        -slot.width / 2,
        -slot.height / 2,
        slot.width,
        slot.height
      );
      ctx.setLineDash([]);

      // Pattern hint (faint)
      if (!slot.isOccupied) {
        ctx.globalAlpha = 0.3;
        drawPattern(
          ctx,
          slot.expectedPattern,
          0,
          0,
          slot.width * 0.6,
          '#999999'
        );
        ctx.globalAlpha = 1;
      }

      ctx.restore();
    },
    [drawPattern]
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
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.shadowBlur = 4;
    ctx.fillText('Puzzle Master Adventure', CANVAS_WIDTH / 2, 50);

    // Level info
    ctx.font = 'bold 20px Arial';
    ctx.fillText(
      `Level ${state.level}: ${state.currentLevel.name}`,
      CANVAS_WIDTH / 2,
      90
    );
    ctx.fillText(
      `Progress: ${state.piecesPlaced}/${state.totalPieces}`,
      CANVAS_WIDTH / 2,
      120
    );

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 0;

    // Draw puzzle slots
    state.puzzleSlots.forEach(slot =>
      drawPuzzleSlot(ctx, slot, state.animationTime)
    );

    // Draw puzzle pieces (non-dragging first, then dragging piece on top)
    state.puzzlePieces
      .filter(piece => !piece.isDragging)
      .forEach(piece => drawPuzzlePiece(ctx, piece, state.animationTime));

    if (state.draggedPiece) {
      drawPuzzlePiece(ctx, state.draggedPiece, state.animationTime);
    }

    // Draw particles
    drawParticles(ctx, state.particles);

    // Draw celebration
    if (state.showCelebration) {
      ctx.fillStyle = 'rgba(255, 215, 0, 0.9)';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 3;
      ctx.shadowBlur = 6;
      ctx.fillText('🧩 PUZZLE SOLVED! 🧩', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    }

    // Draw instructions
    ctx.fillStyle = '#ffffff';
    ctx.font = '18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(
      'Drag the puzzle pieces to match the pattern hints in the slots!',
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT - 20
    );
  }, [drawBackground, drawPuzzlePiece, drawPuzzleSlot, drawParticles]);

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
      state.puzzleSlots.forEach(slot => {
        slot.glowIntensity = Math.max(0, slot.glowIntensity - deltaTime / 100);
      });

      // Check for puzzle completion
      const allPiecesPlaced = state.puzzlePieces.every(piece => piece.isPlaced);
      if (allPiecesPlaced && !state.showCelebration) {
        state.showCelebration = true;
        state.score += 200 * state.level;
        playSound(523, 0.3); // C note
        createParticles(CANVAS_WIDTH / 2, 300, 25, '#FFD700');

        // Update UI
        setGameUIState(prev => ({
          ...prev,
          score: state.score,
          status: 'completed',
        }));

        setTimeout(() => {
          nextLevel();
        }, 3000);
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
      currentLevelName: gameStateRef.current!.currentLevel.name,
      showInstructions: false,
    }));

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [setupCanvas, initAudio, initGameState, gameLoop]);

  // Next level
  const nextLevel = useCallback(() => {
    const newLevel = Math.min(gameUIState.level + 1, PUZZLE_LEVELS.length);
    gameStateRef.current = initGameState(newLevel);

    setGameUIState(prev => ({
      ...prev,
      status: 'playing',
      level: newLevel,
      currentLevelName: gameStateRef.current!.currentLevel.name,
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

      // Find clicked piece
      for (const piece of state.puzzlePieces) {
        if (
          !piece.isPlaced &&
          x >= piece.x &&
          x <= piece.x + piece.width &&
          y >= piece.y &&
          y <= piece.y + piece.height
        ) {
          piece.isDragging = true;
          piece.scale = 1.1;
          state.draggedPiece = piece;
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

      if (state.draggedPiece) {
        state.draggedPiece.x = x - state.draggedPiece.width / 2;
        state.draggedPiece.y = y - state.draggedPiece.height / 2;

        // Check slot proximity for glow effect
        state.puzzleSlots.forEach(slot => {
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
    if (!state || !state.draggedPiece) return;

    const piece = state.draggedPiece;
    let placed = false;

    // Check if dropped on correct slot
    for (const slot of state.puzzleSlots) {
      if (
        !slot.isOccupied &&
        piece.x + piece.width / 2 >= slot.x &&
        piece.x + piece.width / 2 <= slot.x + slot.width &&
        piece.y + piece.height / 2 >= slot.y &&
        piece.y + piece.height / 2 <= slot.y + slot.height
      ) {
        if (piece.pattern === slot.expectedPattern) {
          // Correct placement
          piece.x = slot.x + (slot.width - piece.width) / 2;
          piece.y = slot.y + (slot.height - piece.height) / 2;
          piece.isPlaced = true;
          slot.isOccupied = true;
          slot.glowIntensity = 0;
          placed = true;
          state.piecesPlaced++;

          playSound(659, 0.2); // E note
          createParticles(
            slot.x + slot.width / 2,
            slot.y + slot.height / 2,
            8,
            piece.color
          );
        } else {
          // Wrong pattern
          playSound(196, 0.3, 'square'); // Error sound
        }
        break;
      }
    }

    if (!placed) {
      // Return to original position
      piece.x = piece.originalX;
      piece.y = piece.originalY;
    }

    piece.isDragging = false;
    piece.scale = 1;
    state.draggedPiece = null;

    // Reset slot glow
    state.puzzleSlots.forEach(slot => {
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <header className="bg-white shadow-sm">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/games"
              className="flex items-center space-x-2 text-purple-600 hover:text-purple-700"
            >
              <span>← Back to Games</span>
            </Link>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Score:{' '}
                <span className="font-bold text-purple-600">
                  {gameUIState.score}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                Level:{' '}
                <span className="font-bold text-orange-600">
                  {gameUIState.level}
                </span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                🧩 Puzzle Master Adventure
              </span>
            </div>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🧩 Puzzle Master Adventure
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            Challenge your mind with logic puzzles and pattern matching!
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
            className="border-4 border-purple-400 rounded-lg shadow-2xl bg-white cursor-pointer"
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
              className="bg-purple-500 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-purple-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              🧩 Start Puzzle Adventure!
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
              className="bg-orange-500 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-orange-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              🎯 Next Puzzle!
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
                  <span className="mr-2">🖱️</span> Click and drag puzzle pieces
                </p>
                <p className="flex items-center">
                  <span className="mr-2">🎯</span> Match the pattern hints in
                  the slots
                </p>
                <p className="flex items-center">
                  <span className="mr-2">🧩</span> Place all pieces correctly to
                  complete the puzzle
                </p>
              </div>
              <div className="space-y-2">
                <p className="flex items-center">
                  <span className="mr-2">🌟</span> Each shape has a specific
                  slot
                </p>
                <p className="flex items-center">
                  <span className="mr-2">🎨</span> Look for pattern hints in the
                  slots
                </p>
                <p className="flex items-center">
                  <span className="mr-2">🏆</span> Complete puzzles to unlock
                  harder levels!
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
