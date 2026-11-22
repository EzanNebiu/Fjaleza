import { describe, expect, it } from 'vitest';
import { ANSWER_COUNT, answerAt, loadGuesses } from '../game/words';

describe('word lists', () => {
  it('every answer is a valid guess and there are no duplicates', async () => {
    const guesses = await loadGuesses();
    const answers = Array.from({ length: ANSWER_COUNT }, (_, i) => answerAt(i));
    expect(new Set(answers).size).toBe(answers.length);
    for (const w of answers) expect(guesses.has(w)).toBe(true);
  });

  it('the guess list has only 5-character Albanian words', async () => {
    for (const w of await loadGuesses()) expect(w).toMatch(/^[a-vx-zçë]{5}$/u);
  });
});
