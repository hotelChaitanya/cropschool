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

interface BrushStroke extends GameEntity {
  color: string;
  points: { x: number; y: number }[];
  thickness: number;
  opacity: number;
}

interface ColorPalette {
  id: string;
  name: string;
  colors: string[];
  category: 'primary' | 'secondary' | 'warm' | 'cool' | 'neutral';
}

interface ArtChallenge {
  id: string;
  title: string;
  description: string;
  objective: string;
  difficulty: 'easy' | 'medium' | 'hard';
  theme: string;
  requiredColors: string[];
  technique: 'painting' | 'drawing' | 'collage' | 'mixed';
  timeLimit?: number;
}

interface DrawingTool {
  id: string;
  name: string;
  icon: string;
  type: 'brush' | 'pencil' | 'marker' | 'spray' | 'eraser' | 'fill';
  minSize: number;
  maxSize: number;
  opacity: number;
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
  brushStrokes: BrushStroke[];
  particles: Particle[];
  currentChallenge: ArtChallenge;
  selectedColor: string;
  selectedTool: DrawingTool;
  brushSize: number;
  isDrawing: boolean;
  currentStroke: BrushStroke | null;
  score: number;
  level: number;
  gameStatus: 'menu' | 'playing' | 'completed' | 'paused' | 'gallery';
  mouseX: number;
  mouseY: number;
  showCelebration: boolean;
  animationTime: number;
  artworkCompleted: number;
  canvasWidth: number;
  canvasHeight: number;
  showColorWheel: boolean;
  inspiration: number;
}

const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 700;
const DRAWING_AREA = {
  x: 200,
  y: 100,
  width: 500,
  height: 400,
};

const COLOR_PALETTES: ColorPalette[] = [
  {
    id: 'primary',
    name: 'Primary Colors',
    colors: ['#FF0000', '#00FF00', '#0000FF'],
    category: 'primary',
  },
  {
    id: 'rainbow',
    name: 'Rainbow',
    colors: [
      '#FF0000',
      '#FF7F00',
      '#FFFF00',
      '#00FF00',
      '#0000FF',
      '#4B0082',
      '#8B00FF',
    ],
    category: 'primary',
  },
  {
    id: 'warm',
    name: 'Warm Colors',
    colors: ['#FF6B35', '#F7931E', '#FFD23F', '#EE4B2B', '#C21807'],
    category: 'warm',
  },
  {
    id: 'cool',
    name: 'Cool Colors',
    colors: ['#36A2EB', '#4BC0C0', '#9966FF', '#FF9F40', '#00CED1'],
    category: 'cool',
  },
  {
    id: 'pastels',
    name: 'Pastel Dreams',
    colors: ['#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF', '#FFB3FF'],
    category: 'neutral',
  },
  {
    id: 'earth',
    name: 'Earth Tones',
    colors: ['#8B4513', '#A0522D', '#CD853F', '#D2691E', '#F4A460', '#DEB887'],
    category: 'neutral',
  },
];

const DRAWING_TOOLS: DrawingTool[] = [
  {
    id: 'brush',
    name: 'Paint Brush',
    icon: '🖌️',
    type: 'brush',
    minSize: 2,
    maxSize: 20,
    opacity: 0.8,
  },
  {
    id: 'pencil',
    name: 'Pencil',
    icon: '✏️',
    type: 'pencil',
    minSize: 1,
    maxSize: 5,
    opacity: 1.0,
  },
  {
    id: 'marker',
    name: 'Marker',
    icon: '🖊️',
    type: 'marker',
    minSize: 3,
    maxSize: 15,
    opacity: 0.9,
  },
  {
    id: 'spray',
    name: 'Spray Paint',
    icon: '🎨',
    type: 'spray',
    minSize: 10,
    maxSize: 30,
    opacity: 0.6,
  },
  {
    id: 'eraser',
    name: 'Eraser',
    icon: '🧹',
    type: 'eraser',
    minSize: 5,
    maxSize: 25,
    opacity: 1.0,
  },
];

