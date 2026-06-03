import { BoardCell, Point, CaptureEffect, Token } from '../engine/types';
import { CELL_SIZE, TOKEN_COLORS } from '../engine/constants';
import { getPixelPosition } from '../engine/pathfinder';

export const renderHighlights = (
  ctx: CanvasRenderingContext2D, 
  movableTokenIds: string[], 
  boardCells: BoardCell[],
  allTokens: Token[],
  timestamp: number
): void => {
  movableTokenIds.forEach(id => {
    const token = allTokens.find(t => t.id === id);
    if (!token) return;

    const pt = getPixelPosition(token.position, boardCells, token.index, token.color);
    
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, CELL_SIZE * 0.45, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${0.15 + Math.sin(timestamp / 200) * 0.1})`;
    ctx.fill();
  });
};

export const renderMovePath = (
  ctx: CanvasRenderingContext2D, 
  token: Token | undefined, 
  path: Point[], 
  boardCells: BoardCell[]
): void => {
  if (!token || path.length < 2) return;

  const start = path[0];
  if (!start) return;

  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  for (let i = 1; i < path.length; i++) {
    const pt = path[i];
    if (pt) {
      ctx.lineTo(pt.x, pt.y);
    }
  }

  ctx.strokeStyle = TOKEN_COLORS[token.color].fill;
  ctx.lineWidth = 3;
  ctx.setLineDash([5, 5]);
  ctx.stroke();
  ctx.setLineDash([]); // Reset
  
  // Destination ghost
  const dest = path[path.length - 1];
  if (!dest) return;
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.arc(dest.x, dest.y, CELL_SIZE * 0.38, 0, Math.PI * 2);
  ctx.fillStyle = TOKEN_COLORS[token.color].fill;
  ctx.fill();
  ctx.globalAlpha = 1.0;
};

export const renderCaptureEffect = (
  ctx: CanvasRenderingContext2D, 
  effect: CaptureEffect, 
  timestamp: number
): void => {
  const elapsed = timestamp - effect.startTime;
  if (elapsed > 500) return; // Finished

  const progress = elapsed / 500;
  const opacity = 1 - progress;

  ctx.save();
  ctx.translate(effect.position.x, effect.position.y);
  
  // Draw 8 bursting triangles
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI * 2 / 8) * i;
    const dist = progress * 40;
    
    ctx.save();
    ctx.rotate(angle);
    ctx.translate(dist, 0);
    
    ctx.beginPath();
    ctx.moveTo(0, -5);
    ctx.lineTo(10, 0);
    ctx.lineTo(0, 5);
    ctx.closePath();
    
    ctx.fillStyle = `rgba(${TOKEN_COLORS[effect.color].fill}, ${opacity})`; // Wait, need rgb components or just handle via globalAlpha
    ctx.restore();
  }
  
  // Since we don't have hexToRgb easily, just use globalAlpha
  ctx.globalAlpha = opacity;
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI * 2 / 8) * i;
    const dist = progress * 40;
    
    ctx.save();
    ctx.rotate(angle);
    ctx.translate(dist, 0);
    
    ctx.beginPath();
    ctx.moveTo(0, -5);
    ctx.lineTo(15, 0);
    ctx.lineTo(0, 5);
    ctx.closePath();
    
    ctx.fillStyle = TOKEN_COLORS[effect.color].fill;
    ctx.fill();
    ctx.restore();
  }

  ctx.restore();
  ctx.globalAlpha = 1.0;
};

// Any additional generic particles
export const renderParticles = (
  ctx: CanvasRenderingContext2D, 
  particles: any[], // Type it loosely for now
  timestamp: number
): void => {
  // Simple particle loop
};
