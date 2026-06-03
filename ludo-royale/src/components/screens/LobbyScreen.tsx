import React, { useState, useEffect } from 'react';
import { GameSettings, GameMode, PlayerConfig, PlayerColor, PlayerType } from '../../engine/types';
import { TOKEN_COLORS } from '../../engine/constants';
import { motion } from 'framer-motion';
import { 
  Users, User, Bot, Clock, Sparkles, Volume2, Music, Zap, 
  GraduationCap, ChevronLeft, Shield, Sword, Wrench, 
  Crown, Flame, Gem, Target, Ghost 
} from 'lucide-react';

interface LobbyScreenProps {
  onStart: (settings: GameSettings) => void;
  onBack: () => void;
  initialTrainingMode?: boolean;
}

const AVATAR_ICONS = [
  { icon: Crown, iconName: 'Crown', title: 'The King', color: 'text-gold-400' },
  { icon: Sword, iconName: 'Sword', title: 'The Warrior', color: 'text-ruby-400' },
  { icon: Shield, iconName: 'Shield', title: 'The Guardian', color: 'text-blue-400' },
  { icon: Target, iconName: 'Target', title: 'The Archer', color: 'text-emerald-400' },
  { icon: Flame, iconName: 'Flame', title: 'The Flame', color: 'text-orange-500' },
  { icon: Gem, iconName: 'Gem', title: 'The Diamond', color: 'text-cyan-400' },
  { icon: Ghost, iconName: 'Ghost', title: 'The Phantom', color: 'text-purple-400' },
  { icon: Zap, iconName: 'Zap', title: 'The Bolt', color: 'text-yellow-400' },
];

