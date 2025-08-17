/**
 * Input Manager - Cross-platform input handling
 */

import { EventEmitter } from './EventEmitter';

export interface InputState {
  mouse: {
    x: number;
    y: number;
    buttons: Set<number>;
    wheel: { deltaX: number; deltaY: number };
  };
  touch: {
    touches: Map<
      number,
      { x: number; y: number; startX: number; startY: number }
    >;
    active: boolean;
  };
  keyboard: {
    keys: Set<string>;
    modifiers: {
      shift: boolean;
      ctrl: boolean;
      alt: boolean;
      meta: boolean;
    };
  };
}

export interface InputEvent {
  type: 'mouse' | 'touch' | 'keyboard';
  action: 'down' | 'up' | 'move' | 'wheel';
  data: any;
  timestamp: number;
  preventDefault?: () => void;
}

export class InputManager extends EventEmitter {
  private canvas: HTMLCanvasElement;
  private state: InputState;
  private enabled = true;
  private eventQueue: InputEvent[] = [];

  // Touch gesture detection
  private gestureThreshold = 10; // pixels
  private longPressDelay = 500; // ms
  private longPressTimers: Map<number, number> = new Map();

  constructor(canvas: HTMLCanvasElement) {
    super();
    this.canvas = canvas;

    this.state = {
      mouse: {
        x: 0,
        y: 0,
        buttons: new Set(),
        wheel: { deltaX: 0, deltaY: 0 },
      },
      touch: {
        touches: new Map(),
        active: false,
      },
      keyboard: {
        keys: new Set(),
        modifiers: { shift: false, ctrl: false, alt: false, meta: false },
      },
    };

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Mouse events
    this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.canvas.addEventListener('wheel', this.handleWheel.bind(this));
    this.canvas.addEventListener('contextmenu', e => e.preventDefault());

    // Touch events
    this.canvas.addEventListener(
      'touchstart',
      this.handleTouchStart.bind(this)
    );
    this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this));
    this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this));
    this.canvas.addEventListener(
      'touchcancel',
      this.handleTouchCancel.bind(this)
    );

    // Keyboard events (on window to capture when canvas doesn't have focus)
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('keyup', this.handleKeyUp.bind(this));

    // Focus events
    this.canvas.addEventListener('focus', this.handleFocus.bind(this));
    this.canvas.addEventListener('blur', this.handleBlur.bind(this));

    // Make canvas focusable
    this.canvas.tabIndex = 0;
  }

  private getCanvasCoordinates(
    clientX: number,
    clientY: number
  ): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }

  // Mouse event handlers
  private handleMouseDown(event: MouseEvent): void {
    if (!this.enabled) return;

    const coords = this.getCanvasCoordinates(event.clientX, event.clientY);
    this.state.mouse.x = coords.x;
    this.state.mouse.y = coords.y;
    this.state.mouse.buttons.add(event.button);

    this.queueEvent({
      type: 'mouse',
      action: 'down',
      data: { button: event.button, x: coords.x, y: coords.y },
      timestamp: performance.now(),
      preventDefault: () => event.preventDefault(),
    });
  }

  private handleMouseUp(event: MouseEvent): void {
    if (!this.enabled) return;

    const coords = this.getCanvasCoordinates(event.clientX, event.clientY);
    this.state.mouse.x = coords.x;
    this.state.mouse.y = coords.y;
    this.state.mouse.buttons.delete(event.button);

    this.queueEvent({
      type: 'mouse',
      action: 'up',
      data: { button: event.button, x: coords.x, y: coords.y },
      timestamp: performance.now(),
      preventDefault: () => event.preventDefault(),
    });
  }

  private handleMouseMove(event: MouseEvent): void {
    if (!this.enabled) return;

    const coords = this.getCanvasCoordinates(event.clientX, event.clientY);
    const deltaX = coords.x - this.state.mouse.x;
    const deltaY = coords.y - this.state.mouse.y;

    this.state.mouse.x = coords.x;
    this.state.mouse.y = coords.y;

    this.queueEvent({
      type: 'mouse',
      action: 'move',
      data: { x: coords.x, y: coords.y, deltaX, deltaY },
      timestamp: performance.now(),
      preventDefault: () => event.preventDefault(),
    });
  }

  private handleWheel(event: WheelEvent): void {
    if (!this.enabled) return;

    this.state.mouse.wheel.deltaX = event.deltaX;
    this.state.mouse.wheel.deltaY = event.deltaY;

    this.queueEvent({
      type: 'mouse',
      action: 'wheel',
      data: { deltaX: event.deltaX, deltaY: event.deltaY },
      timestamp: performance.now(),
      preventDefault: () => event.preventDefault(),
    });

    event.preventDefault();
  }

  // Touch event handlers
  private handleTouchStart(event: TouchEvent): void {
    if (!this.enabled) return;

    this.state.touch.active = true;

    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];
      const coords = this.getCanvasCoordinates(touch.clientX, touch.clientY);

      this.state.touch.touches.set(touch.identifier, {
        x: coords.x,
        y: coords.y,
        startX: coords.x,
        startY: coords.y,
      });

      // Start long press timer
      const longPressTimer = window.setTimeout(() => {
        this.queueEvent({
          type: 'touch',
          action: 'down',
          data: {
            id: touch.identifier,
            x: coords.x,
            y: coords.y,
            gesture: 'long-press',
          },
          timestamp: performance.now(),
        });
      }, this.longPressDelay);

      this.longPressTimers.set(touch.identifier, longPressTimer);

      this.queueEvent({
        type: 'touch',
        action: 'down',
        data: { id: touch.identifier, x: coords.x, y: coords.y },
        timestamp: performance.now(),
        preventDefault: () => event.preventDefault(),
      });
    }

    event.preventDefault();
  }

  private handleTouchEnd(event: TouchEvent): void {
    if (!this.enabled) return;

    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];
      const touchData = this.state.touch.touches.get(touch.identifier);

      if (touchData) {
        const coords = this.getCanvasCoordinates(touch.clientX, touch.clientY);

        // Clear long press timer
        const timer = this.longPressTimers.get(touch.identifier);
        if (timer) {
          clearTimeout(timer);
          this.longPressTimers.delete(touch.identifier);
        }

        // Detect tap gesture
        const distance = Math.sqrt(
          Math.pow(coords.x - touchData.startX, 2) +
            Math.pow(coords.y - touchData.startY, 2)
        );

        let gesture = 'touch';
        if (distance < this.gestureThreshold) {
          gesture = 'tap';
        }

        this.queueEvent({
          type: 'touch',
          action: 'up',
          data: {
            id: touch.identifier,
            x: coords.x,
            y: coords.y,
            gesture,
            startX: touchData.startX,
            startY: touchData.startY,
          },
          timestamp: performance.now(),
          preventDefault: () => event.preventDefault(),
        });

        this.state.touch.touches.delete(touch.identifier);
      }
    }

    if (this.state.touch.touches.size === 0) {
      this.state.touch.active = false;
    }

    event.preventDefault();
  }

  private handleTouchMove(event: TouchEvent): void {
    if (!this.enabled) return;

    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];
      const touchData = this.state.touch.touches.get(touch.identifier);

      if (touchData) {
        const coords = this.getCanvasCoordinates(touch.clientX, touch.clientY);
        const deltaX = coords.x - touchData.x;
        const deltaY = coords.y - touchData.y;

        // Update touch position
        touchData.x = coords.x;
        touchData.y = coords.y;

        // Cancel long press if touch moved too much
        const distance = Math.sqrt(
          Math.pow(coords.x - touchData.startX, 2) +
            Math.pow(coords.y - touchData.startY, 2)
        );

        if (distance > this.gestureThreshold) {
          const timer = this.longPressTimers.get(touch.identifier);
          if (timer) {
            clearTimeout(timer);
            this.longPressTimers.delete(touch.identifier);
          }
        }

        this.queueEvent({
          type: 'touch',
          action: 'move',
          data: {
            id: touch.identifier,
            x: coords.x,
            y: coords.y,
            deltaX,
            deltaY,
            startX: touchData.startX,
            startY: touchData.startY,
          },
          timestamp: performance.now(),
          preventDefault: () => event.preventDefault(),
        });
      }
    }

    event.preventDefault();
  }

  private handleTouchCancel(event: TouchEvent): void {
    if (!this.enabled) return;

    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];

      // Clear long press timer
      const timer = this.longPressTimers.get(touch.identifier);
      if (timer) {
        clearTimeout(timer);
        this.longPressTimers.delete(touch.identifier);
      }

      this.state.touch.touches.delete(touch.identifier);
    }

    if (this.state.touch.touches.size === 0) {
      this.state.touch.active = false;
    }
  }

  // Keyboard event handlers
  private handleKeyDown(event: KeyboardEvent): void {
    if (!this.enabled) return;

    this.state.keyboard.keys.add(event.code);
    this.updateModifiers(event);

    this.queueEvent({
      type: 'keyboard',
      action: 'down',
      data: {
        key: event.key,
        code: event.code,
        modifiers: { ...this.state.keyboard.modifiers },
      },
      timestamp: performance.now(),
      preventDefault: () => event.preventDefault(),
    });
  }

  private handleKeyUp(event: KeyboardEvent): void {
    if (!this.enabled) return;

    this.state.keyboard.keys.delete(event.code);
    this.updateModifiers(event);

    this.queueEvent({
      type: 'keyboard',
      action: 'up',
      data: {
        key: event.key,
        code: event.code,
        modifiers: { ...this.state.keyboard.modifiers },
      },
      timestamp: performance.now(),
      preventDefault: () => event.preventDefault(),
    });
  }

  private updateModifiers(event: KeyboardEvent): void {
    this.state.keyboard.modifiers.shift = event.shiftKey;
    this.state.keyboard.modifiers.ctrl = event.ctrlKey;
    this.state.keyboard.modifiers.alt = event.altKey;
    this.state.keyboard.modifiers.meta = event.metaKey;
  }

  private handleFocus(): void {
    this.enabled = true;
    this.emit('focus');
  }

  private handleBlur(): void {
    // Clear all input states when losing focus
    this.state.mouse.buttons.clear();
    this.state.keyboard.keys.clear();
    this.state.touch.touches.clear();
    this.state.touch.active = false;

    // Clear long press timers
    for (const timer of this.longPressTimers.values()) {
      clearTimeout(timer);
    }
    this.longPressTimers.clear();

    this.emit('blur');
  }

  private queueEvent(event: InputEvent): void {
    this.eventQueue.push(event);
  }

  /**
   * Update input manager and process events
   */
  public update(deltaTime: number): void {
    // Process queued events
    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift()!;
      this.emit('input', event);
      this.emit(event.type, event);
    }

    // Reset wheel delta
    this.state.mouse.wheel.deltaX = 0;
    this.state.mouse.wheel.deltaY = 0;
  }

  /**
   * Get current input state
   */
  public getState(): InputState {
    return this.state;
  }

  /**
   * Check if a key is pressed
   */
  public isKeyPressed(keyCode: string): boolean {
    return this.state.keyboard.keys.has(keyCode);
  }

  /**
   * Check if a mouse button is pressed
   */
  public isMouseButtonPressed(button: number): boolean {
    return this.state.mouse.buttons.has(button);
  }

  /**
   * Get mouse position
   */
  public getMousePosition(): { x: number; y: number } {
    return { x: this.state.mouse.x, y: this.state.mouse.y };
  }

  /**
   * Get touch positions
   */
  public getTouchPositions(): Array<{ id: number; x: number; y: number }> {
    return Array.from(this.state.touch.touches.entries()).map(
      ([id, touch]) => ({
        id,
        x: touch.x,
        y: touch.y,
      })
    );
  }

  /**
   * Enable/disable input processing
   */
  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Destroy the input manager
   */
  public destroy(): void {
    // Remove event listeners
    this.canvas.removeEventListener('mousedown', this.handleMouseDown);
    this.canvas.removeEventListener('mouseup', this.handleMouseUp);
    this.canvas.removeEventListener('mousemove', this.handleMouseMove);
    this.canvas.removeEventListener('wheel', this.handleWheel);
    this.canvas.removeEventListener('touchstart', this.handleTouchStart);
    this.canvas.removeEventListener('touchend', this.handleTouchEnd);
    this.canvas.removeEventListener('touchmove', this.handleTouchMove);
    this.canvas.removeEventListener('touchcancel', this.handleTouchCancel);

    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);

    // Clear timers
    for (const timer of this.longPressTimers.values()) {
      clearTimeout(timer);
    }
    this.longPressTimers.clear();

    this.removeAllListeners();
  }
}
