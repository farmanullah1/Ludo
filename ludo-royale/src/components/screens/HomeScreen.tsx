import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Settings, HelpCircle, GraduationCap, Crown, Mail, Globe } from 'lucide-react';

interface HomeScreenProps {
  onPlay: () => void;
  onSettings: () => void;
  onHowToPlay: () => void;
  onTraining: () => void;
  onResume?: () => void;
  hasSavedGame?: boolean;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onPlay, onSettings, onHowToPlay, onTraining, onResume, hasSavedGame }) => {
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
      color: ['#f9d976', '#ef4444', '#3b82f6', '#10b981'][Math.floor(Math.random() * 4)] || '#f9d976'
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
          {hasSavedGame && onResume && (
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onResume}
              className="w-full py-4 bg-amber-500 text-obsidian-950 font-bold font-cinzel text-xl rounded-full shadow-gem-glow hover:bg-amber-400 flex items-center justify-center gap-2 border border-gold-400 animate-pulse"
            >
              <Trophy size={24} /> RESUME GAME
            </motion.button>
          )}

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

      <div className="absolute bottom-4 flex flex-col items-center gap-2 z-10">
        <div className="text-gray-400 text-sm font-crimson italic flex items-center gap-1">
          v1.2.0 • Crafted with <Crown size={14} className="text-gold-500 fill-gold-500" /> by Farman Ullah
        </div>
        <div className="flex gap-4 text-gray-500">
          <a href="mailto:farmanullahansari999@gmail.com" title="Email" className="hover:text-gold-400 transition-colors" target="_blank" rel="noreferrer">
            <Mail size={18} />
          </a>
          <a href="https://linkedin.com/in/farmanullah-ansari" title="LinkedIn" className="hover:text-gold-400 transition-colors" target="_blank" rel="noreferrer">
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-linkedin">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
              <rect width="4" height="12" x="2" y="9" />
              <circle cx="4" cy="4" r="2" />
            </svg>
          </a>
          <a href="https://github.com/farmanullah1" title="GitHub" className="hover:text-gold-400 transition-colors" target="_blank" rel="noreferrer">
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-github">
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.2 1.85v4" />
              <path d="M9 18c-4.51 2-5-2-7-2" />
            </svg>
          </a>
          <a href="https://x.com/farmanullah9088" title="X (Twitter)" className="hover:text-gold-400 transition-colors" target="_blank" rel="noreferrer">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" className="lucide lucide-twitter">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
          <a href="https://farmanullah1.github.io/My-Portfolio/" title="Live Portfolio" className="hover:text-gold-400 transition-colors" target="_blank" rel="noreferrer">
            <Globe size={18} />
          </a>
        </div>
      </div>
    </div>
  );
};

