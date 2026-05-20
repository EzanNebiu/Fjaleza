/**
 * Context-aware Albanian Token Resolver
 * 
 * This module handles the intelligent resolution of Albanian digraphs (DH, GJ, LL, NJ, RR, SH, TH, XH, ZH)
 * based on word context. It does NOT use naive regex replacement but instead considers:
 * 1. Valid Albanian word prefixes from the dictionary
 * 2. Context of the current input
 * 3. Potential valid completions
 */

import { ALBANIAN_DIGRAPHS, type AlbanianToken } from '../types';

/**
 * Check if a combination of letters could form a valid Albanian digraph
 */
export function isPotentialDigraph(char1: string, char2: string): boolean {
  const combo = (char1 + char2).toUpperCase();
  return ALBANIAN_DIGRAPHS.includes(combo as any);
}

/**
 * Context-aware tokenizer that resolves raw input into logical Albanian tokens
 * 
 * @param rawInput - Raw keyboard input string (e.g., "SHQIP")
 * @param validWords - Set of valid Albanian words for context checking
 * @returns Array of resolved Albanian tokens
 * 
 * Examples:
 * - "SHQIP" with valid words containing "SHQIP" → ["SH", "Q", "I", "P"]
 * - "MISHKA" → ["M", "I", "SH", "K", "A"] if "MISHKA" is valid
 * - "ZONJË" → ["Z", "O", "NJ", "Ë"] if "ZONJË" is valid
 */
export function tokenizeAlbanian(
  rawInput: string,
  validWords: Set<string>
): AlbanianToken[] {
  if (!rawInput) return [];
  
  const input = rawInput.toUpperCase();
  const tokens: AlbanianToken[] = [];
  let i = 0;

  while (i < input.length) {
    let matched = false;

    // Try to match a two-character digraph
    if (i < input.length - 1) {
      const twoChar = input.slice(i, i + 2);
      
      if (ALBANIAN_DIGRAPHS.includes(twoChar as any)) {
        // Build potential word with digraph
        const potentialTokens = [...tokens, twoChar];
        const remaining = input.slice(i + 2);
        
        // Check if using the digraph leads to valid word prefixes
        if (isValidPrefix(potentialTokens, remaining, validWords)) {
          tokens.push(twoChar);
          i += 2;
          matched = true;
        }
      }
    }

    // If no digraph matched, take single character
    if (!matched) {
      tokens.push(input[i]);
      i += 1;
    }
  }

  return tokens;
}

/**
 * Check if the current token sequence (plus remaining input) could lead to a valid word
 * 
 * This is the key function that makes tokenization context-aware
 */
function isValidPrefix(
  currentTokens: AlbanianToken[],
  remaining: string,
  validWords: Set<string>
): boolean {
  const currentStr = currentTokens.join('');
  
  // If we have no remaining input, check if current is a valid word
  if (!remaining) {
    return validWords.has(currentStr);
  }

  // Check if any valid word starts with current string
  for (const word of validWords) {
    if (word.startsWith(currentStr)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Convert tokens back to a raw string
 */
export function tokensToString(tokens: AlbanianToken[]): string {
  return tokens.join('');
}

/**
 * Get the length of a word in logical Albanian tokens (not character length)
 */
export function getTokenLength(word: string, validWords: Set<string>): number {
  return tokenizeAlbanian(word, validWords).length;
}

/**
 * Resolve the next character input given current raw input buffer
 * Returns the updated resolved tokens
 * 
 * This is used during live input to update the display
 */
export function resolveNextInput(
  currentRawInput: string,
  newChar: string,
  validWords: Set<string>
): AlbanianToken[] {
  const newRawInput = currentRawInput + newChar;
  return tokenizeAlbanian(newRawInput, validWords);
}

/**
 * Remove the last logical token from the input
 * Returns both the new raw input and new tokens
 */
export function removeLastToken(
  currentRawInput: string,
  currentTokens: AlbanianToken[]
): { rawInput: string; tokens: AlbanianToken[] } {
  if (currentTokens.length === 0) {
    return { rawInput: '', tokens: [] };
  }

  const lastToken = currentTokens[currentTokens.length - 1];
  const newRawInput = currentRawInput.slice(0, -lastToken.length);
  const newTokens = currentTokens.slice(0, -1);

  return { rawInput: newRawInput, tokens: newTokens };
}

/**
 * Validate that a tokenized word exists in the valid words set
 */
export function isValidWord(tokens: AlbanianToken[], validWords: Set<string>): boolean {
  const word = tokensToString(tokens);
  return validWords.has(word);
}

/**
 * Simple fallback tokenizer for when no dictionary is available
 * Uses greedy matching but is less accurate
 */
export function tokenizeGreedy(rawInput: string): AlbanianToken[] {
  if (!rawInput) return [];
  
  const input = rawInput.toUpperCase();
  const tokens: AlbanianToken[] = [];
  let i = 0;

  while (i < input.length) {
    let matched = false;

    // Try two-character digraphs first
    if (i < input.length - 1) {
      const twoChar = input.slice(i, i + 2);
      if (ALBANIAN_DIGRAPHS.includes(twoChar as any)) {
        tokens.push(twoChar);
        i += 2;
        matched = true;
      }
    }

    if (!matched) {
      tokens.push(input[i]);
      i += 1;
    }
  }

  return tokens;
}
