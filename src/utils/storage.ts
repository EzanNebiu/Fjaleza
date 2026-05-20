/**
 * LocalStorage utilities for persisting game data
 */

import type { GameStats, Settings } from '../types';

const STORAGE_KEYS = {
  STATS: 'fjaleza-stats',
  SETTINGS: 'fjaleza-settings',
  DAILY_STATE: 'fjaleza-daily-state',
} as const;

// Stats management
export function loadStats(): GameStats {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.STATS);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading stats:', error);
  }

  return {
    played: 0,
    wins: 0,
    losses: 0,
    currentStreak: 0,
    maxStreak: 0,
    guessDistribution: {},
  };
}

export function saveStats(stats: GameStats): void {
  try {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
  } catch (error) {
    console.error('Error saving stats:', error);
  }
}

export function updateStats(
  won: boolean,
  guessCount: number,
  lastPlayedDaily?: string
): GameStats {
  const stats = loadStats();

  stats.played++;
  
  if (won) {
    stats.wins++;
    stats.currentStreak++;
    stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
    
    // Update guess distribution
    stats.guessDistribution[guessCount] = (stats.guessDistribution[guessCount] || 0) + 1;
  } else {
    stats.losses++;
    stats.currentStreak = 0;
  }

  if (lastPlayedDaily) {
    stats.lastPlayedDaily = lastPlayedDaily;
  }

  saveStats(stats);
  return stats;
}

export function resetStats(): void {
  saveStats({
    played: 0,
    wins: 0,
    losses: 0,
    currentStreak: 0,
    maxStreak: 0,
    guessDistribution: {},
  });
}

// Settings management
export function loadSettings(): Settings {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }

  return {
    hardMode: false,
    reducedMotion: false,
    highContrast: false,
    soundEnabled: false,
    hasSeenWelcome: false,
  };
}

export function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
}

export function updateSetting<K extends keyof Settings>(
  key: K,
  value: Settings[K]
): Settings {
  const settings = loadSettings();
  settings[key] = value;
  saveSettings(settings);
  return settings;
}

// Daily game state management
export interface DailyGameState {
  date: string;
  guesses: string[][];
  evaluations: any[][];
  status: 'playing' | 'won' | 'lost';
}

export function loadDailyState(dateStr: string): DailyGameState | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.DAILY_STATE);
    if (stored) {
      const state: DailyGameState = JSON.parse(stored);
      if (state.date === dateStr) {
        return state;
      }
    }
  } catch (error) {
    console.error('Error loading daily state:', error);
  }
  return null;
}

export function saveDailyState(state: DailyGameState): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DAILY_STATE, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving daily state:', error);
  }
}
