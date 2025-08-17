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

interface LetterOrb extends GameEntity {
  letter: string;
  color: string;
  isSelected: boolean;
  isDragging: boolean;
  originalX: number;
  originalY: number;
  animationOffset: number;
  glowIntensity: number;
  magicPower: number;
}

interface WordSlot extends GameEntity {
  slotIndex: number;
  isOccupied: boolean;
  targetLetter: string;
  glowIntensity: number;
  letter?: string;
}

interface MagicSpell extends GameEntity {
  spellType: 'sparkle' | 'lightning' | 'spiral';
  life: number;
  maxLife: number;
  color: string;
}

interface Particle extends GameEntity {
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
}

interface WordChallenge {
  word: string;
  definition: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
}

// Game state
interface GameState {
  letterOrbs: LetterOrb[];
  wordSlots: WordSlot[];
  magicSpells: MagicSpell[];
  particles: Particle[];
  currentChallenge: WordChallenge;
  selectedLetters: string[];
  formedWord: string;
  score: number;
  level: number;
  gameStatus: 'menu' | 'playing' | 'completed' | 'paused';
  draggedOrb: LetterOrb | null;
  mouseX: number;
  mouseY: number;
  showCelebration: boolean;
  animationTime: number;
  magicMeter: number;
  wordsCompleted: number;
}

const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 700;

const WORD_CHALLENGES: WordChallenge[] = [
  {
    word: 'MAGIC',
    definition: 'The power of wizards and spells',
    difficulty: 'easy',
    category: 'Fantasy',
  },
  {
    word: 'SPELL',
    definition: 'A magical formula',
    difficulty: 'easy',
    category: 'Fantasy',
  },
  {
    word: 'WIZARD',
    definition: 'A person with magical powers',
    difficulty: 'medium',
    category: 'Fantasy',
  },
  {
    word: 'CASTLE',
    definition: 'A large fortified building',
    difficulty: 'medium',
    category: 'Places',
  },
  {
    word: 'DRAGON',
    definition: 'A legendary fire-breathing creature',
    difficulty: 'medium',
    category: 'Fantasy',
  },
  {
    word: 'ADVENTURE',
    definition: 'An exciting journey or experience',
    difficulty: 'hard',
    category: 'Action',
  },
  {
    word: 'MYSTERY',
    definition: 'Something difficult to understand',
    difficulty: 'hard',
    category: 'Thinking',
  },
  {
    word: 'TREASURE',
    definition: 'Valuable things like gold and jewels',
    difficulty: 'hard',
    category: 'Objects',
  },
];

