/**
 * Keyboard Component
 * 
 * Virtual on-screen keyboard with Albanian layout
 * Shows only physical keys, not digraphs
 */

import { Key } from './Key';
import { KEYBOARD_KEYS } from '../types';
import type { KeyState, CellState } from '../types';

interface KeyboardProps {
  keyStates: Map<string, CellState>;
  onKeyPress: (key: string) => void;
  disabled?: boolean;
}

export function Keyboard({ keyStates, onKeyPress, disabled = false }: KeyboardProps) {
  const getKeyState = (key: string): KeyState => {
    // Try both uppercase and lowercase
    const upperKey = key.toUpperCase();
    const lowerKey = key.toLowerCase();
    
    const state = keyStates.get(upperKey) || keyStates.get(lowerKey);
    
    if (!state || state === 'empty' || state === 'pending') {
      return 'unused';
    }
    
    // Map CellState to KeyState
    return state as KeyState;
  };

  const handleKeyPress = (key: string) => {
    if (!disabled) {
      onKeyPress(key);
    }
  };

  return (
    <div
      className="mx-auto w-full max-w-[31rem] space-y-1.5 px-1 sm:space-y-2"
      role="group"
      aria-label="Virtual keyboard"
    >
      {KEYBOARD_KEYS.map((row, rowIndex) => (
        <div
          key={rowIndex}
          className="flex w-full justify-center gap-1.5 sm:gap-2"
          style={{
            paddingInline:
              rowIndex === 1
                ? 'clamp(0.625rem, 4vw, 1.5rem)'
                : rowIndex === 2
                  ? 'clamp(0rem, 1.5vw, 0.75rem)'
                  : undefined,
          }}
        >
          {row.map((key) => (
            <Key
              key={key}
              keyValue={key}
              state={getKeyState(key)}
              onClick={handleKeyPress}
              wide={key === 'ENTER' || key === 'BACKSPACE'}
              disabled={disabled}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
