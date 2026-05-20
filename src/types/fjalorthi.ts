/**
 * Fjalorthi API Type Definitions
 */

/**
 * Main API response structure
 */
export interface FjalorthiResponse {
  searchedWord: string;
  exactMatches: FjalorthiMatch[];
  fuzzyMatches: FjalorthiMatch[];
  firstCanonicalWord: string | null;
}

/**
 * Individual word match from the API
 */
export interface FjalorthiMatch {
  word: string;
  word2: string;
  word5: string;
  wordOrig: string;
  wordDefinition: string;
  wordDer1: string;
  wordDer2: string;
  wordDer3: string;
  wordDer4: string;
  wordDer5: string;
  wordDer6: string;
  wordDer7: string;
  wordDer8: string;
  wordDer9: string;
  derivedWordMatch: boolean;
  exactMatch: boolean;
  canonicalWord: string;
  verb: string | null;
  antonyms: string[];
  synonyms: string[];
}

/**
 * Validation result
 */
export interface WordValidationResult {
  isValid: boolean;
  searchedWord: string;
  canonicalWord?: string;
  source: 'cache' | 'api';
}

/**
 * Cached validation entry
 */
export interface CachedValidation {
  isValid: boolean;
  checkedAt: number;
  canonicalWord?: string;
}
