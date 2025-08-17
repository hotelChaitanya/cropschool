/**
 * Animation Manager - Animation system with easing functions
 */

import { EventEmitter } from './EventEmitter';

export type EasingFunction = (t: number) => number;

// Easing functions
export const Easing = {
  linear: (t: number) => t,

  // Quadratic
  easeInQuad: (t: number) => t * t,
  easeOutQuad: (t: number) => t * (2 - t),
  easeInOutQuad: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),

  // Cubic
  easeInCubic: (t: number) => t * t * t,
  easeOutCubic: (t: number) => --t * t * t + 1,
  easeInOutCubic: (t: number) =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,

  // Quartic
  easeInQuart: (t: number) => t * t * t * t,
  easeOutQuart: (t: number) => 1 - --t * t * t * t,
  easeInOutQuart: (t: number) =>
    t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t,

  // Elastic
  easeInElastic: (t: number) =>
    Math.sin(((13 * Math.PI) / 2) * t) * Math.pow(2, 10 * (t - 1)),
  easeOutElastic: (t: number) =>
    Math.sin(((-13 * Math.PI) / 2) * (t + 1)) * Math.pow(2, -10 * t) + 1,

  // Bounce
  easeOutBounce: (t: number) => {
    if (t < 1 / 2.75) {
      return 7.5625 * t * t;
    } else if (t < 2 / 2.75) {
      return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
    } else if (t < 2.5 / 2.75) {
      return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
    } else {
      return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
    }
  },

  // Back
  easeInBack: (t: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return c3 * t * t * t - c1 * t * t;
  },
  easeOutBack: (t: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
};

export interface AnimationOptions {
  duration: number;
  easing?: EasingFunction;
  delay?: number;
  repeat?: number; // -1 for infinite
  yoyo?: boolean;
  onStart?: () => void;
  onUpdate?: (value: any) => void;
  onComplete?: () => void;
  onRepeat?: () => void;
}

export interface Animation {
  id: string;
  target: any;
  properties: Record<string, { from: number; to: number; current: number }>;
  options: AnimationOptions;
  startTime: number;
  currentTime: number;
  isPlaying: boolean;
  isPaused: boolean;
  repeatCount: number;
  isYoyoReverse: boolean;
}

export interface Tween {
  id: string;
  from: number;
  to: number;
  duration: number;
  easing: EasingFunction;
  delay: number;
  startTime: number;
  onUpdate: (value: number) => void;
  onComplete?: () => void;
}

export class AnimationManager extends EventEmitter {
  private animations: Map<string, Animation> = new Map();
  private tweens: Map<string, Tween> = new Map();
  private nextId = 1;

  /**
   * Create an animation for an object
   */
  public animate(
    target: any,
    properties: Record<string, number>,
    options: AnimationOptions
  ): string {
    const id = `anim_${this.nextId++}`;

    // Store initial values
    const animProperties: Record<
      string,
      { from: number; to: number; current: number }
    > = {};

    for (const [key, toValue] of Object.entries(properties)) {
      const fromValue = target[key] || 0;
      animProperties[key] = {
        from: fromValue,
        to: toValue,
        current: fromValue,
      };
    }

    const animation: Animation = {
      id,
      target,
      properties: animProperties,
      options: {
        easing: Easing.easeOutQuad,
        delay: 0,
        repeat: 0,
        yoyo: false,
        ...options,
      },
      startTime: performance.now() + (options.delay || 0),
      currentTime: 0,
      isPlaying: true,
      isPaused: false,
      repeatCount: 0,
      isYoyoReverse: false,
    };

    this.animations.set(id, animation);

    if (animation.options.onStart) {
      animation.options.onStart();
    }

    this.emit('animation-started', animation);
    return id;
  }

  /**
   * Create a simple tween
   */
  public tween(
    from: number,
    to: number,
    duration: number,
    onUpdate: (value: number) => void,
    options: {
      easing?: EasingFunction;
      delay?: number;
      onComplete?: () => void;
    } = {}
  ): string {
    const id = `tween_${this.nextId++}`;

    const tween: Tween = {
      id,
      from,
      to,
      duration,
      easing: options.easing || Easing.easeOutQuad,
      delay: options.delay || 0,
      startTime: performance.now() + (options.delay || 0),
      onUpdate,
      onComplete: options.onComplete,
    };

    this.tweens.set(id, tween);
    return id;
  }

  /**
   * Update all animations
   */
  public update(deltaTime: number): void {
    const currentTime = performance.now();

    // Update animations
    for (const animation of this.animations.values()) {
      if (animation.isPlaying && !animation.isPaused) {
        this.updateAnimation(animation, currentTime);
      }
    }

    // Update tweens
    for (const tween of this.tweens.values()) {
      this.updateTween(tween, currentTime);
    }
  }

  private updateAnimation(animation: Animation, currentTime: number): void {
    if (currentTime < animation.startTime) return;

    const elapsed = currentTime - animation.startTime;
    let progress = Math.min(elapsed / animation.options.duration, 1);

    // Apply easing
    const easedProgress = animation.options.easing!(progress);

    // Update properties
    for (const [key, prop] of Object.entries(animation.properties)) {
      if (animation.isYoyoReverse) {
        prop.current = prop.to + (prop.from - prop.to) * easedProgress;
      } else {
        prop.current = prop.from + (prop.to - prop.from) * easedProgress;
      }

      animation.target[key] = prop.current;
    }

    // Call update callback
    if (animation.options.onUpdate) {
      animation.options.onUpdate(animation.target);
    }

    // Check if animation is complete
    if (progress >= 1) {
      this.handleAnimationComplete(animation);
    }
  }

