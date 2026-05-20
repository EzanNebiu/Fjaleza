/**
 * Word validation and normalization utilities for Albanian words
 * 
 * NOTE: This uses CHARACTER-based counting, not token-based.
 * Albanian digraphs (DH, GJ, LL, etc.) count as 2 characters, not 1.
 */

/**
 * Normalize a word to standard form
 * - Convert to lowercase (matching user input style)
 * - Normalize Unicode to NFC
 * - Trim whitespace
 */
export function normalizeWord(word: string): string {
  return word.trim().toLowerCase().normalize('NFC');
}

/**
 * Get the character length of a word
 * Uses Array.from() to correctly count Unicode characters
 */
export function getWordLength(word: string): number {
  return Array.from(word).length;
}

/**
 * Check if a string contains only valid Albanian letters
 * Allowed: a-z, ç, ë (lowercase)
 */
export function containsOnlyAlbanianLetters(word: string): boolean {
  // Valid Albanian letters (lowercase)
  const validPattern = /^[a-zçë]+$/;
  return validPattern.test(word);
}

/**
 * Check if a word should be rejected based on content
 * Rejects:
 * - Words with spaces, hyphens, apostrophes
 * - Words with numbers or punctuation
 * - Words with colons (likely namespace pages)
 */
export function shouldRejectWord(word: string): boolean {
  // Reject if contains invalid characters
  if (/[\s\-''`\d:.,;!?()[\]{}/<>@#$%^&*+=|\\~"]/.test(word)) {
    return true;
  }

  // Reject namespace pages (contain :)
  if (word.includes(':')) {
    return true;
  }

  return false;
}

/**
 * Validate that a word is exactly 5 characters
 * Uses character count, not token count
 */
export function isFiveLetterWord(word: string): boolean {
  if (!word) return false;

  const normalized = normalizeWord(word);

  // Check for invalid content
  if (shouldRejectWord(normalized)) {
    return false;
  }

  // Check Albanian letters only
  if (!containsOnlyAlbanianLetters(normalized)) {
    return false;
  }

  // Check character count (not token count!)
  const length = getWordLength(normalized);
  if (length !== 5) {
    return false;
  }

  return true;
}

/**
 * Validate that a word is suitable for the game
 * - Must be exactly 5 characters
 * - Must contain only Albanian letters
 * - Must not contain invalid characters
 */
export function isValidGameWord(word: string): boolean {
  return isFiveLetterWord(word);
}

/**
 * Filter a list of words to only valid 5-character Albanian game words
 * Also removes duplicates and sorts alphabetically
 */
export function filterAndCleanWords(words: string[]): string[] {
  const validWords = new Set<string>();

  for (const word of words) {
    const normalized = normalizeWord(word);
    
    if (isValidGameWord(normalized)) {
      validWords.add(normalized);
    }
  }

  // Convert to array and sort
  return Array.from(validWords).sort();
}

/**
 * Validate that a cached word list is still usable
 */
export function validateCachedWords(words: unknown): words is string[] {
  if (!Array.isArray(words)) {
    return false;
  }

  // Check that it's an array of strings
  if (!words.every(w => typeof w === 'string')) {
    return false;
  }

  // Check that at least some words are valid
  // Allow up to 10% invalid words (in case validation rules changed)
  const validCount = words.filter(w => isValidGameWord(w)).length;
  const validRatio = validCount / words.length;

  return validRatio >= 0.9 && words.length >= 100;
}
