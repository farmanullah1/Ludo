import React, { useEffect, useRef } from 'react';
import { renderDie } from '../../renderers/diceRenderer';
import { Player } from '../../engine/types';
import { motion } from 'framer-motion';

interface DicePanelProps {
  value: number;
  progress: number;
  isRolling: boolean;
  canRoll: boolean;
  onRoll: () => void;
  activePlayer: Player;
  hasMovableTokens: boolean;
  phase: string;
}

export const DicePanel: React.FC<DicePanelProps> = ({
  value,
  progress,
  isRolling,
  canRoll,
  onRoll,
  activePlayer,
  hasMovableTokens,
  phase
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        renderDie(ctx, value, progress);
      }
    }
  }, [value, progress]);

  return (
    <div className="bg-obsidian-800 p-4 rounded-xl border-2 border-gold-500 shadow-gem-glow flex flex-col items-center">
      <div className="mb-2 text-gold-300 font-cinzel text-lg">
        {activePlayer.name}'s Turn
      </div>
      
      <canvas 
        ref={canvasRef} 
        width={100} 
        height={100} 
        className="mb-4"
      />

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onRoll}
        disabled={!canRoll || isRolling}
        className={`w-full py-3 rounded-lg font-bold text-white text-lg transition-colors ${
          canRoll && !isRolling 
            ? 'bg-gold-gradient hover:brightness-110 shadow-lg' 
            : 'bg-gray-600 cursor-not-allowed opacity-50'
        }`}
      >
        {isRolling ? 'Rolling...' : 'ROLL DICE'}
      </motion.button>

      {!hasMovableTokens && phase === 'selecting-token' && (
        <div className="mt-2 text-ruby-400 text-sm animate-pulse">
          No valid moves available.
        </div>
      )}
    </div>
  );
};
