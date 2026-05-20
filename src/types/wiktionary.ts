/**
 * Type definitions for Albanian Wiktionary API
 * MediaWiki Action API response types
 */

/**
 * MediaWiki API response for allpages query
 */
export interface WikiAllPagesResponse {
  batchcomplete?: string;
  continue?: {
    apcontinue: string;
    continue: string;
  };
  query: {
    allpages: WikiPage[];
  };
}

/**
 * Individual page from Wiktionary
 */
export interface WikiPage {
  pageid: number;
  ns: number;
  title: string;
}

/**
 * Cached word list with metadata
 */
export interface CachedWordList {
  words: string[];
  updatedAt: number; // Unix timestamp
  version: number;   // Cache format version
}

/**
 * Word fetch result
 */
export interface WordFetchResult {
  words: string[];
  source: 'cache' | 'wiktionary' | 'fallback' | 'expired-cache';
  fetchedAt?: number;
}
