/**
 * Core Game Engine - Main engine class with game loop and systems
 */

import { EventEmitter } from './EventEmitter';
import { EntityManager } from './EntityManager';
import { SystemManager } from './SystemManager';
import { SceneManager } from './SceneManager';
import { InputManager } from './InputManager';
import { AudioManager } from './AudioManager';
import { AssetManager } from './AssetManager';
import { CanvasRenderer } from './CanvasRenderer';
import { PhysicsWorld } from './PhysicsWorld';
import { AnimationManager } from './AnimationManager';

export interface EngineConfig {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  targetFPS?: number;
  enableWebGL?: boolean;
  debug?: boolean;
}

export class GameEngine extends EventEmitter {
  private config: EngineConfig;
  private canvas: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D | WebGLRenderingContext;

  // Core managers
  public entityManager!: EntityManager;
  public systemManager!: SystemManager;
  public sceneManager!: SceneManager;
  public inputManager!: InputManager;
  public audioManager!: AudioManager;
  public assetManager!: AssetManager;
  public renderer!: CanvasRenderer;
  public physics!: PhysicsWorld;
  public animations!: AnimationManager;

  // Game loop properties
  private isRunning = false;
  private lastFrameTime = 0;
  private frameCount = 0;
  private fps = 0;
  private targetFPS: number;
  private frameTime: number;
  private accumulator = 0;
  private currentTime = 0;

  // Performance metrics
  private frameTimeHistory: number[] = [];
  private maxFrameTimeHistory = 60;

  constructor(config: EngineConfig) {
    super();

    this.config = config;
    this.canvas = config.canvas;
    this.targetFPS = config.targetFPS || 60;
    this.frameTime = 1000 / this.targetFPS;

    this.initializeCanvas();
    this.initializeManagers();
    this.setupEventListeners();

    if (config.debug) {
      this.enableDebugMode();
    }
  }

  private initializeCanvas(): void {
    this.canvas.width = this.config.width;
    this.canvas.height = this.config.height;

    // Try WebGL first, fallback to 2D
    if (this.config.enableWebGL) {
      const webglCtx =
        this.canvas.getContext('webgl') ||
        this.canvas.getContext('experimental-webgl');
      if (webglCtx) {
        this.ctx = webglCtx as WebGLRenderingContext;
        this.emit('webgl-initialized');
      } else {
        console.warn('WebGL not supported, falling back to 2D context');
        this.ctx = this.canvas.getContext('2d')!;
      }
    } else {
      this.ctx = this.canvas.getContext('2d')!;
    }

    if (!this.ctx) {
      throw new Error('Unable to get canvas context');
    }
  }

  private initializeManagers(): void {
    // Initialize core managers
    this.entityManager = new EntityManager();
    this.systemManager = new SystemManager(this);
    this.sceneManager = new SceneManager(this);
    this.inputManager = new InputManager(this.canvas);
    this.audioManager = new AudioManager();
    this.assetManager = new AssetManager();
    this.renderer = new CanvasRenderer(this.ctx, this.config);
    this.physics = new PhysicsWorld();
    this.animations = new AnimationManager();

    // Connect managers
    this.inputManager.on('input', (input: any) => this.emit('input', input));
    this.physics.on('collision', (collision: any) =>
      this.emit('collision', collision)
    );
    this.animations.on('animation-complete', (animation: any) =>
      this.emit('animation-complete', animation)
    );
  }

  private setupEventListeners(): void {
    // Handle window resize
    window.addEventListener('resize', this.handleResize.bind(this));

    // Handle visibility change (pause when tab not active)
    document.addEventListener(
      'visibilitychange',
      this.handleVisibilityChange.bind(this)
    );

    // Handle canvas focus/blur
    this.canvas.addEventListener('focus', () => this.emit('focus'));
    this.canvas.addEventListener('blur', () => this.emit('blur'));
  }

  private handleResize(): void {
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * window.devicePixelRatio;
    this.canvas.height = rect.height * window.devicePixelRatio;
    this.renderer.handleResize(this.canvas.width, this.canvas.height);
    this.emit('resize', {
      width: this.canvas.width,
      height: this.canvas.height,
    });
  }

  private handleVisibilityChange(): void {
    if (document.hidden) {
      this.pause();
    } else {
      this.resume();
    }
  }

  /**
   * Start the game engine
   */
  public start(): void {
    if (this.isRunning) {
      console.warn('Game engine is already running');
      return;
    }

    this.isRunning = true;
    this.lastFrameTime = performance.now();
    this.currentTime = this.lastFrameTime;

    this.emit('start');
    this.gameLoop();
  }

  /**
   * Stop the game engine
   */
  public stop(): void {
    this.isRunning = false;
    this.emit('stop');
  }

  /**
   * Pause the game engine
   */
  public pause(): void {
    if (!this.isRunning) return;
    this.isRunning = false;
    this.emit('pause');
  }

  /**
   * Resume the game engine
   */
  public resume(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastFrameTime = performance.now();
    this.emit('resume');
    this.gameLoop();
  }

