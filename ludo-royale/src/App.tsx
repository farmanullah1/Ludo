import React, { useState } from 'react';
import { HomeScreen } from './components/screens/HomeScreen';
import { LobbyScreen } from './components/screens/LobbyScreen';
import { GameScreen } from './components/screens/GameScreen';
import { HowToPlayScreen } from './components/screens/HowToPlayScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { GameSettings } from './engine/types';

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

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return (
          <HomeScreen 
            onPlay={() => {
              setIsTrainingRequested(false);
              setCurrentScreen('lobby');
            }}
            onSettings={() => setCurrentScreen('settings')}
            onHowToPlay={() => setCurrentScreen('how-to-play')}
            onTraining={() => {
              setIsTrainingRequested(true);
              setCurrentScreen('lobby');
            }}
          />
        );
      case 'settings':
        return (
          <SettingsScreen 
            settings={settings}
            onUpdate={(updates) => setSettings({ ...settings, ...updates })}
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
              setCurrentScreen('game');
            }}
            onBack={() => setCurrentScreen('home')}
          />
        );
      case 'game':
        return (
          <GameScreen 
            settings={settings}
            onExit={() => setCurrentScreen('home')}
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
