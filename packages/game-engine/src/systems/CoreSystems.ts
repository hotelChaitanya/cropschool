/**
 * Render System - Handles sprite rendering for entities with Transform and Sprite components
 */

import type { GameEngine } from '../core/Engine';
import type { CanvasRenderer } from '../core/CanvasRenderer';
import type { Entity } from '../core/EntityManager';

export interface Transform {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  layer: number; // For z-ordering
}

export interface Sprite {
  imageUrl: string;
  sourceX?: number;
  sourceY?: number;
  sourceWidth?: number;
  sourceHeight?: number;
  alpha?: number;
  tint?: string;
  flipX?: boolean;
  flipY?: boolean;
}

export interface Velocity {
  x: number;
  y: number;
}

export class RenderSystem {
  private engine: GameEngine;
  private renderer: CanvasRenderer;

  constructor(engine: GameEngine) {
    this.engine = engine;
    this.renderer = engine.renderer;
  }

  /**
   * Update system - called every frame
   */
  public update(deltaTime: number): void {
    // Get all entities with Transform and Sprite components
    const entities = this.engine.entityManager.getEntitiesWithComponents([
      'transform',
      'sprite',
    ]);

    // Sort by layer for proper z-ordering
    entities.sort((a: Entity, b: Entity) => {
      const transformA = this.engine.entityManager.getComponent(
        a.id,
        'transform'
      ) as unknown as Transform;
      const transformB = this.engine.entityManager.getComponent(
        b.id,
        'transform'
      ) as unknown as Transform;
      return (transformA?.layer || 0) - (transformB?.layer || 0);
    });

    // Render each entity
    for (const entity of entities) {
      this.renderEntity(entity.id);
    }
  }

  private renderEntity(entity: number): void {
    const transform = this.engine.entityManager.getComponent(
      entity,
      'transform'
    ) as unknown as Transform;
    const sprite = this.engine.entityManager.getComponent(
      entity,
      'sprite'
    ) as unknown as Sprite;

    if (!transform || !sprite) return;

    // Check if asset is loaded
    if (!this.engine.assetManager.isAssetLoaded(sprite.imageUrl)) {
      // Load asset if not already loaded
      this.engine.assetManager.loadAsset(sprite.imageUrl);
      return;
    }

    const image = this.engine.assetManager.getAsset(
      sprite.imageUrl
    ) as HTMLImageElement;
    if (!image) return;

    this.renderer.save();

    // Get the 2D context for manual transformations
    const ctx = this.renderer.getContext();
    if (!(ctx instanceof CanvasRenderingContext2D)) return;

    // Apply transform
    ctx.translate(
      transform.x + transform.width / 2,
      transform.y + transform.height / 2
    );
    ctx.rotate(transform.rotation);
    ctx.scale(transform.scaleX, transform.scaleY);

    // Apply sprite properties
    if (sprite.alpha !== undefined) {
      ctx.globalAlpha = sprite.alpha;
    }

    // Flip if needed
    let scaleX = 1;
    let scaleY = 1;
    if (sprite.flipX) scaleX = -1;
    if (sprite.flipY) scaleY = -1;
    if (scaleX !== 1 || scaleY !== 1) {
      ctx.scale(scaleX, scaleY);
    }

    // Draw sprite
    if (
      sprite.sourceX !== undefined &&
      sprite.sourceY !== undefined &&
      sprite.sourceWidth !== undefined &&
      sprite.sourceHeight !== undefined
    ) {
      // Draw from sprite sheet
      ctx.drawImage(
        image,
        sprite.sourceX,
        sprite.sourceY,
        sprite.sourceWidth,
        sprite.sourceHeight,
        -transform.width / 2,
        -transform.height / 2,
        transform.width,
        transform.height
      );
    } else {
      // Draw full image
      ctx.drawImage(
        image,
        -transform.width / 2,
        -transform.height / 2,
        transform.width,
        transform.height
      );
    }

    this.renderer.restore();
  }
}

export class MovementSystem {
  private engine: GameEngine;