const ART_CHALLENGES: ArtChallenge[] = [
  {
    id: 'sunset',
    title: 'Magical Sunset',
    description: 'Paint a beautiful sunset with warm colors',
    objective: 'Use warm colors to create a sunset scene',
    difficulty: 'easy',
    theme: 'Nature',
    requiredColors: ['#FF6B35', '#F7931E', '#FFD23F'],
    technique: 'painting',
  },
  {
    id: 'ocean',
    title: 'Ocean Waves',
    description: 'Create flowing ocean waves with cool blues',
    objective: 'Paint ocean waves using cool colors',
    difficulty: 'easy',
    theme: 'Nature',
    requiredColors: ['#36A2EB', '#4BC0C0', '#00CED1'],
    technique: 'painting',
  },
  {
    id: 'garden',
    title: 'Secret Garden',
    description: 'Draw a magical garden with flowers and plants',
    objective: 'Create a garden scene with greens and flower colors',
    difficulty: 'medium',
    theme: 'Nature',
    requiredColors: ['#00FF00', '#32CD32', '#FF69B4', '#FFD700'],
    technique: 'mixed',
  },
  {
    id: 'rainbow',
    title: 'Rainbow Bridge',
    description: 'Paint a rainbow bridge across the sky',
    objective: 'Use all rainbow colors in proper order',
    difficulty: 'medium',
    theme: 'Fantasy',
    requiredColors: [
      '#FF0000',
      '#FF7F00',
      '#FFFF00',
      '#00FF00',
      '#0000FF',
      '#4B0082',
      '#8B00FF',
    ],
    technique: 'painting',
  },
  {
    id: 'abstract',
    title: 'Color Harmony',
    description: 'Create an abstract composition with complementary colors',
    objective: 'Explore color relationships and balance',
    difficulty: 'hard',
    theme: 'Abstract',
    requiredColors: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00'],
    technique: 'mixed',
  },
  {
    id: 'portrait',
    title: 'Self Portrait',
    description: 'Draw a creative self-portrait',
    objective: 'Use various colors to express personality',
    difficulty: 'hard',
    theme: 'People',
    requiredColors: ['#FFB3BA', '#8B4513', '#000000', '#FFFFFF'],
    technique: 'drawing',
  },
];

