/**
 * Game State Hook
 * 
 * Manages the complete game state with hard mode support
 * NOTE: Uses character-based counting and API-based word validation
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { evaluateGuess, isGameWon, validateHardMode, getKeyboardStates } from '../core/gameEngine';
import { validateAlbanianWord } from '../services/fjalorthi';
import { normalizeWord } from '../utils/wordValidation';
import type { GameState, GameMode, AlbanianToken } from '../types';

interface UseGameStateProps {
  answer: string;
  mode: GameMode;
  hardMode: boolean;
  maxGuesses: number;
  onGameEnd?: (won: boolean, guesses: number) => void;
}

export function useGameState({ answer, mode, hardMode, maxGuesses, onGameEnd }: UseGameStateProps) {
  const [gameState, setGameState] = useState<GameState>(() => {
    // Initialize answer as array of characters
    const answerChars = Array.from(normalizeWord(answer));
    
    return {
      mode,
      answer: answerChars,
      guesses: [],
      evaluations: [],
      currentGuess: [],
      status: 'playing',
      hardMode,
    };
  });

  const [invalidGuess, setInvalidGuess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  // Keep a ref to the current game state for sync access
  const gameStateRef = useRef(gameState);
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // Reset game when answer changes
  useEffect(() => {
    const answerChars = Array.from(normalizeWord(answer));
    
    setGameState({
      mode,
      answer: answerChars,
      guesses: [],
      evaluations: [],
      currentGuess: [],
      status: 'playing',
      hardMode,
    });
    
    // Reset error states
    setInvalidGuess(false);
    setErrorMessage('');
    setShowSuccess(false);
    setIsValidating(false);
  }, [answer, mode, hardMode]);

  // Reset error states after showing
  useEffect(() => {
    if (invalidGuess || errorMessage) {
      const timer = setTimeout(() => {
        setInvalidGuess(false);
        setErrorMessage('');
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [invalidGuess, errorMessage]);

  // Keep onGameEnd in a ref to avoid including it in dependencies
  const onGameEndRef = useRef(onGameEnd);
  useEffect(() => {
    onGameEndRef.current = onGameEnd;
  }, [onGameEnd]);

  // Notify on game end
  useEffect(() => {
    if (gameState.status !== 'playing' && onGameEndRef.current) {
      setShowSuccess(true);
      onGameEndRef.current(gameState.status === 'won', gameState.guesses.length);
      
      // Hide success message after 5 seconds
      const timer = setTimeout(() => setShowSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [gameState.status, gameState.guesses.length]);

  const submitGuess = useCallback(async (letters: string[]) => {
    // Prevent duplicate submissions
    if (isValidating) return;

    // Get current state from ref
    const currentState = gameStateRef.current;

    // Check if game is still playing
    if (currentState.status !== 'playing') {
      return;
    }

    // Check word length
    if (letters.length !== currentState.answer.length) {
      setInvalidGuess(true);
      setErrorMessage('Not enough letters');
      return;
    }

    // Check hard mode before validation
    if (currentState.hardMode && currentState.evaluations.length > 0) {
      const validation = validateHardMode(letters, currentState.evaluations);
      if (!validation.valid) {
        setInvalidGuess(true);
        setErrorMessage(validation.message || 'Hard mode violation');
        return;
      }
    }

    // Build the guess word (keep as user typed it)
    const guessWord = letters.join('');

    try {
      // Set validating state
      setIsValidating(true);

      // Validate word via Fjalorthi API
      const validationResult = await validateAlbanianWord(guessWord);

      if (!validationResult.isValid) {
        setInvalidGuess(true);
        setErrorMessage('Word not found');
        return;
      }

      // IMPORTANT: Keep the guess as the user typed it
      // Do NOT replace with canonicalWord

    } catch (error) {
      console.error('Validation error:', error);
      setInvalidGuess(true);
      setErrorMessage('Could not validate word. Try again.');
      return;
    } finally {
      setIsValidating(false);
    }

    // Use functional setState to update game state
    setGameState(prev => {
      // Double-check status hasn't changed
      if (prev.status !== 'playing') return prev;

      // Evaluate guess against the answer
      const evaluation = evaluateGuess(letters, prev.answer);
      const won = isGameWon(evaluation);
      const lost = !won && prev.guesses.length + 1 >= maxGuesses;

      return {
        ...prev,
        guesses: [...prev.guesses, letters],
        evaluations: [...prev.evaluations, evaluation],
        currentGuess: [],
        status: won ? 'won' : lost ? 'lost' : 'playing',
      };
    });
  }, [maxGuesses, isValidating]);

  const updateCurrentGuess = useCallback((letters: AlbanianToken[]) => {
    setGameState(prev => {
      // Only update if letters actually changed to prevent unnecessary re-renders
      if (prev.currentGuess.length === letters.length && 
          prev.currentGuess.every((l, i) => l === letters[i])) {
        return prev;
      }
      return {
        ...prev,
        currentGuess: letters,
      };
    });
  }, []);

  const keyboardStates = getKeyboardStates(gameState.evaluations);

  return {
    gameState,
    submitGuess,
    updateCurrentGuess,
    keyboardStates,
    invalidGuess,
    errorMessage,
    showSuccess,
    isValidating,
  };
}
