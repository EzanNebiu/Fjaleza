/**
 * Key Component
 * 
 * Individual key on the virtual keyboard
 */

import { CornerDownLeft, Delete } from 'lucide-react';
import { cn } from '../utils/cn';
import type { KeyState } from '../types';

interface KeyProps {
  keyValue: string;
  state: KeyState;
  onClick: (key: string) => void;
  wide?: boolean;
  disabled?: boolean;
}

export function Key({ keyValue, state, onClick, wide = false, disabled = false }: KeyProps) {
  const stateClasses: Record<KeyState, string> = {
    unused: 'bg-hacker-surface border-hacker-border text-hacker-text hover:bg-hacker-border',
    absent: 'bg-hacker-absent border-hacker-absent text-hacker-text-dim',
    present: 'bg-hacker-present border-hacker-present text-hacker-bg',
    correct: 'bg-hacker-correct border-hacker-correct text-hacker-bg',
  };

  const isSpecial = keyValue === 'ENTER' || keyValue === 'BACKSPACE';
  const isBackspace = keyValue === 'BACKSPACE';

  return (
    <button
      className={cn(
        'flex h-[clamp(2.625rem,7dvh,3.25rem)] min-w-0 items-center justify-center rounded-md border px-0.5 font-semibold uppercase',
        'text-sm shadow-[inset_0_-1px_0_rgba(0,0,0,0.35)] transition-colors active:scale-95 sm:text-base',
        wide || isSpecial ? 'flex-[1.35]' : 'flex-1',
        stateClasses[state],
        'focus:outline-none focus:ring-2 focus:ring-hacker-accent',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
      onClick={() => onClick(keyValue)}
      aria-label={keyValue}
      type="button"
      disabled={disabled}
    >
      {isBackspace ? (
        <Delete className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
      ) : keyValue === 'ENTER' ? (
        <CornerDownLeft className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
      ) : (
        keyValue
      )}
    </button>
  );
}
