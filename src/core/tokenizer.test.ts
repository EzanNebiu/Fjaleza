import { describe, it, expect } from 'vitest';
import {
  tokenizeAlbanian,
  tokensToString,
  getTokenLength,
  removeLastToken,
  isValidWord,
  tokenizeGreedy,
  isPotentialDigraph,
} from './tokenizer';

describe('Albanian Tokenizer', () => {
  describe('isPotentialDigraph', () => {
    it('should identify valid Albanian digraphs', () => {
      expect(isPotentialDigraph('D', 'H')).toBe(true);
      expect(isPotentialDigraph('S', 'H')).toBe(true);
      expect(isPotentialDigraph('Z', 'H')).toBe(true);
      expect(isPotentialDigraph('G', 'J')).toBe(true);
      expect(isPotentialDigraph('L', 'L')).toBe(true);
      expect(isPotentialDigraph('N', 'J')).toBe(true);
      expect(isPotentialDigraph('R', 'R')).toBe(true);
      expect(isPotentialDigraph('T', 'H')).toBe(true);
      expect(isPotentialDigraph('X', 'H')).toBe(true);
    });

    it('should reject invalid combinations', () => {
      expect(isPotentialDigraph('A', 'B')).toBe(false);
      expect(isPotentialDigraph('K', 'L')).toBe(false);
      expect(isPotentialDigraph('M', 'N')).toBe(false);
    });

    it('should be case-insensitive', () => {
      expect(isPotentialDigraph('d', 'h')).toBe(true);
      expect(isPotentialDigraph('s', 'h')).toBe(true);
    });
  });

  describe('tokenizeAlbanian with context', () => {
    it('should tokenize word with SH digraph when valid', () => {
      const validWords = new Set(['SHQIP', 'SHTËPI']);
      const tokens = tokenizeAlbanian('SHQIP', validWords);
      expect(tokens).toEqual(['SH', 'Q', 'I', 'P']);
    });

    it('should tokenize word with multiple digraphs', () => {
      const validWords = new Set(['GJUHË', 'LLOGARIT']);
      
      const tokens1 = tokenizeAlbanian('GJUHË', validWords);
      expect(tokens1).toEqual(['GJ', 'U', 'H', 'Ë']);
      
      const tokens2 = tokenizeAlbanian('LLOGARIT', validWords);
      expect(tokens2[0]).toBe('LL');
    });

    it('should handle RR digraph correctly', () => {
      const validWords = new Set(['RRUGË', 'MURRASH']);
      
      const tokens = tokenizeAlbanian('RRUGË', validWords);
      expect(tokens).toEqual(['RR', 'U', 'G', 'Ë']);
    });

    it('should handle words without digraphs', () => {
      const validWords = new Set(['MIKU', 'LIBËR']);
      
      const tokens1 = tokenizeAlbanian('MIKU', validWords);
      expect(tokens1).toEqual(['M', 'I', 'K', 'U']);
      
      const tokens2 = tokenizeAlbanian('LIBËR', validWords);
      expect(tokens2).toEqual(['L', 'I', 'B', 'Ë', 'R']);
    });

    it('should handle ZH and DH digraphs', () => {
      const validWords = new Set(['ZHDUK', 'DHOMA']);
      
      const tokens1 = tokenizeAlbanian('ZHDUK', validWords);
      expect(tokens1).toEqual(['ZH', 'D', 'U', 'K']);
      
      const tokens2 = tokenizeAlbanian('DHOMA', validWords);
      expect(tokens2).toEqual(['DH', 'O', 'M', 'A']);
    });

    it('should handle TH and XH digraphs', () => {
      const validWords = new Set(['THELLË', 'XHAM']);
      
      const tokens1 = tokenizeAlbanian('THELLË', validWords);
      expect(tokens1[0]).toBe('TH');
      
      const tokens2 = tokenizeAlbanian('XHAM', validWords);
      expect(tokens2).toEqual(['XH', 'A', 'M']);
    });

    it('should handle NJ digraph', () => {
      const validWords = new Set(['NJERI', 'ZONJË']);
      
      const tokens1 = tokenizeAlbanian('NJERI', validWords);
      expect(tokens1).toEqual(['NJ', 'E', 'R', 'I']);
      
      const tokens2 = tokenizeAlbanian('ZONJË', validWords);
      expect(tokens2).toEqual(['Z', 'O', 'NJ', 'Ë']);
    });

    it('should handle empty input', () => {
      const validWords = new Set(['TEST']);
      expect(tokenizeAlbanian('', validWords)).toEqual([]);
    });

    it('should be case-insensitive', () => {
      const validWords = new Set(['SHQIP']);
      
      const tokens1 = tokenizeAlbanian('shqip', validWords);
      const tokens2 = tokenizeAlbanian('SHQIP', validWords);
      const tokens3 = tokenizeAlbanian('ShQiP', validWords);
      
      expect(tokens1).toEqual(tokens2);
      expect(tokens2).toEqual(tokens3);
    });
  });

  describe('tokenizeGreedy (fallback)', () => {
    it('should use greedy matching for digraphs', () => {
      const tokens1 = tokenizeGreedy('SHQIP');
      expect(tokens1).toEqual(['SH', 'Q', 'I', 'P']);
      
      const tokens2 = tokenizeGreedy('GJUHË');
      expect(tokens2).toEqual(['GJ', 'U', 'H', 'Ë']);
      
      const tokens3 = tokenizeGreedy('LLOGARIT');
      expect(tokens3[0]).toBe('LL');
    });

    it('should handle words without digraphs', () => {
      const tokens = tokenizeGreedy('MIKU');
      expect(tokens).toEqual(['M', 'I', 'K', 'U']);
    });
  });

  describe('tokensToString', () => {
    it('should convert tokens back to string', () => {
      expect(tokensToString(['SH', 'Q', 'I', 'P'])).toBe('SHQIP');
      expect(tokensToString(['GJ', 'U', 'H', 'Ë'])).toBe('GJUHË');
      expect(tokensToString(['M', 'I', 'K', 'U'])).toBe('MIKU');
    });

    it('should handle empty tokens', () => {
      expect(tokensToString([])).toBe('');
    });
  });

  describe('getTokenLength', () => {
    it('should count logical tokens, not characters', () => {
      const validWords = new Set(['SHQIP', 'GJUHË']);
      
      expect(getTokenLength('SHQIP', validWords)).toBe(4); // SH-Q-I-P
      expect(getTokenLength('GJUHË', validWords)).toBe(4); // GJ-U-H-Ë
      expect(getTokenLength('MIKU', new Set(['MIKU']))).toBe(4); // M-I-K-U
    });
  });

  describe('removeLastToken', () => {
    it('should remove last token correctly for single char', () => {
      const result = removeLastToken('SHQIP', ['SH', 'Q', 'I', 'P']);
      expect(result.rawInput).toBe('SHQI');
      expect(result.tokens).toEqual(['SH', 'Q', 'I']);
    });

    it('should remove last token correctly for digraph', () => {
      const result = removeLastToken('SHQI', ['SH', 'Q', 'I']);
      expect(result.rawInput).toBe('SHQ');
      expect(result.tokens).toEqual(['SH', 'Q']);
    });

    it('should remove SH digraph correctly', () => {
      const result = removeLastToken('SH', ['SH']);
      expect(result.rawInput).toBe('');
      expect(result.tokens).toEqual([]);
    });

    it('should handle empty input', () => {
      const result = removeLastToken('', []);
      expect(result.rawInput).toBe('');
      expect(result.tokens).toEqual([]);
    });

    it('should handle LL digraph removal', () => {
      const result = removeLastToken('LLALL', ['LL', 'A', 'LL']);
      expect(result.rawInput).toBe('LLA');
      expect(result.tokens).toEqual(['LL', 'A']);
    });
  });

  describe('isValidWord', () => {
    it('should validate words correctly', () => {
      const validWords = new Set(['SHQIP', 'GJUHË', 'MIKU']);
      
      expect(isValidWord(['SH', 'Q', 'I', 'P'], validWords)).toBe(true);
      expect(isValidWord(['GJ', 'U', 'H', 'Ë'], validWords)).toBe(true);
      expect(isValidWord(['M', 'I', 'K', 'U'], validWords)).toBe(true);
      expect(isValidWord(['X', 'Y', 'Z'], validWords)).toBe(false);
    });

    it('should handle empty tokens', () => {
      const validWords = new Set(['TEST']);
      expect(isValidWord([], validWords)).toBe(false);
    });
  });

  describe('Complex scenarios', () => {
    it('should handle consecutive digraphs', () => {
      const validWords = new Set(['SHSH', 'DHTH']);
      
      const tokens1 = tokenizeAlbanian('SHSH', validWords);
      expect(tokens1).toEqual(['SH', 'SH']);
      
      const tokens2 = tokenizeAlbanian('DHTH', validWords);
      expect(tokens2).toEqual(['DH', 'TH']);
    });

    it('should handle mixed single and digraphs', () => {
      const validWords = new Set(['MISHKA', 'PESHKU']);
      
      const tokens1 = tokenizeAlbanian('MISHKA', validWords);
      expect(tokens1).toHaveLength(5); // M-I-SH-K-A
      expect(tokens1).toContain('SH');
      
      const tokens2 = tokenizeAlbanian('PESHKU', validWords);
      expect(tokens2).toHaveLength(5); // P-E-SH-K-U
      expect(tokens2).toContain('SH');
    });
  });
});