  private updateTween(tween: Tween, currentTime: number): void {
    if (currentTime < tween.startTime) return;

    const elapsed = currentTime - tween.startTime;
    const progress = Math.min(elapsed / tween.duration, 1);

    // Apply easing
    const easedProgress = tween.easing(progress);
    const value = tween.from + (tween.to - tween.from) * easedProgress;

    tween.onUpdate(value);

    // Check if tween is complete
    if (progress >= 1) {
      if (tween.onComplete) {
        tween.onComplete();
      }
      this.tweens.delete(tween.id);
    }
  }

  private handleAnimationComplete(animation: Animation): void {
    // Handle repeat
    if (
      animation.options.repeat !== undefined &&
      animation.options.repeat !== 0
    ) {
      animation.repeatCount++;

      if (
        animation.options.repeat === -1 ||
        animation.repeatCount < animation.options.repeat
      ) {
        // Reset animation
        animation.startTime = performance.now();

        // Handle yoyo
        if (animation.options.yoyo) {
          animation.isYoyoReverse = !animation.isYoyoReverse;
        } else {
          // Reset properties to start values
          for (const prop of Object.values(animation.properties)) {
            prop.current = prop.from;
          }
        }

        if (animation.options.onRepeat) {
          animation.options.onRepeat();
        }

        return;
      }
    }

    // Animation finished
    animation.isPlaying = false;

    if (animation.options.onComplete) {
      animation.options.onComplete();
    }

    this.emit('animation-complete', animation);
    this.animations.delete(animation.id);
  }

  /**
   * Pause an animation
   */
  public pause(id: string): void {
    const animation = this.animations.get(id);
    if (animation) {
      animation.isPaused = true;
      this.emit('animation-paused', animation);
    }
  }

  /**
   * Resume an animation
   */
  public resume(id: string): void {
    const animation = this.animations.get(id);
    if (animation) {
      animation.isPaused = false;
      // Adjust start time to account for pause duration
      animation.startTime = performance.now() - animation.currentTime;
      this.emit('animation-resumed', animation);
    }
  }

  /**
   * Stop an animation
   */
  public stop(id: string): void {
    const animation = this.animations.get(id);
    if (animation) {
      animation.isPlaying = false;
      this.emit('animation-stopped', animation);
      this.animations.delete(id);
    }

    // Also check tweens
    if (this.tweens.has(id)) {
      this.tweens.delete(id);
    }
  }

  /**
   * Stop all animations on a target
   */
  public stopTarget(target: any): void {
    for (const [id, animation] of this.animations) {
      if (animation.target === target) {
        this.stop(id);
      }
    }
  }

  /**
   * Stop all animations
   */
  public stopAll(): void {
    for (const id of this.animations.keys()) {
      this.stop(id);
    }
    this.tweens.clear();
  }

  /**
   * Check if an animation is playing
   */
  public isPlaying(id: string): boolean {
    const animation = this.animations.get(id);
    return animation ? animation.isPlaying && !animation.isPaused : false;
  }

  /**
   * Get animation progress (0-1)
   */
  public getProgress(id: string): number {
    const animation = this.animations.get(id);
    if (!animation) return 0;

    const elapsed = performance.now() - animation.startTime;
    return Math.min(elapsed / animation.options.duration, 1);
  }

  /**
   * Create a sequence of animations
   */
  public sequence(
    animations: Array<{
      target: any;
      properties: Record<string, number>;
      options: AnimationOptions;
    }>
  ): Promise<void> {
    return new Promise(resolve => {
      let currentIndex = 0;

      const playNext = () => {
        if (currentIndex >= animations.length) {
          resolve();
          return;
        }

        const anim = animations[currentIndex];
        const animOptions = {
          ...anim.options,
          onComplete: () => {
            if (anim.options.onComplete) {
              anim.options.onComplete();
            }
            currentIndex++;
            playNext();
          },
        };

        this.animate(anim.target, anim.properties, animOptions);
      };

      playNext();
    });
  }

  /**
   * Create parallel animations
   */
  public parallel(
    animations: Array<{
      target: any;
      properties: Record<string, number>;
      options: AnimationOptions;
    }>
  ): Promise<void> {
    const promises = animations.map(
      anim =>
        new Promise<void>(resolve => {
          const animOptions = {
            ...anim.options,
            onComplete: () => {
              if (anim.options.onComplete) {
                anim.options.onComplete();
              }
              resolve();
            },
          };
          this.animate(anim.target, anim.properties, animOptions);
        })
    );

    return Promise.all(promises).then(() => {});
  }

  /**
   * Get active animation count
   */
  public getActiveCount(): number {
    return this.animations.size + this.tweens.size;
  }

  /**
   * Destroy the animation manager
   */
  public destroy(): void {
    this.stopAll();
    this.removeAllListeners();
  }
}
