/**
 * Educational Math Game Example - Demonstrates the complete game engine usage
 * This example creates a simple educational game where children can drag numbers to solve addition problems
 */

import {
  GameEngine,
  SceneManager,
  type Scene,
  type EngineConfig,
} from '../src';

import {
  RenderSystem,
  MovementSystem,
  PhysicsSystem,
  type Transform,
  type Sprite,
} from '../src/systems/CoreSystems';

// Game Components
interface NumberComponent {
  value: number;
  draggable: boolean;
  dragging: boolean;
}

interface EquationComponent {
  leftNumber: number;
  rightNumber: number;
  result: number;
  completed: boolean;
}

interface ClickableComponent {
  onClick: () => void;
}

// Main Game Scene
class MathGameScene implements Scene {
  public name = 'MathGame';
  public active = true;

  private engine!: GameEngine;
  private renderSystem!: RenderSystem;
  private movementSystem!: MovementSystem;
  private physicsSystem!: PhysicsSystem;

  private currentEquation: EquationComponent = {
    leftNumber: 0,
    rightNumber: 0,
    result: 0,
    completed: false,
  };

  private score = 0;
  private level = 1;

  public async init(engine: GameEngine): Promise<void> {
    this.engine = engine;

    // Initialize systems
    this.renderSystem = new RenderSystem(engine);
    this.movementSystem = new MovementSystem(engine);
    this.physicsSystem = new PhysicsSystem(engine);

    // Register systems with SystemManager
    engine.systemManager.addSystem({
      name: 'render',
      priority: 100,
      enabled: true,
      update: (deltaTime: number) => this.renderSystem.update(deltaTime),
    });
    engine.systemManager.addSystem({
      name: 'movement',
      priority: 50,
      enabled: true,
      update: (deltaTime: number) => this.movementSystem.update(deltaTime),
    });
    engine.systemManager.addSystem({
      name: 'physics',
      priority: 25,
      enabled: true,
      update: (deltaTime: number) => this.physicsSystem.update(deltaTime),
    });

    // Load game assets
    await this.loadAssets();
  }

  public async enter(engine: GameEngine): Promise<void> {
    console.log('Entering Math Game Scene');

    // Create UI elements
    this.createGameUI();

    // Generate first equation
    this.generateNewEquation();

    // Setup input handlers
    this.setupInputHandlers();
  }

  public update(deltaTime: number, engine: GameEngine): void {
    // Update all game systems
    engine.systemManager.update(deltaTime);

    // Check for completed equations
    this.checkEquationCompletion();

    // Update game logic
    this.updateGameLogic(deltaTime);
  }

  public render(renderer: any, interpolation: number): void {
    // Clear screen with educational blue background
    renderer.clear('#87CEEB');

    // Render game title
    this.renderTitle(renderer);

    // Render equation
    this.renderEquation(renderer);

    // Render score and level
    this.renderHUD(renderer);

    // Render help text
    this.renderHelp(renderer);
  }

  private async loadAssets(): Promise<void> {
    const assets = [
      'numbers/0.png',
      'numbers/1.png',
      'numbers/2.png',
      'numbers/3.png',
      'numbers/4.png',
      'numbers/5.png',
      'numbers/6.png',
      'numbers/7.png',
      'numbers/8.png',
      'numbers/9.png',
      'ui/plus.png',
      'ui/equals.png',
      'sounds/correct.mp3',
      'sounds/incorrect.mp3',
      'sounds/background.mp3',
    ];

    // Load all assets
    for (const asset of assets) {
      await this.engine.assetManager.loadAsset(asset);
    }
  }

  private createGameUI(): void {
    const canvas = this.engine.canvasElement;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Create draggable number options (0-9)
    for (let i = 0; i <= 9; i++) {
      const entity = this.engine.entityManager.createEntity();

      // Add Transform component
      this.engine.entityManager.addComponent(entity.id, {
        type: 'transform',
        x: 50 + (i % 5) * 120,
        y: canvas.height - 150 + Math.floor(i / 5) * 80,
        width: 60,
        height: 60,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        layer: 1,
      });

      // Add Sprite component
      this.engine.entityManager.addComponent(entity.id, {
        type: 'sprite',
        imageUrl: `numbers/${i}.png`,
        alpha: 1,
      });

      // Add Number component
      this.engine.entityManager.addComponent(entity.id, {
        type: 'number',
        value: i,
        draggable: true,
        dragging: false,
      });

      // Add physics body for collision detection (disabled - createBody not available)
      // const bodyId = this.engine.physics.createBody({
      //   x: 50 + (i % 5) * 120,
      //   y: canvas.height - 150 + Math.floor(i / 5) * 80,
      //   width: 60,
      //   height: 60,
      //   type: 'kinematic',
      // });

      // Add RigidBody component
      this.engine.entityManager.addComponent(entity.id, {
        type: 'rigidbody',
        id: 0, // placeholder
      });
    }

    // Create equation display area
    this.createEquationDisplay(centerX, centerY);
  }