export default function ArtStudioAdventurePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const gameStateRef = useRef<GameState | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const [gameUIState, setGameUIState] = useState<{
    score: number;
    level: number;
    status: 'menu' | 'playing' | 'completed' | 'paused' | 'gallery';
    currentChallenge: string;
    showInstructions: boolean;
    selectedTool: string;
    selectedColor: string;
    brushSize: number;
    inspiration: number;
  }>({
    score: 0,
    level: 1,
    status: 'menu',
    currentChallenge: '',
    showInstructions: true,
    selectedTool: 'brush',
    selectedColor: '#FF0000',
    brushSize: 10,
    inspiration: 100,
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

      gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + duration
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    },
    []
  );

  // Create particles for art effects
  const createArtParticles = useCallback(
    (x: number, y: number, count: number = 10, color: string = '#FFD700') => {
      const state = gameStateRef.current;
      if (!state) return;

      for (let i = 0; i < count; i++) {
        const particle: Particle = {
          id: `particle-${Date.now()}-${i}`,
          x: x + (Math.random() - 0.5) * 20,
          y: y + (Math.random() - 0.5) * 20,
          width: 3,
          height: 3,
          rotation: Math.random() * Math.PI * 2,
          scale: 0.5 + Math.random() * 0.5,
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4 - 1,
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
  const initGameState = useCallback((level: number): GameState => {
    const challengeIndex = (level - 1) % ART_CHALLENGES.length;
    const currentChallenge = ART_CHALLENGES[challengeIndex];

    return {
      brushStrokes: [],
      particles: [],
      currentChallenge,
      selectedColor: '#FF0000',
      selectedTool: DRAWING_TOOLS[0],
      brushSize: 10,
      isDrawing: false,
      currentStroke: null,
      score: 0,
      level,
      gameStatus: 'playing',
      mouseX: 0,
      mouseY: 0,
      showCelebration: false,
      animationTime: 0,
      artworkCompleted: 0,
      canvasWidth: DRAWING_AREA.width,
      canvasHeight: DRAWING_AREA.height,
      showColorWheel: false,
      inspiration: 100,
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

    // Set rendering properties
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.imageSmoothingEnabled = true;

    ctxRef.current = ctx;
    return true;
  }, []);

  // Draw artistic background
  const drawBackground = useCallback(
    (ctx: CanvasRenderingContext2D, animationTime: number) => {
      // Soft pastel studio gradient background
      const gradient = ctx.createLinearGradient(
        0,
        0,
        CANVAS_WIDTH,
        CANVAS_HEIGHT
      );
      gradient.addColorStop(0, '#fef7ff');
      gradient.addColorStop(0.3, '#fdf2f8');
      gradient.addColorStop(0.7, '#fef3c7');
      gradient.addColorStop(1, '#f0f9ff');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Soft floating clouds in background
      ctx.globalAlpha = 0.1;
      for (let i = 0; i < 5; i++) {
        const cloudX =
          ((animationTime * 0.1 + i * 200) % (CANVAS_WIDTH + 100)) - 50;
        const cloudY = 50 + i * 30;
        const cloudFloat = Math.sin(animationTime * 0.003 + i) * 5;

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cloudX, cloudY + cloudFloat, 20, 0, Math.PI * 2);
        ctx.arc(cloudX + 25, cloudY + cloudFloat, 30, 0, Math.PI * 2);
        ctx.arc(cloudX + 50, cloudY + cloudFloat, 20, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Soft wooden floor with gentle grain
      const floorGradient = ctx.createLinearGradient(
        0,
        CANVAS_HEIGHT - 100,
        0,
        CANVAS_HEIGHT
      );
      floorGradient.addColorStop(0, '#d4a574');
      floorGradient.addColorStop(1, '#b8956a');
      ctx.fillStyle = floorGradient;
      ctx.fillRect(0, CANVAS_HEIGHT - 100, CANVAS_WIDTH, 100);

      // Gentle easel with rounded edges
      ctx.strokeStyle = '#8b6f47';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(
        DRAWING_AREA.x - 15,
        DRAWING_AREA.y + DRAWING_AREA.height + 15
      );
      ctx.lineTo(DRAWING_AREA.x + DRAWING_AREA.width / 2, DRAWING_AREA.y - 15);
      ctx.moveTo(
        DRAWING_AREA.x + DRAWING_AREA.width + 15,
        DRAWING_AREA.y + DRAWING_AREA.height + 15
      );
      ctx.lineTo(DRAWING_AREA.x + DRAWING_AREA.width / 2, DRAWING_AREA.y - 15);
      ctx.stroke();

      // Soft canvas frame with rounded corners
      ctx.fillStyle = '#e6c2a6';
      ctx.fillRect(
        DRAWING_AREA.x - 12,
        DRAWING_AREA.y - 12,
        DRAWING_AREA.width + 24,
        DRAWING_AREA.height + 24
      );

      // Inner shadow for depth
      ctx.strokeStyle = '#d4a574';
      ctx.lineWidth = 1;
      ctx.strokeRect(
        DRAWING_AREA.x - 8,
        DRAWING_AREA.y - 8,
        DRAWING_AREA.width + 16,
        DRAWING_AREA.height + 16
      );

      // Pure white drawing canvas with soft shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(
        DRAWING_AREA.x,
        DRAWING_AREA.y,
        DRAWING_AREA.width,
        DRAWING_AREA.height
      );
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // Gentle canvas border
      ctx.strokeStyle = '#d1d5db';
      ctx.lineWidth = 1;
      ctx.strokeRect(
        DRAWING_AREA.x,
        DRAWING_AREA.y,
        DRAWING_AREA.width,
        DRAWING_AREA.height
      );

      // Animated floating art supplies with gentle bobbing
      const supplies = [
        { emoji: '🎨', x: 50, y: 200, scale: 1.2 },
        { emoji: '🖌️', x: 80, y: 260, scale: 1.1 },
        { emoji: '✏️', x: 110, y: 320, scale: 1.0 },
        { emoji: '🖍️', x: 750, y: 200, scale: 1.1 },
        { emoji: '📐', x: 780, y: 260, scale: 1.0 },
        { emoji: '✂️', x: 810, y: 320, scale: 1.1 },
      ];

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      supplies.forEach((supply, index) => {
        const float = Math.sin(animationTime * 0.002 + supply.x * 0.01) * 4;
        const rotate = Math.sin(animationTime * 0.001 + index) * 0.1;
        const glow = 0.5 + Math.sin(animationTime * 0.003 + index) * 0.3;

        ctx.save();
        ctx.translate(supply.x, supply.y + float);
        ctx.rotate(rotate);
        ctx.scale(supply.scale, supply.scale);

        // Soft glow effect
        ctx.shadowColor = `rgba(255, 182, 193, ${glow})`;
        ctx.shadowBlur = 15;
        ctx.font = '28px Arial';
        ctx.fillText(supply.emoji, 0, 0);

        ctx.restore();
      });

      // Reset text properties
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
    },
    []
  );

  // Draw brush stroke
  const drawBrushStroke = useCallback(
    (ctx: CanvasRenderingContext2D, stroke: BrushStroke) => {
      if (stroke.points.length < 2) return;

      ctx.save();
      ctx.globalAlpha = stroke.opacity;
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.thickness;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Draw smooth curve through points
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);

      for (let i = 1; i < stroke.points.length - 1; i++) {
        const current = stroke.points[i];
        const next = stroke.points[i + 1];
        const cpx = (current.x + next.x) / 2;
        const cpy = (current.y + next.y) / 2;
        ctx.quadraticCurveTo(current.x, current.y, cpx, cpy);
      }

      if (stroke.points.length > 1) {
        const lastPoint = stroke.points[stroke.points.length - 1];
        ctx.lineTo(lastPoint.x, lastPoint.y);
      }

      ctx.stroke();
      ctx.restore();
    },
    []
  );

  // Draw color palette
  const drawColorPalette = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      palette: ColorPalette,
      x: number,
      y: number
    ) => {
      const colorSize = 28;
      const spacing = 6;

      palette.colors.forEach((color, index) => {
        const colorX = x + index * (colorSize + spacing);
        const colorY = y;

        // Soft shadow for color swatches
        ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
        ctx.shadowBlur = 6;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        // Color swatch with rounded corners
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect(colorX, colorY, colorSize, colorSize, 6);
        ctx.fill();

        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Subtle border with shine effect
        const borderGradient = ctx.createLinearGradient(
          colorX,
          colorY,
          colorX,
          colorY + colorSize
        );
        borderGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
        borderGradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');

        ctx.strokeStyle = borderGradient;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(colorX, colorY, colorSize, colorSize, 6);
        ctx.stroke();

        // Highlight for glass effect
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.roundRect(colorX + 2, colorY + 2, colorSize - 10, colorSize / 3, 3);
        ctx.fill();
      });

      // Palette label with soft styling
      ctx.fillStyle = '#4b5563';
      ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'left';
      ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
      ctx.shadowBlur = 1;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 1;
      ctx.fillText(palette.name, x, y - 8);

      // Reset shadow and text properties
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    },
    []
  );

  // Draw tool palette with soft design
  const drawToolPalette = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      tools: DrawingTool[],
      x: number,
      y: number,
      selectedTool: string
    ) => {
      const toolSize = 45;
      const spacing = 12;

      tools.forEach((tool, index) => {
        const toolX = x;
        const toolY = y + index * (toolSize + spacing);
        const isSelected = tool.id === selectedTool;

        // Gentle hover animation
        const hoverScale = isSelected ? 1.05 : 1.0;
        const glowIntensity = isSelected ? 0.8 : 0.3;

        ctx.save();
        ctx.translate(toolX + toolSize / 2, toolY + toolSize / 2);
        ctx.scale(hoverScale, hoverScale);

        // Soft shadow for depth
        ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        // Tool background with gradient
        const bgGradient = ctx.createRadialGradient(
          0,
          0,
          0,
          0,
          0,
          toolSize / 2
        );
        if (isSelected) {
          bgGradient.addColorStop(0, '#fef3c7');
          bgGradient.addColorStop(1, '#f59e0b');
        } else {
          bgGradient.addColorStop(0, '#ffffff');
          bgGradient.addColorStop(1, '#f3f4f6');
        }

        ctx.fillStyle = bgGradient;
        ctx.beginPath();
        ctx.roundRect(-toolSize / 2, -toolSize / 2, toolSize, toolSize, 8);
        ctx.fill();

        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Soft border with glow
        if (isSelected) {
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 2;
          ctx.shadowColor = '#fbbf24';
          ctx.shadowBlur = 6;
        } else {
          ctx.strokeStyle = '#d1d5db';
          ctx.lineWidth = 1;
        }

        ctx.beginPath();
        ctx.roundRect(-toolSize / 2, -toolSize / 2, toolSize, toolSize, 8);
        ctx.stroke();

        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;

        // Tool icon with better alignment and glow
        ctx.font = '22px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = isSelected ? '#92400e' : '#374151';

        if (isSelected) {
          ctx.shadowColor = '#fbbf24';
          ctx.shadowBlur = 4;
        }

        ctx.fillText(tool.icon, 0, 0);

        // Reset shadow and text properties
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;

        ctx.restore();
      });

      // Reset text properties
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
    },
    []
  );

  // Draw particles with soft effects
  const drawParticles = useCallback(
    (ctx: CanvasRenderingContext2D, particles: Particle[]) => {
      particles.forEach(particle => {
        ctx.save();

        ctx.globalAlpha = particle.life * 0.8;
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.rotation);
        ctx.scale(particle.scale, particle.scale);

        // Soft glow effect
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = 8;
        ctx.fillStyle = particle.color;

        // Draw particle as soft circle instead of rectangle
        ctx.beginPath();
        ctx.arc(0, 0, particle.width / 2, 0, Math.PI * 2);
        ctx.fill();

        // Additional sparkle effect
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ffffff';
        ctx.globalAlpha = particle.life * 0.3;
        ctx.fill();

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

    // Title
    ctx.fillStyle = '#333';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🎨 Art Studio Adventure', CANVAS_WIDTH / 2, 40);

    // Challenge info
    ctx.font = 'bold 16px Arial';
    ctx.fillText(
      `Challenge: ${state.currentChallenge.title}`,
      CANVAS_WIDTH / 2,
      70
    );
    ctx.font = '14px Arial';
    ctx.fillText(`${state.currentChallenge.description}`, CANVAS_WIDTH / 2, 90);

    // Drawing area with brush strokes
    ctx.save();
    ctx.beginPath();
    ctx.rect(
      DRAWING_AREA.x,
      DRAWING_AREA.y,
      DRAWING_AREA.width,
      DRAWING_AREA.height
    );
    ctx.clip();

    // Draw all brush strokes within the drawing area
    state.brushStrokes.forEach(stroke => drawBrushStroke(ctx, stroke));

    ctx.restore();

    // Color palettes
    const mainPalette =
      COLOR_PALETTES.find(p => p.id === 'rainbow') || COLOR_PALETTES[0];
    drawColorPalette(ctx, mainPalette, 50, 150);

    // Required colors for challenge
    if (state.currentChallenge.requiredColors.length > 0) {
      ctx.fillStyle = '#333';
      ctx.font = '12px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('Required Colors:', 400, 140);

      state.currentChallenge.requiredColors.forEach((color, index) => {
        const colorX = 400 + index * 30;
        const colorY = 150;

        ctx.fillStyle = color;
        ctx.fillRect(colorX, colorY, 25, 25);
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.strokeRect(colorX, colorY, 25, 25);
      });
    }

    // Tool palette
    drawToolPalette(ctx, DRAWING_TOOLS, 50, 350, state.selectedTool.id);

    // Current tool and color info
    ctx.fillStyle = '#333';
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Tool: ${state.selectedTool.name}`, 750, 150);
    ctx.fillText(`Size: ${state.brushSize}px`, 750, 170);

    // Current color swatch
    ctx.fillStyle = state.selectedColor;
    ctx.fillRect(750, 180, 30, 30);
    ctx.strokeStyle = '#333';
    ctx.strokeRect(750, 180, 30, 30);

    // Inspiration meter
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillRect(750, 250, 120, 20);
    ctx.fillStyle = '#9C27B0';
    ctx.fillRect(750, 250, (120 * state.inspiration) / 100, 20);
    ctx.strokeStyle = '#333';
    ctx.strokeRect(750, 250, 120, 20);
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.fillText('🎨 Inspiration', 750, 245);

    // Draw particles
    drawParticles(ctx, state.particles);

    // Celebration
    if (state.showCelebration) {
      ctx.fillStyle = 'rgba(255, 215, 0, 0.9)';
      ctx.font = 'bold 36px Arial';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#9C27B0';
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      ctx.shadowBlur = 10;
      ctx.fillText('🎨 MASTERPIECE! 🎨', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    }

    // Instructions
    if (state.gameStatus === 'playing') {
      ctx.fillStyle = '#666';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'transparent';
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.shadowBlur = 0;
      ctx.fillText(
        'Click and drag in the white canvas to create your artwork!',
        CANVAS_WIDTH / 2,
        CANVAS_HEIGHT - 20
      );
    }
  }, [
    drawBackground,
    drawBrushStroke,
    drawColorPalette,
    drawToolPalette,
    drawParticles,
  ]);

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
        particle.vy += 0.1; // gravity
        particle.life -= deltaTime / 1500;
        particle.rotation += 0.05;
        return particle.life > 0;
      });

      // Slowly increase inspiration when drawing
      if (state.isDrawing && state.inspiration < 100) {
        state.inspiration = Math.min(100, state.inspiration + deltaTime / 200);
      }

      // Check for artwork completion (simplified - based on stroke count and colors used)
      const strokeCount = state.brushStrokes.length;
      const uniqueColors = new Set(state.brushStrokes.map(s => s.color));
      const requiredColorsUsed = state.currentChallenge.requiredColors.filter(
        color =>
          Array.from(uniqueColors).some(
            usedColor =>
              Math.abs(
                parseInt(usedColor.slice(1), 16) - parseInt(color.slice(1), 16)
              ) < 100000
          )
      );

      if (
        strokeCount >= 10 &&
        requiredColorsUsed.length >=
          Math.min(3, state.currentChallenge.requiredColors.length) &&
        !state.showCelebration
      ) {
        state.showCelebration = true;
        state.score += 300 * state.level;
        state.artworkCompleted++;
        playSound(523, 0.5); // C note
        createArtParticles(
          DRAWING_AREA.x + DRAWING_AREA.width / 2,
          DRAWING_AREA.y + DRAWING_AREA.height / 2,
          40,
          '#FFD700'
        );

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
    [playSound, createArtParticles]
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
      currentChallenge: gameStateRef.current!.currentChallenge.title,
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
      level: newLevel,
      currentChallenge: gameStateRef.current!.currentChallenge.title,
    }));
  }, [initGameState, gameUIState.level]);

  // Mouse event handlers for drawing
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const state = gameStateRef.current;
      if (!state || state.gameStatus !== 'playing') return;

      const canvas = canvasRef.current!;
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (CANVAS_WIDTH / rect.width);
      const y = (e.clientY - rect.top) * (CANVAS_HEIGHT / rect.height);

      // Check if click is on color palette
      const mainPalette =
        COLOR_PALETTES.find(p => p.id === 'rainbow') || COLOR_PALETTES[0];
      for (let i = 0; i < mainPalette.colors.length; i++) {
        const colorX = 50 + i * 30;
        const colorY = 150;
        if (
          x >= colorX &&
          x <= colorX + 25 &&
          y >= colorY &&
          y <= colorY + 25
        ) {
          state.selectedColor = mainPalette.colors[i];
          setGameUIState(prev => ({
            ...prev,
            selectedColor: mainPalette.colors[i],
          }));
          playSound(440, 0.1); // Color selection sound
          return;
        }
      }

      // Check if click is on tool palette
      for (let i = 0; i < DRAWING_TOOLS.length; i++) {
        const toolX = 50;
        const toolY = 350 + i * 50;
        if (x >= toolX && x <= toolX + 40 && y >= toolY && y <= toolY + 40) {
          state.selectedTool = DRAWING_TOOLS[i];
          setGameUIState(prev => ({
            ...prev,
            selectedTool: DRAWING_TOOLS[i].id,
          }));
          playSound(330, 0.1); // Tool selection sound
          return;
        }
      }

      // Check if click is in drawing area
      if (
        x >= DRAWING_AREA.x &&
        x <= DRAWING_AREA.x + DRAWING_AREA.width &&
        y >= DRAWING_AREA.y &&
        y <= DRAWING_AREA.y + DRAWING_AREA.height
      ) {
        state.isDrawing = true;
        state.currentStroke = {
          id: `stroke-${Date.now()}`,
          color: state.selectedColor,
          points: [{ x, y }],
          thickness: state.brushSize,
          opacity: state.selectedTool.opacity,
          x,
          y,
          width: 0,
          height: 0,
          rotation: 0,
          scale: 1,
        };

        playSound(220, 0.05, 'triangle'); // Drawing start sound
        createArtParticles(x, y, 3, state.selectedColor);
      }
    },
    [playSound, createArtParticles]
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

      if (
        state.isDrawing &&
        state.currentStroke &&
        x >= DRAWING_AREA.x &&
        x <= DRAWING_AREA.x + DRAWING_AREA.width &&
        y >= DRAWING_AREA.y &&
        y <= DRAWING_AREA.y + DRAWING_AREA.height
      ) {
        state.currentStroke.points.push({ x, y });

        // Spray paint effect
        if (state.selectedTool.type === 'spray') {
          for (let i = 0; i < 3; i++) {
            const sprayX = x + (Math.random() - 0.5) * state.brushSize;
            const sprayY = y + (Math.random() - 0.5) * state.brushSize;
            createArtParticles(sprayX, sprayY, 1, state.selectedColor);
          }
        }
      }
    },
    [createArtParticles]
  );

  const handleMouseUp = useCallback(() => {
    const state = gameStateRef.current;
    if (!state || !state.currentStroke) return;

    if (state.currentStroke.points.length > 1) {
      state.brushStrokes.push(state.currentStroke);
    }

    state.isDrawing = false;
    state.currentStroke = null;
    playSound(330, 0.05, 'triangle'); // Drawing end sound
  }, [playSound]);

  // Brush size control
  const handleBrushSizeChange = useCallback((newSize: number) => {
    const state = gameStateRef.current;
    if (state) {
      state.brushSize = newSize;
      setGameUIState(prev => ({ ...prev, brushSize: newSize }));
    }
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <header className="bg-white bg-opacity-80 backdrop-blur-md shadow-lg border-b border-pink-200">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/games"
              className="flex items-center space-x-2 text-purple-600 hover:text-purple-500 transition-colors duration-300 group"
            >
              <span className="group-hover:translate-x-1 transition-transform duration-300">
                ← Back to Games
              </span>
            </Link>
            <div className="flex items-center space-x-6">
              <div className="text-sm text-purple-600 bg-orange-100 px-3 py-1 rounded-full">
                Score:{' '}
                <span className="font-bold text-orange-700">
                  {gameUIState.score}
                </span>
              </div>
              <div className="text-sm text-purple-600 bg-pink-100 px-3 py-1 rounded-full">
                Level:{' '}
                <span className="font-bold text-pink-700">
                  {gameUIState.level}
                </span>
              </div>
              <span className="text-xl font-bold text-purple-700 flex items-center">
                🎨 Art Studio Adventure
              </span>
            </div>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent mb-4">
            🎨 Art Studio Adventure
          </h1>
          <p className="text-lg text-purple-600 mb-6 max-w-2xl mx-auto">
            Create beautiful artworks and learn about colors and creativity!
            <span className="block text-sm text-purple-500 mt-2">
              Express yourself through digital art and discover the magic of
              colors!
            </span>
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="border-4 border-purple-300 rounded-2xl shadow-2xl bg-white cursor-crosshair transition-all duration-300 hover:shadow-3xl hover:border-purple-400"
              style={{
                width: `${CANVAS_WIDTH}px`,
                height: `${CANVAS_HEIGHT}px`,
                maxWidth: '100%',
              }}
            />
            {/* Decorative corner elements */}
            <div className="absolute -top-3 -left-3 w-6 h-6 bg-pink-400 rounded-full opacity-60"></div>
            <div className="absolute -top-3 -right-3 w-6 h-6 bg-purple-400 rounded-full opacity-60"></div>
            <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-orange-400 rounded-full opacity-60"></div>
            <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-blue-400 rounded-full opacity-60"></div>
          </div>
        </div>

        <div className="flex justify-center gap-4 mb-8 flex-wrap">
          {gameUIState.status === 'menu' && (
            <button
              onClick={startGame}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              🎨 Start Creating Magic!
            </button>
          )}

          {gameUIState.status === 'playing' && (
            <>
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
                className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-500 transition-colors"
              >
                🏠 Back to Menu
              </button>

              {/* Brush size controls */}
              <div className="flex items-center space-x-2 bg-white bg-opacity-80 px-4 py-2 rounded-lg">
                <span className="text-sm font-semibold text-purple-700">
                  Brush Size:
                </span>
                <input
                  type="range"
                  min="2"
                  max="30"
                  value={gameUIState.brushSize}
                  onChange={e =>
                    handleBrushSizeChange(parseInt(e.target.value))
                  }
                  className="w-20"
                />
                <span className="text-sm text-purple-700">
                  {gameUIState.brushSize}px
                </span>
              </div>
            </>
          )}

          {gameUIState.status === 'completed' && (
            <button
              onClick={nextLevel}
              className="bg-green-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-green-500 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              🎯 Next Challenge!
            </button>
          )}
        </div>

        {gameUIState.showInstructions && (
          <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-lg p-6 shadow-lg max-w-2xl mx-auto border border-purple-400">
            <h3 className="text-xl font-bold mb-4 text-center text-purple-800">
              🎯 How to Create Art
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-purple-700">
              <div className="space-y-2">
                <p className="flex items-center">
                  <span className="mr-2">🖱️</span> Click and drag on the white
                  canvas to draw
                </p>
                <p className="flex items-center">
                  <span className="mr-2">🎨</span> Click colors to change your
                  brush color
                </p>
                <p className="flex items-center">
                  <span className="mr-2">🖌️</span> Click tools to switch between
                  brushes
                </p>
              </div>
              <div className="space-y-2">
                <p className="flex items-center">
                  <span className="mr-2">🌈</span> Use the required colors in
                  your artwork
                </p>
                <p className="flex items-center">
                  <span className="mr-2">🎯</span> Complete the challenge
                  objective
                </p>
                <p className="flex items-center">
                  <span className="mr-2">🏆</span> Create masterpieces to
                  advance levels!
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
