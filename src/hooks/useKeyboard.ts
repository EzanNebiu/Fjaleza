/**
 * Keyboard Event Hook
 * 
 * Handles physical keyboard events
 */

import { useEffect } from 'react';

interface UseKeyboardProps {
  onKeyPress: (key: string) => void;
  enabled?: boolean;
}

export function useKeyboard({ onKeyPress, enabled = true }: UseKeyboardProps) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const { key } = event;

      // Handle Enter
      if (key === 'Enter') {
        event.preventDefault();
        onKeyPress('ENTER');
        return;
      }

      // Handle Backspace
      if (key === 'Backspace') {
        event.preventDefault();
        onKeyPress('BACKSPACE');
        return;
      }

      // Handle letter keys
      const upperKey = key.toUpperCase();
      if (/^[A-ZÇË]$/.test(upperKey)) {
        event.preventDefault();
        onKeyPress(upperKey);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onKeyPress, enabled]);
}
