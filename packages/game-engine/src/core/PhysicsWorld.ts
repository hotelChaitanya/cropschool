/**
 * Physics World - Basic physics simulation for educational games
 */

import { EventEmitter } from './EventEmitter';

export interface Vector2 {
  x: number;
  y: number;
}

export interface AABB {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Circle {
  x: number;
  y: number;
  radius: number;
}

export interface RigidBody {
  id: string;
  position: Vector2;
  velocity: Vector2;
  acceleration: Vector2;
  mass: number;
  drag: number;
  elasticity: number;
  static: boolean;
  shape: AABB | Circle;
  collisionLayer: number;
  collisionMask: number;
  userData?: any;
}

export interface Collision {
  bodyA: RigidBody;
  bodyB: RigidBody;
  normal: Vector2;
  penetration: number;
  point: Vector2;
}

export class PhysicsWorld extends EventEmitter {
  private bodies: Map<string, RigidBody> = new Map();
  private gravity: Vector2 = { x: 0, y: 0 };
  private worldBounds?: AABB;
  private spatialGrid: Map<string, Set<string>> = new Map();
  private gridSize = 64; // Grid cell size for spatial partitioning

  /**
   * Set world gravity
   */
  public setGravity(x: number, y: number): void {
    this.gravity.x = x;
    this.gravity.y = y;
  }

  /**
   * Set world bounds
   */
  public setWorldBounds(
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    this.worldBounds = { x, y, width, height };
  }

  /**
   * Add a rigid body
   */
  public addBody(body: RigidBody): void {
    this.bodies.set(body.id, body);
    this.updateSpatialGrid(body);
  }

  /**
   * Remove a rigid body
   */
  public removeBody(id: string): void {
    const body = this.bodies.get(id);
    if (body) {
      this.removeFromSpatialGrid(body);
      this.bodies.delete(id);
    }
  }

  /**
   * Get a rigid body
   */
  public getBody(id: string): RigidBody | undefined {
    return this.bodies.get(id);
  }

  /**
   * Update physics simulation
   */
  public update(deltaTime: number): void {
    // Apply forces and integrate
    for (const body of this.bodies.values()) {
      if (!body.static) {
        this.integrateBody(body, deltaTime);
        this.updateSpatialGrid(body);
      }
    }

    // Detect and resolve collisions
    this.detectCollisions();

    // Apply world bounds
    if (this.worldBounds) {
      this.applyWorldBounds();
    }
  }

  private integrateBody(body: RigidBody, deltaTime: number): void {
    // Apply gravity
    if (!body.static && body.mass > 0) {
      body.acceleration.x += this.gravity.x;
      body.acceleration.y += this.gravity.y;
    }

    // Apply drag
    body.velocity.x *= 1 - body.drag * deltaTime;
    body.velocity.y *= 1 - body.drag * deltaTime;

    // Integrate velocity
    body.velocity.x += body.acceleration.x * deltaTime;
    body.velocity.y += body.acceleration.y * deltaTime;

    // Integrate position
    body.position.x += body.velocity.x * deltaTime;
    body.position.y += body.velocity.y * deltaTime;

    // Reset acceleration
    body.acceleration.x = 0;
    body.acceleration.y = 0;
  }

  private detectCollisions(): void {
    const collisions: Collision[] = [];

    // Use spatial grid for broad phase
    const potentialPairs = this.getBroadPhasePairs();

    for (const [bodyA, bodyB] of potentialPairs) {
      // Check collision layers
      if (
        (bodyA.collisionLayer & bodyB.collisionMask) === 0 &&
        (bodyB.collisionLayer & bodyA.collisionMask) === 0
      ) {
        continue;
      }

      const collision = this.checkCollision(bodyA, bodyB);
      if (collision) {
        collisions.push(collision);
        this.emit('collision', collision);
      }
    }

    // Resolve collisions
    for (const collision of collisions) {
      this.resolveCollision(collision);
    }
  }

  private getBroadPhasePairs(): Array<[RigidBody, RigidBody]> {
    const pairs: Array<[RigidBody, RigidBody]> = [];
    const bodiesArray = Array.from(this.bodies.values());

    for (let i = 0; i < bodiesArray.length; i++) {
      for (let j = i + 1; j < bodiesArray.length; j++) {
        const bodyA = bodiesArray[i];
        const bodyB = bodiesArray[j];

        // Skip if both are static
        if (bodyA.static && bodyB.static) continue;

        // Simple AABB broad phase check
        if (this.aabbOverlap(this.getAABB(bodyA), this.getAABB(bodyB))) {
          pairs.push([bodyA, bodyB]);
        }
      }
    }

    return pairs;
  }

