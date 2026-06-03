import { GameSettings, GameState } from '../engine/types';

const SETTINGS_KEY = 'ludo_royale_settings';
const GAME_STATE_KEY = 'ludo_royale_in_progress_state';

export const saveSettings = (settings: GameSettings): void => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings to localStorage:', error);
  }
};

export const loadSettings = (): GameSettings | null => {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading settings from localStorage:', error);
    return null;
  }
};

export const saveGameState = (state: GameState): void => {
  try {
    localStorage.setItem(GAME_STATE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving GameState to localStorage:', error);
  }
};

export const loadGameState = (): GameState | null => {
  try {
    const data = localStorage.getItem(GAME_STATE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading GameState from localStorage:', error);
    return null;
  }
};

export const clearGameState = (): void => {
  try {
    localStorage.removeItem(GAME_STATE_KEY);
  } catch (error) {
    console.error('Error clearing GameState from localStorage:', error);
  }
};
