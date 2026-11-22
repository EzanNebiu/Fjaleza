import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ALLOWED_LETTERS, MAX_GUESSES, WORD_LENGTH } from '../game/constants';
import { dayIndex } from '../game/daily';
import { hardModeError, keyboardStates, letters } from '../game/evaluate';
import {
  loadDailyProgress,
  loadStats,
  recordResult,
  saveDailyProgress,
  saveStats,
  type Stats,
} from '../game/storage';
import type { GameMode, GameStatus } from '../game/types';
import { answerForDay, isValidGuess, randomAnswer } from '../game/words';

export interface GameSnapshot {
  mode: GameMode;
  day: number;
  answer: string;
  guesses: string[];
  current: string;
  status: GameStatus;
  /** Hard mode in effect for this game (fixed after the first guess of a daily game). */
  hardMode: boolean;
}

export interface GameEvents {
  toast: (message: string, opts?: { duration?: number }) => void;
  onFinished: (game: GameSnapshot) => void;
}

/** Per-tile flip duration and stagger, in ms. Keep in sync with --flip-ms in CSS. */
export const FLIP_MS = 320;
export const FLIP_STAGGER = 260;
export const revealDuration = (motion: boolean) => (motion ? FLIP_STAGGER * (WORD_LENGTH - 1) + FLIP_MS : 0);

function dailyGame(day: number, hardModeSetting: boolean): GameSnapshot {
  const saved = loadDailyProgress(day);
  return {
    mode: 'daily',
    day,
    answer: answerForDay(day),
    guesses: saved?.guesses ?? [],
    current: '',
    status: saved?.status ?? 'playing',
    hardMode: saved && saved.guesses.length > 0 ? saved.hardMode : hardModeSetting,
  };
}

function practiceGame(hardMode: boolean, previous?: string): GameSnapshot {
  return {
    mode: 'practice',
    day: dayIndex(),
    answer: randomAnswer(previous),
    guesses: [],
    current: '',
    status: 'playing',
    hardMode,
  };
}

const WIN_MESSAGES = ['Gjeni!', 'Shkëlqyeshëm!', 'Bravo!', 'Shumë mirë!', 'Mirë!', 'Për pak!'];

