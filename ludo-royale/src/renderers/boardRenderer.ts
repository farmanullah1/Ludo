import { BoardCell, GameSettings, PlayerColor } from '../engine/types';
import { CANVAS_SIZE, CELL_SIZE, HOME_BASES, OUTER_TRACK, SAFE_CELLS, START_CELLS, TOKEN_COLORS, BOARD_BG, HOME_RUN_TRACKS } from '../engine/constants';

export const renderBoard = (ctx: CanvasRenderingContext2D, boardCells: BoardCell[], settings: GameSettings): void => {
  // Clear canvas
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  // Background
  ctx.fillStyle = BOARD_BG.centerBase;
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  // Background noise pattern (simplified as dark grid)
  ctx.strokeStyle = 'rgba(255,255,255,0.02)';
  ctx.lineWidth = 1;
  for (let i = 0; i < CANVAS_SIZE; i += 10) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(CANVAS_SIZE, CANVAS_SIZE - i);
    ctx.moveTo(0, i);
    ctx.lineTo(CANVAS_SIZE - i, CANVAS_SIZE);
    ctx.stroke();
  }

  // Board Base Fill
  ctx.fillStyle = BOARD_BG.track;
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  // Draw 4 home bases
  const colors: PlayerColor[] = ['red', 'blue', 'green', 'yellow'];
  colors.forEach((color) => {
    const base = HOME_BASES[color];
    const x = base.col * CELL_SIZE;
    const y = base.row * CELL_SIZE;
    const w = 6 * CELL_SIZE;
    const h = 6 * CELL_SIZE;

    // Base background
    ctx.fillStyle = TOKEN_COLORS[color].homeBase;
    ctx.fillRect(x, y, w, h);

    // Inner glossy box
    const grad = ctx.createRadialGradient(x + w/2, y + h/2, w/4, x + w/2, y + h/2, w/2);
    grad.addColorStop(0, `${TOKEN_COLORS[color].fill}80`); // 80 is 50% opacity in hex
    grad.addColorStop(1, `${TOKEN_COLORS[color].fill}cc`);
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, w, h);

    // Draw 4 nests
    const nestRadius = (CELL_SIZE * 4.5) / 4; // Approx
    const nestCenters = [
      { cx: x + 1.5*CELL_SIZE, cy: y + 1.5*CELL_SIZE },
      { cx: x + 4.5*CELL_SIZE, cy: y + 1.5*CELL_SIZE },
      { cx: x + 1.5*CELL_SIZE, cy: y + 4.5*CELL_SIZE },
      { cx: x + 4.5*CELL_SIZE, cy: y + 4.5*CELL_SIZE },
    ];

    nestCenters.forEach(({cx, cy}) => {
      ctx.beginPath();
      ctx.arc(cx, cy, nestRadius, 0, Math.PI * 2);
      ctx.fillStyle = TOKEN_COLORS[color].homeBase;
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.shadowBlur = 0; // reset
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'white';
      ctx.stroke();
    });
  });

  // Center Finishing Zone (3x3)
  const cx = 7.5 * CELL_SIZE;
  const cy = 7.5 * CELL_SIZE;
  
  ctx.beginPath();
  ctx.moveTo(6*CELL_SIZE, 6*CELL_SIZE);
  ctx.lineTo(9*CELL_SIZE, 6*CELL_SIZE);
  ctx.lineTo(cx, cy);
  ctx.fillStyle = TOKEN_COLORS['blue'].fill;
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(9*CELL_SIZE, 6*CELL_SIZE);
  ctx.lineTo(9*CELL_SIZE, 9*CELL_SIZE);
  ctx.lineTo(cx, cy);
  ctx.fillStyle = TOKEN_COLORS['green'].fill;
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(9*CELL_SIZE, 9*CELL_SIZE);
  ctx.lineTo(6*CELL_SIZE, 9*CELL_SIZE);
  ctx.lineTo(cx, cy);
  ctx.fillStyle = TOKEN_COLORS['yellow'].fill;
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(6*CELL_SIZE, 9*CELL_SIZE);
  ctx.lineTo(6*CELL_SIZE, 6*CELL_SIZE);
  ctx.lineTo(cx, cy);
  ctx.fillStyle = TOKEN_COLORS['red'].fill;
  ctx.fill();

  // Grid over track
  ctx.strokeStyle = BOARD_BG.gridLine;
  ctx.lineWidth = 0.5;
  for (let r = 0; r <= 15; r++) {
    ctx.beginPath();
    ctx.moveTo(0, r * CELL_SIZE);
    ctx.lineTo(CANVAS_SIZE, r * CELL_SIZE);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(r * CELL_SIZE, 0);
    ctx.lineTo(r * CELL_SIZE, CANVAS_SIZE);
    ctx.stroke();
  }

  // Enhance specific track cells
  OUTER_TRACK.forEach((coord, index) => {
    const x = coord[1] * CELL_SIZE;
    const y = coord[0] * CELL_SIZE;

    // Safe cells
    if (SAFE_CELLS.includes(index)) {
      ctx.fillStyle = BOARD_BG.safeCell;
      ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
      ctx.fillStyle = 'white';
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⭐', x + CELL_SIZE/2, y + CELL_SIZE/2);
    }

    // Start cells
    colors.forEach(color => {
      if (START_CELLS[color] === index) {
        ctx.fillStyle = `${TOKEN_COLORS[color].fill}99`; // 60% opacity
        ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
      }
    });
  });

  // Home run cells
  colors.forEach(color => {
    const track = HOME_RUN_TRACKS[color];
    track.forEach(coord => {
      const x = coord[1] * CELL_SIZE;
      const y = coord[0] * CELL_SIZE;
      ctx.fillStyle = `${TOKEN_COLORS[color].fill}66`; // 40% opacity
      ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
    });
  });

  // Outer Borders
  ctx.strokeStyle = BOARD_BG.boardBorder;
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, CANVAS_SIZE-2, CANVAS_SIZE-2);

  const grad = ctx.createLinearGradient(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  grad.addColorStop(0, '#f0b429');
  grad.addColorStop(1, '#d97706');
  ctx.strokeStyle = grad;
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, CANVAS_SIZE-4, CANVAS_SIZE-4);
};
