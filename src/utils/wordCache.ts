/**
 * localStorage cache management for Albanian word lists
 */

import type { CachedWordList } from '../types/wiktionary';

const CACHE_KEY = 'fjaleza-albanian-words-cache';
const CACHE_VERSION = 1;
const CACHE_EXPIRY_DAYS = 7;

/**
 * Get the cache expiry duration in milliseconds
 */
export function getCacheExpiryMs(): number {
  return CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
}

/**
 * Load cached word list from localStorage
 * Returns null if cache doesn't exist or is invalid
 */
export function loadWordCache(): CachedWordList | null {
  try {
    const stored = localStorage.getItem(CACHE_KEY);
    if (!stored) {
      return null;
    }

    const cache: CachedWordList = JSON.parse(stored);

    // Validate structure
    if (!cache.words || !Array.isArray(cache.words)) {
      console.warn('Invalid cache structure');
      return null;
    }

    if (typeof cache.updatedAt !== 'number') {
      console.warn('Invalid cache timestamp');
      return null;
    }

    // Check version
    if (cache.version !== CACHE_VERSION) {
      console.warn('Cache version mismatch, invalidating');
      return null;
    }

    return cache;
  } catch (error) {
    console.error('Error loading word cache:', error);
    return null;
  }
}

/**
 * Save word list to localStorage cache
 */
export function saveWordCache(words: string[]): void {
  try {
    const cache: CachedWordList = {
      words,
      updatedAt: Date.now(),
      version: CACHE_VERSION,
    };

    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    console.log(`Cached ${words.length} Albanian words`);
  } catch (error) {
    console.error('Error saving word cache:', error);
  }
}

/**
 * Check if the cache is expired
 */
export function isCacheExpired(cache: CachedWordList): boolean {
  const now = Date.now();
  const age = now - cache.updatedAt;
  return age > getCacheExpiryMs();
}

/**
 * Check if a valid, non-expired cache exists
 */
export function hasValidCache(): boolean {
  const cache = loadWordCache();
  if (!cache) {
    return false;
  }

  return !isCacheExpired(cache);
}

/**
 * Clear the word cache from localStorage
 */
export function clearWordCache(): void {
  try {
    localStorage.removeItem(CACHE_KEY);
    console.log('Word cache cleared');
  } catch (error) {
    console.error('Error clearing word cache:', error);
  }
}

/**
 * Get cache age in human-readable format
 */
export function getCacheAge(cache: CachedWordList): string {
  const now = Date.now();
  const ageMs = now - cache.updatedAt;
  const ageDays = Math.floor(ageMs / (24 * 60 * 60 * 1000));
  const ageHours = Math.floor((ageMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));

  if (ageDays > 0) {
    return `${ageDays} day${ageDays !== 1 ? 's' : ''} ago`;
  }
  if (ageHours > 0) {
    return `${ageHours} hour${ageHours !== 1 ? 's' : ''} ago`;
  }
  return 'just now';
}

/**
 * Get cache metadata for debugging/display
 */
export function getCacheInfo(): { exists: boolean; expired: boolean; age?: string; wordCount?: number } | null {
  const cache = loadWordCache();
  if (!cache) {
    return null;
  }

  return {
    exists: true,
    expired: isCacheExpired(cache),
    age: getCacheAge(cache),
    wordCount: cache.words.length,
  };
}
