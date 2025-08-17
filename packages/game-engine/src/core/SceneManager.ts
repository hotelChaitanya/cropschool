/**
 * Scene Manager - Scene and game state management
 */

import { EventEmitter } from './EventEmitter';
import type { GameEngine } from './Engine';
import type { CanvasRenderer } from './CanvasRenderer';

export interface Scene {
  name: string;
  active: boolean;

  // Lifecycle methods
  init?(engine: GameEngine): void | Promise<void>;
  enter?(engine: GameEngine): void | Promise<void>;
  exit?(engine: GameEngine): void | Promise<void>;
  update?(deltaTime: number, engine: GameEngine): void;
  render?(renderer: CanvasRenderer, interpolation: number): void;
  destroy?(): void;

  // Input handling
  handleInput?(event: any): boolean; // Return true if handled

  // Pause/Resume
  pause?(): void;
  resume?(): void;
}

export interface SceneTransition {
  type: 'fade' | 'slide' | 'dissolve' | 'instant';
  duration: number;
  direction?: 'left' | 'right' | 'up' | 'down';
  color?: string;
}

export class SceneManager extends EventEmitter {
  private engine: GameEngine;
  private scenes: Map<string, Scene> = new Map();
  private currentScene: Scene | null = null;
  private previousScene: Scene | null = null;
  private nextScene: Scene | null = null;

  // Transition state
  private isTransitioning = false;
  private transitionStartTime = 0;
  private transitionDuration = 0;
  private transitionProgress = 0;
  private transitionType: SceneTransition['type'] = 'instant';
  private transitionColor = '#000000';
  private transitionDirection: SceneTransition['direction'] = 'right';

  // Scene stack for overlay scenes
  private sceneStack: Scene[] = [];

  constructor(engine: GameEngine) {
    super();
    this.engine = engine;
  }

  /**
   * Add a scene
   */
  public addScene(scene: Scene): void {
    if (this.scenes.has(scene.name)) {
      console.warn(`Scene '${scene.name}' already exists`);
      return;
    }

    this.scenes.set(scene.name, scene);

    // Initialize the scene
    if (scene.init) {
      const result = scene.init(this.engine);
      if (result instanceof Promise) {
        result.catch(error => {
          console.error(`Error initializing scene '${scene.name}':`, error);
        });
      }
    }

    this.emit('scene-added', scene);
  }

  /**
   * Remove a scene
   */
  public removeScene(sceneName: string): void {
    const scene = this.scenes.get(sceneName);
    if (!scene) return;

    // Can't remove current scene
    if (scene === this.currentScene) {
      console.warn(`Cannot remove current scene '${sceneName}'`);
      return;
    }

    // Destroy the scene
    if (scene.destroy) {
      scene.destroy();
    }

    this.scenes.delete(sceneName);
    this.emit('scene-removed', scene);
  }

  /**
   * Switch to a scene
   */
  public async switchToScene(
    sceneName: string,
    transition: SceneTransition = { type: 'instant', duration: 0 }
  ): Promise<void> {
    const scene = this.scenes.get(sceneName);
    if (!scene) {
      throw new Error(`Scene '${sceneName}' not found`);
    }

    if (scene === this.currentScene) {
      console.warn(`Scene '${sceneName}' is already current`);
      return;
    }

    if (this.isTransitioning) {
      console.warn('Scene transition already in progress');
      return;
    }

    this.nextScene = scene;

    if (transition.type === 'instant') {
      await this.performInstantTransition();
    } else {
      await this.performAnimatedTransition(transition);
    }
  }

  private async performInstantTransition(): Promise<void> {
    if (this.currentScene && this.currentScene.exit) {
      await this.currentScene.exit(this.engine);
    }

    this.previousScene = this.currentScene;
    this.currentScene = this.nextScene;
    this.nextScene = null;

    if (this.currentScene && this.currentScene.enter) {
      await this.currentScene.enter(this.engine);
    }

    this.emit('scene-changed', {
      from: this.previousScene?.name,
      to: this.currentScene?.name,
    });
  }

