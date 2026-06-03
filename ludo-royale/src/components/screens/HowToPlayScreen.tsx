import React from 'react';
import { motion } from 'framer-motion';

import { Trophy, Dices, ArrowRight, Swords, Shield, Sparkles, ChevronLeft } from 'lucide-react';

interface HowToPlayScreenProps {
  onBack: () => void;
}

export const HowToPlayScreen: React.FC<HowToPlayScreenProps> = ({ onBack }) => {
  const steps = [
    {
      title: 'Goal',
      description: 'Be the first to move all 4 of your tokens from the home yard to the center finishing square.',
      icon: <Trophy className="text-gold-400" size={40} />
    },
    {
      title: 'Getting Started',
      description: 'You must roll a 6 to move a token from your yard onto the starting square.',
      icon: <Dices className="text-blue-400" size={40} />
    },
    {
      title: 'Bonus Turns',
      description: 'Rolling a 6 earns you a bonus turn. However, rolling three 6s in a row forfeits your turn!',
      icon: <Sparkles className="text-emerald-400" size={40} />
    },
    {
      title: 'Capturing',
      description: 'Land on an opponent\'s token to send it back to their yard. Capturing grants you an extra turn!',
      icon: <Swords className="text-ruby-400" size={40} />
    },
    {
      title: 'Safe Spaces & Blocks',
      description: 'Star-marked cells are safe. Two tokens of the same color form a blockade that no one can pass or land on.',
      icon: <Shield className="text-gold-500" size={40} />
    },
    {
      title: 'Winning',
      description: 'You must roll the exact number needed to reach the home square. First to all 4 tokens wins!',
      icon: <Star className="text-purple-400" size={40} />
    }
  ];

  return (
    <div className="w-screen min-h-screen bg-obsidian-950 p-8 flex flex-col items-center overflow-y-auto">
      <div className="w-full max-w-2xl">
        <button onClick={onBack} className="text-gold-400 hover:text-gold-300 font-cinzel text-lg mb-8 flex items-center gap-2">
          <ChevronLeft /> Back to Menu
        </button>

        <h1 className="text-5xl font-cinzel text-gold-300 text-center mb-12">How to Play</h1>

        <div className="grid gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-obsidian-900 p-6 rounded-2xl border border-gold-600/20 flex gap-6 items-center shadow-lg"
            >
              <div className="bg-obsidian-800 w-20 h-20 flex items-center justify-center rounded-full border-2 border-gold-500 shadow-gem-glow flex-shrink-0">
                {step.icon}
              </div>
              <div>
                <h3 className="text-2xl font-cinzel text-gold-400 mb-2">{step.title}</h3>
                <p className="text-parchment-200 leading-relaxed font-crimson text-lg">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="w-full mt-12 py-4 bg-gold-gradient text-obsidian-950 font-bold font-cinzel text-xl rounded-full shadow-gem-glow"
        >
          GOT IT!
        </motion.button>
      </div>
    </div>
  );
};
