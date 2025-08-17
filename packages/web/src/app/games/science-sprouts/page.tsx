'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

// Game state types for Science Sprouts
interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  type: 'water' | 'sunlight' | 'nutrient';
  collected: boolean;
}

interface Plant {
  x: number;
  y: number;
  height: number;
  width: number;
  growth: number;
  maxGrowth: number;
  waterLevel: number;
  sunlightLevel: number;
  nutrientLevel: number;
  stage: 'seed' | 'sprout' | 'small' | 'medium' | 'full';
}

interface GameState {
  running: boolean;
  paused: boolean;
  score: number;
  level: number;
  particles: Particle[];
  plant: Plant;
  canvas: HTMLCanvasElement | null;
  ctx: CanvasRenderingContext2D | null;
  lastParticleSpawn: number;
  animationId: number | null;
}

export default function ScienceSproutsPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>({
    running: false,
    paused: false,
    score: 0,
    level: 1,
    particles: [],
    plant: {
      x: 400,
      y: 500,
      height: 20,
      width: 10,
      growth: 0,
      maxGrowth: 100,
      waterLevel: 0,
      sunlightLevel: 0,
      nutrientLevel: 0,
      stage: 'seed',
    },
    canvas: null,
    ctx: null,
    lastParticleSpawn: 0,
    animationId: null,
  });
  const [status, setStatus] = useState(
    '🌱 Welcome to Science Sprouts! Help your plant grow by collecting resources!'
  );
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    return () => {
      if (gameState.animationId) {
        cancelAnimationFrame(gameState.animationId);
      }
    };
  }, [gameState.animationId]);

  const createParticle = (
    type: 'water' | 'sunlight' | 'nutrient'
  ): Particle => {
    const colors = {
      water: '#4FC3F7',
      sunlight: '#FFD54F',
      nutrient: '#81C784',
    };

    return {
      id: Math.random(),
      x: Math.random() * 750 + 25,
      y: -20,
      vx: (Math.random() - 0.5) * 2,
      vy: Math.random() * 2 + 1,
      size: Math.random() * 8 + 6,
      color: colors[type],
      type,
      collected: false,
    };
  };

  const updatePlantStage = (plant: Plant) => {
    const totalResources =
      plant.waterLevel + plant.sunlightLevel + plant.nutrientLevel;

    if (totalResources >= 80) {
      plant.stage = 'full';
      plant.height = 200;
      plant.width = 40;
    } else if (totalResources >= 60) {
      plant.stage = 'medium';
      plant.height = 150;
      plant.width = 30;
    } else if (totalResources >= 40) {
      plant.stage = 'small';
      plant.height = 100;
      plant.width = 20;
    } else if (totalResources >= 20) {
      plant.stage = 'sprout';
      plant.height = 50;
      plant.width = 15;
    } else {
      plant.stage = 'seed';
      plant.height = 20;
      plant.width = 10;
    }

    plant.growth = Math.min(totalResources, plant.maxGrowth);
  };

  const drawPlant = (ctx: CanvasRenderingContext2D, plant: Plant) => {
    const baseY = 580;

    if (plant.stage === 'seed') {
      // Draw seed
      ctx.fillStyle = '#8D6E63';
      ctx.beginPath();
      ctx.ellipse(plant.x, baseY, 8, 5, 0, 0, 2 * Math.PI);
      ctx.fill();
    } else {
      // Draw stem
      const stemGradient = ctx.createLinearGradient(
        plant.x,
        baseY,
        plant.x,
        baseY - plant.height
      );
      stemGradient.addColorStop(0, '#4CAF50');
      stemGradient.addColorStop(1, '#81C784');
      ctx.fillStyle = stemGradient;
      ctx.fillRect(
        plant.x - plant.width / 4,
        baseY - plant.height,
        plant.width / 2,
        plant.height
      );

      // Draw leaves based on stage
      if (
        plant.stage === 'sprout' ||
        plant.stage === 'small' ||
        plant.stage === 'medium' ||
        plant.stage === 'full'
      ) {
        const leafCount =
          plant.stage === 'sprout'
            ? 2
            : plant.stage === 'small'
              ? 4
              : plant.stage === 'medium'
                ? 6
                : 8;

        for (let i = 0; i < leafCount; i++) {
          const leafY = baseY - (plant.height * (i + 1)) / (leafCount + 1);
          const side = i % 2 === 0 ? -1 : 1;
          const leafSize = Math.min(plant.width * 0.8, 15);

          ctx.fillStyle = '#4CAF50';
          ctx.beginPath();
          ctx.ellipse(
            plant.x + side * (plant.width / 2 + leafSize / 2),
            leafY,
            leafSize,
            leafSize / 2,
            (side * Math.PI) / 6,
            0,
            2 * Math.PI
          );
          ctx.fill();
        }
      }

      // Draw flower for full grown plant
      if (plant.stage === 'full') {
        const flowerY = baseY - plant.height - 10;
        const petalColors = [
          '#FF5722',
          '#E91E63',
          '#9C27B0',
          '#3F51B5',
          '#2196F3',
        ];

        for (let i = 0; i < 5; i++) {
          const angle = (i * Math.PI * 2) / 5;
          const petalX = plant.x + Math.cos(angle) * 12;
          const petalY = flowerY + Math.sin(angle) * 12;

          ctx.fillStyle = petalColors[i];
          ctx.beginPath();
          ctx.ellipse(petalX, petalY, 8, 4, angle, 0, 2 * Math.PI);
          ctx.fill();
        }

        // Flower center
        ctx.fillStyle = '#FFC107';
        ctx.beginPath();
        ctx.arc(plant.x, flowerY, 6, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
  };

  const drawParticle = (ctx: CanvasRenderingContext2D, particle: Particle) => {
    if (particle.collected) return;

    // Particle glow effect
    const gradient = ctx.createRadialGradient(
      particle.x,
      particle.y,
      0,
      particle.x,
      particle.y,
      particle.size
    );
    gradient.addColorStop(0, particle.color);
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0.1)');

    ctx.fillStyle = gradient;
    ctx.beginPath();

    if (particle.type === 'water') {
      // Water droplet shape
      ctx.beginPath();
      ctx.arc(
        particle.x,
        particle.y - particle.size / 3,
        particle.size / 2,
        0,
        2 * Math.PI
      );
      ctx.arc(
        particle.x,
        particle.y + particle.size / 3,
        particle.size / 3,
        0,
        2 * Math.PI
      );
    } else if (particle.type === 'sunlight') {
      // Sun ray shape
      const spikes = 8;
      const outerRadius = particle.size;
      const innerRadius = particle.size / 2;

      ctx.beginPath();
      for (let i = 0; i < spikes * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (i * Math.PI) / spikes;
        const x = particle.x + Math.cos(angle) * radius;
        const y = particle.y + Math.sin(angle) * radius;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
    } else {
      // Nutrient crystal shape
      ctx.beginPath();
      ctx.moveTo(particle.x, particle.y - particle.size);
      ctx.lineTo(particle.x + particle.size, particle.y);
      ctx.lineTo(particle.x, particle.y + particle.size);
      ctx.lineTo(particle.x - particle.size, particle.y);
      ctx.closePath();
    }

    ctx.fill();

    // Add sparkle effect
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.arc(
      particle.x - particle.size / 3,
      particle.y - particle.size / 3,
      2,
      0,
      2 * Math.PI
    );
    ctx.fill();
  };

  const drawGame = () => {
    if (!gameState.ctx || !gameState.canvas) return;

    const { ctx, canvas, plant, particles } = gameState;

    // Clear canvas with sky gradient
    const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGradient.addColorStop(0, '#87CEEB');
    skyGradient.addColorStop(0.7, '#98FB98');
    skyGradient.addColorStop(1, '#8BC34A');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw ground
    ctx.fillStyle = '#795548';
    ctx.fillRect(0, canvas.height - 40, canvas.width, 40);

    // Draw clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    for (let i = 0; i < 3; i++) {
      const x = ((i + 1) * canvas.width) / 4;
      const y = 80 + i * 20;
      ctx.beginPath();
      ctx.arc(x, y, 30, 0, 2 * Math.PI);
      ctx.arc(x + 25, y, 35, 0, 2 * Math.PI);
      ctx.arc(x - 25, y, 35, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Draw plant
    drawPlant(ctx, plant);

    // Draw particles
    particles.forEach(particle => drawParticle(ctx, particle));

    // Draw resource bars
    const barWidth = 200;
    const barHeight = 20;
    const barX = 20;

    // Water bar
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillRect(barX, 20, barWidth, barHeight);
    ctx.fillStyle = '#2196F3';
    ctx.fillRect(barX, 20, (barWidth * plant.waterLevel) / 100, barHeight);
    ctx.strokeStyle = '#1976D2';
    ctx.strokeRect(barX, 20, barWidth, barHeight);

    // Sunlight bar
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillRect(barX, 50, barWidth, barHeight);
    ctx.fillStyle = '#FFC107';
    ctx.fillRect(barX, 50, (barWidth * plant.sunlightLevel) / 100, barHeight);
    ctx.strokeStyle = '#F57C00';
    ctx.strokeRect(barX, 50, barWidth, barHeight);

    // Nutrient bar
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillRect(barX, 80, barWidth, barHeight);
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(barX, 80, (barWidth * plant.nutrientLevel) / 100, barHeight);
    ctx.strokeStyle = '#388E3C';
    ctx.strokeRect(barX, 80, barWidth, barHeight);

    // Resource labels
    ctx.fillStyle = '#2E5984';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(
      `💧 Water: ${plant.waterLevel.toFixed(0)}%`,
      barX + barWidth + 10,
      35
    );
    ctx.fillText(
      `☀️ Sunlight: ${plant.sunlightLevel.toFixed(0)}%`,
      barX + barWidth + 10,
      65
    );
    ctx.fillText(
      `🌿 Nutrients: ${plant.nutrientLevel.toFixed(0)}%`,
      barX + barWidth + 10,
      95
    );

    // Plant stage
    ctx.fillStyle = '#2E5984';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(
      `Plant Stage: ${plant.stage.toUpperCase()}`,
      canvas.width / 2,
      30
    );

    // Growth progress
    const growthPercent = (
      (plant.waterLevel + plant.sunlightLevel + plant.nutrientLevel) /
      3
    ).toFixed(1);
    ctx.fillText(`Growth: ${growthPercent}%`, canvas.width / 2, 55);

    // Instructions
    ctx.fillStyle = '#2E5984';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(
      'Click on falling resources to collect them!',
      canvas.width / 2,
      canvas.height - 10
    );
  };

  const updateGame = () => {
    if (!gameState.running || gameState.paused) return;

    const now = Date.now();

    // Spawn particles
    if (now - gameState.lastParticleSpawn > 1000) {
      const types: ('water' | 'sunlight' | 'nutrient')[] = [
        'water',
        'sunlight',
        'nutrient',
      ];
      const randomType = types[Math.floor(Math.random() * types.length)];

      setGameState(prev => ({
        ...prev,
        particles: [...prev.particles, createParticle(randomType)],
        lastParticleSpawn: now,
      }));
    }

    // Update particles
    setGameState(prev => {
      const updatedParticles = prev.particles
        .map(particle => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
        }))
        .filter(particle => !particle.collected && particle.y < 600);

      return { ...prev, particles: updatedParticles };
    });

    // Update plant
    setGameState(prev => {
      const updatedPlant = { ...prev.plant };
      updatePlantStage(updatedPlant);
      return { ...prev, plant: updatedPlant };
    });
  };

  const handleCanvasClick = (e: MouseEvent) => {
    if (!gameState.running || gameState.paused || !gameState.canvas) return;

    const rect = gameState.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if click hits any particle
    setGameState(prev => {
      let updatedScore = prev.score;
      let updatedPlant = { ...prev.plant };

      const updatedParticles = prev.particles.filter(particle => {
        if (
          !particle.collected &&
          Math.abs(particle.x - x) < particle.size &&
          Math.abs(particle.y - y) < particle.size
        ) {
          // Add resource to plant
          if (particle.type === 'water') {
            updatedPlant.waterLevel = Math.min(
              100,
              updatedPlant.waterLevel + 5
            );
          } else if (particle.type === 'sunlight') {
            updatedPlant.sunlightLevel = Math.min(
              100,
              updatedPlant.sunlightLevel + 5
            );
          } else if (particle.type === 'nutrient') {
            updatedPlant.nutrientLevel = Math.min(
              100,
              updatedPlant.nutrientLevel + 5
            );
          }

          updatedScore += 10;
          return false; // Remove the particle
        }
        return true; // Keep the particle
      });

      return {
        ...prev,
        plant: updatedPlant,
        score: updatedScore,
        particles: updatedParticles,
      };
    });
  };

  const startGame = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setGameState(prev => ({
      ...prev,
      canvas,
      ctx,
      running: true,
      score: 0,
      plant: {
        x: 400,
        y: 500,
        height: 20,
        width: 10,
        growth: 0,
        maxGrowth: 100,
        waterLevel: 0,
        sunlightLevel: 0,
        nutrientLevel: 0,
        stage: 'seed',
      },
      particles: [],
      lastParticleSpawn: Date.now(),
    }));

    setStatus(
      '🌱 Science Sprouts started! Click on resources to help your plant grow!'
    );

    // Add event listeners
    canvas.addEventListener('click', handleCanvasClick);

    // Start game loop
    gameLoop();
  };

  const gameLoop = () => {
    updateGame();
    drawGame();

    const animationId = requestAnimationFrame(gameLoop);
    setGameState(prev => ({ ...prev, animationId }));
  };

  const resetGame = () => {
    if (gameState.animationId) {
      cancelAnimationFrame(gameState.animationId);
    }

    setGameState({
      running: false,
      paused: false,
      score: 0,
      level: 1,
      particles: [],
      plant: {
        x: 400,
        y: 500,
        height: 20,
        width: 10,
        growth: 0,
        maxGrowth: 100,
        waterLevel: 0,
        sunlightLevel: 0,
        nutrientLevel: 0,
        stage: 'seed',
      },
      canvas: null,
      ctx: null,
      lastParticleSpawn: 0,
      animationId: null,
    });

    setStatus('🔄 Game reset! Click "Start Game" to plant a new seed!');

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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
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
              <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">🌱</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                Science Sprouts
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
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Science Sprouts Game
          </h1>
          <p className="text-lg text-gray-600">
            Learn about plant growth! Help your plant grow by collecting water,
            sunlight, and nutrients!
          </p>
        </div>

        {/* Game Canvas */}
        <div className="flex justify-center mb-6">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="border-4 border-green-400 rounded-2xl shadow-2xl bg-gradient-to-br from-blue-100 to-green-200 cursor-crosshair"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </div>

        {/* Game Controls */}
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          <button
            onClick={startGame}
            disabled={gameState.running}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🌱 Start Growing
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
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            🧪 How to Play:
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-gray-700">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">💧</span>
              <p>Click on blue water droplets to hydrate your plant</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">☀️</span>
              <p>Click on yellow sunlight rays for photosynthesis</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">🌿</span>
              <p>Click on green nutrients to feed your plant</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">🌸</span>
              <p>Watch your plant grow from seed to full bloom!</p>
            </div>
          </div>
        </div>

        {/* Plant Stages Info */}
        <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-2xl p-6 border border-green-200 mb-6">
          <h4 className="text-lg font-semibold text-green-800 mb-4">
            🌱 Plant Growth Stages:
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div className="bg-white rounded-lg p-3">
              <div className="text-2xl mb-2">🌰</div>
              <p className="text-sm font-medium">Seed</p>
              <p className="text-xs text-gray-600">0-20%</p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <div className="text-2xl mb-2">🌱</div>
              <p className="text-sm font-medium">Sprout</p>
              <p className="text-xs text-gray-600">20-40%</p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <div className="text-2xl mb-2">🌿</div>
              <p className="text-sm font-medium">Small</p>
              <p className="text-xs text-gray-600">40-60%</p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <div className="text-2xl mb-2">🌳</div>
              <p className="text-sm font-medium">Medium</p>
              <p className="text-xs text-gray-600">60-80%</p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <div className="text-2xl mb-2">🌸</div>
              <p className="text-sm font-medium">Full Bloom</p>
              <p className="text-xs text-gray-600">80-100%</p>
            </div>
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
