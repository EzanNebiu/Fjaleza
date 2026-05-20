/**
 * Core type definitions for the Albanian word puzzle game
 */

// Albanian letter (logical token) - can be single letter or digraph
export type AlbanianLetter = string;

// Albanian token - represents one logical position in the word
export type AlbanianToken = string;

// Cell state after evaluation
export type CellState = 'empty' | 'pending' | 'correct' | 'present' | 'absent';

// Key state on keyboard
export type KeyState = 'unused' | 'absent' | 'present' | 'correct';

// Game status
export type GameStatus = 'playing' | 'won' | 'lost';

// Game mode
export type GameMode = 'daily' | 'practice';

// Guess evaluation result
export interface GuessEvaluation {
  token: AlbanianToken;
  state: CellState;
}

// Game state
export interface GameState {
  mode: GameMode;
  answer: AlbanianToken[];
  guesses: AlbanianToken[][];
  evaluations: GuessEvaluation[][];
  currentGuess: AlbanianToken[];
  status: GameStatus;
  hardMode: boolean;
}

// Stats
export interface GameStats {
  played: number;
  wins: number;
  losses: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: Record<number, number>; // 1-6
  lastPlayedDaily?: string; // ISO date string
}

// Settings
export interface Settings {
  hardMode: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
  soundEnabled: boolean;
  hasSeenWelcome: boolean;
}

// Albanian alphabet constants
export const ALBANIAN_ALPHABET = [
  'A', 'B', 'C', 'Ç', 'D', 'DH', 'E', 'Ë', 'F', 'G', 'GJ',
  'H', 'I', 'J', 'K', 'L', 'LL', 'M', 'N', 'NJ', 'O', 'P',
  'Q', 'R', 'RR', 'S', 'SH', 'T', 'TH', 'U', 'V', 'X', 'XH',
  'Y', 'Z', 'ZH'
] as const;

export const ALBANIAN_DIGRAPHS = [
  'DH', 'GJ', 'LL', 'NJ', 'RR', 'SH', 'TH', 'XH', 'ZH'
] as const;

// Physical keyboard keys (individual letters only)
export const KEYBOARD_KEYS = [
  ['Q', 'W', 'E', 'Ë', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ç'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
] as const;

export const MAX_GUESSES = 6;
export const WORD_LENGTH = 5; // Number of logical tokens
