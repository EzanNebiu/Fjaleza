import { describe, it, expect } from 'vitest';
import {
  evaluateGuess,
  isGameWon,
  validateHardMode,
  getKeyboardStates,
} from './gameEngine';
import type { GuessEvaluation } from '../types';

describe('Game Engine', () => {
  describe('evaluateGuess', () => {
    it('should mark all correct when guess matches answer', () => {
      const guess = ['SH', 'Q', 'I', 'P'];
      const answer = ['SH', 'Q', 'I', 'P'];
      const result = evaluateGuess(guess, answer);

      expect(result.every(r => r.state === 'correct')).toBe(true);
    });

    it('should mark absent when token not in answer', () => {
      const guess = ['M', 'I', 'K', 'U', 'A'];
      const answer = ['SH', 'Q', 'I', 'P', 'E'];
      const result = evaluateGuess(guess, answer);

      expect(result[0].state).toBe('absent'); // M
      expect(result[1].state).toBe('present'); // I (in answer but wrong pos)
      expect(result[3].state).toBe('absent'); // U
    });

    it('should handle duplicate tokens correctly - case 1', () => {
      // Answer has one 'L', guess has two 'L's
      const guess = ['LL', 'A', 'L', 'E'];
      const answer = ['M', 'A', 'L', 'E'];
      const result = evaluateGuess(guess, answer);

      expect(result[0].state).toBe('absent'); // LL not in answer
      expect(result[1].state).toBe('correct'); // A correct
      expect(result[2].state).toBe('correct'); // L correct
      expect(result[3].state).toBe('correct'); // E correct
    });

    it('should handle duplicate tokens correctly - case 2', () => {
      // Answer has RR digraph, guess has single R - they should NOT match (different tokens)
      const guess = ['M', 'U', 'R', 'Ë', 'A'];
      const answer = ['RR', 'U', 'G', 'Ë', 'B'];
      const result = evaluateGuess(guess, answer);

      expect(result[0].state).toBe('absent'); // M
      expect(result[1].state).toBe('correct'); // U
      expect(result[2].state).toBe('absent'); // R (RR is different token)
      expect(result[3].state).toBe('correct'); // Ë
      expect(result[4].state).toBe('absent'); // A
    });

    it('should handle duplicate tokens correctly - case 3', () => {
      // Both answer and guess have duplicates
      const guess = ['RR', 'U', 'R', 'Ë'];
      const answer = ['M', 'U', 'RR', 'A'];
      const result = evaluateGuess(guess, answer);

      expect(result[0].state).toBe('present'); // RR present but wrong pos
      expect(result[1].state).toBe('correct'); // U correct
      expect(result[2].state).toBe('absent'); // R (RR already matched)
      expect(result[3].state).toBe('absent'); // Ë
    });

    it('should handle Albanian digraphs in evaluation', () => {
      const guess = ['GJ', 'U', 'H', 'Ë'];
      const answer = ['GJ', 'U', 'H', 'Ë'];
      const result = evaluateGuess(guess, answer);

      expect(result.every(r => r.state === 'correct')).toBe(true);
    });

    it('should mark present when digraph is in wrong position', () => {
      const guess = ['SH', 'T', 'Ë', 'P', 'I'];
      const answer = ['T', 'SH', 'Ë', 'P', 'I'];
      const result = evaluateGuess(guess, answer);

      expect(result[0].state).toBe('present'); // SH present but wrong pos
      expect(result[1].state).toBe('present'); // T present but wrong pos
      expect(result[2].state).toBe('correct'); // Ë correct
      expect(result[3].state).toBe('correct'); // P correct
      expect(result[4].state).toBe('correct'); // I correct
    });

    it('should handle all absent', () => {
      const guess = ['M', 'I', 'K', 'U'];
      const answer = ['SH', 'Q', 'A', 'P'];
      const result = evaluateGuess(guess, answer);

      expect(result.every(r => r.state === 'absent')).toBe(true);
    });

    it('should handle mix of correct, present, and absent', () => {
      const guess = ['SH', 'I', 'K', 'U'];
      const answer = ['SH', 'Q', 'I', 'P'];
      const result = evaluateGuess(guess, answer);

      expect(result[0].state).toBe('correct'); // SH correct
      expect(result[1].state).toBe('present'); // I present but wrong pos
      expect(result[2].state).toBe('absent'); // K absent
      expect(result[3].state).toBe('absent'); // U absent
    });
  });

  describe('isGameWon', () => {
    it('should return true when all tokens are correct', () => {
      const evaluation: GuessEvaluation[] = [
        { token: 'SH', state: 'correct' },
        { token: 'Q', state: 'correct' },
        { token: 'I', state: 'correct' },
        { token: 'P', state: 'correct' },
      ];

      expect(isGameWon(evaluation)).toBe(true);
    });

    it('should return false when any token is not correct', () => {
      const evaluation: GuessEvaluation[] = [
        { token: 'SH', state: 'correct' },
        { token: 'Q', state: 'present' },
        { token: 'I', state: 'correct' },
        { token: 'P', state: 'correct' },
      ];

      expect(isGameWon(evaluation)).toBe(false);
    });

    it('should return false when all are absent', () => {
      const evaluation: GuessEvaluation[] = [
        { token: 'M', state: 'absent' },
        { token: 'I', state: 'absent' },
        { token: 'K', state: 'absent' },
        { token: 'U', state: 'absent' },
      ];

      expect(isGameWon(evaluation)).toBe(false);
    });
  });

  describe('validateHardMode', () => {
    it('should pass when no previous evaluations', () => {
      const guess = ['SH', 'Q', 'I', 'P'];
      const result = validateHardMode(guess, []);

      expect(result.valid).toBe(true);
    });

    it('should fail when not reusing correct token', () => {
      const guess = ['M', 'I', 'K', 'U'];
      const previousEvals: GuessEvaluation[][] = [
        [
          { token: 'SH', state: 'correct' },
          { token: 'T', state: 'absent' },
          { token: 'Ë', state: 'absent' },
          { token: 'P', state: 'absent' },
        ],
      ];

      const result = validateHardMode(guess, previousEvals);

      expect(result.valid).toBe(false);
      expect(result.message).toContain('Position 1 must be SH');
    });

    it('should fail when not including present token', () => {
      const guess = ['SH', 'T', 'Ë', 'P'];
      const previousEvals: GuessEvaluation[][] = [
        [
          { token: 'SH', state: 'correct' },
          { token: 'Q', state: 'present' },
          { token: 'I', state: 'absent' },
          { token: 'K', state: 'absent' },
        ],
      ];

      const result = validateHardMode(guess, previousEvals);

      expect(result.valid).toBe(false);
      expect(result.message).toContain('must contain Q');
    });

    it('should pass when following all hard mode rules', () => {
      const guess = ['SH', 'Q', 'A', 'P'];
      const previousEvals: GuessEvaluation[][] = [
        [
          { token: 'SH', state: 'correct' },
          { token: 'Q', state: 'present' },
          { token: 'I', state: 'absent' },
          { token: 'K', state: 'absent' },
        ],
      ];

      const result = validateHardMode(guess, previousEvals);

      expect(result.valid).toBe(true);
    });

    it('should handle digraphs in hard mode validation', () => {
      const guess = ['GJ', 'U', 'H', 'Ë'];
      const previousEvals: GuessEvaluation[][] = [
        [
          { token: 'GJ', state: 'correct' },
          { token: 'I', state: 'absent' },
          { token: 'K', state: 'absent' },
          { token: 'U', state: 'present' },
        ],
      ];

      const result = validateHardMode(guess, previousEvals);

      expect(result.valid).toBe(true);
    });
  });

  describe('getKeyboardStates', () => {
    it('should return empty map for no evaluations', () => {
      const states = getKeyboardStates([]);
      expect(states.size).toBe(0);
    });

    it('should track key states correctly', () => {
      const evaluations: GuessEvaluation[][] = [
        [
          { token: 'SH', state: 'correct' },
          { token: 'Q', state: 'present' },
          { token: 'I', state: 'absent' },
          { token: 'K', state: 'absent' },
        ],
      ];

      const states = getKeyboardStates(evaluations);

      expect(states.get('SH')).toBe('correct');
      expect(states.get('Q')).toBe('present');
      expect(states.get('I')).toBe('absent');
      expect(states.get('K')).toBe('absent');
    });

    it('should prioritize correct over present', () => {
      const evaluations: GuessEvaluation[][] = [
        [
          { token: 'A', state: 'present' },
          { token: 'B', state: 'absent' },
          { token: 'C', state: 'absent' },
          { token: 'D', state: 'absent' },
        ],
        [
          { token: 'A', state: 'correct' },
          { token: 'E', state: 'absent' },
          { token: 'F', state: 'absent' },
          { token: 'G', state: 'absent' },
        ],
      ];

      const states = getKeyboardStates(evaluations);

      expect(states.get('A')).toBe('correct');
    });

    it('should update individual letters within digraphs', () => {
      const evaluations: GuessEvaluation[][] = [
        [
          { token: 'SH', state: 'correct' },
          { token: 'Q', state: 'absent' },
          { token: 'I', state: 'absent' },
          { token: 'P', state: 'absent' },
        ],
      ];

      const states = getKeyboardStates(evaluations);

      // Both S and H should be marked correct since SH is correct
      expect(states.get('S')).toBe('correct');
      expect(states.get('H')).toBe('correct');
    });
  });
});
