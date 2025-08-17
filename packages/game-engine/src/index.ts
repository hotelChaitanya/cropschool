/**
 * Game Engine - Main exports
 */

// Core engine
export { GameEngine } from './core/Engine';
export type { EngineConfig } from './core/Engine';

// Core systems
export { EventEmitter } from './core/EventEmitter';
export { EntityManager } from './core/EntityManager';
export type { Entity, Component } from './core/EntityManager';
export { SystemManager } from './core/SystemManager';
export { SceneManager } from './core/SceneManager';
export type { Scene, SceneTransition } from './core/SceneManager';

// Input and interaction
export { InputManager } from './core/InputManager';
export type { InputEvent } from './core/InputManager';

// Audio
export { AudioManager } from './core/AudioManager';

// Assets
export { AssetManager } from './core/AssetManager';

// Rendering
export { CanvasRenderer } from './core/CanvasRenderer';
export type { Camera } from './core/CanvasRenderer';

// Physics
export { PhysicsWorld } from './core/PhysicsWorld';
export type { RigidBody, Collision } from './core/PhysicsWorld';

// Animation
export { AnimationManager } from './core/AnimationManager';
export type { Animation, EasingFunction } from './core/AnimationManager';
