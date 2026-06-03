import React from 'react';
import { Player } from '../../engine/types';
import { TOKEN_COLORS } from '../../engine/constants';
import { motion } from 'framer-motion';
import { renderIcon } from '../../utils/iconUtils';

import { Trophy, Swords, User, Bot, Star, Home } from 'lucide-react';

interface PlayerPanelProps {
  player: Player;
  isActive: boolean;
  compact?: boolean;
}

export const PlayerPanel: React.FC<PlayerPanelProps> = ({ player, isActive, compact }) => {
  const borderColor = TOKEN_COLORS[player.color].fill;
  
  if (compact) {
    return (
      <motion.div 
        animate={isActive ? { scale: 1.02, boxShadow: `0 0 10px ${borderColor}80` } : { scale: 1.0, boxShadow: 'none' }}
        className={`bg-obsidian-800 rounded-lg p-2 flex items-center gap-2 border-l-4 ${isActive ? 'brightness-110' : 'opacity-70'} min-w-[110px] max-w-[140px] flex-shrink-0`}
        style={{ borderLeftColor: borderColor }}
      >
        <div className="bg-obsidian-900 p-1 rounded-full border border-gray-700 flex-shrink-0">
           {player.type === 'human' ? <User size={12} className="text-blue-400" /> : <Bot size={12} className="text-emerald-400" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-bold text-parchment-100 text-xs truncate flex items-center gap-1">
            {renderIcon(player.avatar.iconName, { size: 10, className: "text-gold-400 flex-shrink-0" })}
            <span className="truncate">{player.name}</span>
          </div>
          <div className="text-[10px] text-gold-400 flex items-center gap-1 font-cinzel">
            <Trophy size={10} /> {player.stats.tokensFinished}/4
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      animate={isActive ? { scale: 1.02, boxShadow: `0 0 15px ${borderColor}80` } : { scale: 1.0, boxShadow: 'none' }}
      className={`bg-obsidian-800 rounded-lg overflow-hidden flex flex-col w-full min-w-[200px] border-l-4 ${isActive ? 'brightness-110' : 'opacity-80'}`}
      style={{ borderLeftColor: borderColor }}
    >
      <div className="p-3 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="bg-obsidian-900 p-2 rounded-full border border-gray-700">
             {player.type === 'human' ? <User size={20} className="text-blue-400" /> : <Bot size={20} className="text-emerald-400" />}
          </div>
          <div>
            <div className="font-bold text-parchment-100 flex items-center gap-2">
              {renderIcon(player.avatar.iconName, { size: 18, className: "text-gold-400" })} {player.name}
            </div>
            <div className="text-xs text-gray-400 capitalize">{player.type.replace('-', ' ')}</div>
          </div>
        </div>
      </div>
      
      <div className="p-3 flex flex-col gap-2 bg-obsidian-900">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-400 flex items-center gap-1"><Home size={14} /> Tokens:</span>
          <div className="flex gap-1">
            {player.tokens.map((t, i) => (
              <span key={i} title={t.isHome ? 'Base' : t.isFinished ? 'Finished' : 'On Board'}>
                {t.isHome ? <div className="w-3 h-3 bg-gray-600 rounded-sm" /> : t.isFinished ? <Trophy size={14} className="text-gold-400" /> : <div className="w-3 h-3 rounded-full" style={{ backgroundColor: TOKEN_COLORS[player.color].fill }} />}
              </span>
            ))}
          </div>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-400 flex items-center gap-1"><Swords size={14} /> Captures:</span>
          <span className="text-ruby-400 font-bold">{player.stats.tokensCapured}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-400 flex items-center gap-1"><Star size={14} /> Finished:</span>
          <span className="text-gold-400 font-bold">{player.stats.tokensFinished} / 4</span>
        </div>
      </div>
    </motion.div>
  );
};
