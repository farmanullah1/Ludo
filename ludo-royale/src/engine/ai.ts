import { Player, GameState, PlayerType, TokenPosition } from './types';
import { getMovableTokens, getTokenPath, applyMove, isBlocked } from './pathfinder';
import { SAFE_CELLS } from './constants';

const evaluateMove = (tokenId: string, player: Player, gameState: GameState, difficulty: PlayerType): number => {
  if (difficulty === 'ai-easy') {
    return Math.random(); // Random selection
  }

  const token = player.tokens.find(t => t.id === tokenId);
  if (!token) return 0;

  const diceVal = gameState.dice.values[0];
  const allTokens = gameState.players.flatMap(p => p.tokens);
  const path = getTokenPath(token, diceVal, gameState.boardCells);
  if (path.length === 0) return 0;

  const dest = path[path.length - 1];
  if (!dest) return 0;
  let score = 0;

  // Medium Logic
  if (token.position.type === 'base') {
    score += 10; // Getting out of base is good
  }

  if (dest.type === 'board') {
    if (SAFE_CELLS.includes(dest.cellIndex)) {
      score += 5; // Landing on safe cell
    }

    // Check for capture
    const enemiesOnDest = allTokens.filter(t => 
      t.color !== player.color && 
      t.position.type === 'board' && 
      t.position.cellIndex === dest.cellIndex
    );
    if (enemiesOnDest.length === 1) {
      score += 8; // Capture opportunity
    }
  }

  score += 3; // +3 for just moving (progress)

  if (dest.type === 'homeRun') {
    score += 15; // Reaching home run is great
  }

  // Hard Logic
  if (difficulty === 'ai-hard') {
    if (dest.type === 'finished') {
      score += 20; // Winning a token is top priority
    }

    if (dest.type === 'board') {
      // Check for blockade creation
      const friendsOnDest = allTokens.filter(t => 
        t.color === player.color && 
        t.id !== token.id &&
        t.position.type === 'board' && 
        t.position.cellIndex === dest.cellIndex
      );
      if (friendsOnDest.length === 1) {
        score += 12; // Create blockade
      }
    }

    // Add slight noise to avoid predictability
    score += (Math.random() * 2 - 1); 
  }

  return score;
};

export const getAIMove = (player: Player, gameState: GameState, difficulty: PlayerType): string | null => {
  if (gameState.movableTokenIds.length === 0) return null;
  if (gameState.movableTokenIds.length === 1) return gameState.movableTokenIds[0] || null;

  let bestToken: string | null = null;
  let bestScore = -Infinity;

  gameState.movableTokenIds.forEach(tokenId => {
    const score = evaluateMove(tokenId, player, gameState, difficulty);
    if (score > bestScore) {
      bestScore = score;
      bestToken = tokenId;
    }
  });

  return bestToken || gameState.movableTokenIds[0] || null;
};
