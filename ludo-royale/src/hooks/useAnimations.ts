import { useEffect, useRef } from 'react';
import { GameState } from '../engine/types';
import { GameAction } from '../engine/gameReducer';
import { renderBoard } from '../renderers/boardRenderer';
import { renderHighlights, renderMovePath, renderCaptureEffect } from '../renderers/effectsRenderer';
import { renderTokens } from '../renderers/tokenRenderer';
import { getPixelPosition, getTokenPath } from '../engine/pathfinder';

export const useAnimations = (
  canvasRef: React.RefObject<HTMLCanvasElement>,
  ctx: CanvasRenderingContext2D | null,
  gameState: GameState,
  dispatch: React.Dispatch<GameAction>
) => {
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number>();

  // Pre-render board
  useEffect(() => {
    if (!offscreenCanvasRef.current) {
      offscreenCanvasRef.current = document.createElement('canvas');
      offscreenCanvasRef.current.width = 750;
      offscreenCanvasRef.current.height = 750;
    }
    const offCtx = offscreenCanvasRef.current.getContext('2d');
    if (offCtx) {
      renderBoard(offCtx, gameState.boardCells, gameState.settings);
    }
  }, [gameState.settings]); 

  useEffect(() => {
    if (!ctx || !offscreenCanvasRef.current) return;

    const renderLoop = (timestamp: number) => {
      ctx.clearRect(0, 0, 750, 750);
      ctx.drawImage(offscreenCanvasRef.current!, 0, 0, 750, 750);

      const allTokens = gameState.players.flatMap(p => p.tokens);
      const activePlayer = gameState.players[gameState.activePlayerIndex];

      if (gameState.phase === 'selecting-token') {
        renderHighlights(ctx, gameState.movableTokenIds, gameState.boardCells, allTokens, timestamp);
      }

      if (gameState.selectedTokenId && gameState.dice.values.length > 0) {
        const token = allTokens.find(t => t.id === gameState.selectedTokenId);
        if (token) {
          const positions = getTokenPath(token, gameState.dice.values[0], []);
          const pathPoints = positions.map(pos => getPixelPosition(pos, [], token.index, token.color));
          renderMovePath(ctx, token, pathPoints, gameState.boardCells);
        }
      }

      renderTokens(ctx, gameState.players, gameState.animations, timestamp, activePlayer?.id || '', gameState.movableTokenIds);

      // Check for completed animations
      gameState.animations.forEach(anim => {
        if (anim.type === 'move' && anim.tokenId) {
           const elapsed = timestamp - anim.startTime;
           if (elapsed >= anim.duration) {
             dispatch({ type: 'ANIMATION_COMPLETE', payload: { animationId: anim.tokenId } });
           }
        }
      });

      if (gameState.captureEffect) {
        renderCaptureEffect(ctx, gameState.captureEffect, timestamp);
      }

      rafRef.current = requestAnimationFrame(renderLoop);
    };

    rafRef.current = requestAnimationFrame(renderLoop);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [ctx, gameState, dispatch]);
};
