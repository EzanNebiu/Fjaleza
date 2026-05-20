/**
 * Grid Row Component
 * 
 * A row in the game grid displaying a complete guess
 */

import { Cell } from './Cell';
import { cn } from '../utils/cn';
import type { AlbanianToken, GuessEvaluation } from '../types';

interface RowProps {
  tokens: AlbanianToken[];
  evaluation?: GuessEvaluation[];
  wordLength: number;
  animate?: boolean;
  shake?: boolean;
  reducedMotion?: boolean;
}

export function Row({ tokens, evaluation, wordLength, animate = false, shake = false, reducedMotion = false }: RowProps) {
  // Fill empty slots
  const cells = Array.from({ length: wordLength }, (_, i) => {
    const token = tokens[i] || '';
    const evalState = evaluation?.[i]?.state;
    
    let state: 'empty' | 'pending' | 'correct' | 'present' | 'absent';
    if (evalState) {
      state = evalState;
    } else if (token) {
      state = 'pending';
    } else {
      state = 'empty';
    }
    
    return {
      token,
      state,
    };
  });

  return (
    <div
      className={cn(
        'flex w-full max-w-[22rem] justify-center gap-1 sm:gap-2',
        shake && !reducedMotion && 'animate-shake',
        reducedMotion && shake && 'reduced-motion'
      )}
    >
      {cells.map((cell, i) => (
        <Cell
          key={i}
          token={cell.token}
          state={cell.state}
          animate={animate && !!evaluation}
          delay={i * 100}
          reducedMotion={reducedMotion}
        />
      ))}
    </div>
  );
}