export function useGame(opts: { hardModeSetting: boolean; motion: boolean; events: GameEvents }) {
  const { hardModeSetting, motion } = opts;
  const events = useRef(opts.events);
  useEffect(() => {
    events.current = opts.events;
  });

  const [game, setGame] = useState<GameSnapshot>(() => dailyGame(dayIndex(), hardModeSetting));
  const [stats, setStats] = useState<Stats>(loadStats);
  /** Row index currently flipping; keyboard colours wait until it has finished. */
  const [revealingRow, setRevealingRow] = useState<number | null>(null);
  const [shakeKey, setShakeKey] = useState(0);
  const [busy, setBusy] = useState(false);
  const gameRef = useRef(game);
  useEffect(() => {
    gameRef.current = game;
  }, [game]);
  const dailyBackup = useRef<GameSnapshot | null>(null);

  // Persist daily progress.
  useEffect(() => {
    if (game.mode !== 'daily') return;
    saveDailyProgress({ day: game.day, guesses: game.guesses, status: game.status, hardMode: game.hardMode });
  }, [game.mode, game.day, game.guesses, game.status, game.hardMode]);

  const reject = useCallback((message: string) => {
    setShakeKey((k) => k + 1);
    events.current.toast(message);
  }, []);

  const type = useCallback((key: string) => {
    if (busy || revealingRow !== null) return;
    const ch = key.normalize('NFC').toLocaleLowerCase('sq');
    if (!ALLOWED_LETTERS.test(ch)) return;
    setGame((g) =>
      g.status !== 'playing' || letters(g.current).length >= WORD_LENGTH ? g : { ...g, current: g.current + ch }
    );
  }, [busy, revealingRow]);

  const erase = useCallback(() => {
    if (busy || revealingRow !== null) return;
    setGame((g) =>
      g.status !== 'playing' || !g.current ? g : { ...g, current: letters(g.current).slice(0, -1).join('') }
    );
  }, [busy, revealingRow]);

  const submit = useCallback(async () => {
    if (busy || revealingRow !== null) return;
    const g = gameRef.current;
    if (g.status !== 'playing') return;
    const guess = g.current;
    if (letters(guess).length < WORD_LENGTH) return reject('Nuk ka mjaftueshëm shkronja');
    // Hard mode follows the setting until the first guess, then stays fixed for this game.
    const hardMode = g.guesses.length === 0 ? hardModeSetting : g.hardMode;
    if (hardMode) {
      const err = hardModeError(guess, g.guesses, g.answer);
      if (err) return reject(err);
    }
    setBusy(true);
    let valid: boolean;
    try {
      valid = guess === g.answer || (await isValidGuess(guess));
    } catch {
      setBusy(false);
      return reject('Lista e fjalëve nuk u ngarkua. Provo përsëri.');
    }
    setBusy(false);
    if (!valid) return reject('Kjo fjalë nuk është në listë');

    const guesses = [...g.guesses, guess];
    const won = guess === g.answer;
    const status: GameStatus = won ? 'won' : guesses.length >= MAX_GUESSES ? 'lost' : 'playing';
    const next: GameSnapshot = { ...g, guesses, current: '', status, hardMode };
    setGame(next);
    setRevealingRow(guesses.length - 1);

    window.setTimeout(() => {
      setRevealingRow(null);
      if (status === 'playing') return;
      if (next.mode === 'daily') {
        setStats((s) => {
          const updated = recordResult(s, next.day, won, guesses.length);
          if (updated !== s) saveStats(updated);
          return updated;
        });
      }
      events.current.toast(won ? WIN_MESSAGES[guesses.length - 1] : next.answer.toLocaleUpperCase('sq'), {
        duration: won ? 1800 : 3500,
      });
      events.current.onFinished(next);
    }, revealDuration(motion));
  }, [busy, revealingRow, motion, reject, hardModeSetting]);

  const startPractice = useCallback(() => {
    const g = gameRef.current;
    if (g.mode === 'daily') dailyBackup.current = g;
    setRevealingRow(null);
    setGame(practiceGame(hardModeSetting, g.answer));
  }, [hardModeSetting]);

  const backToDaily = useCallback(() => {
    const today = dayIndex();
    const backup = dailyBackup.current;
    setRevealingRow(null);
    setGame(backup && backup.day === today ? { ...backup, current: '' } : dailyGame(today, hardModeSetting));
  }, [hardModeSetting]);

  /**
   * Load today's puzzle if the date has changed. An unfinished puzzle with guesses
   * on it is never swapped out from under the player.
   */
  const checkRollover = useCallback((allowSwitchFinished: boolean) => {
    const g = gameRef.current;
    const today = dayIndex();
    if (g.mode !== 'daily' || g.day === today) return false;
    const untouched = g.status === 'playing' && g.guesses.length === 0;
    if (untouched || (g.status !== 'playing' && allowSwitchFinished)) {
      setGame(dailyGame(today, hardModeSetting));
      return true;
    }
    return false;
  }, [hardModeSetting]);

  const visibleGuesses = game.guesses;
  const keyStates = useMemo(() => {
    const settled = revealingRow === null ? visibleGuesses : visibleGuesses.slice(0, revealingRow);
    return keyboardStates(settled, game.answer);
  }, [visibleGuesses, revealingRow, game.answer]);

  const view = useMemo(
    () => (game.guesses.length === 0 && game.hardMode !== hardModeSetting ? { ...game, hardMode: hardModeSetting } : game),
    [game, hardModeSetting]
  );

  return {
    game: view,
    stats,
    setStats,
    keyStates,
    revealingRow,
    shakeKey,
    busy,
    type,
    erase,
    submit,
    startPractice,
    backToDaily,
    checkRollover,
  };
}