  private createEquationDisplay(centerX: number, centerY: number): void {
    // Left number slot
    const leftSlot = this.engine.entityManager.createEntity();
    this.engine.entityManager.addComponent(leftSlot.id, {
      type: 'transform',
      x: centerX - 200,
      y: centerY - 50,
      width: 100,
      height: 100,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      layer: 0,
    });

    // Plus sign
    const plusEntity = this.engine.entityManager.createEntity();
    this.engine.entityManager.addComponent(plusEntity.id, {
      type: 'transform',
      x: centerX - 50,
      y: centerY - 25,
      width: 50,
      height: 50,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      layer: 0,
    });

    this.engine.entityManager.addComponent(plusEntity.id, {
      type: 'sprite',
      imageUrl: 'ui/plus.png',
      alpha: 1,
    });

    // Right number slot
    const rightSlot = this.engine.entityManager.createEntity();
    this.engine.entityManager.addComponent(rightSlot.id, {
      type: 'transform',
      x: centerX + 50,
      y: centerY - 50,
      width: 100,
      height: 100,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      layer: 0,
    });

    // Equals sign
    const equalsEntity = this.engine.entityManager.createEntity();
    this.engine.entityManager.addComponent(equalsEntity.id, {
      type: 'transform',
      x: centerX + 200,
      y: centerY - 25,
      width: 50,
      height: 50,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      layer: 0,
    });

    this.engine.entityManager.addComponent(equalsEntity.id, {
      type: 'sprite',
      imageUrl: 'ui/equals.png',
      alpha: 1,
    });

    // Result slot
    const resultSlot = this.engine.entityManager.createEntity();
    this.engine.entityManager.addComponent(resultSlot.id, {
      type: 'transform',
      x: centerX + 300,
      y: centerY - 50,
      width: 100,
      height: 100,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      layer: 0,
    });
  }

  private generateNewEquation(): void {
    // Generate random numbers based on level
    const maxNumber = Math.min(5 + this.level, 9);
    this.currentEquation.leftNumber = Math.floor(Math.random() * maxNumber) + 1;
    this.currentEquation.rightNumber =
      Math.floor(Math.random() * maxNumber) + 1;
    this.currentEquation.result =
      this.currentEquation.leftNumber + this.currentEquation.rightNumber;
    this.currentEquation.completed = false;

    console.log(
      `New equation: ${this.currentEquation.leftNumber} + ${this.currentEquation.rightNumber} = ${this.currentEquation.result}`
    );
  }

  private setupInputHandlers(): void {
    this.engine.inputManager.on('pointerdown', (event: any) => {
      this.handlePointerDown(event);
    });

    this.engine.inputManager.on('pointermove', (event: any) => {
      this.handlePointerMove(event);
    });

    this.engine.inputManager.on('pointerup', (event: any) => {
      this.handlePointerUp(event);
    });
  }

  private handlePointerDown(event: any): void {
    const x = event.x;
    const y = event.y;

    // Check if clicking on a draggable number
    const entities = this.engine.entityManager.getEntitiesWithComponents([
      'transform',
      'number',
    ]);

    for (const entity of entities) {
      const transform = this.engine.entityManager.getComponent(
        entity.id,
        'transform'
      ) as unknown as Transform;
      const number = this.engine.entityManager.getComponent(
        entity.id,
        'number'
      ) as unknown as NumberComponent;

      if (!transform || !number || !number.draggable) continue;

      // Check if point is inside the entity bounds
      if (
        x >= transform.x &&
        x <= transform.x + transform.width &&
        y >= transform.y &&
        y <= transform.y + transform.height
      ) {
        number.dragging = true;
        console.log(`Started dragging number: ${number.value}`);
        break;
      }
    }
  }

  private handlePointerMove(event: any): void {
    const x = event.x;
    const y = event.y;

    // Update position of dragging numbers
    const entities = this.engine.entityManager.getEntitiesWithComponents([
      'transform',
      'number',
    ]);

    for (const entity of entities) {
      const transform = this.engine.entityManager.getComponent(
        entity.id,
        'transform'
      ) as unknown as Transform;
      const number = this.engine.entityManager.getComponent(
        entity.id,
        'number'
      ) as unknown as NumberComponent;

      if (!transform || !number || !number.dragging) continue;

      // Update position
      transform.x = x - transform.width / 2;
      transform.y = y - transform.height / 2;
    }
  }

  private handlePointerUp(event: any): void {
    const entities = this.engine.entityManager.getEntitiesWithComponents([
      'transform',
      'number',
    ]);

    for (const entity of entities) {
      const number = this.engine.entityManager.getComponent(
        entity.id,
        'number'
      ) as unknown as NumberComponent;
      if (number && number.dragging) {
        number.dragging = false;

        // Check if dropped in correct position
        this.checkDropPosition(entity.id);
      }
    }
  }