  constructor(engine: GameEngine) {
    this.engine = engine;
  }

  /**
   * Update entities with Transform and Velocity components
   */
  public update(deltaTime: number): void {
    const entities = this.engine.entityManager.getEntitiesWithComponents([
      'transform',
      'velocity',
    ]);

    for (const entity of entities) {
      const transform = this.engine.entityManager.getComponent(
        entity.id,
        'transform'
      ) as unknown as Transform;
      const velocity = this.engine.entityManager.getComponent(
        entity.id,
        'velocity'
      ) as unknown as Velocity;

      if (!transform || !velocity) continue;

      // Update position based on velocity
      transform.x += velocity.x * deltaTime;
      transform.y += velocity.y * deltaTime;
    }
  }
}

export class AnimationSystem {
  private engine: GameEngine;

  constructor(engine: GameEngine) {
    this.engine = engine;
  }

  /**
   * Update entities with sprite animations
   */
  public update(deltaTime: number): void {
    const entities = this.engine.entityManager.getEntitiesWithComponents([
      'transform',
      'sprite',
      'animation',
    ]);

    for (const entity of entities) {
      const sprite = this.engine.entityManager.getComponent(
        entity.id,
        'sprite'
      ) as unknown as Sprite;
      const animation = this.engine.entityManager.getComponent(
        entity.id,
        'animation'
      ) as unknown as SpriteAnimation;

      if (!sprite || !animation) continue;

      // Update animation
      animation.currentTime += deltaTime;

      if (animation.currentTime >= animation.frameTime) {
        animation.currentFrame++;
        animation.currentTime = 0;

        if (animation.currentFrame >= animation.frames.length) {
          if (animation.loop) {
            animation.currentFrame = 0;
          } else {
            animation.currentFrame = animation.frames.length - 1;
            // Emit animation complete event via event emitter pattern
            // Since GameEngine doesn't have emit, we could emit through the animation manager
            // For now, just console.log
            console.log(
              'Animation complete:',
              animation.name,
              'for entity:',
              entity.id
            );
          }
        }
      }

      // Update sprite source rectangle
      const frame = animation.frames[animation.currentFrame];
      if (frame) {
        sprite.sourceX = frame.x;
        sprite.sourceY = frame.y;
        sprite.sourceWidth = frame.width;
        sprite.sourceHeight = frame.height;
      }
    }
  }
}

export interface SpriteAnimationFrame {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SpriteAnimation {
  name: string;
  frames: SpriteAnimationFrame[];
  frameTime: number; // Time per frame in seconds
  currentFrame: number;
  currentTime: number;
  loop: boolean;
}

export class PhysicsSystem {
  private engine: GameEngine;

  constructor(engine: GameEngine) {
    this.engine = engine;
  }

  /**
   * Update entities with physics bodies
   */
  public update(deltaTime: number): void {
    const entities = this.engine.entityManager.getEntitiesWithComponents([
      'transform',
      'rigidbody',
    ]);

    for (const entity of entities) {
      const transform = this.engine.entityManager.getComponent(
        entity.id,
        'transform'
      ) as unknown as Transform;
      const body = this.engine.entityManager.getComponent(
        entity.id,
        'rigidbody'
      ) as any;

      if (!transform || !body) continue;

      // For now, skip physics body update since the method doesn't exist
      // this.engine.physics.updateBodyPosition(body.id, transform.x, transform.y);
    }

    // Update physics world
    this.engine.physics.update(deltaTime);

    // Update transform positions from physics bodies
    for (const entity of entities) {
      const transform = this.engine.entityManager.getComponent(
        entity.id,
        'transform'
      ) as unknown as Transform;
      const body = this.engine.entityManager.getComponent(
        entity.id,
        'rigidbody'
      ) as any;

      if (!transform || !body) continue;

      // Get updated position from physics body
      const physicsBody = this.engine.physics.getBody(body.id);
      if (physicsBody) {
        // For now, skip position updates since the physics body structure is different
        // transform.x = physicsBody.x;
        // transform.y = physicsBody.y;
      }
    }
  }
}
