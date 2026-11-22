import { memo } from 'react';
import { MAX_GUESSES, WORD_LENGTH } from '../game/constants';
import { evaluateGuess, letters } from '../game/evaluate';
import type { TileState } from '../game/types';
import { FLIP_STAGGER } from '../hooks/useGame';

const STATE_LABEL: Record<TileState, string> = {
  correct: 'në vendin e duhur',
  present: 'në fjalë, por në vend tjetër',
  absent: 'nuk është në fjalë',
};

interface TileProps {
  letter: string;
  state?: TileState;
  anim?: 'pop' | 'flip' | 'win';
  delay?: number;
}

export const Tile = memo(function Tile({ letter, state, anim, delay = 0 }: TileProps) {
  const label = letter
    ? `${letter.toLocaleUpperCase('sq')}${state ? `, ${STATE_LABEL[state]}` : ''}`
    : 'bosh';
  return (
    <div
      className="tile"
      role="img"
      aria-label={label}
      data-state={state ?? (letter ? 'typed' : 'empty')}
      data-anim={anim}
      style={delay ? { animationDelay: `${delay}ms` } : undefined}
    >
      {letter}
    </div>
  );
});

interface BoardProps {
  guesses: string[];
  current: string;
  answer: string;
  revealingRow: number | null;
  shakeKey: number;
  celebrate: boolean;
}

export function Board({ guesses, current, answer, revealingRow, shakeKey, celebrate }: BoardProps) {
  const currentLetters = letters(current);
  return (
    <div className="board" role="group" aria-label="Tabela e lojës">
      {Array.from({ length: MAX_GUESSES }, (_, r) => {
        const guess = guesses[r];
        if (guess !== undefined) {
          const evaluation = evaluateGuess(guess, answer);
          const flipping = r === revealingRow;
          const winning = celebrate && r === guesses.length - 1;
          return (
            <div className="row" role="group" aria-label={`Rreshti ${r + 1}`} key={r}>
              {letters(guess).map((ch, i) => (
                <Tile
                  key={i}
                  letter={ch}
                  state={evaluation[i]}
                  anim={flipping ? 'flip' : winning ? 'win' : undefined}
                  delay={flipping ? i * FLIP_STAGGER : winning ? i * 90 : 0}
                />
              ))}
            </div>
          );
        }
        const isCurrent = r === guesses.length;
        return (
          <div
            className="row"
            role="group"
            aria-label={`Rreshti ${r + 1}`}
            key={isCurrent ? `current-${shakeKey}` : r}
            data-anim={isCurrent && shakeKey > 0 ? 'shake' : undefined}
          >
            {Array.from({ length: WORD_LENGTH }, (_, i) => {
              const ch = isCurrent ? (currentLetters[i] ?? '') : '';
              return (
                <Tile
                  key={isCurrent && ch ? `${i}-${ch}` : i}
                  letter={ch}
                  anim={isCurrent && ch && i === currentLetters.length - 1 ? 'pop' : undefined}
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
