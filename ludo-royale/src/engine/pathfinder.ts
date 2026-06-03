import { Token, TokenPosition, BoardCell, PlayerColor, Point, Player } from './types';
import { START_CELLS, CELL_SIZE, BOARD_PADDING, HOME_BASES, HOME_BASE_TOKEN_POSITIONS, OUTER_TRACK, HOME_RUN_TRACKS, CANVAS_SIZE } from './constants';

export const getTokenPath = (token: Token, steps: number, boardCells: BoardCell[]): TokenPosition[] => {
  const path: TokenPosition[] = [];
  if (steps === 0) return path;

  if (token.position.type === 'base') {
    if (steps === 6) {
      path.push({ type: 'board', cellIndex: START_CELLS[token.color] });
    }
    return path;
  }

  let currentStepCount = token.stepCount;
  let currentPos = token.position;

  for (let i = 0; i < steps; i++) {
    currentStepCount++;
    if (currentStepCount <= 50) {
      // Outer track
      if (currentPos.type === 'board') {
        currentPos = { type: 'board', cellIndex: (currentPos.cellIndex + 1) % 52 };
      } else {
        return []; // Invalid
      }
    } else if (currentStepCount <= 56) {
      // Home run
      const hrStep = currentStepCount - 50;
      currentPos = { type: 'homeRun', step: hrStep };
    } else if (currentStepCount === 57) {
      currentPos = { type: 'finished' };
    } else {
      // Overshoot
      return [];
    }
    path.push(currentPos);
  }

  return path;
};

export const isBlocked = (position: TokenPosition, movingTokenColor: PlayerColor, allTokens: Token[], strict: boolean = true): boolean => {
  if (position.type !== 'board') return false;
  
  // Count tokens of same color on this cell
  const tokensOnCell = allTokens.filter(t => 
    t.position.type === 'board' && 
    t.position.cellIndex === position.cellIndex
  );

  // Group by color
  const colorCounts = tokensOnCell.reduce((acc, t) => {
    acc[t.color] = (acc[t.color] || 0) + 1;
    return acc;
  }, {} as Record<PlayerColor, number>);

  // Check if any enemy has 2 or more tokens here (blockade)
  for (const color in colorCounts) {
    if (color !== movingTokenColor && colorCounts[color as PlayerColor] >= 2) {
      return true; // Blocked by enemy blockade
    }
  }

  return false;
};

export const canTokenMove = (token: Token, diceValue: number, allTokens: Token[]): boolean => {
  const path = getTokenPath(token, diceValue, []);
  if (path.length === 0) return false;

  // Check for blockades along the path (except the final destination which could be a capture, but blockade rules usually prevent passing AND landing)
  // Actually, you cannot pass a blockade or land on it.
  for (const pos of path) {
    if (isBlocked(pos, token.color, allTokens)) {
      return false;
    }
  }

  return true;
};

export const getMovableTokens = (player: Player, diceValue: number, allTokens: Token[]): string[] => {
  return player.tokens
    .filter(t => canTokenMove(t, diceValue, allTokens))
    .map(t => t.id);
};

export const applyMove = (token: Token, newPosition: TokenPosition): Token => {
  let stepCount = token.stepCount;
  if (token.position.type === 'base' && newPosition.type === 'board') {
    stepCount = 0; // Just entered
  } else if (newPosition.type === 'board') {
    // Determine steps taken by counting difference, though usually it's handled by path generator
    // For simplicity, we can assume the stepCount increments appropriately in reducer or we pass it
    // Wait, applyMove should probably take the whole path or just know the diceValue.
    // If it's a simple assignment:
  }
  
  // We'll update stepCount in the reducer since we have the path length
  return {
    ...token,
    position: newPosition,
    isHome: newPosition.type === 'base',
    isFinished: newPosition.type === 'finished'
  };
};

export const getPixelPosition = (position: TokenPosition, boardCells: BoardCell[], tokenIndex: number, color: PlayerColor): Point => {
  let row = 0;
  let col = 0;

  if (position.type === 'base') {
    const base = HOME_BASES[color];
    const offset = HOME_BASE_TOKEN_POSITIONS[tokenIndex] || [0, 0];
    row = base.row + offset[0]!;
    col = base.col + offset[1]!;
  } else if (position.type === 'board') {
    const coords = OUTER_TRACK[position.cellIndex] || [0, 0];
    row = coords[0]!;
    col = coords[1]!;
  } else if (position.type === 'homeRun') {
    const coords = (HOME_RUN_TRACKS[color] && HOME_RUN_TRACKS[color][position.step - 1]) || [0, 0];
    row = coords[0]!;
    col = coords[1]!;
  } else if (position.type === 'finished') {
    // Center of the board roughly
    return { x: CANVAS_SIZE / 2, y: CANVAS_SIZE / 2 };
  }

  return {
    x: BOARD_PADDING + col * CELL_SIZE + CELL_SIZE / 2,
    y: BOARD_PADDING + row * CELL_SIZE + CELL_SIZE / 2
  };
};
