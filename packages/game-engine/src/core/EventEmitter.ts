/**
 * EventEmitter - Base class for event-driven architecture
 */

export interface EventListener {
  (event: any): void;
}

export class EventEmitter {
  private events: Map<string, EventListener[]> = new Map();

  /**
   * Add an event listener
   */
  public on(event: string, listener: EventListener): void {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(listener);
  }

  /**
   * Add a one-time event listener
   */
  public once(event: string, listener: EventListener): void {
    const onceListener = (data: any) => {
      listener(data);
      this.off(event, onceListener);
    };
    this.on(event, onceListener);
  }

  /**
   * Remove an event listener
   */
  public off(event: string, listener: EventListener): void {
    const listeners = this.events.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Emit an event
   */
  public emit(event: string, data?: any): void {
    const listeners = this.events.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error in event listener for '${event}':`, error);
        }
      });
    }
  }

  /**
   * Remove all listeners for an event
   */
  public removeAllListeners(event?: string): void {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
  }

  /**
   * Get listener count for an event
   */
  public listenerCount(event: string): number {
    const listeners = this.events.get(event);
    return listeners ? listeners.length : 0;
  }

  /**
   * Get all event names
   */
  public eventNames(): string[] {
    return Array.from(this.events.keys());
  }
}