  private async performAnimatedTransition(
    transition: SceneTransition
  ): Promise<void> {
    return new Promise(async resolve => {
      this.isTransitioning = true;
      this.transitionStartTime = performance.now();
      this.transitionDuration = transition.duration;
      this.transitionType = transition.type;
      this.transitionColor = transition.color || '#000000';
      this.transitionDirection = transition.direction || 'right';

      // Start transition out
      this.emit('transition-start', {
        from: this.currentScene?.name,
        to: this.nextScene?.name,
      });

      // Wait for half transition to switch scenes
      setTimeout(async () => {
        if (this.currentScene && this.currentScene.exit) {
          await this.currentScene.exit(this.engine);
        }

        this.previousScene = this.currentScene;
        this.currentScene = this.nextScene;
        this.nextScene = null;

        if (this.currentScene && this.currentScene.enter) {
          await this.currentScene.enter(this.engine);
        }

        this.emit('scene-changed', {
          from: this.previousScene?.name,
          to: this.currentScene?.name,
        });
      }, transition.duration / 2);

      // Complete transition
      setTimeout(() => {
        this.isTransitioning = false;
        this.transitionProgress = 0;
        this.emit('transition-complete', { scene: this.currentScene?.name });
        resolve();
      }, transition.duration);
    });
  }

  /**
   * Push a scene onto the stack (overlay)
   */
  public pushScene(sceneName: string): void {
    const scene = this.scenes.get(sceneName);
    if (!scene) {
      throw new Error(`Scene '${sceneName}' not found`);
    }

    // Pause current scene
    if (this.currentScene && this.currentScene.pause) {
      this.currentScene.pause();
    }

    this.sceneStack.push(scene);
    scene.active = true;

    if (scene.enter) {
      const result = scene.enter(this.engine);
      if (result instanceof Promise) {
        result.catch(error => {
          console.error(`Error entering overlay scene '${sceneName}':`, error);
        });
      }
    }

    this.emit('scene-pushed', scene);
  }

  /**
   * Pop the top scene from the stack
   */
  public popScene(): Scene | null {
    const scene = this.sceneStack.pop();
    if (!scene) return null;

    scene.active = false;

    if (scene.exit) {
      const result = scene.exit(this.engine);
      if (result instanceof Promise) {
        result.catch(error => {
          console.error(`Error exiting overlay scene '${scene.name}':`, error);
        });
      }
    }

    // Resume previous scene
    const topScene =
      this.sceneStack.length > 0
        ? this.sceneStack[this.sceneStack.length - 1]
        : this.currentScene;

    if (topScene && topScene.resume) {
      topScene.resume();
    }

    this.emit('scene-popped', scene);
    return scene;
  }

  /**
   * Get current scene
   */
  public getCurrentScene(): Scene | null {
    return this.currentScene;
  }

  /**
   * Get scene by name
   */
  public getScene(sceneName: string): Scene | undefined {
    return this.scenes.get(sceneName);
  }

  /**
   * Check if a scene exists
   */
  public hasScene(sceneName: string): boolean {
    return this.scenes.has(sceneName);
  }

  /**
   * Update current scene and overlay scenes
   */
  public update(deltaTime: number): void {
    // Update transition
    if (this.isTransitioning) {
      const elapsed = performance.now() - this.transitionStartTime;
      this.transitionProgress = Math.min(elapsed / this.transitionDuration, 1);
    }

    // Update current scene
    if (
      this.currentScene &&
      this.currentScene.active &&
      this.currentScene.update
    ) {
      this.currentScene.update(deltaTime, this.engine);
    }

    // Update overlay scenes
    for (const scene of this.sceneStack) {
      if (scene.active && scene.update) {
        scene.update(deltaTime, this.engine);
      }
    }
  }

  /**
   * Render current scene and overlay scenes
   */
  public render(renderer: CanvasRenderer, interpolation: number): void {
    // Render current scene
    if (this.currentScene && this.currentScene.render) {
      this.currentScene.render(renderer, interpolation);
    }

    // Render overlay scenes
    for (const scene of this.sceneStack) {
      if (scene.active && scene.render) {
        scene.render(renderer, interpolation);
      }
    }

    // Render transition effect
    if (this.isTransitioning) {
      this.renderTransition(renderer);
    }
  }

