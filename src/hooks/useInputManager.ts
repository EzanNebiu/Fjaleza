/**
 * Input Manager Hook
 * 
 * Manages raw keyboard input using simple character-based counting
 * NOTE: Digraphs are counted as 2 characters, not 1
 */

import { useState, useCallback } from 'react';

interface UseInputManagerProps {
  wordLength: number;
  onSubmit: (letters: string[]) => void;
}

interface UseInputManagerReturn {
  rawInput: string;
  letters: string[];
  handleKeyPress: (key: string) => void;
  clearInput: () => void;
}

export function useInputManager({
  wordLength,
  onSubmit,
}: UseInputManagerProps): UseInputManagerReturn {
  const [rawInput, setRawInput] = useState('');

  // Convert raw input to array of characters
  const letters = Array.from(rawInput);

  const handleKeyPress = useCallback((key: string) => {
    const lowerKey = key.toLowerCase();

    // Handle Enter
    if (lowerKey === 'enter') {
      if (letters.length === wordLength) {
        onSubmit(letters);
      }
      return;
    }

    // Handle Backspace
    if (lowerKey === 'backspace') {
      if (rawInput.length > 0) {
        setRawInput(rawInput.slice(0, -1));
      }
      return;
    }

    // Handle letter input (Albanian alphabet + ç, ë)
    if (letters.length < wordLength && /^[a-zçë]$/.test(lowerKey)) {
      setRawInput(rawInput + lowerKey);
    }
  }, [rawInput, letters, wordLength, onSubmit]);

  const clearInput = useCallback(() => {
    setRawInput('');
  }, []);

  return {
    rawInput,
    letters,
    handleKeyPress,
    clearInput,
  };
}
