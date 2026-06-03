import { Player, AnimationState, Point } from '../engine/types';
import { CELL_SIZE, TOKEN_COLORS } from '../engine/constants';
import { getPixelPosition } from '../engine/pathfinder';

// Easing function
const easeInOutCubic = (t: number): number => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export const drawToken = (
  ctx: CanvasRenderingContext2D, 
  x: number, 
  y: number, 
  color: import('../engine/types').PlayerColor, 
  text: string = '', 
  activeAndMovable: boolean = false, 
  timestamp: number,
  scale: number = 1.0,
  isFinished: boolean = false
) => {
  let drawY = y;
  
  if (activeAndMovable) {
    drawY += Math.sin(timestamp / 150) * 3;
    
    // Golden ring
    ctx.beginPath();
    ctx.arc(x, drawY, CELL_SIZE * 0.45, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(240, 180, 41, 0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  if (isFinished) {
    ctx.shadowBlur = 10 + Math.sin(timestamp / 500) * 6;
    ctx.shadowColor = TOKEN_COLORS[color].glow;
  } else {
    ctx.shadowBlur = 8;
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
  }

  const radius = CELL_SIZE * 0.38 * scale;
  
  // Base shape with gradient
  ctx.beginPath();
  ctx.arc(x, drawY, radius, 0, Math.PI * 2);
  const grad = ctx.createRadialGradient(x - radius/3, drawY - radius/3, radius/10, x, drawY, radius);
  grad.addColorStop(0, '#ffffff'); // Highlight
  grad.addColorStop(0.2, TOKEN_COLORS[color].fill);
  grad.addColorStop(1, TOKEN_COLORS[color].stroke);
  
  ctx.fillStyle = grad;
  ctx.fill();
  
  // Stroke
  ctx.lineWidth = 2;
  ctx.strokeStyle = TOKEN_COLORS[color].stroke;
  ctx.stroke();

  // Specular highlight
  ctx.beginPath();
  ctx.ellipse(x - radius/3, drawY - radius/3, radius * 0.4, radius * 0.2, -Math.PI / 4, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.fill();

  ctx.shadowBlur = 0; // Reset

  if (text) {
    ctx.fillStyle = 'white';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, drawY);
  }
};

export const renderTokens = (
  ctx: CanvasRenderingContext2D, 
  players: Player[], 
  animations: AnimationState[], 
  timestamp: number,
  activePlayerId: string,
  movableTokenIds: string[]
): void => {
  // Group tokens by cell to show numbers if multiple
  const cellCounts = new Map<string, string[]>(); // key: cell_index_or_base, value: array of token IDs
  
  const allTokens = players.flatMap(p => p.tokens);

  allTokens.forEach(t => {
    // Only group tokens that are on the board and not animating
    if (t.position.type === 'board' && !t.animating) {
      const key = `board-${t.position.cellIndex}`;
      const existing = cellCounts.get(key) || [];
      existing.push(t.id);
      cellCounts.set(key, existing);
    }
  });

  // Render tokens
  players.forEach(player => {
    player.tokens.forEach(token => {
      // Find animation state if any
      const anim = animations.find(a => a.tokenId === token.id);
      
      let x = 0;
      let y = 0;
      let scale = 1.0;
      let text = '';
      
      const isActiveAndMovable = player.id === activePlayerId && movableTokenIds.includes(token.id);

      if (anim && anim.path && anim.path.length > 0) {
        // Interpolate along path
        // Use either anim.progress if provided or calculate based on time
        let p = anim.progress;
        if (anim.startTime) {
           p = (timestamp - anim.startTime) / anim.duration;
           if (p > 1) p = 1;
        }
        
        const easedP = easeInOutCubic(p);
        
        // Find segment
        const totalSegments = anim.path.length - 1;
        if (totalSegments > 0) {
          const scaledP = easedP * totalSegments;
          const index = Math.min(Math.floor(scaledP), totalSegments - 1);
          const segmentP = scaledP - index;
          
          const p1 = anim.path[index];
          const p2 = anim.path[index + 1];
          
          if (p1 && p2) {
            x = p1.x + (p2.x - p1.x) * segmentP;
            y = p1.y + (p2.y - p1.y) * segmentP;
            
            // Parabolic hop per segment
            y -= Math.sin(segmentP * Math.PI) * 15;
          }
        } else if (anim.path[0]) {
          x = anim.path[0].x;
          y = anim.path[0].y;
        }

        if (anim.type === 'enter-board') {
          scale = 0.3 + easedP * 0.7;
        } else if (anim.type === 'reach-home') {
          scale = easedP < 0.5 ? 1.0 + easedP * 0.6 : 1.3 - (easedP - 0.5) * 0.6;
        }
      } else {
        const pt = getPixelPosition(token.position, [], token.index, token.color);
        x = pt.x;
        y = pt.y;

        if (token.position.type === 'board') {
           const grouped = cellCounts.get(`board-${token.position.cellIndex}`);
           if (grouped && grouped.length > 1) {
             // We only draw the token once per group, or offset them
             // Let's just draw the first token of the group with a number
             if (grouped[0] !== token.id) return; // Skip drawing others in the group
             text = grouped.length.toString();
           }
        }
      }

      drawToken(ctx, x, y, token.color, text, isActiveAndMovable, timestamp, scale, token.isFinished);
    });
  });
};
