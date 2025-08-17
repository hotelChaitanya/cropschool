'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import Link from 'next/link';

export default function AlphabetFarmTestPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGameStarted, setIsGameStarted] = useState(false);

  const testCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.log('❌ Canvas not found');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.log('❌ Canvas context not found');
      return;
    }

    console.log('✅ Canvas and context found');

    // Simple test draw
    canvas.width = 800;
    canvas.height = 600;

    // Clear with blue background
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, 800, 600);

    // Draw test text
    ctx.fillStyle = '#2E5984';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('✅ CANVAS IS WORKING!', 400, 200);

    // Draw test rectangle
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(350, 250, 100, 60);

    // Draw test text on rectangle
    ctx.fillStyle = 'white';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('TEST', 400, 285);

    console.log('✅ Test drawing completed');
    setIsGameStarted(true);
  }, []);

  const handleMouseClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (800 / rect.width);
      const y = (e.clientY - rect.top) * (600 / rect.height);

      console.log(`🖱️ Mouse click at: ${x}, ${y}`);

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw a red circle at click position
      ctx.fillStyle = 'red';
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, 2 * Math.PI);
      ctx.fill();
    },
    []
  );

  useEffect(() => {
    console.log('🔄 Component mounted');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-lime-50 to-emerald-50">
      <header className="bg-white shadow-sm">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/games"
              className="flex items-center space-x-2 text-green-600 hover:text-green-700"
            >
              <span>← Back to Games</span>
            </Link>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold text-gray-900">
                Canvas Test
              </span>
            </div>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Canvas Debugging Test
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            This page tests if canvas rendering is working properly
          </p>

          <div className="mb-4">
            <p className="text-sm text-gray-500">
              Status: {isGameStarted ? '✅ Canvas Working' : '⏳ Not Started'}
            </p>
          </div>
        </div>

        <div className="flex justify-center mb-6">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            onClick={handleMouseClick}
            className="border-4 border-green-400 rounded-lg shadow-lg bg-white cursor-pointer"
            style={{
              width: '800px',
              height: '600px',
              maxWidth: '100%',
            }}
          />
        </div>

        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={testCanvas}
            className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600"
          >
            🧪 Test Canvas
          </button>

          <button
            onClick={() => {
              const canvas = canvasRef.current;
              const ctx = canvas?.getContext('2d');
              if (canvas && ctx) {
                ctx.clearRect(0, 0, 800, 600);
                ctx.fillStyle = '#87CEEB';
                ctx.fillRect(0, 0, 800, 600);
                setIsGameStarted(false);
              }
            }}
            className="bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600"
          >
            🗑️ Clear Canvas
          </button>
        </div>

        <div className="bg-white rounded-lg p-6 shadow">
          <h3 className="text-lg font-bold mb-4">Debug Instructions:</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Click "Test Canvas" to see if basic drawing works</li>
            <li>
              If you see blue background and "CANVAS IS WORKING!" text, canvas
              rendering is fine
            </li>
            <li>Click anywhere on the canvas to test mouse coordinates</li>
            <li>Check browser console (F12) for debug messages</li>
            <li>If canvas is blank, there's a rendering issue</li>
          </ol>

          <div className="mt-4 p-4 bg-gray-100 rounded">
            <p className="text-sm font-mono">
              Expected: Blue background, "CANVAS IS WORKING!" text, green
              rectangle with "TEST"
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
