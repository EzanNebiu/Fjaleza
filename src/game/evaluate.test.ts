import { describe, expect, it } from 'vitest';
import { evaluateGuess, hardModeError, keyboardStates, letters } from './evaluate';

const c = 'correct';
const p = 'present';
const a = 'absent';

describe('evaluateGuess', () => {
  it('marks an exact match all green', () => {
    expect(evaluateGuess('fjalë', 'fjalë')).toEqual([c, c, c, c, c]);
  });

  it('marks absent letters gray and misplaced letters yellow', () => {
    // barka has one r (not in place 1 or 2): first r yellow, second r gray
    expect(evaluateGuess('rruga', 'barka')).toEqual([p, a, a, a, c]);
    // drita has its r in place 2: that copy is green and the first r is gray
    expect(evaluateGuess('rruga', 'drita')).toEqual([a, c, a, a, c]);
  });

  it('marks both copies yellow when the answer also has two', () => {
    // burrë has two r
    expect(evaluateGuess('rrota', 'burrë')).toEqual([p, p, a, a, a]);
  });

  it('counts each answer letter once across yellows', () => {
    // molla has l,l,o: lloji -> l yellow, l yellow, o yellow, j gray, i gray
    expect(evaluateGuess('lloji', 'molla')).toEqual([p, p, p, a, a]);
  });

  it('prefers the exact match over an earlier misplaced copy', () => {
    // kalon has a single n (last); the first n must be gray
    expect(evaluateGuess('nanon', 'kalon')).toEqual([a, c, a, c, c]);
  });

  it('only colors as many copies as the answer contains', () => {
    expect(evaluateGuess('aaaaa', 'akull')).toEqual([c, a, a, a, a]);
    // lulet has l in places 1 and 3: ballë gets one green l and one yellow l
    expect(evaluateGuess('ballë', 'lulet')).toEqual([a, a, c, p, a]);
  });

  it('treats ë and ç as letters distinct from e and c', () => {
    expect(evaluateGuess('fjale', 'fjalë')).toEqual([c, c, c, c, a]);
    expect(evaluateGuess('canta', 'çanta')).toEqual([a, c, c, c, c]);
  });

  it('normalises decomposed input (e + combining diaeresis) to ë', () => {
    expect(letters('fjalë')).toEqual(['f', 'j', 'a', 'l', 'ë']);
    expect(evaluateGuess('fjalë', 'fjalë')).toEqual([c, c, c, c, c]);
  });

  it('throws on mismatched lengths', () => {
    expect(() => evaluateGuess('abc', 'fjalë')).toThrow();
  });
});

describe('keyboardStates', () => {
  it('upgrades but never downgrades a key', () => {
    const states = keyboardStates(['rruga', 'drita'], 'drita');
    expect(states.get('r')).toBe(c);
    expect(states.get('u')).toBe(a);
    expect(states.get('a')).toBe(c);
  });

  it('keeps yellow when a later guess does not contain the letter', () => {
    const states = keyboardStates(['lloji', 'mbret'], 'akull');
    expect(states.get('l')).toBe(p);
  });

  it('a gray duplicate does not hide its yellow twin', () => {
    expect(keyboardStates(['rruga'], 'barka').get('r')).toBe(p);
  });
});

describe('hardModeError', () => {
  it('requires greens to stay in place', () => {
    expect(hardModeError('besoj', ['drita'], 'drita')).toMatch(/Shkronja 1 duhet të jetë D/);
  });

  it('requires yellows to be reused', () => {
    // rruga vs drita reveals r (yellow) and a (green); dimër has no a in place 5
    expect(hardModeError('dimër', ['rruga'], 'drita')).not.toBeNull();
  });

  it('accepts a guess that uses all hints', () => {
    expect(hardModeError('drita', ['rruga'], 'drita')).toBeNull();
  });
});