  private checkCollision(bodyA: RigidBody, bodyB: RigidBody): Collision | null {
    const shapeA = bodyA.shape;
    const shapeB = bodyB.shape;

    // AABB vs AABB
    if (this.isAABB(shapeA) && this.isAABB(shapeB)) {
      return this.aabbVsAABB(bodyA, bodyB, shapeA, shapeB);
    }

    // Circle vs Circle
    if (this.isCircle(shapeA) && this.isCircle(shapeB)) {
      return this.circleVsCircle(bodyA, bodyB, shapeA, shapeB);
    }

    // AABB vs Circle or Circle vs AABB
    if (
      (this.isAABB(shapeA) && this.isCircle(shapeB)) ||
      (this.isCircle(shapeA) && this.isAABB(shapeB))
    ) {
      return this.aabbVsCircle(bodyA, bodyB);
    }

    return null;
  }

  private aabbVsAABB(
    bodyA: RigidBody,
    bodyB: RigidBody,
    aabbA: AABB,
    aabbB: AABB
  ): Collision | null {
    const posA = bodyA.position;
    const posB = bodyB.position;

    const overlapX =
      Math.min(posA.x + aabbA.width, posB.x + aabbB.width) -
      Math.max(posA.x, posB.x);
    const overlapY =
      Math.min(posA.y + aabbA.height, posB.y + aabbB.height) -
      Math.max(posA.y, posB.y);

    if (overlapX > 0 && overlapY > 0) {
      // Determine collision normal and penetration
      let normal: Vector2;
      let penetration: number;

      if (overlapX < overlapY) {
        penetration = overlapX;
        normal = posA.x < posB.x ? { x: -1, y: 0 } : { x: 1, y: 0 };
      } else {
        penetration = overlapY;
        normal = posA.y < posB.y ? { x: 0, y: -1 } : { x: 0, y: 1 };
      }

      const point = {
        x: Math.max(posA.x, posB.x) + overlapX / 2,
        y: Math.max(posA.y, posB.y) + overlapY / 2,
      };

      return { bodyA, bodyB, normal, penetration, point };
    }

    return null;
  }

  private circleVsCircle(
    bodyA: RigidBody,
    bodyB: RigidBody,
    circleA: Circle,
    circleB: Circle
  ): Collision | null {
    const dx = bodyB.position.x - bodyA.position.x;
    const dy = bodyB.position.y - bodyA.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const radiusSum = circleA.radius + circleB.radius;

    if (distance < radiusSum && distance > 0) {
      const penetration = radiusSum - distance;
      const normal = { x: dx / distance, y: dy / distance };
      const point = {
        x: bodyA.position.x + normal.x * circleA.radius,
        y: bodyA.position.y + normal.y * circleA.radius,
      };

      return { bodyA, bodyB, normal, penetration, point };
    }

    return null;
  }

  private aabbVsCircle(bodyA: RigidBody, bodyB: RigidBody): Collision | null {
    // Simplified AABB vs Circle collision
    // This would need more complex implementation for production use
    const aabbBody = this.isAABB(bodyA.shape) ? bodyA : bodyB;
    const circleBody = this.isCircle(bodyA.shape) ? bodyA : bodyB;

    const aabb = this.getAABB(aabbBody);
    const circle = circleBody.shape as Circle;

    // Find closest point on AABB to circle center
    const closestX = Math.max(
      aabb.x,
      Math.min(circleBody.position.x, aabb.x + aabb.width)
    );
    const closestY = Math.max(
      aabb.y,
      Math.min(circleBody.position.y, aabb.y + aabb.height)
    );

    const dx = circleBody.position.x - closestX;
    const dy = circleBody.position.y - closestY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < circle.radius) {
      const penetration = circle.radius - distance;
      const normal =
        distance > 0 ? { x: dx / distance, y: dy / distance } : { x: 0, y: -1 }; // Default normal

      const point = { x: closestX, y: closestY };

      return {
        bodyA: aabbBody,
        bodyB: circleBody,
        normal: bodyA === aabbBody ? normal : { x: -normal.x, y: -normal.y },
        penetration,
        point,
      };
    }

    return null;
  }

