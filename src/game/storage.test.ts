import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  EMPTY_STATS,
  KEYS,
  loadDailyProgress,
  loadSettings,
  loadStats,
  recordResult,
  safeStorage,
  saveDailyProgress,
  visibleStreak,
} from './storage';

beforeEach(() => {
  localStorage.clear();
  safeStorage.reset();
});
afterEach(() => {
  vi.restoreAllMocks();
});

const fresh = () => ({ ...EMPTY_STATS, distribution: [...EMPTY_STATS.distribution] });

describe('recordResult', () => {
  it('counts a win and builds a streak on consecutive days', () => {
    let s = recordResult(fresh(), 10, true, 3);
    s = recordResult(s, 11, true, 4);
    expect(s).toMatchObject({ played: 2, wins: 2, currentStreak: 2, maxStreak: 2 });
    expect(s.distribution).toEqual([0, 0, 1, 1, 0, 0]);
  });

  it('is idempotent for the same day, so a refresh cannot double count', () => {
    const once = recordResult(fresh(), 10, true, 3);
    expect(recordResult(once, 10, true, 3)).toBe(once);
  });

  it('resets the streak after a loss', () => {
    let s = recordResult(fresh(), 10, true, 3);
    s = recordResult(s, 11, false, 6);
    expect(s.currentStreak).toBe(0);
    expect(s.maxStreak).toBe(1);
  });

  it('restarts the streak after a skipped day', () => {
    let s = recordResult(fresh(), 10, true, 3);
    s = recordResult(s, 12, true, 2);
    expect(s.currentStreak).toBe(1);
  });

  it('shows the streak as broken once a day is missed', () => {
    const s = recordResult(fresh(), 10, true, 3);
    expect(visibleStreak(s, 10)).toBe(1);
    expect(visibleStreak(s, 11)).toBe(1);
    expect(visibleStreak(s, 12)).toBe(0);
  });
});

describe('daily progress', () => {
  it('survives a reload on the same day and resets on the next day', () => {
    saveDailyProgress({ day: 5, guesses: ['drita'], status: 'playing', hardMode: false });
    safeStorage.reset();
    expect(loadDailyProgress(5)?.guesses).toEqual(['drita']);
    expect(loadDailyProgress(6)).toBeNull();
  });

  it('ignores corrupt data', () => {
    localStorage.setItem(KEYS.daily, '{not json');
    expect(loadDailyProgress(5)).toBeNull();
    localStorage.setItem(KEYS.stats, '"oops"');
    expect(loadStats().played).toBe(0);
  });
});

describe('blocked localStorage', () => {
  it('falls back to memory without throwing', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError');
    });
    safeStorage.reset();
    expect(() =>
      saveDailyProgress({ day: 1, guesses: ['akull'], status: 'won', hardMode: false })
    ).not.toThrow();
    expect(loadDailyProgress(1)?.status).toBe('won');
    expect(loadSettings().theme).toBe('system');
  });
});

describe('settings migration', () => {
  it('carries over hard mode and the welcome flag from version 1', () => {
    localStorage.setItem('fjaleza-settings', JSON.stringify({ hardMode: true, hasSeenWelcome: true }));
    expect(loadSettings()).toMatchObject({ hardMode: true, seenHelp: true });
  });
});