export default function WordWizardAdventurePage() {
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

  // Create magic spell effect
  const createMagicSpell = useCallback(
    (x: number, y: number, type: 'sparkle' | 'lightning' | 'spiral') => {
      const state = gameStateRef.current;
      if (!state) return;

      const colors = {
        sparkle: '#FFD700',
        lightning: '#9C27B0',
        spiral: '#E91E63',
      };

      const spell: MagicSpell = {
        id: `spell-${Date.now()}`,
        x,
        y,
        width: 40,
        height: 40,
        rotation: 0,
        scale: 1,
        spellType: type,
        life: 1,
        maxLife: 1,
        color: colors[type],
      };

      state.magicSpells.push(spell);
    },
    []
  );

  // Initialize game state
  const initGameState = useCallback((level: number): GameState => {
    const challengeIndex = (level - 1) % WORD_CHALLENGES.length;
    const currentChallenge = WORD_CHALLENGES[challengeIndex];
    const word = currentChallenge.word;

    const letterOrbs: LetterOrb[] = [];
    const wordSlots: WordSlot[] = [];

    // Create word slots
    const slotSize = 60;
    const slotsStartX = (CANVAS_WIDTH - word.length * (slotSize + 10)) / 2;

    for (let i = 0; i < word.length; i++) {
      wordSlots.push({
        id: `slot-${i}`,
        x: slotsStartX + i * (slotSize + 10),
        y: 250,
        width: slotSize,
        height: slotSize,
        rotation: 0,
        scale: 1,
        slotIndex: i,
        isOccupied: false,
        targetLetter: word[i],
        glowIntensity: 0,
      });
    }

    // Create letter orbs (scrambled letters + extra distractors)
    const wordLetters = word.split('');
    const extraLetters = ['A', 'E', 'I', 'O', 'U', 'R', 'S', 'T', 'L', 'N'];
    const allLetters = [...wordLetters];

    // Add extra letters for difficulty
    for (let i = 0; i < Math.min(4, 8 - wordLetters.length); i++) {
      const extraLetter =
        extraLetters[Math.floor(Math.random() * extraLetters.length)];
      if (!allLetters.includes(extraLetter)) {
        allLetters.push(extraLetter);
      }
    }

    // Shuffle letters
    for (let i = allLetters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allLetters[i], allLetters[j]] = [allLetters[j], allLetters[i]];
    }

    // Create letter orb entities
    const orbsPerRow = Math.min(allLetters.length, 8);
    const orbsStartX = (CANVAS_WIDTH - orbsPerRow * 80) / 2;

    allLetters.forEach((letter, index) => {
      const row = Math.floor(index / orbsPerRow);
      const col = index % orbsPerRow;
      const x = orbsStartX + col * 80;
      const y = 500 + row * 80;

      const magicColors = [
        '#9C27B0',
        '#E91E63',
        '#3F51B5',
        '#00BCD4',
        '#4CAF50',
        '#FF9800',
      ];

      letterOrbs.push({
        id: `orb-${letter}-${index}`,
        letter,
        x,
        y,
        width: 60,
        height: 60,
        rotation: 0,
        scale: 1,
        color: magicColors[index % magicColors.length],
        isSelected: false,
        isDragging: false,
        originalX: x,
        originalY: y,
        animationOffset: index * 0.4,
        glowIntensity: 0.3 + Math.random() * 0.4,
        magicPower: Math.random(),
      });
    });

    return {
      letterOrbs,
      wordSlots,
      magicSpells: [],
      particles: [],
      currentChallenge,
      selectedLetters: [],
      formedWord: '',
      score: 0,
      level,
      gameStatus: 'playing',
      draggedOrb: null,
      mouseX: 0,
      mouseY: 0,
      showCelebration: false,
      animationTime: 0,
      magicMeter: 100,
      wordsCompleted: 0,
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

  // Draw magical background
  const drawBackground = useCallback(
    (ctx: CanvasRenderingContext2D, animationTime: number) => {
      // Softer twilight magical sky gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      gradient.addColorStop(0, '#2d1b69');
      gradient.addColorStop(0.3, '#603c8a');
      gradient.addColorStop(0.6, '#8b5fc7');
      gradient.addColorStop(1, '#c084fc');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Soft floating sparkle stars
      for (let i = 0; i < 60; i++) {
        const x = (i * 137.5) % CANVAS_WIDTH;
        const y = (i * 47.3) % CANVAS_HEIGHT;
        const twinkle = Math.sin(animationTime * 0.002 + i) * 0.5 + 0.5;
        const size = 0.8 + twinkle * 1.5;
        const alpha = 0.6 + twinkle * 0.4;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = size * 3;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Gentle magical aurora with softer colors
      ctx.globalAlpha = 0.2;
      for (let i = 0; i < 4; i++) {
        const x =
          ((animationTime * 0.15 + i * 250) % (CANVAS_WIDTH + 200)) - 100;
        const auroraGradient = ctx.createLinearGradient(
          x,
          0,
          x + 180,
          CANVAS_HEIGHT
        );
        const hue = 280 + i * 30 + Math.sin(animationTime * 0.001) * 20;
        auroraGradient.addColorStop(0, `hsl(${hue}, 70%, 65%)`);
        auroraGradient.addColorStop(0.5, `hsl(${hue + 20}, 60%, 55%)`);
        auroraGradient.addColorStop(1, 'transparent');

        ctx.fillStyle = auroraGradient;
        ctx.fillRect(x, 0, 180, CANVAS_HEIGHT);
      }

      // Floating magical orbs in background
      ctx.globalAlpha = 0.15;
      for (let i = 0; i < 8; i++) {
        const orbX =
          ((animationTime * 0.05 + i * 120) % (CANVAS_WIDTH + 60)) - 30;
        const orbY = 100 + i * 70 + Math.sin(animationTime * 0.003 + i) * 30;
        const orbSize = 15 + Math.sin(animationTime * 0.004 + i) * 8;

        const orbGradient = ctx.createRadialGradient(
          orbX,
          orbY,
          0,
          orbX,
          orbY,
          orbSize
        );
        orbGradient.addColorStop(0, '#fbbf24');
        orbGradient.addColorStop(0.7, '#f59e0b');
        orbGradient.addColorStop(1, 'transparent');

        ctx.fillStyle = orbGradient;
        ctx.beginPath();
        ctx.arc(orbX, orbY, orbSize, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
    },
    []
  );

  // Draw letter orb with softer magical effects
  const drawLetterOrb = useCallback(
    (ctx: CanvasRenderingContext2D, orb: LetterOrb, animationTime: number) => {
      ctx.save();

      ctx.translate(orb.x + orb.width / 2, orb.y + orb.height / 2);
      ctx.rotate(orb.rotation);
      ctx.scale(orb.scale, orb.scale);

      // Gentle floating animation
      if (!orb.isDragging) {
        const float =
          Math.sin(animationTime * 0.0015 + orb.animationOffset) * 6;
        const sway = Math.cos(animationTime * 0.001 + orb.animationOffset) * 2;
        ctx.translate(sway, float);
      }

      // Soft multi-layered magical glow
      const baseGlow = orb.width / 2 + orb.glowIntensity * 15;
      const pulseGlow =
        baseGlow + Math.sin(animationTime * 0.003 + orb.animationOffset) * 8;

      // Outer glow layer
      const outerGlow = ctx.createRadialGradient(
        0,
        0,
        orb.width / 2,
        0,
        0,
        pulseGlow + 10
      );
      outerGlow.addColorStop(0, 'transparent');
      outerGlow.addColorStop(0.6, orb.color + '20');
      outerGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = outerGlow;
      ctx.beginPath();
      ctx.arc(0, 0, pulseGlow + 10, 0, Math.PI * 2);
      ctx.fill();

      // Main glow layer
      const mainGlow = ctx.createRadialGradient(
        0,
        0,
        orb.width / 2 - 8,
        0,
        0,
        pulseGlow
      );
      mainGlow.addColorStop(0, orb.color + '80');
      mainGlow.addColorStop(0.5, orb.color + '40');
      mainGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = mainGlow;
      ctx.beginPath();
      ctx.arc(0, 0, pulseGlow, 0, Math.PI * 2);
      ctx.fill();

      // Orb body with crystal-like gradient
      const orbGradient = ctx.createRadialGradient(
        -12,
        -12,
        0,
        0,
        0,
        orb.width / 2
      );
      orbGradient.addColorStop(0, '#ffffff');
      orbGradient.addColorStop(0.2, orb.color + 'CC');
      orbGradient.addColorStop(0.7, orb.color);
      orbGradient.addColorStop(1, orb.color + '99');

      ctx.fillStyle = orbGradient;
      ctx.beginPath();
      ctx.arc(0, 0, orb.width / 2, 0, Math.PI * 2);
      ctx.fill();

      // Crystal shine effect
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.arc(-8, -8, orb.width / 4, 0, Math.PI * 2);
      ctx.fill();

      // Soft magical border with pulse
      const borderGlow = orb.isDragging
        ? 1.0
        : 0.6 + Math.sin(animationTime * 0.004) * 0.3;
      ctx.shadowColor = orb.isDragging ? '#fbbf24' : orb.color;
      ctx.shadowBlur = borderGlow * 12;
      ctx.strokeStyle = orb.isDragging ? '#fbbf24' : 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = orb.isDragging ? 3 : 2;
      ctx.beginPath();
      ctx.arc(0, 0, orb.width / 2, 0, Math.PI * 2);
      ctx.stroke();

      // Reset shadow
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;

      // Letter text with soft magical glow
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = 'bold 26px system-ui, -apple-system, sans-serif';

      // Text shadow for depth
      ctx.shadowColor = orb.color;
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      ctx.fillStyle = '#ffffff';
      ctx.fillText(orb.letter, 0, 0);

      // Text highlight
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillText(orb.letter, 0, 0);

      // Magic sparkles around orb
      for (let i = 0; i < 3; i++) {
        const sparkleAngle = animationTime * 0.003 + i * ((Math.PI * 2) / 3);
        const sparkleRadius = orb.width / 2 + 15;
        const sparkleX = Math.cos(sparkleAngle) * sparkleRadius;
        const sparkleY = Math.sin(sparkleAngle) * sparkleRadius;

        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(sparkleX, sparkleY, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    },
    []
  );

  // Draw word slot with magical effects
  const drawWordSlot = useCallback(
    (ctx: CanvasRenderingContext2D, slot: WordSlot, animationTime: number) => {
      ctx.save();

      ctx.translate(slot.x + slot.width / 2, slot.y + slot.height / 2);

      // Magical glow effect
      if (slot.glowIntensity > 0) {
        ctx.shadowColor = '#4CAF50';
        ctx.shadowBlur = slot.glowIntensity * 25;
      }

      // Slot background with runic patterns
      ctx.fillStyle = slot.isOccupied
        ? 'rgba(76, 175, 80, 0.4)'
        : 'rgba(255, 255, 255, 0.2)';
      ctx.strokeStyle = slot.isOccupied ? '#4CAF50' : '#ffffff';
      ctx.lineWidth = 3;

      // Draw magical circle
      ctx.beginPath();
      ctx.arc(0, 0, slot.width / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Animated runes around the circle
      ctx.strokeStyle = slot.isOccupied
        ? '#4CAF50'
        : 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI * 2) / 8 + animationTime * 0.001;
        const runeRadius = slot.width / 2 + 8;
        const runeX = Math.cos(angle) * runeRadius;
        const runeY = Math.sin(angle) * runeRadius;

        ctx.beginPath();
        ctx.moveTo(runeX - 3, runeY - 3);
        ctx.lineTo(runeX + 3, runeY + 3);
        ctx.moveTo(runeX + 3, runeY - 3);
        ctx.lineTo(runeX - 3, runeY + 3);
        ctx.stroke();
      }

      // Letter hint or placed letter
      if (slot.isOccupied && slot.letter) {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#4CAF50';
        ctx.shadowBlur = 15;
        ctx.fillText(slot.letter, 0, 0);
      } else {
        // Faint target letter hint
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.font = '18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(slot.targetLetter, 0, 0);
      }

      ctx.restore();
    },
    []
  );

  // Draw magic spells
  const drawMagicSpells = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      spells: MagicSpell[],
      animationTime: number
    ) => {
      spells.forEach(spell => {
        ctx.save();

        ctx.globalAlpha = spell.life;
        ctx.translate(spell.x, spell.y);
        ctx.rotate(animationTime * 0.01);

        switch (spell.spellType) {
          case 'sparkle':
            for (let i = 0; i < 5; i++) {
              const angle = (i * Math.PI * 2) / 5;
              const radius = 20 * spell.scale;
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;

              ctx.fillStyle = spell.color;
              ctx.beginPath();
              ctx.arc(x, y, 4, 0, Math.PI * 2);
              ctx.fill();
            }
            break;

          case 'lightning':
            ctx.strokeStyle = spell.color;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(-20, -20);
            ctx.lineTo(10, -5);
            ctx.lineTo(-5, 5);
            ctx.lineTo(20, 20);
            ctx.stroke();
            break;

          case 'spiral':
            ctx.strokeStyle = spell.color;
            ctx.lineWidth = 3;
            ctx.beginPath();
            for (let i = 0; i < 50; i++) {
              const angle = i * 0.3;
              const radius = i * 0.8;
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;
              if (i === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.stroke();
            break;
        }

        ctx.restore();
      });
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
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#9C27B0';
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.shadowBlur = 10;
    ctx.fillText('Word Wizard Adventure', CANVAS_WIDTH / 2, 50);

    // Challenge info
    ctx.font = 'bold 18px Arial';
    ctx.fillText(
      `Challenge: ${state.currentChallenge.word}`,
      CANVAS_WIDTH / 2,
      90
    );
    ctx.font = '16px Arial';
    ctx.fillText(
      `"${state.currentChallenge.definition}"`,
      CANVAS_WIDTH / 2,
      115
    );

    // Magic meter
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(20, 150, 200, 20);
    ctx.fillStyle = '#9C27B0';
    ctx.fillRect(20, 150, (200 * state.magicMeter) / 100, 20);
    ctx.strokeStyle = '#ffffff';
    ctx.strokeRect(20, 150, 200, 20);
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('🪄 Magic Power', 20, 140);

    // Reset text alignment and shadow
    ctx.textAlign = 'center';
    ctx.shadowColor = 'transparent';
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 0;

    // Draw word slots
    state.wordSlots.forEach(slot =>
      drawWordSlot(ctx, slot, state.animationTime)
    );

    // Draw letter orbs (non-dragging first, then dragging orb on top)
    state.letterOrbs
      .filter(orb => !orb.isDragging)
      .forEach(orb => drawLetterOrb(ctx, orb, state.animationTime));

    if (state.draggedOrb) {
      drawLetterOrb(ctx, state.draggedOrb, state.animationTime);
    }

    // Draw magic spells
    drawMagicSpells(ctx, state.magicSpells, state.animationTime);

    // Draw particles
    drawParticles(ctx, state.particles);

    // Draw celebration
    if (state.showCelebration) {
      ctx.fillStyle = 'rgba(255, 215, 0, 0.9)';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#9C27B0';
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 3;
      ctx.shadowBlur = 15;
      ctx.fillText('🪄 SPELL CAST! 🪄', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    }

    // Draw instructions
    ctx.fillStyle = '#ffffff';
    ctx.font = '18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(
      'Drag letter orbs to the magical slots to cast the word spell!',
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT - 20
    );
  }, [
    drawBackground,
    drawLetterOrb,
    drawWordSlot,
    drawMagicSpells,
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
        particle.vy += 0.2; // gravity
        particle.life -= deltaTime / 1000;
        particle.rotation += 0.1;
        return particle.life > 0;
      });

      // Update magic spells
      state.magicSpells = state.magicSpells.filter(spell => {
        spell.life -= deltaTime / 1000;
        spell.scale += deltaTime / 1000;
        return spell.life > 0;
      });

      // Update slot glow
      state.wordSlots.forEach(slot => {
        slot.glowIntensity = Math.max(0, slot.glowIntensity - deltaTime / 100);
      });

      // Check for word completion
      const allSlotsOccupied = state.wordSlots.every(slot => slot.isOccupied);
      if (allSlotsOccupied && !state.showCelebration) {
        state.showCelebration = true;
        state.score += 250 * state.level;
        state.wordsCompleted++;
        playSound(523, 0.4); // C note
        createParticles(CANVAS_WIDTH / 2, 250, 30, '#FFD700');
        createMagicSpell(CANVAS_WIDTH / 2, 250, 'sparkle');

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
    [playSound, createParticles, createMagicSpell]
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
      currentWord: gameStateRef.current!.currentChallenge.word,
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
      currentWord: gameStateRef.current!.currentChallenge.word,
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

      // Find clicked orb
      for (const orb of state.letterOrbs) {
        if (
          !orb.isSelected &&
          x >= orb.x &&
          x <= orb.x + orb.width &&
          y >= orb.y &&
          y <= orb.y + orb.height
        ) {
          orb.isDragging = true;
          orb.scale = 1.2;
          state.draggedOrb = orb;
          playSound(880, 0.1, 'sine'); // High note for magic
          createMagicSpell(
            orb.x + orb.width / 2,
            orb.y + orb.height / 2,
            'lightning'
          );
          break;
        }
      }
    },
    [playSound, createMagicSpell]
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

      if (state.draggedOrb) {
        state.draggedOrb.x = x - state.draggedOrb.width / 2;
        state.draggedOrb.y = y - state.draggedOrb.height / 2;

        // Check slot proximity for glow effect
        state.wordSlots.forEach(slot => {
          const distance = Math.sqrt(
            Math.pow(x - (slot.x + slot.width / 2), 2) +
              Math.pow(y - (slot.y + slot.height / 2), 2)
          );
          slot.glowIntensity = Math.max(0, 1 - distance / 80);
        });
      }
    },
    []
  );

  const handleMouseUp = useCallback(() => {
    const state = gameStateRef.current;
    if (!state || !state.draggedOrb) return;

    const orb = state.draggedOrb;
    let placed = false;

    // Check if dropped on correct slot
    for (const slot of state.wordSlots) {
      if (
        !slot.isOccupied &&
        orb.x + orb.width / 2 >= slot.x &&
        orb.x + orb.width / 2 <= slot.x + slot.width &&
        orb.y + orb.height / 2 >= slot.y &&
        orb.y + orb.height / 2 <= slot.y + slot.height
      ) {
        if (orb.letter === slot.targetLetter) {
          // Correct placement
          orb.x = slot.x + (slot.width - orb.width) / 2;
          orb.y = slot.y + (slot.height - orb.height) / 2;
          orb.isSelected = true;
          slot.isOccupied = true;
          slot.letter = orb.letter;
          slot.glowIntensity = 0;
          placed = true;

          playSound(659, 0.3); // E note for success
          createParticles(
            slot.x + slot.width / 2,
            slot.y + slot.height / 2,
            12,
            orb.color
          );
          createMagicSpell(
            slot.x + slot.width / 2,
            slot.y + slot.height / 2,
            'spiral'
          );
        } else {
          // Wrong letter
          playSound(196, 0.4, 'square'); // Error sound
          createMagicSpell(
            orb.x + orb.width / 2,
            orb.y + orb.height / 2,
            'sparkle'
          );
        }
        break;
      }
    }

    if (!placed) {
      // Return to original position
      orb.x = orb.originalX;
      orb.y = orb.originalY;
    }

    orb.isDragging = false;
    orb.scale = 1;
    state.draggedOrb = null;

    // Reset slot glow
    state.wordSlots.forEach(slot => {
      slot.glowIntensity = 0;
    });
  }, [playSound, createParticles, createMagicSpell]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
      <header className="bg-black bg-opacity-30 backdrop-blur-sm">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/games"
              className="flex items-center space-x-2 text-purple-300 hover:text-purple-200"
            >
              <span>← Back to Games</span>
            </Link>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-purple-200">
                Score:{' '}
                <span className="font-bold text-yellow-300">
                  {gameUIState.score}
                </span>
              </div>
              <div className="text-sm text-purple-200">
                Level:{' '}
                <span className="font-bold text-cyan-300">
                  {gameUIState.level}
                </span>
              </div>
              <span className="text-xl font-bold text-white">
                🪄 Word Wizard Adventure
              </span>
            </div>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-white mb-4">
            🪄 Word Wizard Adventure
          </h1>
          <p className="text-lg text-purple-200 mb-4">
            Cast spelling spells and build magical vocabulary!
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
            className="border-4 border-purple-400 rounded-lg shadow-2xl bg-black cursor-pointer"
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
              className="bg-purple-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-purple-500 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              🪄 Start Magic Adventure!
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
              className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-500 transition-colors"
            >
              🏠 Back to Menu
            </button>
          )}

          {gameUIState.status === 'completed' && (
            <button
              onClick={nextLevel}
              className="bg-cyan-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-cyan-500 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              🎯 Next Spell!
            </button>
          )}
        </div>

        {gameUIState.showInstructions && (
          <div className="bg-black bg-opacity-50 backdrop-blur-sm rounded-lg p-6 shadow-lg max-w-2xl mx-auto border border-purple-400">
            <h3 className="text-xl font-bold mb-4 text-center text-white">
              🎯 How to Cast Spells
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-purple-200">
              <div className="space-y-2">
                <p className="flex items-center">
                  <span className="mr-2">🖱️</span> Click and drag magical letter
                  orbs
                </p>
                <p className="flex items-center">
                  <span className="mr-2">🪄</span> Drop them in the correct
                  spell slots
                </p>
                <p className="flex items-center">
                  <span className="mr-2">✨</span> Complete the word to cast the
                  spell
                </p>
              </div>
              <div className="space-y-2">
                <p className="flex items-center">
                  <span className="mr-2">🌟</span> Each orb contains a magical
                  letter
                </p>
                <p className="flex items-center">
                  <span className="mr-2">🔮</span> Read the definition for clues
                </p>
                <p className="flex items-center">
                  <span className="mr-2">🏆</span> Master spells to become a
                  Word Wizard!
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
