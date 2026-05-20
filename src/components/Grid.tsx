/**
 * Game Grid Component
 * 
 * Main game grid displaying all guesses and current input
 */

import { Row } from './Row';
import type { AlbanianToken, GuessEvaluation } from '../types';

interface GridProps {
  guesses: AlbanianToken[][];
  evaluations: GuessEvaluation[][];
  currentGuess: AlbanianToken[];
  maxGuesses: number;
  wordLength: number;
  currentRow?: number;
  invalidGuess?: boolean;
  reducedMotion?: boolean;
}

export function Grid({
  guesses,
  evaluations,
  currentGuess,
  maxGuesses,
  wordLength,
  currentRow,
  invalidGuess = false,
  reducedMotion = false,
}: GridProps) {
  const rows = Array.from({ length: maxGuesses }, (_, i) => {
    const isCurrentRow = i === guesses.length;
    const isPastRow = i < guesses.length;
    
    if (isPastRow) {
      return {
        tokens: guesses[i],
        evaluation: evaluations[i],
        animate: i === currentRow,
        shake: false,
      };
    } else if (isCurrentRow) {
      return {
        tokens: currentGuess,
        evaluation: undefined,
        animate: false,
        shake: invalidGuess,
      };
    } else {
      return {
        tokens: [],
        evaluation: undefined,
        animate: false,
        shake: false,
      };
    }
  });

  return (
    <div
      className="flex w-full flex-col items-center gap-1 sm:gap-2"
      role="grid"
      aria-label="Game board"
    >
      {rows.map((row, i) => (
        <Row
          key={i}
          tokens={row.tokens}
          evaluation={row.evaluation}
          wordLength={wordLength}
          animate={row.animate}
          shake={row.shake}
          reducedMotion={reducedMotion}
        />
      ))}
    </div>
  );
}
