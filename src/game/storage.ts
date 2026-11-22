/**
 * Persistence. Everything goes through safeStorage so the game keeps working
 * (for the current session) when localStorage is blocked, full or throws.
 */
import { MAX_GUESSES } from './constants';
import type { GameStatus, ThemeSetting } from './types';

const memory = new Map<string, string>();
let backend: Storage | null | undefined;

function getBackend(): Storage | null {
  if (backend !== undefined) return backend;
  try {
    const s = window.localStorage;
    const probe = '__fjaleza_probe__';
    s.setItem(probe, probe);
    s.removeItem(probe);
    backend = s;
  } catch {
    backend = null;
  }
  return backend;
}

export const safeStorage = {
  get(key: string): string | null {
    try {
      return getBackend()?.getItem(key) ?? memory.get(key) ?? null;
    } catch {
      return memory.get(key) ?? null;
    }
  },
  set(key: string, value: string): void {
    memory.set(key, value);
    try {
      getBackend()?.setItem(key, value);
    } catch {
      /* quota exceeded or blocked: the in-memory copy still works */
    }
  },
  remove(key: string): void {
    memory.delete(key);
    try {
      getBackend()?.removeItem(key);
    } catch {
      /* ignore */
    }
  },
  /** For tests: forget the detected backend. */
  reset(): void {
    backend = undefined;
    memory.clear();
  },
};

function readJson<T>(key: string): T | null {
  const raw = safeStorage.get(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export const KEYS = {
  settings: 'fjaleza:settings:v2',
  stats: 'fjaleza:stats:v2',
  daily: 'fjaleza:daily:v2',
  consent: 'fjaleza:consent:v1',
} as const;

// ---------------------------------------------------------------- settings
export interface Settings {
  hardMode: boolean;
  theme: ThemeSetting;
  colorBlind: boolean;
  /** 'system' follows prefers-reduced-motion. */
  reducedMotion: 'system' | 'on';
  seenHelp: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  hardMode: false,
  theme: 'system',
  colorBlind: false,
  reducedMotion: 'system',
  seenHelp: false,
};

export function loadSettings(): Settings {
  const stored = readJson<Partial<Settings>>(KEYS.settings);
  if (stored) return { ...DEFAULT_SETTINGS, ...stored };
  // Carry over the two settings that existed in the first version.
  const legacy = readJson<{ hardMode?: boolean; hasSeenWelcome?: boolean }>('fjaleza-settings');
  return {
    ...DEFAULT_SETTINGS,
    hardMode: legacy?.hardMode ?? false,
    seenHelp: legacy?.hasSeenWelcome ?? false,
  };
}

export function saveSettings(settings: Settings): void {
  safeStorage.set(KEYS.settings, JSON.stringify(settings));
}

// ---------------------------------------------------------------- daily progress
export interface DailyProgress {
  day: number;
  guesses: string[];
  status: GameStatus;
  hardMode: boolean;
}

export function loadDailyProgress(day: number): DailyProgress | null {
  const stored = readJson<DailyProgress>(KEYS.daily);
  if (!stored || stored.day !== day || !Array.isArray(stored.guesses)) return null;
  return stored;
}

export function saveDailyProgress(progress: DailyProgress): void {
  safeStorage.set(KEYS.daily, JSON.stringify(progress));
}

// ---------------------------------------------------------------- stats (daily games only)
export interface Stats {
  played: number;
  wins: number;
  currentStreak: number;
  maxStreak: number;
  /** distribution[i] = wins in i + 1 guesses */
  distribution: number[];
  lastPlayedDay: number | null;
  lastWonDay: number | null;
}

export const EMPTY_STATS: Stats = {
  played: 0,
  wins: 0,
  currentStreak: 0,
  maxStreak: 0,
  distribution: Array(MAX_GUESSES).fill(0),
  lastPlayedDay: null,
  lastWonDay: null,
};

export function loadStats(): Stats {
  const stored = readJson<Partial<Stats>>(KEYS.stats);
  if (!stored) return { ...EMPTY_STATS, distribution: [...EMPTY_STATS.distribution] };
  const distribution = Array.from({ length: MAX_GUESSES }, (_, i) => Number(stored.distribution?.[i]) || 0);
  return { ...EMPTY_STATS, ...stored, distribution };
}

export function saveStats(stats: Stats): void {
  safeStorage.set(KEYS.stats, JSON.stringify(stats));
}

/**
 * Record a finished daily game. Idempotent per day: a refresh or a second tab
 * can never count the same puzzle twice. A streak continues only if the previous
 * win was on the previous day.
 */
export function recordResult(stats: Stats, day: number, won: boolean, guessCount: number): Stats {
  if (stats.lastPlayedDay !== null && stats.lastPlayedDay >= day) return stats;
  const next: Stats = { ...stats, distribution: [...stats.distribution] };
  next.played += 1;
  next.lastPlayedDay = day;
  if (won) {
    next.wins += 1;
    next.distribution[guessCount - 1] += 1;
    next.currentStreak = stats.lastWonDay === day - 1 ? stats.currentStreak + 1 : 1;
    next.maxStreak = Math.max(next.maxStreak, next.currentStreak);
    next.lastWonDay = day;
  } else {
    next.currentStreak = 0;
  }
  return next;
}

/** The streak as it stands today: it is broken once a whole day passes without a win. */
export function visibleStreak(stats: Stats, today: number): number {
  if (stats.lastWonDay === null) return 0;
  return today - stats.lastWonDay <= 1 ? stats.currentStreak : 0;
}
