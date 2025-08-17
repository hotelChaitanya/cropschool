/**
 * Canvas Renderer - 2D rendering with optimizations
 */

import type { EngineConfig } from './Engine';

export interface RenderOptions {
  alpha?: number;
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
  offsetX?: number;
  offsetY?: number;
  flipX?: boolean;
  flipY?: boolean;
}

export interface Camera {
  x: number;
  y: number;
  zoom: number;
  rotation: number;
}

export class CanvasRenderer {
  private ctx: CanvasRenderingContext2D | WebGLRenderingContext;
  private config: EngineConfig;
  private camera: Camera;
  private transformStack: number = 0;

  // Performance optimization
  private imageSmoothing = true;
  private pixelRatio: number;

  constructor(
    ctx: CanvasRenderingContext2D | WebGLRenderingContext,
    config: EngineConfig
  ) {
    this.ctx = ctx;
    this.config = config;
    this.pixelRatio = window.devicePixelRatio || 1;

    this.camera = {
      x: 0,
      y: 0,
      zoom: 1,
      rotation: 0,
    };

    this.setupCanvas();
  }

  private setupCanvas(): void {
    if (this.ctx instanceof CanvasRenderingContext2D) {
      // Set up 2D context
      this.ctx.imageSmoothingEnabled = this.imageSmoothing;
      this.ctx.textBaseline = 'top';
    }
  }

  /**
   * Clear the canvas
   */
  public clear(color?: string): void {
    if (this.ctx instanceof CanvasRenderingContext2D) {
      if (color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(0, 0, this.config.width, this.config.height);
      } else {
        this.ctx.clearRect(0, 0, this.config.width, this.config.height);
      }
    }
  }

  /**
   * Save the current transform state
   */
  public save(): void {
    if (this.ctx instanceof CanvasRenderingContext2D) {
      this.ctx.save();
      this.transformStack++;
    }
  }

  /**
   * Restore the previous transform state
   */
  public restore(): void {
    if (
      this.ctx instanceof CanvasRenderingContext2D &&
      this.transformStack > 0
    ) {
      this.ctx.restore();
      this.transformStack--;
    }
  }

  /**
   * Apply camera transform
   */
  public applyCameraTransform(): void {
    if (this.ctx instanceof CanvasRenderingContext2D) {
      this.save();

      // Apply camera zoom and rotation
      this.ctx.translate(this.config.width / 2, this.config.height / 2);
      this.ctx.scale(this.camera.zoom, this.camera.zoom);
      this.ctx.rotate(this.camera.rotation);
      this.ctx.translate(-this.camera.x, -this.camera.y);
    }
  }

  /**
   * Draw an image
   */
  public drawImage(
    image: HTMLImageElement | HTMLCanvasElement,
    x: number,
    y: number,
    width?: number,
    height?: number,
    options: RenderOptions = {}
  ): void {
    if (!(this.ctx instanceof CanvasRenderingContext2D)) return;

    this.save();

    const drawWidth = width || image.width;
    const drawHeight = height || image.height;

    // Apply transformations
    this.ctx.translate(x + (options.offsetX || 0), y + (options.offsetY || 0));

    if (options.rotation) {
      this.ctx.translate(drawWidth / 2, drawHeight / 2);
      this.ctx.rotate(options.rotation);
      this.ctx.translate(-drawWidth / 2, -drawHeight / 2);
    }

    if (options.scaleX !== undefined || options.scaleY !== undefined) {
      const scaleX = (options.scaleX ?? 1) * (options.flipX ? -1 : 1);
      const scaleY = (options.scaleY ?? 1) * (options.flipY ? -1 : 1);
      this.ctx.scale(scaleX, scaleY);
    }

    if (options.alpha !== undefined) {
      this.ctx.globalAlpha = options.alpha;
    }

    this.ctx.drawImage(image, 0, 0, drawWidth, drawHeight);

    this.restore();
  }

  /**
   * Draw a sprite from a sprite sheet
   */
  public drawSprite(
    spriteSheet: HTMLImageElement,
    sourceX: number,
    sourceY: number,
    sourceWidth: number,
    sourceHeight: number,
    destX: number,
    destY: number,
    destWidth?: number,
    destHeight?: number,
    options: RenderOptions = {}
  ): void {
    if (!(this.ctx instanceof CanvasRenderingContext2D)) return;

    this.save();

    const drawWidth = destWidth || sourceWidth;
    const drawHeight = destHeight || sourceHeight;

    // Apply transformations
    this.ctx.translate(
      destX + (options.offsetX || 0),
      destY + (options.offsetY || 0)
    );

    if (options.rotation) {
      this.ctx.translate(drawWidth / 2, drawHeight / 2);
      this.ctx.rotate(options.rotation);
      this.ctx.translate(-drawWidth / 2, -drawHeight / 2);
    }

    if (options.scaleX !== undefined || options.scaleY !== undefined) {
      const scaleX = (options.scaleX ?? 1) * (options.flipX ? -1 : 1);
      const scaleY = (options.scaleY ?? 1) * (options.flipY ? -1 : 1);
      this.ctx.scale(scaleX, scaleY);
    }

    if (options.alpha !== undefined) {
      this.ctx.globalAlpha = options.alpha;
    }

    this.ctx.drawImage(
      spriteSheet,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      drawWidth,
      drawHeight
    );

    this.restore();
  }