  private resolveCollision(collision: Collision): void {
    const { bodyA, bodyB, normal, penetration } = collision;

    // Separate bodies
    if (!bodyA.static && !bodyB.static) {
      const separation = penetration / 2;
      bodyA.position.x -= normal.x * separation;
      bodyA.position.y -= normal.y * separation;
      bodyB.position.x += normal.x * separation;
      bodyB.position.y += normal.y * separation;
    } else if (!bodyA.static) {
      bodyA.position.x -= normal.x * penetration;
      bodyA.position.y -= normal.y * penetration;
    } else if (!bodyB.static) {
      bodyB.position.x += normal.x * penetration;
      bodyB.position.y += normal.y * penetration;
    }

    // Apply elastic collision response
    if (!bodyA.static || !bodyB.static) {
      const relativeVelocity = {
        x: bodyB.velocity.x - bodyA.velocity.x,
        y: bodyB.velocity.y - bodyA.velocity.y,
      };

      const velAlongNormal =
        relativeVelocity.x * normal.x + relativeVelocity.y * normal.y;

      if (velAlongNormal > 0) return; // Objects separating

      const e = Math.min(bodyA.elasticity, bodyB.elasticity);
      const j = -(1 + e) * velAlongNormal;
      const impulse = j / (1 / bodyA.mass + 1 / bodyB.mass);

      if (!bodyA.static) {
        bodyA.velocity.x -= (impulse * normal.x) / bodyA.mass;
        bodyA.velocity.y -= (impulse * normal.y) / bodyA.mass;
      }

      if (!bodyB.static) {
        bodyB.velocity.x += (impulse * normal.x) / bodyB.mass;
        bodyB.velocity.y += (impulse * normal.y) / bodyB.mass;
      }
    }
  }

  private applyWorldBounds(): void {
    if (!this.worldBounds) return;

    for (const body of this.bodies.values()) {
      if (body.static) continue;

      const bounds = this.getAABB(body);

      // Left/Right bounds
      if (bounds.x < this.worldBounds.x) {
        body.position.x = this.worldBounds.x - (bounds.x - body.position.x);
        body.velocity.x = Math.abs(body.velocity.x) * body.elasticity;
      } else if (
        bounds.x + bounds.width >
        this.worldBounds.x + this.worldBounds.width
      ) {
        body.position.x =
          this.worldBounds.x +
          this.worldBounds.width -
          bounds.width -
          (bounds.x - body.position.x);
        body.velocity.x = -Math.abs(body.velocity.x) * body.elasticity;
      }

      // Top/Bottom bounds
      if (bounds.y < this.worldBounds.y) {
        body.position.y = this.worldBounds.y - (bounds.y - body.position.y);
        body.velocity.y = Math.abs(body.velocity.y) * body.elasticity;
      } else if (
        bounds.y + bounds.height >
        this.worldBounds.y + this.worldBounds.height
      ) {
        body.position.y =
          this.worldBounds.y +
          this.worldBounds.height -
          bounds.height -
          (bounds.y - body.position.y);
        body.velocity.y = -Math.abs(body.velocity.y) * body.elasticity;
      }
    }
  }

  // Utility methods
  private isAABB(shape: AABB | Circle): shape is AABB {
    return 'width' in shape && 'height' in shape;
  }

  private isCircle(shape: AABB | Circle): shape is Circle {
    return 'radius' in shape;
  }

  private getAABB(body: RigidBody): AABB {
    if (this.isAABB(body.shape)) {
      return {
        x: body.position.x + body.shape.x,
        y: body.position.y + body.shape.y,
        width: body.shape.width,
        height: body.shape.height,
      };
    } else {
      const circle = body.shape as Circle;
      return {
        x: body.position.x - circle.radius,
        y: body.position.y - circle.radius,
        width: circle.radius * 2,
        height: circle.radius * 2,
      };
    }
  }

  private aabbOverlap(a: AABB, b: AABB): boolean {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  private updateSpatialGrid(body: RigidBody): void {
    // Simple spatial grid implementation
    const bounds = this.getAABB(body);
    const gridKey = `${Math.floor(bounds.x / this.gridSize)},${Math.floor(bounds.y / this.gridSize)}`;

    if (!this.spatialGrid.has(gridKey)) {
      this.spatialGrid.set(gridKey, new Set());
    }
    this.spatialGrid.get(gridKey)!.add(body.id);
  }

  private removeFromSpatialGrid(body: RigidBody): void {
    for (const [key, bodies] of this.spatialGrid) {
      bodies.delete(body.id);
      if (bodies.size === 0) {
        this.spatialGrid.delete(key);
      }
    }
  }

  /**
   * Apply force to a body
   */
  public applyForce(bodyId: string, forceX: number, forceY: number): void {
    const body = this.bodies.get(bodyId);
    if (body && !body.static && body.mass > 0) {
      body.acceleration.x += forceX / body.mass;
      body.acceleration.y += forceY / body.mass;
    }
  }

  /**
   * Set body velocity
   */
  public setVelocity(
    bodyId: string,
    velocityX: number,
    velocityY: number
  ): void {
    const body = this.bodies.get(bodyId);
    if (body && !body.static) {
      body.velocity.x = velocityX;
      body.velocity.y = velocityY;
    }
  }

  /**
   * Get all bodies
   */
  public getBodies(): RigidBody[] {
    return Array.from(this.bodies.values());
  }

  /**
   * Clear all bodies
   */
  public clear(): void {
    this.bodies.clear();
    this.spatialGrid.clear();
  }

  /**
   * Destroy the physics world
   */
  public destroy(): void {
    this.clear();
    this.removeAllListeners();
  }
}
