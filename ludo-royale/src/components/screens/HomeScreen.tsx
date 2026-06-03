import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Settings, HelpCircle, GraduationCap, Crown } from 'lucide-react';

interface HomeScreenProps {
  onPlay: () => void;
  onSettings: () => void;
  onHowToPlay: () => void;
  onTraining: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onPlay, onSettings, onHowToPlay, onTraining }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;

    const particles = Array.from({ length: 40 }).map(() => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: Math.random() * 2 + 1,
      color: ['#f9d976', '#ef4444', '#3b82f6', '#10b981'][Math.floor(Math.random() * 4)]
    }));

    let animationId: number;

    const render = () => {
      ctx.clearRect(0, 0, w, h);
      
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.6;
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      animationId = requestAnimationFrame(render);
    };

    render();

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="relative w-screen h-screen flex flex-col items-center justify-center overflow-hidden bg-obsidian-950">
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
      
      <div className="z-10 flex flex-col items-center text-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="relative mb-8"
        >
          <div className="absolute inset-0 bg-gold-gradient blur-3xl opacity-20 animate-pulse"></div>
          <h1 className="font-cinzel text-7xl font-black bg-gold-gradient text-transparent bg-clip-text drop-shadow-lg">
            LUDO ROYALE
          </h1>
          <h2 className="font-crimson italic text-gold-300 text-2xl mt-2 tracking-widest">
            The Classic Game. Reborn.
          </h2>
        </motion.div>

        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="flex flex-col gap-4 w-72"
        >
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onPlay}
            className="w-full py-4 bg-gold-gradient text-obsidian-950 font-bold font-cinzel text-xl rounded-full shadow-gem-glow hover:brightness-110 flex items-center justify-center gap-2"
          >
            <Trophy size={24} /> PLAY GAME
          </motion.button>

          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onTraining}
            className="w-full py-4 bg-emerald-600 text-white font-bold font-cinzel text-xl rounded-full shadow-lg hover:bg-emerald-500 flex items-center justify-center gap-2 border-2 border-emerald-400/30"
          >
            <GraduationCap size={24} /> TRAINING
          </motion.button>
          
          <div className="grid grid-cols-2 gap-4">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onHowToPlay}
              className="py-3 border-2 border-gold-600/50 text-gold-400 font-bold font-cinzel rounded-full hover:bg-gold-600/10 flex items-center justify-center gap-2"
            >
              <HelpCircle size={18} /> INFO
            </motion.button>
            
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onSettings}
              className="py-3 border-2 border-gold-600/50 text-gold-400 font-bold font-cinzel rounded-full hover:bg-gold-600/10 flex items-center justify-center gap-2"
            >
              <Settings size={18} /> SETTINGS
            </motion.button>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-4 text-gray-500 text-sm font-crimson italic flex items-center gap-1">
        v1.1.0 • Made with <Crown size={14} className="text-gold-600" /> by Farman Ullah
      </div>
    </div>
  );
};