  private renderTransition(renderer: CanvasRenderer): void {
    const ctx = renderer.getContext();
    if (!(ctx instanceof CanvasRenderingContext2D)) return;

    renderer.save();

    const canvas = this.engine.canvasElement;
    const width = canvas.width;
    const height = canvas.height;

    switch (this.transitionType) {
      case 'fade':
        ctx.globalAlpha =
          this.transitionProgress < 0.5
            ? this.transitionProgress * 2
            : (1 - this.transitionProgress) * 2;
        renderer.drawRect(0, 0, width, height, this.transitionColor);
        break;

      case 'slide':
        const slideOffset =
          this.transitionDirection === 'left' ||
          this.transitionDirection === 'right'
            ? width *
              (this.transitionProgress < 0.5
                ? this.transitionProgress * 2
                : (1 - this.transitionProgress) * 2)
            : height *
              (this.transitionProgress < 0.5
                ? this.transitionProgress * 2
                : (1 - this.transitionProgress) * 2);

        if (this.transitionDirection === 'left') {
          renderer.drawRect(
            -slideOffset,
            0,
            width,
            height,
            this.transitionColor
          );
        } else if (this.transitionDirection === 'right') {
          renderer.drawRect(
            slideOffset,
            0,
            width,
            height,
            this.transitionColor
          );
        } else if (this.transitionDirection === 'up') {
          renderer.drawRect(
            0,
            -slideOffset,
            width,
            height,
            this.transitionColor
          );
        } else if (this.transitionDirection === 'down') {
          renderer.drawRect(
            0,
            slideOffset,
            width,
            height,
            this.transitionColor
          );
        }
        break;

      case 'dissolve':
        // Simple dissolve effect using noise pattern
        ctx.globalAlpha =
          this.transitionProgress < 0.5
            ? this.transitionProgress * 2
            : (1 - this.transitionProgress) * 2;
        renderer.drawRect(0, 0, width, height, this.transitionColor);
        break;
    }

    renderer.restore();
  }

  /**
   * Handle input events
   */
  public handleInput(event: any): boolean {
    // Check overlay scenes first (top to bottom)
    for (let i = this.sceneStack.length - 1; i >= 0; i--) {
      const scene = this.sceneStack[i];
      if (scene.active && scene.handleInput) {
        if (scene.handleInput(event)) {
          return true; // Input was handled
        }
      }
    }

    // Check current scene
    if (this.currentScene && this.currentScene.handleInput) {
      return this.currentScene.handleInput(event);
    }

    return false;
  }

  /**
   * Pause all scenes
   */
  public pauseAll(): void {
    if (this.currentScene && this.currentScene.pause) {
      this.currentScene.pause();
    }

    for (const scene of this.sceneStack) {
      if (scene.pause) {
        scene.pause();
      }
    }
  }

  /**
   * Resume all scenes
   */
  public resumeAll(): void {
    if (this.currentScene && this.currentScene.resume) {
      this.currentScene.resume();
    }

    for (const scene of this.sceneStack) {
      if (scene.resume) {
        scene.resume();
      }
    }
  }

  /**
   * Get all scene names
   */
  public getSceneNames(): string[] {
    return Array.from(this.scenes.keys());
  }

  /**
   * Clear all scenes
   */
  public clear(): void {
    // Clear stack
    while (this.sceneStack.length > 0) {
      this.popScene();
    }

    // Exit current scene
    if (this.currentScene && this.currentScene.exit) {
      this.currentScene.exit(this.engine);
    }

    // Destroy all scenes
    for (const scene of this.scenes.values()) {
      if (scene.destroy) {
        scene.destroy();
      }
    }

    this.scenes.clear();
    this.currentScene = null;
    this.previousScene = null;
    this.nextScene = null;
  }

  /**
   * Destroy the scene manager
   */
  public destroy(): void {
    this.clear();
    this.removeAllListeners();
  }
}
