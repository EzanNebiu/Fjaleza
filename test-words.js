import { tokenizeAlbanian } from './src/core/tokenizer.js';
import { VALID_ANSWER_WORDS, VALID_ALLOWED_WORDS } from './src/data/words.js';

console.log('=== Albanian Word Dictionary Diagnostics ===\n');

// Count exported words
console.log('Exported counts:');
console.log(`  VALID_ANSWER_WORDS: ${VALID_ANSWER_WORDS.length} words`);
console.log(`  VALID_ALLOWED_WORDS: ${VALID_ALLOWED_WORDS.length} words\n`);

// Test some sample words
const testWords = ['SHQIP', 'GJUHË', 'DHOMA', 'RRUGË', 'THELLË'];
console.log('Sample word tokenization:');

const validWordsSet = new Set(VALID_ALLOWED_WORDS);

testWords.forEach(word => {
  const tokens = tokenizeAlbanian(word, validWordsSet);
  console.log(`  ${word.padEnd(10)} -> [${tokens.join(', ')}] (${tokens.length} tokens)`);
});

console.log('\n=== Checking all ANSWER_WORDS for 5-token validity ===');
let validCount = 0;
let invalidWords = [];

VALID_ANSWER_WORDS.slice(0, 50).forEach(word => {
  const tokens = tokenizeAlbanian(word, validWordsSet);
  if (tokens.length === 5) {
    validCount++;
  } else {
    invalidWords.push(`${word} (${tokens.length} tokens): [${tokens.join(', ')}]`);
  }
});

console.log(`Valid 5-token words in first 50: ${validCount}/50`);
if (invalidWords.length > 0) {
  console.log('\nInvalid words found:');
  invalidWords.forEach(w => console.log(`  ❌ ${w}`));
}
