/**
 * Entity-Component-System (ECS) - Entity Manager
 */

export type EntityId = number;

export interface Component {
  type: string;
}

export interface Entity {
  id: EntityId;
  components: Map<string, Component>;
  active: boolean;
  tags: Set<string>;
}

export class EntityManager {
  private entities: Map<EntityId, Entity> = new Map();
  private nextEntityId: EntityId = 1;
  private componentQueries: Map<string, Set<EntityId>> = new Map();

  /**
   * Create a new entity
   */
  public createEntity(tags: string[] = []): Entity {
    const entity: Entity = {
      id: this.nextEntityId++,
      components: new Map(),
      active: true,
      tags: new Set(tags),
    };

    this.entities.set(entity.id, entity);
    return entity;
  }

  /**
   * Destroy an entity
   */
  public destroyEntity(entityId: EntityId): void {
    const entity = this.entities.get(entityId);
    if (entity) {
      // Remove from component queries
      for (const componentType of entity.components.keys()) {
        this.removeFromQuery(componentType, entityId);
      }

      this.entities.delete(entityId);
    }
  }

  /**
   * Get an entity by ID
   */
  public getEntity(entityId: EntityId): Entity | undefined {
    return this.entities.get(entityId);
  }

  /**
   * Add a component to an entity
   */
  public addComponent<T extends Component>(
    entityId: EntityId,
    component: T
  ): void {
    const entity = this.entities.get(entityId);
    if (entity) {
      entity.components.set(component.type, component);
      this.addToQuery(component.type, entityId);
    }
  }

  /**
   * Remove a component from an entity
   */
  public removeComponent(entityId: EntityId, componentType: string): void {
    const entity = this.entities.get(entityId);
    if (entity && entity.components.has(componentType)) {
      entity.components.delete(componentType);
      this.removeFromQuery(componentType, entityId);
    }
  }

  /**
   * Get a component from an entity
   */
  public getComponent<T extends Component>(
    entityId: EntityId,
    componentType: string
  ): T | undefined {
    const entity = this.entities.get(entityId);
    return entity?.components.get(componentType) as T | undefined;
  }

  /**
   * Check if an entity has a component
   */
  public hasComponent(entityId: EntityId, componentType: string): boolean {
    const entity = this.entities.get(entityId);
    return entity ? entity.components.has(componentType) : false;
  }

  /**
   * Get all entities with specific components
   */
  public getEntitiesWithComponents(componentTypes: string[]): Entity[] {
    const entities: Entity[] = [];

    for (const entity of this.entities.values()) {
      if (
        entity.active &&
        componentTypes.every(type => entity.components.has(type))
      ) {
        entities.push(entity);
      }
    }

    return entities;
  }

  /**
   * Get entities by tag
   */
  public getEntitiesByTag(tag: string): Entity[] {
    const entities: Entity[] = [];

    for (const entity of this.entities.values()) {
      if (entity.active && entity.tags.has(tag)) {
        entities.push(entity);
      }
    }

    return entities;
  }

  /**
   * Add a tag to an entity
   */
  public addTag(entityId: EntityId, tag: string): void {
    const entity = this.entities.get(entityId);
    if (entity) {
      entity.tags.add(tag);
    }
  }

  /**
   * Remove a tag from an entity
   */
  public removeTag(entityId: EntityId, tag: string): void {
    const entity = this.entities.get(entityId);
    if (entity) {
      entity.tags.delete(tag);
    }
  }

  /**
   * Set entity active/inactive
   */
  public setEntityActive(entityId: EntityId, active: boolean): void {
    const entity = this.entities.get(entityId);
    if (entity) {
      entity.active = active;
    }
  }

  /**
   * Get all active entities
   */
  public getActiveEntities(): Entity[] {
    return Array.from(this.entities.values()).filter(entity => entity.active);
  }

  /**
   * Get entity count
   */
  public getEntityCount(): number {
    return this.entities.size;
  }

  /**
   * Clear all entities
   */
  public clear(): void {
    this.entities.clear();
    this.componentQueries.clear();
    this.nextEntityId = 1;
  }

  /**
   * Destroy the entity manager
   */
  public destroy(): void {
    this.clear();
  }

  private addToQuery(componentType: string, entityId: EntityId): void {
    if (!this.componentQueries.has(componentType)) {
      this.componentQueries.set(componentType, new Set());
    }
    this.componentQueries.get(componentType)!.add(entityId);
  }

  private removeFromQuery(componentType: string, entityId: EntityId): void {
    const query = this.componentQueries.get(componentType);
    if (query) {
      query.delete(entityId);
    }
  }
}