export const LobbyScreen: React.FC<LobbyScreenProps> = ({ onStart, onBack, initialTrainingMode = false }) => {
  const [mode, setMode] = useState<GameMode>('4-player');
  const [turnTimeLimit, setTurnTimeLimit] = useState<number | null>(null);
  const [showMovableHints, setShowMovableHints] = useState(true);
  const [animationSpeed, setAnimationSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [isTrainingMode, setIsTrainingMode] = useState(initialTrainingMode);

  const [players, setPlayers] = useState<PlayerConfig[]>([
    { name: 'Player 1', type: 'human', color: 'red', avatar: { iconName: 'Crown', title: 'The King' } },
    { name: 'Player 2', type: 'human', color: 'blue', avatar: { iconName: 'Sword', title: 'The Warrior' } },
    { name: 'Player 3', type: 'ai-medium', color: 'green', avatar: { iconName: 'Shield', title: 'The Guardian' } },
    { name: 'Player 4', type: 'ai-medium', color: 'yellow', avatar: { iconName: 'Target', title: 'The Archer' } },
  ]);

  useEffect(() => {
    if (initialTrainingMode) {
      handleTrainingModeToggle(true);
    }
  }, [initialTrainingMode]);

  const handleTrainingModeToggle = (enabled: boolean) => {
    setIsTrainingMode(enabled);
    if (enabled) {
      setTurnTimeLimit(null);
      setShowMovableHints(true);
      setAnimationSpeed('slow');
      // Set others to easy AI
      setPlayers(prev => prev.map((p, i) => i === 0 ? p : { ...p, type: 'ai-easy' as PlayerType }));
    }
  };

  const handleStart = () => {
    onStart({
      mode,
      players: players.slice(0, numPlayers),
      turnTimeLimit,
      soundEnabled,
      musicEnabled,
      animationSpeed,
      showMovableHints,
      blockadeRules: 'standard',
      extraDiceRolls: true,
      safeZoneProtection: true
    });
  };

  const updatePlayer = (index: number, updates: Partial<PlayerConfig>) => {
    const newPlayers = [...players];
    newPlayers[index] = { ...newPlayers[index], ...updates } as PlayerConfig;
    setPlayers(newPlayers);
  };

  const numPlayers = parseInt(mode.charAt(0));

  return (
    <div className="w-screen min-h-screen bg-obsidian-950 p-6 flex flex-col items-center overflow-y-auto">
      <div className="w-full max-w-4xl">
        <button onClick={onBack} className="text-gold-400 hover:text-gold-300 font-cinzel text-lg mb-4 flex items-center gap-2">
          <ChevronLeft /> Back
        </button>

        <h1 className="text-4xl font-cinzel text-center text-gold-300 mb-8 border-b border-gold-600/30 pb-4">
          Game Lobby
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-6">
            {/* Training Mode Toggle */}
            <div className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${isTrainingMode ? 'bg-emerald-900/20 border-emerald-500 shadow-gem-glow' : 'bg-obsidian-900 border-gray-800'}`} onClick={() => handleTrainingModeToggle(!isTrainingMode)}>
               <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${isTrainingMode ? 'bg-emerald-500 text-white' : 'bg-gray-700 text-gray-400'}`}>
                    <GraduationCap size={24} />
                  </div>
                  <div>
                    <div className="font-bold text-parchment-100">Training Mode</div>
                    <div className="text-xs text-gray-400">Easy AI, hints enabled, no timer.</div>
                  </div>
               </div>
               <div className={`w-12 h-6 rounded-full relative transition-colors ${isTrainingMode ? 'bg-emerald-500' : 'bg-gray-700'}`}>
                 <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isTrainingMode ? 'left-7' : 'left-1'}`} />
               </div>
            </div>

            {/* Mode Selection */}
            <div className="bg-obsidian-900 p-6 rounded-xl border border-gray-800">
              <h2 className="text-xl font-cinzel text-parchment-200 mb-4 flex items-center gap-2"><Users size={20} /> Game Mode</h2>
              <div className="flex gap-4">
                {(['2-player', '3-player', '4-player'] as GameMode[]).map(m => (
                  <motion.button
                    key={m}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setMode(m)}
                    className={`flex-1 py-4 rounded-lg border-2 transition-colors flex flex-col items-center gap-1 ${
                      mode === m ? 'border-gold-500 bg-gold-600/20 shadow-gem-glow text-gold-300' : 'border-gray-700 bg-obsidian-800 text-gray-400'
                    }`}
                  >
                    <div className="font-cinzel font-bold">{m.charAt(0)} Players</div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Players */}
            <div className="space-y-4">
              {players.slice(0, numPlayers).map((p, i) => (
                <div key={i} className="bg-obsidian-900 p-4 rounded-xl border border-gray-800 flex flex-wrap gap-4 items-center" style={{ borderLeftColor: TOKEN_COLORS[p.color].fill, borderLeftWidth: 4 }}>
                  
                  <div className="bg-obsidian-800 p-2 rounded-full border border-gray-700">
                    {p.type === 'human' ? <User size={20} className="text-blue-400" /> : <Bot size={20} className="text-emerald-400" />}
                  </div>

                  <div className="flex-1 min-w-[150px]">
                    <input 
                      type="text" 
                      value={p.name}
                      onChange={(e) => updatePlayer(i, { name: e.target.value })}
                      className="bg-transparent border-b-2 text-xl font-bold text-parchment-100 focus:outline-none w-full"
                      style={{ borderColor: TOKEN_COLORS[p.color].fill }}
                    />
                  </div>

                  <select 
                    value={p.type}
                    onChange={(e) => updatePlayer(i, { type: e.target.value as PlayerType })}
                    disabled={isTrainingMode && i > 0}
                    className="bg-obsidian-800 border border-gray-700 rounded p-2 text-parchment-200 outline-none disabled:opacity-50"
                  >
                    <option value="human">Human</option>
                    <option value="ai-easy">AI (Easy)</option>
                    <option value="ai-medium">AI (Medium)</option>
                    <option value="ai-hard">AI (Hard)</option>
                  </select>

                  <div className="flex gap-1">
                    {AVATAR_ICONS.map((avatar, ai) => {
                      const Icon = avatar.icon;
                      return (
                        <button 
                          key={ai}
                          onClick={() => updatePlayer(i, { avatar: { iconName: avatar.iconName, title: avatar.title } })}
                          className={`p-2 rounded transition-all ${p.avatar.iconName === avatar.iconName ? 'bg-gray-700 ring-1 ring-gold-400 scale-110' : 'opacity-40 hover:opacity-100'}`}
                          title={avatar.title}
                        >
                          <Icon size={18} className={avatar.color} />
                        </button>
                      );
                    })}
                  </div>

                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            {/* Settings */}
            <div className="bg-obsidian-900 p-6 rounded-xl border border-gray-800">
              <h2 className="text-xl font-cinzel text-parchment-200 mb-4">Options</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 flex items-center gap-2"><Clock size={16} /> Turn Timer</span>
                  <select 
                    value={turnTimeLimit || 'off'} 
                    onChange={e => setTurnTimeLimit(e.target.value === 'off' ? null : parseInt(e.target.value))}
                    disabled={isTrainingMode}
                    className="bg-obsidian-800 text-gold-300 p-1 rounded outline-none border border-gray-700 disabled:opacity-50"
                  >
                    <option value="off">Off</option>
                    <option value="15">15s</option>
                    <option value="30">30s</option>
                    <option value="60">60s</option>
                  </select>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-300 flex items-center gap-2"><Sparkles size={16} /> Show Hints</span>
                  <input type="checkbox" checked={showMovableHints} onChange={e => setShowMovableHints(e.target.checked)} disabled={isTrainingMode} className="accent-gold-500 w-5 h-5" />
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-300 flex items-center gap-2"><Zap size={16} /> Speed</span>
                  <select 
                    value={animationSpeed} 
                    onChange={e => setAnimationSpeed(e.target.value as any)}
                    disabled={isTrainingMode}
                    className="bg-obsidian-800 text-gold-300 p-1 rounded outline-none border border-gray-700 disabled:opacity-50"
                  >
                    <option value="slow">Slow</option>
                    <option value="normal">Normal</option>
                    <option value="fast">Fast</option>
                  </select>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-300 flex items-center gap-2"><Volume2 size={16} /> Sound</span>
                  <input type="checkbox" checked={soundEnabled} onChange={e => setSoundEnabled(e.target.checked)} className="accent-gold-500 w-5 h-5" />
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-300 flex items-center gap-2"><Music size={16} /> Music</span>
                  <input type="checkbox" checked={musicEnabled} onChange={e => setMusicEnabled(e.target.checked)} className="accent-gold-500 w-5 h-5" />
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStart}
              className="w-full py-4 bg-gold-gradient text-obsidian-950 font-bold font-cinzel text-xl rounded-xl shadow-gem-glow flex items-center justify-center gap-2"
            >
              <Zap fill="currentColor" /> START GAME
            </motion.button>
          </div>

        </div>
      </div>
    </div>
  );
};
