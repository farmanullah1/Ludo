import React, { useState } from 'react';
import { GameEvent } from '../../engine/types';
import { TOKEN_COLORS } from '../../engine/constants';
import { motion, AnimatePresence } from 'framer-motion';

import { Dices, ArrowRight, Swords, Sparkles, Trophy, SkipForward, List } from 'lucide-react';

interface ScoreBoardProps {
  events: GameEvent[];
  turnNumber: number;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({ events, turnNumber }) => {
  const [expanded, setExpanded] = useState(false);

  const getEventIcon = (type: GameEvent['type']) => {
    switch(type) {
      case 'roll': return <Dices size={14} className="text-gold-400" />;
      case 'move': return <ArrowRight size={14} className="text-blue-400" />;
      case 'capture': return <Swords size={14} className="text-ruby-400" />;
      case 'enter': return <Sparkles size={14} className="text-emerald-400" />;
      case 'finish': return <Trophy size={14} className="text-gold-500" />;
      case 'skip': return <SkipForward size={14} className="text-gray-400" />;
      default: return null;
    }
  };

  return (
    <div className="bg-obsidian-800 rounded-xl overflow-hidden shadow-gem-glow border border-gray-700 w-full max-w-sm">
      <div 
        className="p-3 bg-obsidian-900 cursor-pointer flex justify-between items-center"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="font-cinzel text-gold-400 font-bold flex items-center gap-2">
          <List size={18} /> Turn {turnNumber}
        </span>
        <span className="text-gray-400 text-sm">{expanded ? '▼ Collapse' : '▲ Event Log'}</span>
      </div>
      
      <AnimatePresence>
        {expanded && (
          <motion.div 
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="max-h-64 overflow-y-auto p-2 flex flex-col gap-1">
              {events.length === 0 && (
                <div className="text-center text-gray-500 py-4 text-sm">No events yet</div>
              )}
              {events.map(ev => (
                <motion.div 
                  key={ev.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 p-2 rounded bg-obsidian-950 text-sm"
                >
                  <span>{getEventIcon(ev.type)}</span>
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: TOKEN_COLORS[ev.playerColor].fill }}
                  />
                  <span className="text-parchment-200">{ev.description}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
