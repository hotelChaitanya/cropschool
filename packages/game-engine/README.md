# 🎮 CropSchool Game Engine

A comprehensive educational game engine built with TypeScript and Canvas, specifically designed for creating engaging educational games for children.

## ✨ Features

### 🏗️ **Entity-Component-System (ECS) Architecture**

- **Modular Design**: Clean separation of data (Components) and logic (Systems)
- **High Performance**: Optimized for 60 FPS gameplay
- **Scalable**: Easy to add new game mechanics and features

### 🎯 **60 FPS Game Loop**

- **Fixed Timestep**: Consistent physics simulation with accumulator pattern
- **Frame Interpolation**: Smooth visual rendering between updates
- **Performance Monitoring**: Built-in FPS tracking and debug metrics

### 🕹️ **Cross-Platform Input System**

- **Touch Support**: Multi-touch gestures for tablets and phones
- **Mouse & Keyboard**: Desktop compatibility
- **Gesture Recognition**: Tap, long-press, drag, pinch, and swipe detection
- **Unified API**: Single interface for all input types

### 🎨 **Advanced Rendering**

- **Canvas 2D & WebGL**: Automatic fallback support
- **Camera System**: Pan, zoom, and rotate capabilities
- **Sprite Management**: Efficient image rendering with transformations
- **Layer System**: Z-ordering for proper visual hierarchy

### ⚛️ **Physics Simulation**

- **Collision Detection**: AABB and Circle collision algorithms
- **Drag & Drop**: Educational game-optimized interaction system
- **Spatial Partitioning**: Grid-based optimization for performance
- **Basic Physics**: Velocity, acceleration, and collision response

### 🎵 **Audio Management**

- **Web Audio API**: High-quality sound processing
- **Spatial Audio**: 3D positioned sound effects
- **Music & SFX**: Background music with sound effect layering
- **Volume Controls**: Individual volume control for different audio types

### 📦 **Asset Management**

- **Progressive Loading**: Async loading with progress tracking
- **Caching System**: Efficient memory management
- **Multiple Formats**: Support for images, audio, and JSON data
- **Preloading**: Batch asset loading for smooth gameplay

### 🎬 **Animation System**

- **Easing Functions**: 20+ built-in easing curves
- **Property Animation**: Animate any numeric properties
- **Sequence Support**: Chain animations together
- **Parallel Execution**: Run multiple animations simultaneously

### 🎭 **Scene Management**

- **Scene Transitions**: Fade, slide, and dissolve effects
- **Scene Stack**: Overlay scenes for UI and menus
- **Lifecycle Management**: Proper initialization and cleanup
- **State Persistence**: Maintain scene state across transitions

## 🚀 Quick Start

### Installation

```bash
npm install @cropschool/game-engine
```

### Basic Usage

```typescript
import { GameEngine, type EngineConfig } from '@cropschool/game-engine';

// Get your canvas element
const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;

// Configure the engine
const config: EngineConfig = {
  canvas: canvas,
  width: 1024,
  height: 768,
  targetFPS: 60,
  enableWebGL: false,
  debug: true,
};

// Create and start the engine
const engine = new GameEngine(config);
engine.start();
```

### Creating a Simple Scene

```typescript
import { type Scene } from '@cropschool/game-engine';

class MyGameScene implements Scene {
  public name = 'MyGame';
  public active = true;

  public async init(engine: GameEngine): Promise<void> {
    // Load assets
    await engine.assetManager.loadImage('player.png');

    // Create entities
    const player = engine.entityManager.createEntity();
    engine.entityManager.addComponent(player, 'transform', {
      x: 100,
      y: 100,
      width: 64,
      height: 64,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      layer: 1,
    });
    engine.entityManager.addComponent(player, 'sprite', {
      imageUrl: 'player.png',
    });
  }

  public update(deltaTime: number, engine: GameEngine): void {
    // Update game logic
  }

  public render(renderer: CanvasRenderer, interpolation: number): void {
    renderer.clear('#87CEEB');
    // Render game objects
  }
}

// Add scene to engine
const scene = new MyGameScene();
engine.sceneManager.addScene(scene);
engine.sceneManager.switchToScene('MyGame');
```

## 🎮 Educational Game Example

The engine includes a complete educational math game example demonstrating:

- **Drag & Drop Mechanics**: Children can drag numbers to solve equations
- **Visual Feedback**: Immediate response to correct/incorrect answers
- **Progressive Difficulty**: Levels increase complexity gradually
- **Audio Rewards**: Sound effects for engagement
- **Score System**: Points and level progression

```typescript
import { createMathGame } from '@cropschool/game-engine/examples/MathGame';

// Start the math game
createMathGame();
```

## 🏗️ Architecture Overview

### Entity-Component-System

