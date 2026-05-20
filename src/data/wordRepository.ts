/**
 * Word Repository
 * 
 * Handles word selection for daily puzzles and practice mode
 * Uses fallback words for target selection only
 * User guesses are validated via Fjalorthi API
 */

import { VALID_ANSWER_WORDS } from './words';

/**
 * Get a deterministic daily word based on date
 * Uses Europe/Belgrade timezone by default
 */
export function getDailyWord(date: Date = new Date(), timezone: string = 'Europe/Belgrade'): string {
  const words = VALID_ANSWER_WORDS;
  
  // Convert to timezone-specific date
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  
  const parts = formatter.formatToParts(date);
  const year = parts.find(p => p.type === 'year')!.value;
  const month = parts.find(p => p.type === 'month')!.value;
  const day = parts.find(p => p.type === 'day')!.value;
  
  // Create date string: YYYY-MM-DD
  const dateStr = `${year}-${month}-${day}`;
  
  // Use date as seed for deterministic selection
  const hash = simpleHash(dateStr);
  const index = hash % words.length;
  
  return words[index];
}

/**
 * Get a random word for practice mode
 */
export function getRandomWord(): string {
  const words = VALID_ANSWER_WORDS;
  const index = Math.floor(Math.random() * words.length);
  return words[index];
}

/**
 * Simple hash function for deterministic daily word selection
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Get the date string for today in the specified timezone
 * Returns YYYY-MM-DD format
 */
export function getTodayDateString(timezone: string = 'Europe/Belgrade'): string {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  
  const parts = formatter.formatToParts(new Date());
  const year = parts.find(p => p.type === 'year')!.value;
  const month = parts.find(p => p.type === 'month')!.value;
  const day = parts.find(p => p.type === 'day')!.value;
  
  return `${year}-${month}-${day}`;
}
