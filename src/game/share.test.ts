import { describe, expect, it } from 'vitest';
import { buildShareText } from './share';

const base = {
  puzzle: 12,
  answer: 'drita',
  won: true,
  hardMode: false,
  colorBlind: false,
  dark: true,
  url: 'https://example.org',
};

describe('buildShareText', () => {
  it('produces the emoji grid and score', () => {
    const text = buildShareText({ ...base, guesses: ['rruga', 'drita'] });
    expect(text).toBe('Fjalëza #12 2/6\n\n⬛🟩⬛⬛🟩\n🟩🟩🟩🟩🟩\n\nhttps://example.org');
  });

  it('uses X for a loss, * for hard mode, and the color-blind palette', () => {
    const text = buildShareText({
      ...base,
      won: false,
      hardMode: true,
      colorBlind: true,
      dark: false,
      guesses: Array(6).fill('rruga'),
      answer: 'barka',
    });
    expect(text.startsWith('Fjalëza #12 X/6*')).toBe(true);
    expect(text).toContain('🟦⬜⬜⬜🟧');
  });
});
