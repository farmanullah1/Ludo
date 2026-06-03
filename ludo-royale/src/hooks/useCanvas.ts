import { useEffect, useState, RefObject } from 'react';
import { CANVAS_SIZE } from '../engine/constants';

export const useCanvas = (canvasRef: RefObject<HTMLCanvasElement>) => {
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    // Handle HiDPI displays
    const dpr = window.devicePixelRatio || 1;
    
    // We want the logical size to match container, but internal resolution to be CANVAS_SIZE * dpr
    // Wait, the prompt says: "On desktop: canvas is fixed at 750px. Use ResizeObserver to re-scale."
    
    // For simplicity, we keep internal resolution fixed to CANVAS_SIZE * dpr
    // and use CSS to scale it visually.
    canvas.width = CANVAS_SIZE * dpr;
    canvas.height = CANVAS_SIZE * dpr;
    
    context.scale(dpr, dpr);
    
    setCtx(context);

    // Resize observer to handle CSS sizing
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        // The container size
        const { width, height } = entry.contentRect;
        const size = Math.min(width, height);
        canvas.style.width = `${size}px`;
        canvas.style.height = `${size}px`;
      }
    });

    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    return () => resizeObserver.disconnect();
  }, [canvasRef]);

  return { ctx, canvasSize: CANVAS_SIZE };
};
