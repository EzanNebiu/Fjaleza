/**
 * Game Engine
 * 
 * Core game logic for evaluating guesses and managing game state
 */

import type { AlbanianToken, GuessEvaluation, CellState } from '../types';

/**
 * Evaluate a guess against the answer
 * Handles duplicate letters correctly
 * 
 * Algorithm:
 * 1. First pass: Mark all exact matches (correct position)
 * 2. Second pass: Mark present letters (wrong position) considering already-used letters
 * 3. Third pass: Mark remaining as absent
 */
export function evaluateGuess(
  guess: AlbanianToken[],
  answer: AlbanianToken[]
): GuessEvaluation[] {
  const result: GuessEvaluation[] = guess.map(token => ({
    token,
    state: 'absent' as CellState,
  }));

  const answerTokens = [...answer];
  const usedAnswerIndices = new Set<number>();

  // First pass: Mark correct positions
  for (let i = 0; i < guess.length; i++) {
    if (guess[i] === answer[i]) {
      result[i].state = 'correct';
      usedAnswerIndices.add(i);
    }
  }

  // Second pass: Mark present (wrong position)
  for (let i = 0; i < guess.length; i++) {
    if (result[i].state === 'correct') continue;

    // Find this token in answer (not already used)
    for (let j = 0; j < answerTokens.length; j++) {
      if (!usedAnswerIndices.has(j) && guess[i] === answerTokens[j]) {
        result[i].state = 'present';
        usedAnswerIndices.add(j);
        break;
      }
    }
  }

  return result;
}

/**
 * Check if the game is won
 */
export function isGameWon(evaluation: GuessEvaluation[]): boolean {
  return evaluation.every(e => e.state === 'correct');
}

/**
 * Check if a guess follows hard mode rules
 * In hard mode:
 * - Must use all revealed correct tokens in the same position
 * - Must use all revealed present tokens somewhere
 */
export function validateHardMode(
  guess: AlbanianToken[],
  previousEvaluations: GuessEvaluation[][]
): { valid: boolean; message?: string } {
  // Collect all correct positions and present tokens from previous guesses
  const correctPositions = new Map<number, AlbanianToken>();
  const presentTokens = new Set<AlbanianToken>();

  for (const evaluation of previousEvaluations) {
    for (let i = 0; i < evaluation.length; i++) {
      const { token, state } = evaluation[i];
      
      if (state === 'correct') {
        correctPositions.set(i, token);
      } else if (state === 'present') {
        presentTokens.add(token);
      }
    }
  }

  // Check correct positions
  for (const [position, token] of correctPositions.entries()) {
    if (guess[position] !== token) {
      return {
        valid: false,
        message: `Position ${position + 1} must be ${token}`,
      };
    }
  }

  // Check present tokens are included
  for (const token of presentTokens) {
    if (!guess.includes(token)) {
      return {
        valid: false,
        message: `Guess must contain ${token}`,
      };
    }
  }

  return { valid: true };
}

/**
 * Get keyboard key states based on all evaluations
 * Returns a map of token -> best state seen
 */
export function getKeyboardStates(
  evaluations: GuessEvaluation[][]
): Map<string, CellState> {
  const keyStates = new Map<string, CellState>();

  const statePriority: Record<CellState, number> = {
    'correct': 4,
    'present': 3,
    'absent': 2,
    'pending': 1,
    'empty': 0,
  };

  for (const evaluation of evaluations) {
    for (const { token, state } of evaluation) {
      // Normalize to uppercase for keyboard matching
      const upperToken = token.toUpperCase();
      
      const currentState = keyStates.get(upperToken);
      if (!currentState || statePriority[state] > statePriority[currentState]) {
        keyStates.set(upperToken, state);
      }

      // Also update individual letters within digraphs
      if (upperToken.length === 2) {
        for (const char of upperToken) {
          const currentCharState = keyStates.get(char);
          if (!currentCharState || statePriority[state] > statePriority[currentCharState]) {
            keyStates.set(char, state);
          }
        }
      }
    }
  }

  return keyStates;
}
