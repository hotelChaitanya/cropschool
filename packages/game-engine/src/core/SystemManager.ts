/**
 * System Manager - Manages game systems
 */

import { EventEmitter } from './EventEmitter';
import type { GameEngine } from './Engine';

export interface System {
  name: string;
  priority: number;
  enabled: boolean;

  update(deltaTime: number, engine: GameEngine): void;
  destroy?(): void;
}

export class SystemManager extends EventEmitter {
  private systems: Map<string, System> = new Map();
  private sortedSystems: System[] = [];
  private engine: GameEngine;

  constructor(engine: GameEngine) {
    super();
    this.engine = engine;
  }

  /**
   * Add a system
   */
  public addSystem(system: System): void {
    if (this.systems.has(system.name)) {
      console.warn(`System '${system.name}' already exists`);
      return;
    }

    this.systems.set(system.name, system);
    this.updateSystemOrder();

    this.emit('system-added', system);
  }

  /**
   * Remove a system
   */
  public removeSystem(systemName: string): void {
    const system = this.systems.get(systemName);
    if (system) {
      if (system.destroy) {
        system.destroy();
      }

      this.systems.delete(systemName);
      this.updateSystemOrder();

      this.emit('system-removed', system);
    }
  }

  /**
   * Get a system by name
   */
  public getSystem<T extends System>(systemName: string): T | undefined {
    return this.systems.get(systemName) as T | undefined;
  }

  /**
   * Enable/disable a system
   */
  public setSystemEnabled(systemName: string, enabled: boolean): void {
    const system = this.systems.get(systemName);
    if (system) {
      system.enabled = enabled;
      this.emit('system-toggled', { system, enabled });
    }
  }

  /**
   * Update all systems
   */
  public update(deltaTime: number): void {
    for (const system of this.sortedSystems) {
      if (system.enabled) {
        try {
          system.update(deltaTime, this.engine);
        } catch (error) {
          console.error(`Error updating system '${system.name}':`, error);
          this.emit('system-error', { system, error });
        }
      }
    }
  }

  /**
   * Get system count
   */
  public getSystemCount(): number {
    return this.systems.size;
  }

  /**
   * Get all systems
   */
  public getSystems(): System[] {
    return Array.from(this.systems.values());
  }

  /**
   * Clear all systems
   */
  public clear(): void {
    for (const system of this.systems.values()) {
      if (system.destroy) {
        system.destroy();
      }
    }

    this.systems.clear();
    this.sortedSystems = [];
  }

  /**
   * Destroy the system manager
   */
  public destroy(): void {
    this.clear();
    this.removeAllListeners();
  }

  private updateSystemOrder(): void {
    this.sortedSystems = Array.from(this.systems.values()).sort(
      (a, b) => a.priority - b.priority
    );
  }
}
