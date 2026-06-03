import React from 'react';
import { motion } from 'framer-motion';
import { GameSettings } from '../../engine/types';

interface SettingsScreenProps {
  settings: GameSettings;
  onUpdate: (updates: Partial<GameSettings>) => void;
  onBack: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ settings, onUpdate, onBack }) => {
  return (
    <div className="w-screen min-h-screen bg-obsidian-950 p-8 flex flex-col items-center overflow-y-auto">
      <div className="w-full max-w-xl">
        <button onClick={onBack} className="text-gold-400 hover:text-gold-300 font-cinzel text-lg mb-8">
          ← Back
        </button>

        <h1 className="text-4xl font-cinzel text-gold-300 text-center mb-12">Settings</h1>

        <div className="bg-obsidian-900 p-8 rounded-2xl border border-gold-600/20 space-y-8 shadow-xl">
          
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl text-parchment-100 font-bold">Sound Effects</h3>
              <p className="text-sm text-gray-400">Enable or disable game sounds</p>
            </div>
            <input 
              type="checkbox" 
              checked={settings.soundEnabled} 
              onChange={e => onUpdate({ soundEnabled: e.target.checked })}
              className="w-6 h-6 accent-gold-500"
            />
          </div>

          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl text-parchment-100 font-bold">Music</h3>
              <p className="text-sm text-gray-400">Background ambient music</p>
            </div>
            <input 
              type="checkbox" 
              checked={settings.musicEnabled} 
              onChange={e => onUpdate({ musicEnabled: e.target.checked })}
              className="w-6 h-6 accent-gold-500"
            />
          </div>

          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl text-parchment-100 font-bold">Animation Speed</h3>
              <p className="text-sm text-gray-400">How fast tokens move</p>
            </div>
            <select 
              value={settings.animationSpeed}
              onChange={e => onUpdate({ animationSpeed: e.target.value as any })}
              className="bg-obsidian-800 text-gold-300 p-2 rounded outline-none border border-gray-700"
            >
              <option value="slow">Slow</option>
              <option value="normal">Normal</option>
              <option value="fast">Fast</option>
            </select>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl text-parchment-100 font-bold">Show Movable Hints</h3>
              <p className="text-sm text-gray-400">Highlight tokens you can move</p>
            </div>
            <input 
              type="checkbox" 
              checked={settings.showMovableHints} 
              onChange={e => onUpdate({ showMovableHints: e.target.checked })}
              className="w-6 h-6 accent-gold-500"
            />
          </div>

        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="w-full mt-12 py-4 bg-gold-gradient text-obsidian-950 font-bold font-cinzel text-xl rounded-full shadow-gem-glow"
        >
          SAVE CHANGES
        </motion.button>
      </div>
    </div>
  );
};
