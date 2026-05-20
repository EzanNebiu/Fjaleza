/**
 * Grid Cell Component
 * 
 * Individual cell in the game grid displaying one Albanian token
 */

import { cn } from '../utils/cn';
import type { CellState } from '../types';

interface CellProps {
  token: string;
  state: CellState;
  animate?: boolean;
  delay?: number;
  reducedMotion?: boolean;
}

export function Cell({ token, state, animate = false, delay = 0, reducedMotion = false }: CellProps) {
  const stateClasses: Record<CellState, string> = {
    empty: 'border-hacker-border bg-hacker-surface',
    pending: 'border-hacker-text-dim bg-hacker-surface',
    correct: 'border-hacker-correct bg-hacker-correct text-hacker-bg',
    present: 'border-hacker-present bg-hacker-present text-hacker-bg',
    absent: 'border-hacker-absent bg-hacker-absent text-hacker-text-dim',
  };

  return (
    <div
      className={cn(
        'flex aspect-square w-[clamp(2.5rem,min(15vw,7dvh),4rem)] items-center justify-center border-2',
        'font-bold text-[clamp(1.15rem,min(7vw,3.25dvh),1.875rem)] uppercase transition-colors',
        stateClasses[state],
        animate && !reducedMotion && 'animate-flip',
        reducedMotion && 'reduced-motion'
      )}
      style={
        animate && !reducedMotion
          ? {
              animationDelay: `${delay}ms`,
            }
          : undefined
      }
    >
      {token}
    </div>
  );
}
