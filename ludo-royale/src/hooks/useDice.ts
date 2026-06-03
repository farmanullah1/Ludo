import { useState, useCallback, useRef } from 'react';
import { GameSettings } from '../engine/types';

export const useDice = (settings: GameSettings) => {
  const [isRolling, setIsRolling] = useState(false);
  const [currentValue, setCurrentValue] = useState(1);
  const [animationProgress, setAnimationProgress] = useState(0);
  const animationRef = useRef<number>();

  const roll = useCallback((onComplete: (val: number) => void) => {
    if (isRolling) return;
    
    setIsRolling(true);
    setAnimationProgress(0);
    
    const startTime = performance.now();
    const duration = 1200; // ms

    const animate = (time: number) => {
      let progress = (time - startTime) / duration;
      if (progress >= 1) progress = 1;
      
      setAnimationProgress(progress);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsRolling(false);
        const finalValue = Math.floor(Math.random() * 6) + 1;
        setCurrentValue(finalValue);
        onComplete(finalValue);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [isRolling]);

  return { roll, isRolling, currentValue, animationProgress };
};
