/**
 * Main Game Component
 * 
 * Orchestrates the entire game UI
 */

import { useState, useEffect, useCallback } from 'react';
import { Grid } from './Grid';
import { Keyboard } from './Keyboard';
import { GameOverModal } from './GameOverModal';
import { DailyTimer } from './DailyTimer';
import { useGameState } from '../hooks/useGameState';
import { useInputManager } from '../hooks/useInputManager';
import { useKeyboard } from '../hooks/useKeyboard';
import { useApp } from '../contexts/AppContext';
import { MAX_GUESSES, WORD_LENGTH } from '../types';

export function Game() {
  const { answer, settings, onGameEnd, newGame, mode } = useApp();
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [gameResult, setGameResult] = useState<{ won: boolean; guesses: number } | null>(null);

  const {
    gameState,
    submitGuess,
    updateCurrentGuess,
    keyboardStates,
    invalidGuess,
    errorMessage,
    showSuccess,
    isValidating,
  } = useGameState({
    answer,
    mode: mode,
    hardMode: settings.hardMode,
    maxGuesses: MAX_GUESSES,
    onGameEnd: (won, guesses) => {
      onGameEnd(won, guesses);
      setGameResult({ won, guesses });
      // Show modal after a short delay
      setTimeout(() => setShowGameOverModal(true), 1500);
    },
  });

  // Reset game result when answer changes (new game started)
  useEffect(() => {
    setGameResult(null);
    setShowGameOverModal(false);
  }, [answer]);

  const handleCloseModal = useCallback(() => {
    console.log('handleCloseModal called');
    setShowGameOverModal(false);
    console.log('showGameOverModal set to false');
  }, []);

  const handleNewGame = useCallback(() => {
    console.log('Starting new game');
    setShowGameOverModal(false);
    setGameResult(null);
    newGame();
  }, [newGame]);

  const {
    letters: currentLetters,
    handleKeyPress,
    clearInput,
  } = useInputManager({
    wordLength: WORD_LENGTH,
    onSubmit: (letters) => {
      submitGuess(letters);
      clearInput();
    },
  });

  // Clear input when answer changes (new game)
  useEffect(() => {
    clearInput();
  }, [answer]); // eslint-disable-line react-hooks/exhaustive-deps

  // Update game state with current input
  useEffect(() => {
    updateCurrentGuess(currentLetters);
  }, [currentLetters]); // eslint-disable-line react-hooks/exhaustive-deps

  // Enable physical keyboard
  useKeyboard({
    onKeyPress: handleKeyPress,
    enabled: gameState.status === 'playing' && !isValidating,
  });

  return (
    <div className="relative flex w-full max-w-[30rem] flex-col items-center gap-4 px-1 sm:gap-8 sm:px-4">
      {/* Game Over Modal */}
      {gameResult && (
        <GameOverModal
          isOpen={showGameOverModal}
          onClose={handleCloseModal}
          won={gameResult.won}
          answer={answer}
          guesses={gameResult.guesses}
          onNewGame={mode === 'practice' ? handleNewGame : undefined}
        />
      )}

      {/* Validating message */}
      {isValidating && (
        <div
          className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 
                     w-[calc(100vw-2rem)] max-w-sm bg-hacker-accent text-center text-hacker-bg px-4 py-2 rounded-lg shadow-lg"
          role="status"
        >
          Checking word...
        </div>
      )}

      {/* Error message */}
      {errorMessage && !isValidating && (
        <div
          className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 
                     w-[calc(100vw-2rem)] max-w-sm bg-hacker-error text-center text-white px-4 py-2 rounded-lg shadow-lg
                     animate-shake"
          role="alert"
        >
          {errorMessage}
        </div>
      )}

      {/* Game status */}
      {showSuccess && gameState.status !== 'playing' && (
        <div
          className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 
                     w-[calc(100vw-2rem)] max-w-sm bg-hacker-accent text-center text-hacker-bg px-5 py-3 rounded-lg shadow-lg
                     font-bold text-base sm:text-lg"
          role="status"
        >
          {gameState.status === 'won' ? '🎉 You won!' : `The word was: ${answer}`}
        </div>
      )}

      {/* Hard mode indicator */}
      {settings.hardMode && (
        <div className="text-xs text-hacker-accent uppercase tracking-wider">
          Hard Mode
        </div>
      )}

      {/* Daily timer */}
      {mode === 'daily' && gameState.status !== 'playing' && (
        <DailyTimer />
      )}

      {/* Grid */}
      <Grid
        guesses={gameState.guesses}
        evaluations={gameState.evaluations}
        currentGuess={gameState.currentGuess}
        maxGuesses={MAX_GUESSES}
        wordLength={WORD_LENGTH}
        currentRow={gameState.guesses.length - 1}
        invalidGuess={invalidGuess}
        reducedMotion={settings.reducedMotion}
      />

      {/* Keyboard */}
      <Keyboard
        keyStates={keyboardStates}
        onKeyPress={handleKeyPress}
        disabled={isValidating}
      />
    </div>
  );
}