```typescript
// Create an entity
const player = engine.entityManager.createEntity();

// Add components (data)
engine.entityManager.addComponent(player, 'transform', {
  x: 0,
  y: 0,
  width: 32,
  height: 32,
});
engine.entityManager.addComponent(player, 'velocity', {
  x: 100,
  y: 0,
});

// Systems process entities with specific components
class MovementSystem {
  update(deltaTime: number) {
    const entities = engine.entityManager.getEntitiesWithComponents([
      'transform',
      'velocity',
    ]);

    for (const entity of entities) {
      const transform = engine.entityManager.getComponent(entity, 'transform');
      const velocity = engine.entityManager.getComponent(entity, 'velocity');

      transform.x += velocity.x * deltaTime;
      transform.y += velocity.y * deltaTime;
    }
  }
}
```

### Input Handling

```typescript
// Listen for input events
engine.inputManager.on('pointerdown', event => {
  console.log('Touch/click at:', event.x, event.y);
});

engine.inputManager.on('gesture', gesture => {
  if (gesture.type === 'pinch') {
    // Handle zoom gesture
    camera.zoom *= gesture.scale;
  }
});
```

### Audio System

```typescript
// Load and play sounds
await engine.audioManager.loadSound('coin.mp3');
engine.audioManager.playSound('coin.mp3');

// Background music with looping
engine.audioManager.playMusic('background.mp3', {
  loop: true,
  volume: 0.7,
});

// Spatial audio for immersive effects
engine.audioManager.playSpatialSound('explosion.mp3', x, y);
```

## 🎯 Core Systems

### 1. **Render System**

Handles sprite rendering with layering and transformations

### 2. **Movement System**

Updates entity positions based on velocity components

### 3. **Animation System**

Manages sprite animations and property tweening

### 4. **Physics System**

Processes collision detection and physics simulation

### 5. **Input System**

Converts raw input events into game actions

### 6. **Audio System**

Manages sound effects and background music

## 🔧 Configuration Options

```typescript
interface EngineConfig {
  canvas: HTMLCanvasElement; // Target canvas element
  width: number; // Canvas width
  height: number; // Canvas height
  targetFPS?: number; // Target frame rate (default: 60)
  enableWebGL?: boolean; // Use WebGL if available
  debug?: boolean; // Show debug information
}
```

## 🎨 Educational Game Features

### Child-Friendly Optimizations

- **Large Touch Targets**: Optimized for small fingers
- **Visual Feedback**: Clear response to interactions
- **Simple Controls**: Intuitive drag-and-drop mechanics
- **Encouraging Audio**: Positive reinforcement sounds

### Accessibility Features

- **High Contrast**: Clear visual elements
- **Audio Cues**: Sound feedback for actions
- **Scalable UI**: Adapts to different screen sizes
- **Simple Language**: Age-appropriate terminology

## 📱 Cross-Platform Support

The engine works seamlessly across:

- **Desktop Browsers** (Chrome, Firefox, Safari, Edge)
- **Mobile Devices** (iOS Safari, Android Chrome)
- **Tablets** (iPad, Android tablets)
- **Touch Devices** (Windows tablets, Chromebooks)

## 🔍 Performance Optimization

### Built-in Optimizations

- **Object Pooling**: Reuse entities and components
- **Spatial Partitioning**: Efficient collision detection
- **Frame Limiting**: Prevent resource exhaustion
- **Asset Caching**: Minimize loading times
- **Dirty Checking**: Only update changed elements

### Performance Monitoring

```typescript
// Enable debug mode for performance metrics
const config = { debug: true };

// Listen for performance events
engine.on('fps-update', fps => {
  console.log('Current FPS:', fps);
});
```

## 🧪 Testing

```bash
# Run tests
npm test

# Watch mode for development
npm run test:watch

# Type checking
npm run type-check
```

## 🏗️ Building

```bash
# Build for production
npm run build

# Development mode with watching
npm run dev

# Run example game
npm run example
```

## 📚 Advanced Topics

### Custom Systems

Create your own game systems by implementing the system interface:

```typescript
class CustomSystem {
  constructor(private engine: GameEngine) {}

  update(deltaTime: number): void {
    // Your custom logic here
  }
}

// Register with the engine
engine.systemManager.addSystem(new CustomSystem(engine));
```

### Scene Transitions

Create smooth transitions between game scenes:

```typescript
await engine.sceneManager.switchToScene('NextLevel', {
  type: 'fade',
  duration: 1000,
  color: '#000000',
});
```

### Animation Sequences

Chain multiple animations together:

```typescript
engine.animations.createSequence([
  { target: player, property: 'x', to: 200, duration: 1000 },
  { target: player, property: 'y', to: 300, duration: 500 },
  { target: player, property: 'rotation', to: Math.PI, duration: 800 },
]);
```

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines for more information.

## 📄 License

MIT License - see LICENSE file for details.

## 🎓 Educational Philosophy

This engine is designed with educational principles in mind:

- **Learning Through Play**: Makes learning fun and engaging
- **Immediate Feedback**: Helps children understand concepts quickly
- **Progressive Difficulty**: Builds confidence through manageable challenges
- **Multimodal Learning**: Combines visual, audio, and kinesthetic elements
- **Safe Environment**: Encourages experimentation without fear of failure

---

**Built with ❤️ for young learners by the CropSchool team**
