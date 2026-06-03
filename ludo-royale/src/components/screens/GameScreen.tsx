import React, { useEffect, useReducer, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { GameSettings, GameState } from '../../engine/types';
import { gameReducer, INITIAL_STATE } from '../../engine/gameReducer';
import { GameCanvas } from '../game/GameCanvas';
import { PlayerPanel } from '../game/PlayerPanel';
import { DicePanel } from '../game/DicePanel';
import { ScoreBoard } from '../game/ScoreBoard';
import { TurnTimer } from '../game/TurnTimer';
import { useDice } from '../../hooks/useDice';
import { useSound } from '../../hooks/useSound';
import { getAIMove } from '../../engine/ai';
import { getTokenPath } from '../../engine/pathfinder';
import { TOKEN_COLORS } from '../../engine/constants';
import { renderIcon } from '../../utils/iconUtils';
import { saveGameState, clearGameState } from '../../utils/storageUtils';

interface GameScreenProps {
  settings: GameSettings;
  onExit: () => void;
  restoredState?: GameState | null;
}

export const GameScreen: React.FC<GameScreenProps> = ({ settings, onExit, restoredState }) => {
  const [gameState, dispatch] = useReducer(gameReducer, INITIAL_STATE);
  const { roll, isRolling, currentValue, animationProgress } = useDice(settings);
  const sound = useSound(settings);

  // Initialize game on mount
  useEffect(() => {
    if (restoredState) {
      dispatch({ type: 'RESTORE_GAME', payload: restoredState });
    } else {
      dispatch({ type: 'INITIALIZE_GAME', payload: settings });
    }
  }, [settings, restoredState]);

  // Persist game state on change
  useEffect(() => {
    if (gameState.players.length > 0 && gameState.phase !== 'idle' && gameState.phase !== 'game-over') {
      saveGameState(gameState);
    } else if (gameState.phase === 'game-over') {
      clearGameState();
    }
  }, [gameState]);

  const activePlayer = gameState.players?.[gameState.activePlayerIndex];

  const handleRoll = useCallback(() => {
    if (gameState.phase !== 'rolling') return;
    sound.playDiceRoll();
    dispatch({ type: 'ROLL_DICE' });
    
    roll((val) => {
      dispatch({ type: 'DICE_RESULT', payload: { value: val } });
    });
  }, [gameState.phase, roll, sound]);

  // AI loop
  useEffect(() => {
    if (!activePlayer || gameState.players.length === 0) return;

    if (gameState.phase === 'rolling' && activePlayer.type !== 'human' && !isRolling) {
      const timer = setTimeout(() => {
        handleRoll();
      }, 1000);
      return () => clearTimeout(timer);
    }

    if (gameState.phase === 'selecting-token' && activePlayer.type !== 'human') {
      const timer = setTimeout(() => {
        const tokenId = getAIMove(activePlayer, gameState, activePlayer.type);
        if (tokenId) {
          dispatch({ type: 'SELECT_TOKEN', payload: { tokenId } });
          const token = activePlayer.tokens.find(t => t.id === tokenId);
          if (token) {
            const path = getTokenPath(token, gameState.dice.values[0] || 1, []);
            if (path.length > 0) {
              dispatch({ 
                type: 'MOVE_TOKEN', 
                payload: { tokenId, targetPosition: path[path.length - 1]! } 
              });
            }
          }
        } else {
          dispatch({ type: 'END_TURN' });
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
    
    // Auto-advance if no moves or phase is idle
    if (gameState.phase === 'idle' && gameState.players.length > 0) {
      dispatch({ type: 'END_TURN' });
    }
  }, [gameState.phase, activePlayer, handleRoll, isRolling, gameState.dice.values, gameState.movableTokenIds, gameState.players.length]);

  if (gameState.players.length === 0 || !activePlayer) return (
    <div className="w-screen h-screen bg-obsidian-950 flex items-center justify-center">
      <div className="text-gold-400 font-cinzel text-2xl animate-pulse">Initializing Royale...</div>
    </div>
  );

  return (
    <div className="w-screen min-h-screen bg-obsidian-950 flex flex-col p-4 overflow-hidden">
      {/* Top Header */}
      <div className="flex justify-between items-center mb-4 text-gold-400 font-cinzel">
        <button onClick={onExit} className="hover:text-white">← Pause / Quit</button>
        <div className="text-xl">Turn {gameState.turnNumber}</div>
        <div className="w-[100px] flex justify-end">
          {settings.turnTimeLimit && (
            <TurnTimer 
              limit={settings.turnTimeLimit} 
              turnNumber={gameState.turnNumber} 
              onExpire={() => dispatch({ type: 'TIMER_EXPIRED' })} 
            />
          )}
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 items-center justify-center">
        
        {/* Left Panels */}
        <div className="flex flex-row lg:flex-col gap-4 w-full lg:w-auto overflow-x-auto lg:overflow-visible p-2">
          {gameState.players.slice(0, 2).map((p, i) => (
            <PlayerPanel key={p.id} player={p} isActive={gameState.activePlayerIndex === i} />
          ))}
        </div>

        {/* Center Canvas */}
        <div className="flex-shrink-0 w-full max-w-[750px] relative">
          <GameCanvas gameState={gameState} dispatch={dispatch} />
        </div>

        {/* Right Panels & Controls */}
        <div className="flex flex-col gap-4 w-full lg:w-auto max-w-sm">
          <div className="flex flex-row lg:flex-col gap-4 overflow-x-auto lg:overflow-visible">
            {gameState.players.slice(2, 4).map((p, i) => (
              <PlayerPanel key={p.id} player={p} isActive={gameState.activePlayerIndex === i + 2} />
            ))}
          </div>

          <DicePanel 
            value={currentValue}
            progress={animationProgress}
            isRolling={isRolling}
            canRoll={gameState.phase === 'rolling' && activePlayer.type === 'human'}
            onRoll={handleRoll}
            activePlayer={activePlayer}
            hasMovableTokens={gameState.movableTokenIds.length > 0}
            phase={gameState.phase}
          />

          <ScoreBoard events={gameState.eventLog} turnNumber={gameState.turnNumber} />
        </div>

      </div>

      {/* Winner Modal */}
      {gameState.phase === 'game-over' && (
        <div className="absolute inset-0 bg-obsidian-950/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="bg-obsidian-900 p-10 rounded-3xl border-2 border-gold-500 shadow-gem-glow text-center flex flex-col items-center max-w-md w-full relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gold-gradient" />
            
            <div className="mb-6 relative">
              <div className="absolute inset-0 bg-gold-500 blur-3xl opacity-30 animate-pulse" />
              <div className="bg-obsidian-800 p-6 rounded-full border-2 border-gold-500 relative">
                <Trophy size={80} className="text-gold-400" />
              </div>
            </div>

            <h2 className="font-cinzel text-5xl font-black bg-gold-gradient text-transparent bg-clip-text mb-2">
              VICTORY!
            </h2>
            
            <div className="flex items-center gap-3 mb-8">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-white/20"
                style={{ backgroundColor: TOKEN_COLORS[gameState.winner?.color || 'red'].fill }}
              >
                {gameState.winner && renderIcon(gameState.winner.avatar.iconName, { size: 24, className: "text-white" })}
              </div>
              <span className="text-2xl font-cinzel text-parchment-100">{gameState.winner?.name}</span>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full mb-8">
              <div className="bg-obsidian-800 p-4 rounded-xl border border-gray-700">
                <div className="text-gray-400 text-xs mb-1 uppercase tracking-wider font-cinzel">Turns</div>
                <div className="text-2xl font-bold text-parchment-100">{gameState.turnNumber}</div>
              </div>
              <div className="bg-obsidian-800 p-4 rounded-xl border border-gray-700">
                <div className="text-gray-400 text-xs mb-1 uppercase tracking-wider font-cinzel">Captures</div>
                <div className="text-2xl font-bold text-ruby-400">{gameState.winner?.stats.tokensCapured}</div>
              </div>
            </div>

            <div className="flex flex-col gap-3 w-full">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onExit} 
                className="w-full py-4 bg-gold-gradient text-obsidian-950 font-bold rounded-xl font-cinzel text-xl shadow-lg"
              >
                PLAY AGAIN
              </motion.button>
              
              <button 
                onClick={onExit}
                className="w-full py-3 text-gold-500 font-cinzel hover:text-gold-400 transition-colors"
              >
                EXIT TO MENU
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
