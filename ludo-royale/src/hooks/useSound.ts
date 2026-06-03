import { useEffect, useRef, useCallback } from 'react';
import { AudioEngine } from '../engine/audioEngine';
import { GameSettings } from '../engine/types';

export const useSound = (settings: GameSettings) => {
  const engineRef = useRef<AudioEngine | null>(null);

  useEffect(() => {
    // Lazily initialize on first interaction or mount if allowed
    const initAudio = () => {
      if (!engineRef.current) {
        engineRef.current = new AudioEngine();
        engineRef.current.setMusicEnabled(settings.musicEnabled);
        engineRef.current.setSfxEnabled(settings.soundEnabled);
      }
    };
    
    window.addEventListener('click', initAudio, { once: true });
    window.addEventListener('keydown', initAudio, { once: true });

    return () => {
      window.removeEventListener('click', initAudio);
      window.removeEventListener('keydown', initAudio);
      if (engineRef.current) {
        engineRef.current.stopMusic();
      }
    };
  }, []);

  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setMusicEnabled(settings.musicEnabled);
      engineRef.current.setSfxEnabled(settings.soundEnabled);
    }
  }, [settings.musicEnabled, settings.soundEnabled]);

  const playDiceRoll = useCallback(() => engineRef.current?.playDiceRoll(), []);
  const playTokenMove = useCallback(() => engineRef.current?.playTokenMove(), []);
  const playCapture = useCallback(() => engineRef.current?.playCapture(), []);
  const playTokenEnter = useCallback(() => engineRef.current?.playTokenEnter(), []);
  const playTokenFinish = useCallback(() => engineRef.current?.playTokenFinish(), []);
  const playTick = useCallback(() => engineRef.current?.playTick(), []);

  return {
    playDiceRoll,
    playTokenMove,
    playCapture,
    playTokenEnter,
    playTokenFinish,
    playTick
  };
};