  /**
   * Draw a rectangle
   */
  public drawRect(
    x: number,
    y: number,
    width: number,
    height: number,
    color: string,
    filled = true
  ): void {
    if (!(this.ctx instanceof CanvasRenderingContext2D)) return;

    if (filled) {
      this.ctx.fillStyle = color;
      this.ctx.fillRect(x, y, width, height);
    } else {
      this.ctx.strokeStyle = color;
      this.ctx.strokeRect(x, y, width, height);
    }
  }

  /**
   * Draw a circle
   */
  public drawCircle(
    x: number,
    y: number,
    radius: number,
    color: string,
    filled = true
  ): void {
    if (!(this.ctx instanceof CanvasRenderingContext2D)) return;

    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);

    if (filled) {
      this.ctx.fillStyle = color;
      this.ctx.fill();
    } else {
      this.ctx.strokeStyle = color;
      this.ctx.stroke();
    }
  }

  /**
   * Draw text
   */
  public drawText(
    text: string,
    x: number,
    y: number,
    font: string,
    color: string,
    align: CanvasTextAlign = 'left'
  ): void {
    if (!(this.ctx instanceof CanvasRenderingContext2D)) return;

    this.ctx.font = font;
    this.ctx.fillStyle = color;
    this.ctx.textAlign = align;
    this.ctx.fillText(text, x, y);
  }

  /**
   * Draw a line
   */
  public drawLine(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: string,
    width = 1
  ): void {
    if (!(this.ctx instanceof CanvasRenderingContext2D)) return;

    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = width;
    this.ctx.stroke();
  }

  /**
   * Draw a polygon
   */
  public drawPolygon(
    points: Array<{ x: number; y: number }>,
    color: string,
    filled = true
  ): void {
    if (!(this.ctx instanceof CanvasRenderingContext2D) || points.length < 3)
      return;

    this.ctx.beginPath();
    this.ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length; i++) {
      this.ctx.lineTo(points[i].x, points[i].y);
    }

    this.ctx.closePath();

    if (filled) {
      this.ctx.fillStyle = color;
      this.ctx.fill();
    } else {
      this.ctx.strokeStyle = color;
      this.ctx.stroke();
    }
  }

  /**
   * Set camera position
   */
  public setCameraPosition(x: number, y: number): void {
    this.camera.x = x;
    this.camera.y = y;
  }

  /**
   * Set camera zoom
   */
  public setCameraZoom(zoom: number): void {
    this.camera.zoom = Math.max(0.1, zoom);
  }

  /**
   * Set camera rotation
   */
  public setCameraRotation(rotation: number): void {
    this.camera.rotation = rotation;
  }

  /**
   * Move camera by offset
   */
  public moveCamera(deltaX: number, deltaY: number): void {
    this.camera.x += deltaX;
    this.camera.y += deltaY;
  }

  /**
   * Get camera position
   */
  public getCameraPosition(): { x: number; y: number } {
    return { x: this.camera.x, y: this.camera.y };
  }

  /**
   * Convert screen coordinates to world coordinates
   */
  public screenToWorld(
    screenX: number,
    screenY: number
  ): { x: number; y: number } {
    const x =
      (screenX - this.config.width / 2) / this.camera.zoom + this.camera.x;
    const y =
      (screenY - this.config.height / 2) / this.camera.zoom + this.camera.y;
    return { x, y };
  }

  /**
   * Convert world coordinates to screen coordinates
   */
  public worldToScreen(
    worldX: number,
    worldY: number
  ): { x: number; y: number } {
    const x =
      (worldX - this.camera.x) * this.camera.zoom + this.config.width / 2;
    const y =
      (worldY - this.camera.y) * this.camera.zoom + this.config.height / 2;
    return { x, y };
  }

  /**
   * Check if a point is visible on screen
   */
  public isVisible(x: number, y: number, width = 0, height = 0): boolean {
    const screenPos = this.worldToScreen(x, y);

    return (
      screenPos.x + width >= 0 &&
      screenPos.y + height >= 0 &&
      screenPos.x <= this.config.width &&
      screenPos.y <= this.config.height
    );
  }

  /**
   * Set image smoothing
   */
  public setImageSmoothing(enabled: boolean): void {
    if (this.ctx instanceof CanvasRenderingContext2D) {
      this.imageSmoothing = enabled;
      this.ctx.imageSmoothingEnabled = enabled;
    }
  }

  /**
   * Handle canvas resize
   */
  public handleResize(width: number, height: number): void {
    this.config.width = width;
    this.config.height = height;
  }

  /**
   * Create a render target (off-screen canvas)
   */
  public createRenderTarget(width: number, height: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }

  /**
   * Get canvas context
   */
  public getContext(): CanvasRenderingContext2D | WebGLRenderingContext {
    return this.ctx;
  }

  /**
   * Reset all transforms
   */
  public resetTransform(): void {
    if (this.ctx instanceof CanvasRenderingContext2D) {
      while (this.transformStack > 0) {
        this.restore();
      }
      this.ctx.resetTransform();
    }
  }
}
