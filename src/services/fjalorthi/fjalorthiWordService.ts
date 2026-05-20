/**
 * Fjalorthi Word Validation Service
 * 
 * Provides cached validation of Albanian words using the Fjalorthi API
 */

import { fetchWordDefinition, isValidWordResponse } from './fjalorthiApi';
import { normalizeWord } from '../../utils/wordValidation';
import { VALID_ANSWER_WORDS } from '../../data/words';
import type { WordValidationResult, CachedValidation } from '../../types/fjalorthi';

const CACHE_KEY = 'fjaleza-word-validation-cache';
const CACHE_EXPIRY_DAYS = 30;
const CACHE_EXPIRY_MS = CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

/**
 * Load validation cache from localStorage
 */
function loadValidationCache(): Record<string, CachedValidation> {
  try {
    const stored = localStorage.getItem(CACHE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading validation cache:', error);
  }
  return {};
}

/**
 * Save validation cache to localStorage
 */
function saveValidationCache(cache: Record<string, CachedValidation>): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error('Error saving validation cache:', error);
  }
}

/**
 * Check if a cached entry is still valid
 */
function isCacheEntryValid(entry: CachedValidation): boolean {
  const now = Date.now();
  const age = now - entry.checkedAt;
  return age < CACHE_EXPIRY_MS;
}

/**
 * Validate an Albanian word using the Fjalorthi API
 * 
 * This function:
 * 1. Normalizes the input word
 * 2. Checks the cache first
 * 3. If not cached or expired, calls the API
 * 4. Validates the response (checks exactMatches and derived forms)
 * 5. Falls back to checking if the word is in our answer list
 * 6. Caches the result
 * 7. Returns validation result
 * 
 * IMPORTANT: This does NOT replace the user's guess with canonicalWord.
 * The guess remains exactly as the user typed it.
 * 
 * @param word - The word to validate (will be normalized)
 * @returns Validation result with isValid flag
 */
export async function validateAlbanianWord(word: string): Promise<WordValidationResult> {
  const normalized = normalizeWord(word);
  const normalizedUpper = normalized.toUpperCase();

  // Load cache
  const cache = loadValidationCache();

  // Check cache first
  if (cache[normalized]) {
    const cachedEntry = cache[normalized];
    if (isCacheEntryValid(cachedEntry)) {
      console.log(`✓ Using cached validation for "${normalized}": ${cachedEntry.isValid}`);
      return {
        isValid: cachedEntry.isValid,
        searchedWord: normalized,
        canonicalWord: cachedEntry.canonicalWord,
        source: 'cache',
      };
    }
  }

  // Not in cache or expired - call API
  console.log(`→ Validating "${normalized}" via Fjalorthi API...`);

  try {
    const response = await fetchWordDefinition(normalized);
    
    // Check if the response indicates a valid word
    let isValid = isValidWordResponse(response, normalized);

    // FALLBACK: If API doesn't recognize it, check if it's in our answer list
    // This handles conjugated forms and valid Albanian words that the API might miss
    if (!isValid && VALID_ANSWER_WORDS.includes(normalizedUpper)) {
      console.log(`✓ Word "${normalized}" found in answer list (API fallback)`);
      isValid = true;
    }

    // Extract canonical word if available
    const canonicalWord = response.firstCanonicalWord || undefined;

    // Cache the result
    cache[normalized] = {
      isValid,
      checkedAt: Date.now(),
      canonicalWord,
    };
    saveValidationCache(cache);

    console.log(`✓ API validation for "${normalized}": ${isValid}${canonicalWord ? ` (canonical: ${canonicalWord})` : ''}`);

    return {
      isValid,
      searchedWord: normalized,
      canonicalWord,
      source: 'api',
    };
  } catch (error) {
    console.error('Failed to validate word via API:', error);
    throw error;
  }
}

/**
 * Clear the validation cache
 * Useful for testing or if the cache becomes corrupted
 */
export function clearValidationCache(): void {
  try {
    localStorage.removeItem(CACHE_KEY);
    console.log('Validation cache cleared');
  } catch (error) {
    console.error('Error clearing validation cache:', error);
  }
}

/**
 * Get cache statistics for debugging
 */
export function getValidationCacheStats(): { size: number; oldestEntry?: number } {
  const cache = loadValidationCache();
  const entries = Object.values(cache);
  
  let oldestTimestamp: number | undefined;
  if (entries.length > 0) {
    oldestTimestamp = Math.min(...entries.map(e => e.checkedAt));
  }

  return {
    size: entries.length,
    oldestEntry: oldestTimestamp,
  };
}
