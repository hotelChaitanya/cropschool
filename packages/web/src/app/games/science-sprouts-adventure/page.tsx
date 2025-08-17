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

interface Resource extends GameEntity {
  type: 'water' | 'sunlight' | 'nutrient';
  color: string;
  isDragging: boolean;
  isCollected: boolean;
  vx: number;
  vy: number;
  animationOffset: number;
  glowIntensity: number;
}

interface PlantPart extends GameEntity {
  type: 'seed' | 'root' | 'stem' | 'leaf' | 'flower';
  isVisible: boolean;
  growthProgress: number;
  color: string;
}

interface Particle extends GameEntity {
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
}

interface PlantState {
  stage: 'seed' | 'sprout' | 'young' | 'mature' | 'flowering';
  waterLevel: number;
  sunlightLevel: number;
  nutrientLevel: number;
  overallGrowth: number;
  parts: PlantPart[];
  x: number;
  y: number;
}

// Game state
interface GameState {
  resources: Resource[];
  plant: PlantState;
  particles: Particle[];
  score: number;
  level: number;
  gameStatus: 'menu' | 'playing' | 'completed' | 'paused';
  draggedResource: Resource | null;
  mouseX: number;
  mouseY: number;
  showCelebration: boolean;
  animationTime: number;
  lastResourceSpawn: number;
  targetWater: number;
  targetSunlight: number;
  targetNutrient: number;
}

const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 700;

export default function ScienceSproutsAdventurePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const gameStateRef = useRef<GameState | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const [gameUIState, setGameUIState] = useState<{
    score: number;
    level: number;
    status: 'menu' | 'playing' | 'completed' | 'paused';
    plantStage: string;
    showInstructions: boolean;
  }>({
    score: 0,
    level: 1,
    status: 'menu',
    plantStage: 'seed',
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

  // Generate level targets
  const generateLevelTargets = useCallback((level: number) => {
    const baseTarget = 20 + level * 10;
    return {
      water: Math.min(baseTarget + Math.floor(Math.random() * 10), 100),
      sunlight: Math.min(baseTarget + Math.floor(Math.random() * 10), 100),
      nutrient: Math.min(baseTarget + Math.floor(Math.random() * 10), 100),
    };
  }, []);

  // Create plant parts
  const createPlantParts = useCallback((): PlantPart[] => {
    return [
      {
        id: 'seed',
        type: 'seed',
        x: CANVAS_WIDTH / 2,
        y: 550,
        width: 20,
        height: 15,
        rotation: 0,
        scale: 1,
        isVisible: true,
        growthProgress: 1,
        color: '#8D6E63',
      },
      {
        id: 'root',
        type: 'root',
        x: CANVAS_WIDTH / 2,
        y: 565,
        width: 30,
        height: 20,
        rotation: 0,
        scale: 0,
        isVisible: false,
        growthProgress: 0,
        color: '#5D4037',
      },
      {
        id: 'stem',
        type: 'stem',
        x: CANVAS_WIDTH / 2,
        y: 450,
        width: 8,
        height: 100,
        rotation: 0,
        scale: 0,
        isVisible: false,
        growthProgress: 0,
        color: '#4CAF50',
      },
      {
        id: 'leaf1',
        type: 'leaf',
        x: CANVAS_WIDTH / 2 - 25,
        y: 480,
        width: 20,
        height: 15,
        rotation: -0.3,
        scale: 0,
        isVisible: false,
        growthProgress: 0,
        color: '#66BB6A',
      },
      {
        id: 'leaf2',
        type: 'leaf',
        x: CANVAS_WIDTH / 2 + 25,
        y: 460,
        width: 20,
        height: 15,
        rotation: 0.3,
        scale: 0,
        isVisible: false,
        growthProgress: 0,
        color: '#66BB6A',
      },
      {
        id: 'flower',
        type: 'flower',
        x: CANVAS_WIDTH / 2,
        y: 400,
        width: 30,
        height: 30,
        rotation: 0,
        scale: 0,
        isVisible: false,
        growthProgress: 0,
        color: '#E91E63',
      },
    ];
  }, []);

  // Initialize game state
  const initGameState = useCallback(
    (level: number): GameState => {
      const targets = generateLevelTargets(level);

      return {
        resources: [],
        plant: {
          stage: 'seed',
          waterLevel: 0,
          sunlightLevel: 0,
          nutrientLevel: 0,
          overallGrowth: 0,
          parts: createPlantParts(),
          x: CANVAS_WIDTH / 2,
          y: 550,
        },
        particles: [],
        score: 0,
        level,
        gameStatus: 'playing',
        draggedResource: null,
        mouseX: 0,
        mouseY: 0,
        showCelebration: false,
        animationTime: 0,
        lastResourceSpawn: 0,
        targetWater: targets.water,
        targetSunlight: targets.sunlight,
        targetNutrient: targets.nutrient,
      };
    },
    [generateLevelTargets, createPlantParts]
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

  // Create resource
  const createResource = useCallback(
    (type: 'water' | 'sunlight' | 'nutrient'): Resource => {
      const colors = {
        water: '#2196F3',
        sunlight: '#FFC107',
        nutrient: '#4CAF50',
      };

      return {
        id: `resource-${type}-${Date.now()}`,
        type,
        x: Math.random() * (CANVAS_WIDTH - 60) + 30,
        y: -30,
        width: 30,
        height: 30,
        rotation: 0,
        scale: 1,
        color: colors[type],
        isDragging: false,
        isCollected: false,
        vx: (Math.random() - 0.5) * 2,
        vy: 1 + Math.random() * 2,
        animationOffset: Math.random() * Math.PI * 2,
        glowIntensity: 0.5 + Math.random() * 0.5,
      };
    },
    []
  );

  // Update plant growth
  const updatePlantGrowth = useCallback((plant: PlantState) => {
    const totalResources =
      plant.waterLevel + plant.sunlightLevel + plant.nutrientLevel;
    plant.overallGrowth = Math.min(totalResources / 3, 100);

    // Update plant stage
    if (plant.overallGrowth >= 80) {
      plant.stage = 'flowering';
    } else if (plant.overallGrowth >= 60) {
      plant.stage = 'mature';
    } else if (plant.overallGrowth >= 40) {
      plant.stage = 'young';
    } else if (plant.overallGrowth >= 20) {
      plant.stage = 'sprout';
    } else {
      plant.stage = 'seed';
    }

    // Update plant parts visibility and scale
    plant.parts.forEach(part => {
      switch (part.type) {
        case 'seed':
          part.isVisible = plant.stage === 'seed';
          break;
        case 'root':
          part.isVisible = plant.overallGrowth >= 10;
          part.scale = Math.min(plant.overallGrowth / 50, 1);
          break;
        case 'stem':
          part.isVisible = plant.overallGrowth >= 20;
          part.scale = Math.min(plant.overallGrowth / 50, 1);
          part.height = 100 * part.scale;
          break;
        case 'leaf':
          part.isVisible = plant.overallGrowth >= 40;
          part.scale = Math.min((plant.overallGrowth - 30) / 40, 1);
          break;
        case 'flower':
          part.isVisible = plant.overallGrowth >= 80;
          part.scale = Math.min((plant.overallGrowth - 70) / 30, 1);
          break;
      }
    });
  }, []);

  // Draw background
  const drawBackground = useCallback(
    (ctx: CanvasRenderingContext2D, animationTime: number) => {
      // Sky gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      gradient.addColorStop(0, '#87CEEB');
      gradient.addColorStop(0.6, '#98FB98');
      gradient.addColorStop(1, '#8BC34A');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Clouds
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      for (let i = 0; i < 4; i++) {
        const x = ((animationTime * 0.3 + i * 200) % (CANVAS_WIDTH + 100)) - 50;
        const y = 60 + i * 25;

        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.arc(x + 25, y, 30, 0, Math.PI * 2);
        ctx.arc(x + 50, y, 20, 0, Math.PI * 2);
        ctx.arc(x + 25, y - 15, 25, 0, Math.PI * 2);
        ctx.fill();
      }

      // Ground
      ctx.fillStyle = '#795548';
      ctx.fillRect(0, CANVAS_HEIGHT - 80, CANVAS_WIDTH, 80);

      // Grass
      ctx.fillStyle = '#8BC34A';
      for (let i = 0; i < CANVAS_WIDTH; i += 8) {
        const height = 15 + Math.sin(animationTime * 0.002 + i * 0.1) * 5;
        ctx.fillRect(i, CANVAS_HEIGHT - 80, 4, -height);
      }
    },
    []
  );

  // Draw resource with effects
  const drawResource = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      resource: Resource,
      animationTime: number
    ) => {
      if (resource.isCollected) return;

      ctx.save();

      ctx.translate(
        resource.x + resource.width / 2,
        resource.y + resource.height / 2
      );
      ctx.rotate(resource.rotation);
      ctx.scale(resource.scale, resource.scale);

      // Glow effect
      ctx.shadowColor = resource.color;
      ctx.shadowBlur = resource.glowIntensity * 15;

      // Resource shape based on type
      if (resource.type === 'water') {
        // Water droplet
        ctx.fillStyle = resource.color;
        ctx.beginPath();
        ctx.arc(0, -5, resource.width / 3, 0, Math.PI * 2);
        ctx.arc(0, 5, resource.width / 4, 0, Math.PI * 2);
        ctx.fill();
      } else if (resource.type === 'sunlight') {
        // Sun rays
        ctx.fillStyle = resource.color;
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
          const angle = (i * Math.PI) / 4;
          const innerRadius = resource.width / 4;
          const outerRadius = resource.width / 2;
          const x1 = Math.cos(angle) * innerRadius;
          const y1 = Math.sin(angle) * innerRadius;
          const x2 = Math.cos(angle) * outerRadius;
          const y2 = Math.sin(angle) * outerRadius;

          if (i === 0) ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          if (i < 7) {
            const nextAngle = ((i + 1) * Math.PI) / 4;
            const x3 = Math.cos(nextAngle) * innerRadius;
            const y3 = Math.sin(nextAngle) * innerRadius;
            ctx.lineTo(x3, y3);
          }
        }
        ctx.closePath();
        ctx.fill();
      } else {
        // Nutrient crystal
        ctx.fillStyle = resource.color;
        ctx.beginPath();
        ctx.moveTo(0, -resource.height / 2);
        ctx.lineTo(resource.width / 2, 0);
        ctx.lineTo(0, resource.height / 2);
        ctx.lineTo(-resource.width / 2, 0);
        ctx.closePath();
        ctx.fill();
      }

      // Sparkle effect
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.beginPath();
      ctx.arc(-resource.width / 4, -resource.height / 4, 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    },
    []
  );

  // Draw plant part
  const drawPlantPart = useCallback(
    (ctx: CanvasRenderingContext2D, part: PlantPart, animationTime: number) => {
      if (!part.isVisible || part.scale <= 0) return;

      ctx.save();

      ctx.translate(part.x, part.y);
      ctx.rotate(part.rotation);
      ctx.scale(part.scale, part.scale);

      switch (part.type) {
        case 'seed':
          ctx.fillStyle = part.color;
          ctx.beginPath();
          ctx.ellipse(0, 0, part.width / 2, part.height / 2, 0, 0, Math.PI * 2);
          ctx.fill();
          break;

        case 'root':
          ctx.strokeStyle = part.color;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.quadraticCurveTo(-15, 10, -20, 20);
          ctx.moveTo(0, 0);
          ctx.quadraticCurveTo(15, 10, 20, 20);
          ctx.moveTo(0, 0);
          ctx.lineTo(0, 15);
          ctx.stroke();
          break;

        case 'stem':
          const gradient = ctx.createLinearGradient(
            0,
            -part.height / 2,
            0,
            part.height / 2
          );
          gradient.addColorStop(0, '#66BB6A');
          gradient.addColorStop(1, '#4CAF50');
          ctx.fillStyle = gradient;
          ctx.fillRect(
            -part.width / 2,
            -part.height / 2,
            part.width,
            part.height
          );
          break;

        case 'leaf':
          ctx.fillStyle = part.color;
          ctx.beginPath();
          ctx.ellipse(0, 0, part.width / 2, part.height / 2, 0, 0, Math.PI * 2);
          ctx.fill();

          // Leaf vein
          ctx.strokeStyle = '#4CAF50';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(-part.width / 3, 0);
          ctx.lineTo(part.width / 3, 0);
          ctx.stroke();
          break;

        case 'flower':
          // Petals
          const petalColors = [
            '#E91E63',
            '#F06292',
            '#EC407A',
            '#E91E63',
            '#D81B60',
          ];
          for (let i = 0; i < 5; i++) {
            const angle = (i * Math.PI * 2) / 5;
            const petalX = Math.cos(angle) * 10;
            const petalY = Math.sin(angle) * 10;

            ctx.fillStyle = petalColors[i];
            ctx.beginPath();
            ctx.ellipse(petalX, petalY, 8, 4, angle, 0, Math.PI * 2);
            ctx.fill();
          }

          // Flower center
          ctx.fillStyle = '#FFC107';
          ctx.beginPath();
          ctx.arc(0, 0, 5, 0, Math.PI * 2);
          ctx.fill();
          break;
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

  // Draw resource bars
  const drawResourceBars = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      plant: PlantState,
      targets: { water: number; sunlight: number; nutrient: number }
    ) => {
      const barWidth = 200;
      const barHeight = 20;
      const barX = 20;

      // Water bar
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillRect(barX, 20, barWidth, barHeight);
      ctx.fillStyle = '#2196F3';
      ctx.fillRect(barX, 20, (barWidth * plant.waterLevel) / 100, barHeight);
      ctx.strokeStyle = '#1976D2';
      ctx.lineWidth = 2;
      ctx.strokeRect(barX, 20, barWidth, barHeight);

      // Target line for water
      const targetX = barX + (barWidth * targets.water) / 100;
      ctx.strokeStyle = '#FF5722';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(targetX, 20);
      ctx.lineTo(targetX, 40);
      ctx.stroke();

      // Sunlight bar
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillRect(barX, 50, barWidth, barHeight);
      ctx.fillStyle = '#FFC107';
      ctx.fillRect(barX, 50, (barWidth * plant.sunlightLevel) / 100, barHeight);
      ctx.strokeStyle = '#F57C00';
      ctx.lineWidth = 2;
      ctx.strokeRect(barX, 50, barWidth, barHeight);

      // Target line for sunlight
      const targetX2 = barX + (barWidth * targets.sunlight) / 100;
      ctx.strokeStyle = '#FF5722';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(targetX2, 50);
      ctx.lineTo(targetX2, 70);
      ctx.stroke();

      // Nutrient bar
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillRect(barX, 80, barWidth, barHeight);
      ctx.fillStyle = '#4CAF50';
      ctx.fillRect(barX, 80, (barWidth * plant.nutrientLevel) / 100, barHeight);
      ctx.strokeStyle = '#388E3C';
      ctx.lineWidth = 2;
      ctx.strokeRect(barX, 80, barWidth, barHeight);

      // Target line for nutrient
      const targetX3 = barX + (barWidth * targets.nutrient) / 100;
      ctx.strokeStyle = '#FF5722';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(targetX3, 80);
      ctx.lineTo(targetX3, 100);
      ctx.stroke();

      // Labels
      ctx.fillStyle = '#2E5984';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(
        `💧 Water: ${plant.waterLevel.toFixed(0)}% (Target: ${targets.water}%)`,
        barX + barWidth + 15,
        35
      );
      ctx.fillText(
        `☀️ Sunlight: ${plant.sunlightLevel.toFixed(0)}% (Target: ${targets.sunlight}%)`,
        barX + barWidth + 15,
        65
      );
      ctx.fillText(
        `🌿 Nutrients: ${plant.nutrientLevel.toFixed(0)}% (Target: ${targets.nutrient}%)`,
        barX + barWidth + 15,
        95
      );
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
    ctx.fillText('Science Sprouts Adventure', CANVAS_WIDTH / 2, 50);

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 0;

    // Draw resource bars
    drawResourceBars(ctx, state.plant, {
      water: state.targetWater,
      sunlight: state.targetSunlight,
      nutrient: state.targetNutrient,
    });

    // Draw plant stage
    ctx.fillStyle = '#2E5984';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(
      `Plant Stage: ${state.plant.stage.toUpperCase()}`,
      CANVAS_WIDTH / 2,
      120
    );
    ctx.fillText(
      `Growth: ${state.plant.overallGrowth.toFixed(1)}%`,
      CANVAS_WIDTH / 2,
      145
    );

    // Draw plant parts
    state.plant.parts.forEach(part =>
      drawPlantPart(ctx, part, state.animationTime)
    );

    // Draw resources (non-dragging first, then dragging resource on top)
    state.resources
      .filter(resource => !resource.isDragging)
      .forEach(resource => drawResource(ctx, resource, state.animationTime));

    if (state.draggedResource) {
      drawResource(ctx, state.draggedResource, state.animationTime);
    }

    // Draw particles
    drawParticles(ctx, state.particles);

    // Draw celebration
    if (state.showCelebration) {
      ctx.fillStyle = 'rgba(255, 215, 0, 0.8)';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('🌸 PLANT BLOOMED! 🌸', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    }

    // Draw instructions
    ctx.fillStyle = '#2E5984';
    ctx.font = '18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(
      'Click on falling resources to collect them and help your plant grow!',
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT - 20
    );
  }, [
    drawBackground,
    drawResource,
    drawPlantPart,
    drawParticles,
    drawResourceBars,
  ]);

  // Update game logic
  const update = useCallback(
    (deltaTime: number) => {
      const state = gameStateRef.current;
      if (!state || state.gameStatus !== 'playing') return;

      state.animationTime += deltaTime;

      // Spawn resources
      if (state.animationTime - state.lastResourceSpawn > 2000) {
        const resourceTypes: ('water' | 'sunlight' | 'nutrient')[] = [
          'water',
          'sunlight',
          'nutrient',
        ];
        const randomType =
          resourceTypes[Math.floor(Math.random() * resourceTypes.length)];
        state.resources.push(createResource(randomType));
        state.lastResourceSpawn = state.animationTime;
      }

      // Update resources
      state.resources = state.resources.filter(resource => {
        if (!resource.isCollected) {
          resource.x += resource.vx;
          resource.y += resource.vy;
          resource.rotation += 0.02;
          resource.animationOffset += 0.1;

          // Remove resources that fall off screen
          return resource.y < CANVAS_HEIGHT + 50;
        }
        return false;
      });

      // Update particles
      state.particles = state.particles.filter(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.2; // gravity
        particle.life -= deltaTime / 1000;
        particle.rotation += 0.1;
        return particle.life > 0;
      });

      // Update plant growth
      updatePlantGrowth(state.plant);

      // Check for level completion
      const targetsReached =
        state.plant.waterLevel >= state.targetWater &&
        state.plant.sunlightLevel >= state.targetSunlight &&
        state.plant.nutrientLevel >= state.targetNutrient;

      if (targetsReached && !state.showCelebration) {
        state.showCelebration = true;
        state.score += 200;
        playSound(523, 0.3); // C note
        createParticles(CANVAS_WIDTH / 2, 400, 30, '#FFD700');

        // Update UI
        setGameUIState(prev => ({
          ...prev,
          score: state.score,
          status: 'completed',
          plantStage: state.plant.stage,
        }));

        setTimeout(() => {
          nextLevel();
        }, 3000);
      }
    },
    [createResource, updatePlantGrowth, playSound, createParticles]
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
      plantStage: 'seed',
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
      plantStage: 'seed',
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

      // Find clicked resource
      for (const resource of state.resources) {
        if (
          !resource.isCollected &&
          x >= resource.x &&
          x <= resource.x + resource.width &&
          y >= resource.y &&
          y <= resource.y + resource.height
        ) {
          resource.isCollected = true;

          // Add resource to plant
          if (resource.type === 'water') {
            state.plant.waterLevel = Math.min(100, state.plant.waterLevel + 8);
          } else if (resource.type === 'sunlight') {
            state.plant.sunlightLevel = Math.min(
              100,
              state.plant.sunlightLevel + 8
            );
          } else if (resource.type === 'nutrient') {
            state.plant.nutrientLevel = Math.min(
              100,
              state.plant.nutrientLevel + 8
            );
          }

          state.score += 15;
          playSound(880, 0.1); // High A note
          createParticles(
            resource.x + resource.width / 2,
            resource.y + resource.height / 2,
            5,
            resource.color
          );

          setGameUIState(prev => ({
            ...prev,
            score: state.score,
            plantStage: state.plant.stage,
          }));
          break;
        }
      }
    },
    [playSound, createParticles]
  );

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
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
                🌱 Science Sprouts Adventure
              </span>
            </div>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🌱 Science Sprouts Adventure
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            Learn about plant growth! Collect resources to help your plant
            bloom!
          </p>
        </div>

        <div className="flex justify-center mb-6">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            onMouseDown={handleMouseDown}
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
              🌱 Start Growing!
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
              🧪 How to Play
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <p className="flex items-center">
                  <span className="mr-2">💧</span> Click blue water droplets to
                  hydrate your plant
                </p>
                <p className="flex items-center">
                  <span className="mr-2">☀️</span> Click yellow sunlight for
                  photosynthesis
                </p>
                <p className="flex items-center">
                  <span className="mr-2">🌿</span> Click green nutrients to feed
                  your plant
                </p>
              </div>
              <div className="space-y-2">
                <p className="flex items-center">
                  <span className="mr-2">🎯</span> Reach the target levels for
                  each resource
                </p>
                <p className="flex items-center">
                  <span className="mr-2">🌱</span> Watch your plant grow through
                  different stages
                </p>
                <p className="flex items-center">
                  <span className="mr-2">🌸</span> Complete levels to earn
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
