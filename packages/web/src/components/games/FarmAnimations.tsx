'use client';

import React, { useEffect, useRef } from 'react';

interface FarmAnimationsProps {
  canvas: HTMLCanvasElement | null;
  ctx: CanvasRenderingContext2D | null;
  isActive: boolean;
}

export const FarmAnimations: React.FC<FarmAnimationsProps> = ({
  canvas,
  ctx,
  isActive,
}) => {
  const animationFrame = useRef<number>();

  useEffect(() => {
    if (!canvas || !ctx || !isActive) return;

    const drawBackground = () => {
      // Sky gradient
      const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height / 2);
      skyGradient.addColorStop(0, '#87CEEB');
      skyGradient.addColorStop(1, '#98FB98');
      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height / 2);

      // Ground gradient
      const groundGradient = ctx.createLinearGradient(
        0,
        canvas.height / 2,
        0,
        canvas.height
      );
      groundGradient.addColorStop(0, '#90EE90');
      groundGradient.addColorStop(1, '#228B22');
      ctx.fillStyle = groundGradient;
      ctx.fillRect(0, canvas.height / 2, canvas.width, canvas.height / 2);

      // Draw simple farm elements
      drawSun();
      drawClouds();
      drawFarmElements();
    };

    const drawSun = () => {
      const x = canvas.width - 100;
      const y = 80;

      // Sun rays
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 3;
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4;
        const startX = x + Math.cos(angle) * 30;
        const startY = y + Math.sin(angle) * 30;
        const endX = x + Math.cos(angle) * 45;
        const endY = y + Math.sin(angle) * 45;

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
      }

      // Sun circle
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(x, y, 25, 0, Math.PI * 2);
      ctx.fill();

      // Sun face
      ctx.fillStyle = '#FFA500';
      // Eyes
      ctx.beginPath();
      ctx.arc(x - 8, y - 5, 3, 0, Math.PI * 2);
      ctx.arc(x + 8, y - 5, 3, 0, Math.PI * 2);
      ctx.fill();

      // Smile
      ctx.strokeStyle = '#FFA500';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y + 5, 10, 0, Math.PI);
      ctx.stroke();
    };

    const drawClouds = () => {
      const clouds = [
        { x: 100, y: 60, size: 0.8 },
        { x: 250, y: 40, size: 1.0 },
        { x: 400, y: 70, size: 0.6 },
      ];

      ctx.fillStyle = '#FFFFFF';
      clouds.forEach(cloud => {
        const { x, y, size } = cloud;

        // Multiple circles to form cloud
        ctx.beginPath();
        ctx.arc(x, y, 20 * size, 0, Math.PI * 2);
        ctx.arc(x + 15 * size, y, 25 * size, 0, Math.PI * 2);
        ctx.arc(x + 30 * size, y, 20 * size, 0, Math.PI * 2);
        ctx.arc(x + 15 * size, y - 10 * size, 15 * size, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    const drawFarmElements = () => {
      // Simple barn
      const barnX = 50;
      const barnY = canvas.height - 200;

      // Barn body
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(barnX, barnY, 80, 60);

      // Barn roof
      ctx.fillStyle = '#DC143C';
      ctx.beginPath();
      ctx.moveTo(barnX - 10, barnY);
      ctx.lineTo(barnX + 40, barnY - 30);
      ctx.lineTo(barnX + 90, barnY);
      ctx.closePath();
      ctx.fill();

      // Barn door
      ctx.fillStyle = '#654321';
      ctx.fillRect(barnX + 30, barnY + 20, 20, 40);

      // Simple fence
      ctx.strokeStyle = '#8B4513';
      ctx.lineWidth = 4;
      const fenceY = canvas.height - 120;

      for (let i = 200; i < 600; i += 30) {
        ctx.beginPath();
        ctx.moveTo(i, fenceY);
        ctx.lineTo(i, fenceY + 40);
        ctx.stroke();
      }

      // Fence rails
      ctx.beginPath();
      ctx.moveTo(200, fenceY + 10);
      ctx.lineTo(600, fenceY + 10);
      ctx.moveTo(200, fenceY + 25);
      ctx.lineTo(600, fenceY + 25);
      ctx.stroke();

      // Simple trees
      const trees = [
        { x: 700, y: canvas.height - 150 },
        { x: 600, y: canvas.height - 180 },
      ];

      trees.forEach(tree => {
        // Tree trunk
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(tree.x - 5, tree.y, 10, 30);

        // Tree leaves
        ctx.fillStyle = '#228B22';
        ctx.beginPath();
        ctx.arc(tree.x, tree.y - 10, 25, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    const animate = () => {
      if (!isActive) return;

      drawBackground();
      animationFrame.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [canvas, ctx, isActive]);

  return null; // This component only handles canvas drawing
};

export default FarmAnimations;
