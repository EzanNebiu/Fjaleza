/**
 * Fjalorthi API Client
 * 
 * Validates Albanian words using the Fjalorthi dictionary API
 */

import type { FjalorthiResponse } from '../../types/fjalorthi';

const API_BASE_URL = 'https://qub10cxllf.execute-api.eu-central-1.amazonaws.com/prod/define/';
const REQUEST_TIMEOUT = 10000; // 10 seconds

/**
 * Fetch word definition from Fjalorthi API
 * 
 * @param word - Normalized Albanian word to validate
 * @returns API response with exactMatches and fuzzyMatches
 */
export async function fetchWordDefinition(word: string): Promise<FjalorthiResponse> {
  const url = `${API_BASE_URL}${encodeURIComponent(word)}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data: FjalorthiResponse = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - please try again');
      }
      throw new Error(`API request failed: ${error.message}`);
    }
    throw new Error('Unknown error occurred while validating word');
  }
}

/**
 * Check if the API response indicates a valid word
 * 
 * A word is valid if:
 * 1. exactMatches array exists and has items
 * 2. At least one exact match has exactMatch === true
 * 3. OR the searched word appears in derived forms (wordDer1-9)
 * 
 * @param response - Fjalorthi API response
 * @param searchedWord - The word that was searched (normalized)
 * @returns true if the word is valid
 */
export function isValidWordResponse(response: FjalorthiResponse, searchedWord: string): boolean {
  if (!response.exactMatches || !Array.isArray(response.exactMatches)) {
    return false;
  }

  if (response.exactMatches.length === 0) {
    return false;
  }

  // Check if any exact match confirms the word
  for (const match of response.exactMatches) {
    // Primary check: exactMatch flag
    if (match.exactMatch === true) {
      return true;
    }

    // Secondary check: word appears in derived forms
    const derivedForms = [
      match.wordDer1,
      match.wordDer2,
      match.wordDer3,
      match.wordDer4,
      match.wordDer5,
      match.wordDer6,
      match.wordDer7,
      match.wordDer8,
      match.wordDer9,
    ];

    for (const derived of derivedForms) {
      if (derived && derived.toLowerCase().trim() === searchedWord.toLowerCase().trim()) {
        return true;
      }
    }
  }

  return false;
}
