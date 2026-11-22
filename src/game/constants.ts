/** Core game rules. Changing these changes the game for every player. */
export const WORD_LENGTH = 5;
export const MAX_GUESSES = 6;

/**
 * Puzzle #1 is this local calendar date. Each later local day is the next puzzle.
 * Changing it shifts the whole schedule, so treat it as permanent once live.
 */
export const EPOCH = { year: 2026, month: 11, day: 22 } as const;

/** Letters accepted from the keyboard: the Albanian alphabet written with single characters. */
export const ALLOWED_LETTERS = /^[a-vx-zçë]$/u;

/** On-screen keyboard rows. Albanian has no W; Ë and Ç sit next to related keys. */
export const KEYBOARD_ROWS: readonly (readonly string[])[] = [
  ['q', 'e', 'ë', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ç'],
  ['enter', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'backspace'],
];