  private checkDropPosition(entity: number): void {
    const transform = this.engine.entityManager.getComponent(
      entity,
      'transform'
    ) as unknown as Transform;
    const number = this.engine.entityManager.getComponent(
      entity,
      'number'
    ) as unknown as NumberComponent;

    if (!transform || !number) return;

    const canvas = this.engine.canvasElement;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Check if dropped in result slot
    const resultSlotX = centerX + 300;
    const resultSlotY = centerY - 50;

    if (
      transform.x >= resultSlotX - 50 &&
      transform.x <= resultSlotX + 150 &&
      transform.y >= resultSlotY - 50 &&
      transform.y <= resultSlotY + 150
    ) {
      // Check if correct answer
      if (number.value === this.currentEquation.result) {
        this.handleCorrectAnswer();
      } else {
        this.handleIncorrectAnswer();
      }
    }
  }

  private handleCorrectAnswer(): void {
    console.log('Correct answer!');

    // Play success sound
    this.engine.audioManager.playSound('sounds/correct.mp3');

    // Increase score
    this.score += 10 * this.level;

    // Check for level up
    if (this.score >= this.level * 100) {
      this.level++;
      console.log(`Level up! Now level ${this.level}`);
    }

    // Generate new equation
    setTimeout(() => {
      this.generateNewEquation();
    }, 1000);
  }

  private handleIncorrectAnswer(): void {
    console.log('Incorrect answer, try again!');

    // Play error sound
    this.engine.audioManager.playSound('sounds/incorrect.mp3');

    // Maybe show a helpful hint
    this.showHint();
  }

  private showHint(): void {
    const hint = `Hint: ${this.currentEquation.leftNumber} + ${this.currentEquation.rightNumber} = ?`;
    console.log(hint);

    // Could create a visual hint entity here
  }

  private checkEquationCompletion(): void {
    // This would check if the equation is completed correctly
    // For now, completion is handled in drop detection
  }

  private updateGameLogic(deltaTime: number): void {
    // Update any time-based game logic here
    // For example, timers, animations, etc.
  }

  private renderTitle(renderer: any): void {
    const ctx = renderer.getContext();
    if (!(ctx instanceof CanvasRenderingContext2D)) return;

    ctx.save();
    ctx.fillStyle = '#2E5984';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Math Adventure!', this.engine.canvasElement.width / 2, 60);
    ctx.restore();
  }

  private renderEquation(renderer: any): void {
    const ctx = renderer.getContext();
    if (!(ctx instanceof CanvasRenderingContext2D)) return;

    const canvas = this.engine.canvasElement;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    ctx.save();
    ctx.fillStyle = '#333';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';

    // Render equation numbers
    ctx.fillText(
      this.currentEquation.leftNumber.toString(),
      centerX - 150,
      centerY
    );
    ctx.fillText(
      this.currentEquation.rightNumber.toString(),
      centerX + 100,
      centerY
    );
    ctx.fillText('?', centerX + 350, centerY);

    ctx.restore();
  }

  private renderHUD(renderer: any): void {
    const ctx = renderer.getContext();
    if (!(ctx instanceof CanvasRenderingContext2D)) return;

    ctx.save();
    ctx.fillStyle = '#2E5984';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'left';

    ctx.fillText(`Score: ${this.score}`, 20, 40);
    ctx.fillText(`Level: ${this.level}`, 20, 70);

    ctx.restore();
  }

  private renderHelp(renderer: any): void {
    const ctx = renderer.getContext();
    if (!(ctx instanceof CanvasRenderingContext2D)) return;

    ctx.save();
    ctx.fillStyle = '#666';
    ctx.font = '18px Arial';
    ctx.textAlign = 'center';

    ctx.fillText(
      'Drag numbers to solve the equation!',
      this.engine.canvasElement.width / 2,
      this.engine.canvasElement.height - 40
    );

    ctx.restore();
  }

  public exit(): void {
    console.log('Exiting Math Game Scene');
  }

  public destroy(): void {
    // Clean up resources
    this.engine.entityManager.clear();
  }
}

// Initialize and start the game
export function createMathGame(): void {
  // Get canvas element
  const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
  if (!canvas) {
    console.error('Canvas element with id "gameCanvas" not found');
    return;
  }

  // Engine configuration
  const config: EngineConfig = {
    canvas: canvas,
    width: 1024,
    height: 768,
    targetFPS: 60,
    enableWebGL: false, // Use 2D for educational games
    debug: true,
  };

  // Create game engine
  const engine = new GameEngine(config);

  // Create and add the math game scene
  const mathScene = new MathGameScene();
  engine.sceneManager.addScene(mathScene);

  // Switch to the math game scene
  engine.sceneManager.switchToScene('MathGame');

  // Start the engine
  engine.start();

  // Play background music
  engine.audioManager.playSound('sounds/background.mp3', {
    loop: true,
    volume: 0.3,
  });

  console.log('Math Adventure Game Started!');
}

// Usage example:
// createMathGame();
