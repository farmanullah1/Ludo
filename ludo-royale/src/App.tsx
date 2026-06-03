import React, { useState, useEffect } from 'react';
import { HomeScreen } from './components/screens/HomeScreen';
import { LobbyScreen } from './components/screens/LobbyScreen';
import { GameScreen } from './components/screens/GameScreen';
import { HowToPlayScreen } from './components/screens/HowToPlayScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { GameSettings, GameState } from './engine/types';
import { loadGameState, loadSettings, saveSettings } from './utils/storageUtils';

type ScreenState = 'home' | 'lobby' | 'game' | 'settings' | 'how-to-play';

const DEFAULT_SETTINGS: GameSettings = {
  mode: '4-player',
  players: [],
  turnTimeLimit: null,
  soundEnabled: true,
  musicEnabled: true,
  animationSpeed: 'normal',
  showMovableHints: true,
  blockadeRules: 'standard',
  extraDiceRolls: true,
  safeZoneProtection: true
};

function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenState>('home');
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [isTrainingRequested, setIsTrainingRequested] = useState(false);
  const [savedGame, setSavedGame] = useState<GameState | null>(null);
  const [restoredState, setRestoredState] = useState<GameState | null>(null);

  // Load settings and saved game on mount
  useEffect(() => {
    const loadedSettings = loadSettings();
    if (loadedSettings) {
      setSettings(loadedSettings);
    }
    const loadedGame = loadGameState();
    if (loadedGame) {
      setSavedGame(loadedGame);
    }
  }, []);

  // Update settings and save to localStorage
  const handleUpdateSettings = (updates: Partial<GameSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return (
          <HomeScreen 
            onPlay={() => {
              setIsTrainingRequested(false);
              setRestoredState(null);
              setCurrentScreen('lobby');
            }}
            onSettings={() => setCurrentScreen('settings')}
            onHowToPlay={() => setCurrentScreen('how-to-play')}
            onTraining={() => {
              setIsTrainingRequested(true);
              setRestoredState(null);
              setCurrentScreen('lobby');
            }}
            hasSavedGame={!!savedGame}
            onResume={() => {
              if (savedGame) {
                setSettings(savedGame.settings);
                setRestoredState(savedGame);
                setCurrentScreen('game');
              }
            }}
          />
        );
      case 'settings':
        return (
          <SettingsScreen 
            settings={settings}
            onUpdate={handleUpdateSettings}
            onBack={() => setCurrentScreen('home')}
          />
        );
      case 'how-to-play':
        return (
          <HowToPlayScreen onBack={() => setCurrentScreen('home')} />
        );
      case 'lobby':
        return (
          <LobbyScreen 
            initialTrainingMode={isTrainingRequested}
            onStart={(newSettings) => {
              setSettings(newSettings);
              setRestoredState(null);
              setCurrentScreen('game');
            }}
            onBack={() => setCurrentScreen('home')}
          />
        );
      case 'game':
        return (
          <GameScreen 
            settings={settings}
            restoredState={restoredState}
            onExit={() => {
              const loadedGame = loadGameState();
              setSavedGame(loadedGame);
              setRestoredState(null);
              setCurrentScreen('home');
            }}
          />
        );
      default:
        return <div>Screen not found</div>;
    }
  };

  return (
    <div className="w-screen min-h-screen bg-obsidian-950 text-parchment-100 font-crimson overflow-hidden selection:bg-gold-500/30">
      {renderScreen()}
    </div>
  );
}

export default App;
