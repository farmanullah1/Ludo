import React, { useRef } from 'react';
import { useCanvas } from '../../hooks/useCanvas';
import { useAnimations } from '../../hooks/useAnimations';
import { GameState } from '../../engine/types';
import { GameAction } from '../../engine/gameReducer';
import { useSound } from '../../hooks/useSound';
import { getPixelPosition, getTokenPath } from '../../engine/pathfinder';

interface GameCanvasProps {
  gameState: GameState;
  dispatch: React.Dispatch<GameAction>;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ gameState, dispatch }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { ctx, canvasSize } = useCanvas(canvasRef);
  const sound = useSound(gameState.settings);

  // Hook up animations
  useAnimations(canvasRef, ctx, gameState, dispatch);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (gameState.phase !== 'selecting-token' || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;
    
    if ('touches' in e) {
      const touch = e.touches[0];
      if (!touch) return;
      clientX = touch.clientX;
      clientY = touch.clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    // Map click to 750x750 coordinates
    const x = ((clientX - rect.left) / rect.width) * 750;
    const y = ((clientY - rect.top) / rect.height) * 750;

    // Check which movable token was clicked
    const allTokens = gameState.players.flatMap(p => p.tokens);
    const clickedTokenId = gameState.movableTokenIds.find(id => {
      const t = allTokens.find(token => token.id === id);
      if (!t) return false;
      const pt = getPixelPosition(t.position, [], t.index, t.color);
      const dist = Math.sqrt((pt.x - x)**2 + (pt.y - y)**2);
      return dist < 30; // Radius of interaction
    });

    if (clickedTokenId) {
      sound.playTick();
      dispatch({ 
        type: 'SELECT_TOKEN', 
        payload: { tokenId: clickedTokenId } 
      });
      
      // Auto-trigger move for now since we want the game to progress
      const t = allTokens.find(token => token.id === clickedTokenId);
      if (t) {
        const diceVal = gameState.dice.values[0] || 1;
        const path = getTokenPath(t, diceVal, []);
        const targetPos = path[path.length - 1];
        if (targetPos) {
          dispatch({
            type: 'MOVE_TOKEN',
            payload: { tokenId: clickedTokenId, targetPosition: targetPos }
          });
        }
      }
    }
  };

  return (
    <div className="relative w-full max-w-[750px] mx-auto aspect-square flex items-center justify-center p-2">
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        onTouchStart={handleCanvasClick}
        className="w-full h-full rounded-xl shadow-2xl bg-obsidian-900 border-2 border-gold-600/50 cursor-pointer"
        style={{ touchAction: 'none', maxWidth: '750px', maxHeight: '750px' }}
      />
    </div>
  );
};
