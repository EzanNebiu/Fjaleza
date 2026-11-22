import { describe, expect, it } from 'vitest';
import { dayIndex, formatCountdown, msUntilNextDay, puzzleNumber, scheduleIndex } from './daily';
import { ANSWER_COUNT, answerAt, answerForDay } from './words';

describe('dayIndex', () => {
  it('is 0 on the epoch date and counts local calendar days', () => {
    expect(dayIndex(new Date(2026, 10, 22, 0, 0, 1))).toBe(0);
    expect(dayIndex(new Date(2026, 10, 22, 23, 59, 59))).toBe(0);
    expect(dayIndex(new Date(2026, 10, 23, 0, 0, 0))).toBe(1);
    expect(dayIndex(new Date(2027, 10, 22, 12))).toBe(365);
  });

  it('rolls over exactly at local midnight', () => {
    const before = new Date(2026, 11, 31, 23, 59, 59, 999);
    const after = new Date(2027, 0, 1, 0, 0, 0, 0);
    expect(dayIndex(after) - dayIndex(before)).toBe(1);
  });

  it('stays consecutive across DST changes', () => {
    let prev = dayIndex(new Date(2027, 0, 1, 12));
    for (let d = 1; d < 400; d++) {
      const cur = dayIndex(new Date(2027, 0, 1 + d, 12));
      expect(cur).toBe(prev + 1);
      prev = cur;
    }
  });

  it('handles dates before the epoch', () => {
    expect(dayIndex(new Date(2026, 10, 21, 12))).toBe(-1);
    expect(scheduleIndex(-1, 10)).toBe(9);
  });
});

describe('daily answer', () => {
  it('is the same for everyone on the same day', () => {
    expect(answerForDay(42)).toBe(answerForDay(42));
  });

  it('never repeats until the whole schedule has been used', () => {
    const seen = new Set<string>();
    for (let d = 0; d < ANSWER_COUNT; d++) seen.add(answerForDay(d));
    expect(seen.size).toBe(ANSWER_COUNT);
    expect(answerForDay(ANSWER_COUNT)).toBe(answerForDay(0));
  });

  it('decodes to valid 5-character Albanian words', () => {
    for (let i = 0; i < ANSWER_COUNT; i++) {
      const w = answerAt(i);
      expect([...w]).toHaveLength(5);
      expect(w).toMatch(/^[a-vx-zçë]+$/u);
    }
  });

  it('starts puzzle numbers at 1', () => {
    expect(puzzleNumber(0)).toBe(1);
  });
});

describe('countdown', () => {
  it('counts down to the next local midnight', () => {
    expect(msUntilNextDay(new Date(2026, 10, 22, 23, 59, 0))).toBe(60_000);
    expect(formatCountdown(3_723_000)).toBe('01:02:03');
    expect(formatCountdown(-5)).toBe('00:00:00');
  });
});
