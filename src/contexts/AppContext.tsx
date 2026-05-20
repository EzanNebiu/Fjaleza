/**
 * App Context for global state management
 * 
 * Manages settings, stats, and game mode
 */

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import { loadSettings, saveSettings, loadStats, updateStats, resetStats as resetStatsStorage } from '../utils/storage';
import { getDailyWord, getRandomWord, getTodayDateString } from '../data/wordRepository';
import type { Settings, GameStats, GameMode } from '../types';

interface AppContextValue {
  settings: Settings;
  stats: GameStats;
  mode: GameMode;
  answer: string;
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  toggleMode: () => void;
  newGame: () => void;
  onGameEnd: (won: boolean, guesses: number) => void;
  resetStats: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [stats, setStats] = useState<GameStats>(loadStats);
  const [mode, setMode] = useState<GameMode>('daily');
  const [answer, setAnswer] = useState<string>(() => getDailyWord());

  // Check if daily puzzle needs reset (every 24 hours)
  useEffect(() => {
    const checkDailyReset = () => {
      const today = getTodayDateString();
      
      if (mode === 'daily') {
        const lastPlayedDate = stats.lastPlayedDaily;
        
        // If never played or different day, reset to today's word
        if (!lastPlayedDate || lastPlayedDate !== today) {
          console.log('Daily word reset:', { lastPlayedDate, today });
          setAnswer(getDailyWord());
        }
      }
    };

    // Check on mount
    checkDailyReset();

    // Check every minute for date change
    const interval = setInterval(checkDailyReset, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, [mode, stats.lastPlayedDaily]);

  const updateSetting = useCallback(<K extends keyof Settings>(key: K, value: Settings[K]) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    saveSettings(newSettings);
  }, [settings]);

  const toggleMode = useCallback(() => {
    const newMode: GameMode = mode === 'daily' ? 'practice' : 'daily';
    setMode(newMode);
    
    if (newMode === 'daily') {
      setAnswer(getDailyWord());
    } else {
      setAnswer(getRandomWord());
    }
  }, [mode]);

  const newGame = useCallback(() => {
    if (mode === 'practice') {
      setAnswer(getRandomWord());
    } else {
      setAnswer(getDailyWord());
    }
  }, [mode]);

  const onGameEnd = useCallback((won: boolean, guesses: number) => {
    setStats(() => {
      const today = mode === 'daily' ? getTodayDateString() : undefined;
      return updateStats(won, guesses, today);
    });
  }, [mode]);

  const resetStatsCallback = useCallback(() => {
    resetStatsStorage();
    setStats(loadStats());
  }, []);

  return (
    <AppContext.Provider
      value={{
        settings,
        stats,
        mode,
        answer,
        updateSetting,
        toggleMode,
        newGame,
        onGameEnd,
        resetStats: resetStatsCallback,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
