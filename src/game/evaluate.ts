import type { TileState } from './types';

/** Split a word into letters. Ë and Ç are single code points after NFC normalisation. */
export function letters(word: string): string[] {
  return Array.from(word.normalize('NFC'));
}

/**
 * Score a guess against the answer, handling repeated letters the standard way:
 * exact matches first, then each remaining answer letter can mark at most one
 * misplaced guess letter, left to right.
 */
export function evaluateGuess(guess: string, answer: string): TileState[] {
  const g = letters(guess);
  const a = letters(answer);
  if (g.length !== a.length) throw new Error('Guess and answer must have the same length');

  const result: TileState[] = g.map(() => 'absent');
  const remaining = new Map<string, number>();

  g.forEach((ch, i) => {
    if (ch === a[i]) result[i] = 'correct';
    else remaining.set(a[i], (remaining.get(a[i]) ?? 0) + 1);
  });
  g.forEach((ch, i) => {
    if (result[i] === 'correct') return;
    const left = remaining.get(ch) ?? 0;
    if (left > 0) {
      result[i] = 'present';
      remaining.set(ch, left - 1);
    }
  });
  return result;
}

const RANK: Record<TileState, number> = { absent: 1, present: 2, correct: 3 };

/** Best state seen for each key: correct beats present beats absent. */
export function keyboardStates(guesses: string[], answer: string): Map<string, TileState> {
  const states = new Map<string, TileState>();
  for (const guess of guesses) {
    const evaluation = evaluateGuess(guess, answer);
    letters(guess).forEach((ch, i) => {
      const prev = states.get(ch);
      if (!prev || RANK[evaluation[i]] > RANK[prev]) states.set(ch, evaluation[i]);
    });
  }
  return states;
}

/**
 * Hard mode: every revealed green must stay in place and every revealed yellow
 * (with its count) must be reused. Returns an error message in Albanian or null.
 */
export function hardModeError(guess: string, previous: string[], answer: string): string | null {
  const g = letters(guess);
  for (const prev of previous) {
    const evaluation = evaluateGuess(prev, answer);
    const p = letters(prev);
    for (let i = 0; i < p.length; i++) {
      if (evaluation[i] === 'correct' && g[i] !== p[i]) {
        return `Shkronja ${i + 1} duhet të jetë ${p[i].toLocaleUpperCase('sq')}`;
      }
    }
    const required = new Map<string, number>();
    p.forEach((ch, i) => {
      if (evaluation[i] !== 'absent') required.set(ch, (required.get(ch) ?? 0) + 1);
    });
    for (const [ch, count] of required) {
      if (g.filter((x) => x === ch).length < count) {
        return `Fjala duhet të përmbajë ${ch.toLocaleUpperCase('sq')}`;
      }
    }
  }
  return null;
}
