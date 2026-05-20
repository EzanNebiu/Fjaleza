/**
 * Albanian Word Service
 * High-level service for managing Albanian 5-letter word lists
 * Handles caching, fetching from Wiktionary, and fallback
 */

import { fetchAllWiktionaryPages } from './wiktionaryApi';
import { loadWordCache, saveWordCache, isCacheExpired, clearWordCache as clearCache } from '../../utils/wordCache';
import { filterAndCleanWords, validateCachedWords } from '../../utils/wordValidation';
import { FALLBACK_ALBANIAN_WORDS } from '../../data/fallbackWords';
import type { WordFetchResult } from '../../types/wiktionary';

/**
 * Get Albanian 5-letter words
 * Cache-first approach:
 * 1. Try to load from cache
 * 2. If cache is valid and not expired, return it
 * 3. If cache is expired or missing, fetch from Wiktionary
 * 4. If Wiktionary fails, use expired cache or fallback
 */
export async function getAlbanianFiveLetterWords(): Promise<WordFetchResult> {
  console.log('Getting Albanian 5-letter words...');

  // Try to load from cache
  const cache = loadWordCache();

  if (cache) {
    // Validate cache contents
    if (!validateCachedWords(cache.words)) {
      console.warn('Cache exists but contains invalid data, will refetch');
    } else if (!isCacheExpired(cache)) {
      // Cache is valid and not expired
      console.log(`Using cached word list (${cache.words.length} words)`);
      return {
        words: cache.words,
        source: 'cache',
        fetchedAt: cache.updatedAt,
      };
    } else {
      console.log('Cache exists but is expired, will attempt to refresh');
    }
  }

  // Cache is missing, expired, or invalid - try to fetch from Wiktionary
  try {
    console.log('Fetching fresh word list from Wiktionary...');
    const freshWords = await fetchAndProcessWiktionaryWords();

    if (freshWords.length > 0) {
      // Save to cache
      saveWordCache(freshWords);

      return {
        words: freshWords,
        source: 'wiktionary',
        fetchedAt: Date.now(),
      };
    } else {
      console.warn('Wiktionary returned no valid words');
    }
  } catch (error) {
    console.error('Failed to fetch from Wiktionary:', error);
  }

  // Wiktionary fetch failed - use expired cache if available
  if (cache && validateCachedWords(cache.words)) {
    console.log('Using expired cache as fallback');
    return {
      words: cache.words,
      source: 'expired-cache',
      fetchedAt: cache.updatedAt,
    };
  }

  // Last resort: use fallback word list
  console.log('Using built-in fallback word list');
  return {
    words: FALLBACK_ALBANIAN_WORDS,
    source: 'fallback',
  };
}

/**
 * Refresh the Albanian word list from Wiktionary
 * Ignores cache and always fetches fresh data
 */
export async function refreshAlbanianFiveLetterWords(): Promise<WordFetchResult> {
  console.log('Manually refreshing word list from Wiktionary...');

  try {
    const freshWords = await fetchAndProcessWiktionaryWords();

    if (freshWords.length > 0) {
      // Replace cache with fresh data
      saveWordCache(freshWords);

      return {
        words: freshWords,
        source: 'wiktionary',
        fetchedAt: Date.now(),
      };
    } else {
      throw new Error('Wiktionary returned no valid words');
    }
  } catch (error) {
    console.error('Failed to refresh from Wiktionary:', error);
    throw error;
  }
}

/**
 * Clear the cached word list
 * Next call to getAlbanianFiveLetterWords will fetch from Wiktionary
 */
export function clearAlbanianWordCache(): void {
  clearCache();
}

/**
 * Fetch from Wiktionary and process the words
 * Returns filtered, validated, and sorted list of 5-letter Albanian words
 */
async function fetchAndProcessWiktionaryWords(): Promise<string[]> {
  // Fetch all page titles from Wiktionary
  const rawTitles = await fetchAllWiktionaryPages();

  if (rawTitles.length === 0) {
    throw new Error('No pages returned from Wiktionary');
  }

  console.log(`Processing ${rawTitles.length} raw titles from Wiktionary...`);

  // Filter and clean: only 5-token Albanian words
  const validWords = filterAndCleanWords(rawTitles);

  console.log(`After filtering: ${validWords.length} valid 5-letter words`);

  if (validWords.length === 0) {
    throw new Error('No valid 5-letter words found after filtering');
  }

  return validWords;
}

/**
 * Get word list status for debugging/UI display
 */
export function getWordListStatus(): {
  hasCachedWords: boolean;
  isExpired: boolean;
  wordCount?: number;
  age?: string;
} {
  const cache = loadWordCache();

  if (!cache) {
    return {
      hasCachedWords: false,
      isExpired: false,
    };
  }

  const expired = isCacheExpired(cache);
  const ageMs = Date.now() - cache.updatedAt;
  const ageDays = Math.floor(ageMs / (24 * 60 * 60 * 1000));
  const ageHours = Math.floor((ageMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));

  let age = 'just now';
  if (ageDays > 0) {
    age = `${ageDays} day${ageDays !== 1 ? 's' : ''} ago`;
  } else if (ageHours > 0) {
    age = `${ageHours} hour${ageHours !== 1 ? 's' : ''} ago`;
  }

  return {
    hasCachedWords: true,
    isExpired: expired,
    wordCount: cache.words.length,
    age,
  };
}
