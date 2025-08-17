import { useRef, useCallback, useEffect, useState } from 'react';

interface GameEngineOptions {
  width: number;
  height: number;
  onUpdate?: (deltaTime: number) => void;
  onRender?: (ctx: CanvasRenderingContext2D) => void;
}

export function useGameEngine(options: GameEngineOptions) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return false;

    const ctx = canvas.getContext('2d');
    if (!ctx) return false;

    // Set canvas size with DPI scaling
    const devicePixelRatio = window.devicePixelRatio || 1;
    canvas.width = options.width * devicePixelRatio;
    canvas.height = options.height * devicePixelRatio;
    canvas.style.width = `${options.width}px`;
    canvas.style.height = `${options.height}px`;
    ctx.scale(devicePixelRatio, devicePixelRatio);

    ctxRef.current = ctx;
    return true;
  }, [options.width, options.height]);

  const gameLoop = useCallback(
    (currentTime: number) => {
      const deltaTime = currentTime - (gameLoop as any).lastTime || 0;
      (gameLoop as any).lastTime = currentTime;

      if (options.onUpdate) {
        options.onUpdate(deltaTime);
      }

      if (options.onRender && ctxRef.current) {
        options.onRender(ctxRef.current);
      }

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    },
    [options]
  );

  const start = useCallback(() => {
    if (!setupCanvas()) return;
    setIsRunning(true);
    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [setupCanvas, gameLoop]);

  const stop = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setIsRunning(false);
  }, []);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return {
    canvasRef,
    ctx: ctxRef.current,
    isRunning,
    start,
    stop,
  };
}
