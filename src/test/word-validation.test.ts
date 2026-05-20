import { describe, it, expect } from 'vitest';
import { tokenizeAlbanian } from '../core/tokenizer';
import { VALID_ANSWER_WORDS, VALID_ALLOWED_WORDS } from '../data/words';

describe('Word List Validation', () => {
  it('should have valid 5-token answer words', () => {
    const validWordsSet = new Set(VALID_ALLOWED_WORDS);
    const invalidWords: string[] = [];
    
    VALID_ANSWER_WORDS.forEach(word => {
      const tokens = tokenizeAlbanian(word, validWordsSet);
      if (tokens.length !== 5) {
        invalidWords.push(`${word} (${tokens.length} tokens)`);
      }
    });
    
    console.log(`\nTotal ANSWER_WORDS: ${VALID_ANSWER_WORDS.length}`);
    console.log(`Total ALLOWED_WORDS: ${VALID_ALLOWED_WORDS.length}`);
    console.log(`Invalid words found: ${invalidWords.length}`);
    
    if (invalidWords.length > 0) {
      console.log('\nFirst 20 invalid words:');
      invalidWords.slice(0, 20).forEach(w => console.log(`  ❌ ${w}`));
    }
    
    expect(invalidWords.length).toBe(0);
  });
});