  /**
   * Main game loop using fixed timestep with accumulator
   */
  private gameLoop(): void {
    if (!this.isRunning) return;

    const now = performance.now();
    const frameTime = Math.min(now - this.lastFrameTime, 250); // Cap at 250ms to prevent spiral of death
    this.lastFrameTime = now;

    this.accumulator += frameTime;

    // Update at fixed timestep
    while (this.accumulator >= this.frameTime) {
      this.update(this.frameTime / 1000); // Convert to seconds
      this.accumulator -= this.frameTime;
    }

    // Render with interpolation
    const interpolation = this.accumulator / this.frameTime;
    this.render(interpolation);

    // Update performance metrics
    this.updatePerformanceMetrics(frameTime);

    // Continue loop
    requestAnimationFrame(() => this.gameLoop());
  }

  /**
   * Update game state
   */
  private update(deltaTime: number): void {
    this.frameCount++;

    // Update input
    this.inputManager.update(deltaTime);

    // Update physics
    this.physics.update(deltaTime);

    // Update animations
    this.animations.update(deltaTime);

    // Update current scene
    this.sceneManager.update(deltaTime);

    // Update all systems
    this.systemManager.update(deltaTime);

    // Emit update event
    this.emit('update', deltaTime);
  }

  /**
   * Render game
   */
  private render(interpolation: number): void {
    // Clear canvas
    this.renderer.clear();

    // Render current scene
    this.sceneManager.render(this.renderer, interpolation);

    // Render debug info if enabled
    if (this.config.debug) {
      this.renderDebugInfo();
    }

    // Emit render event
    this.emit('render', interpolation);
  }

  private updatePerformanceMetrics(frameTime: number): void {
    this.frameTimeHistory.push(frameTime);
    if (this.frameTimeHistory.length > this.maxFrameTimeHistory) {
      this.frameTimeHistory.shift();
    }

    // Calculate FPS every second
    if (this.frameCount % 60 === 0) {
      this.fps = Math.round(
        1000 /
          (this.frameTimeHistory.reduce((a, b) => a + b, 0) /
            this.frameTimeHistory.length)
      );
      this.emit('fps-update', this.fps);
    }
  }

  private renderDebugInfo(): void {
    if (this.ctx instanceof CanvasRenderingContext2D) {
      const ctx = this.ctx;
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(10, 10, 200, 100);

      ctx.fillStyle = 'white';
      ctx.font = '12px monospace';
      ctx.fillText(`FPS: ${this.fps}`, 20, 30);
      ctx.fillText(`Entities: ${this.entityManager.getEntityCount()}`, 20, 45);
      ctx.fillText(`Systems: ${this.systemManager.getSystemCount()}`, 20, 60);
      ctx.fillText(
        `Scene: ${this.sceneManager.getCurrentScene()?.name || 'None'}`,
        20,
        75
      );
      ctx.fillText(
        `Audio: ${this.audioManager.getActiveSourceCount()} playing`,
        20,
        90
      );
      ctx.restore();
    }
  }

  private enableDebugMode(): void {
    // Add debug keyboard shortcuts
    this.inputManager.on('keydown', (event: any) => {
      if (event.key === 'F1') {
        console.log('Engine Debug Info:', {
          fps: this.fps,
          entities: this.entityManager.getEntityCount(),
          systems: this.systemManager.getSystemCount(),
          currentScene: this.sceneManager.getCurrentScene()?.name,
          audioSources: this.audioManager.getActiveSourceCount(),
        });
      }
    });
  }

  /**
   * Destroy the engine and clean up resources
   */
  public destroy(): void {
    this.stop();

    // Clean up managers
    this.inputManager.destroy();
    this.audioManager.destroy();
    this.assetManager.destroy();
    this.physics.destroy();
    this.animations.destroy();
    this.sceneManager.destroy();
    this.systemManager.destroy();
    this.entityManager.destroy();

    // Remove event listeners
    window.removeEventListener('resize', this.handleResize);
    document.removeEventListener(
      'visibilitychange',
      this.handleVisibilityChange
    );

    this.emit('destroy');
    this.removeAllListeners();
  }

  // Getters
  public get isGameRunning(): boolean {
    return this.isRunning;
  }
  public get currentFPS(): number {
    return this.fps;
  }
  public get canvasContext(): CanvasRenderingContext2D | WebGLRenderingContext {
    return this.ctx;
  }
  public get canvasElement(): HTMLCanvasElement {
    return this.canvas;
  }
  public get engineConfig(): EngineConfig {
    return this.config;
  }

  // EventEmitter method declarations to help TypeScript
  declare public emit: (event: string, data?: any) => void;
  declare public on: (event: string, listener: (data?: any) => void) => void;
  declare public off: (event: string, listener: (data?: any) => void) => void;
  declare public once: (event: string, listener: (data?: any) => void) => void;
  declare public removeAllListeners: (event?: string) => void;
}
