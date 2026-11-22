import { EPOCH } from './constants';

const DAY_MS = 86_400_000;
const EPOCH_UTC = Date.UTC(EPOCH.year, EPOCH.month - 1, EPOCH.day);

/**
 * Days since the epoch, using the player's LOCAL calendar date. Everyone on the
 * same local date gets the same puzzle, and the puzzle rolls over at local midnight.
 * Working on calendar dates (not elapsed milliseconds) keeps DST changes harmless.
 */
export function dayIndex(date: Date = new Date()): number {
  const localMidnightAsUtc = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.round((localMidnightAsUtc - EPOCH_UTC) / DAY_MS);
}

/** Human-facing puzzle number, starting at 1 on the epoch date. */
export function puzzleNumber(day: number): number {
  return day + 1;
}

/** Index into the answer schedule. Wraps around after the last answer. */
export function scheduleIndex(day: number, scheduleLength: number): number {
  return ((day % scheduleLength) + scheduleLength) % scheduleLength;
}

/** Milliseconds until the next local midnight. */
export function msUntilNextDay(now: Date = new Date()): number {
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return next.getTime() - now.getTime();
}

export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':');
}
