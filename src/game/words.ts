import { ENCODED_ANSWERS } from '../data/generated/answers';
import { scheduleIndex } from './daily';

/** Must match encode() in scripts/compile-words.mjs. */
function decodeAnswer(encoded: string, index: number): string {
  const bin = atob(encoded);
  const bytes = new Uint8Array(bin.length);
  for (let j = 0; j < bin.length; j++) bytes[j] = bin.charCodeAt(j) ^ ((index * 31 + j * 7 + 13) & 0xff);
  return new TextDecoder().decode(bytes);
}

export const ANSWER_COUNT = ENCODED_ANSWERS.length;

export function answerAt(index: number): string {
  return decodeAnswer(ENCODED_ANSWERS[index], index);
}

export function answerForDay(day: number): string {
  return answerAt(scheduleIndex(day, ANSWER_COUNT));
}

export function randomAnswer(exclude?: string): string {
  for (let tries = 0; tries < 10; tries++) {
    const word = answerAt(Math.floor(Math.random() * ANSWER_COUNT));
    if (word !== exclude) return word;
  }
  return answerAt(0);
}

let guessSet: Promise<Set<string>> | null = null;

/** Load the valid-guess list (a separate chunk) once, on first use. */
export function loadGuesses(): Promise<Set<string>> {
  guessSet ??= import('../data/generated/guesses').then((m) => new Set(m.default.split(' ')));
  return guessSet;
}

export async function isValidGuess(word: string): Promise<boolean> {
  return (await loadGuesses()).has(word);
}
