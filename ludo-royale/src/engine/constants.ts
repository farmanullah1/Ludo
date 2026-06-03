import { PlayerColor } from './types';

// Canvas dimensions
export const CANVAS_SIZE = 750;           // px (square)
export const CELL_SIZE = CANVAS_SIZE / 15; // 50px per cell
export const BOARD_PADDING = 0;

// Board layout: 15x15 grid
// The classic Ludo board uses a 15x15 grid:
// - 4 colored home bases (6x6 corners)
// - 1 center finishing zone (3x3)
// - Cross-shaped track connecting them

// Track definition: array of [row, col] for all 52 cells (0-51), starting from Red's entry point going clockwise
export const OUTER_TRACK: [number, number][] = [
  // Define all 52 [row, col] positions of the outer track in clockwise order
  // Starting from Red's entry at [6, 1]:
  [6,1],[6,2],[6,3],[6,4],[6,5],           // Red approach top
  [5,6],[4,6],[3,6],[2,6],[1,6],[0,6],     // Going up left column
  [0,7],                                    // Top-center
  [0,8],[1,8],[2,8],[3,8],[4,8],[5,8],     // Going down right column
  [6,9],[6,10],[6,11],[6,12],[6,13],[6,14],// Blue approach top
  [7,14],                                   // Right-center
  [8,14],[8,13],[8,12],[8,11],[8,10],[8,9],// Going left on bottom of right arm
  [9,8],[10,8],[11,8],[12,8],[13,8],[14,8],// Going down right column
  [14,7],                                   // Bottom-center
  [14,6],[13,6],[12,6],[11,6],[10,6],[9,6],// Going up left column
  [8,5],[8,4],[8,3],[8,2],[8,1],[8,0],     // Green approach bottom
  [7,0],                                    // Left-center
  [6,0],                                    // Closing the loop (connects back)
];

// Home run tracks (color-specific inner paths toward center)
export const HOME_RUN_TRACKS: Record<PlayerColor, [number, number][]> = {
  red:    [[7,1],[7,2],[7,3],[7,4],[7,5],[7,6]],
  blue:   [[1,7],[2,7],[3,7],[4,7],[5,7],[6,7]],
  green:  [[7,13],[7,12],[7,11],[7,10],[7,9],[7,8]],
  yellow: [[13,7],[12,7],[11,7],[10,7],[9,7],[8,7]],
};

// Home base regions (top-left cell of 6x6 area)
export const HOME_BASES: Record<PlayerColor, { row: number; col: number }> = {
  red:    { row: 0, col: 0 },
  blue:   { row: 0, col: 9 },
  green:  { row: 9, col: 9 },
  yellow: { row: 9, col: 0 },
};

// Token starting positions within home base (4 slots)
export const HOME_BASE_TOKEN_POSITIONS: [number, number][] = [
  [1,1], [1,4], [4,1], [4,4],   // relative to home base top-left
];

// Safe cell indices (on outer track)
export const SAFE_CELLS: number[] = [0, 8, 13, 21, 26, 34, 39, 47];

// Starting cells per player (index on outer track where tokens enter)
export const START_CELLS: Record<PlayerColor, number> = {
  red:    0,
  blue:   13,
  green:  26,
  yellow: 39,
};

// Token colors
export const TOKEN_COLORS: Record<PlayerColor, { fill: string; stroke: string; glow: string; homeBase: string }> = {
  red:    { fill: '#ef4444', stroke: '#991b1b', glow: '#fca5a5', homeBase: '#fee2e2' },
  blue:   { fill: '#3b82f6', stroke: '#1d4ed8', glow: '#93c5fd', homeBase: '#dbeafe' },
  green:  { fill: '#10b981', stroke: '#065f46', glow: '#6ee7b7', homeBase: '#d1fae5' },
  yellow: { fill: '#f59e0b', stroke: '#92400e', glow: '#fde68a', homeBase: '#fef3c7' },
};

// Animation durations (ms) at 'normal' speed
export const ANIM_DURATION = {
  tokenMove:    300,    // per cell step
  capture:      500,
  enterBoard:   600,
  reachHome:    800,
  diceRoll:    1200,
  particleBurst: 800,
};

// Player turn order
export const TURN_ORDER: PlayerColor[] = ['red', 'blue', 'green', 'yellow'];

// Board background colors
export const BOARD_BG = {
  track:         '#f8f5eb',
  safeCell:      '#86efac',
  centerBase:    '#1e1b2e',
  gridLine:      '#c4b89a',
  boardBorder:   '#8B6914',
};
