/**
 * Help Modal Content
 * 
 * Explains game rules and Albanian letter system
 */

import { Cell } from './Cell';

export function Help() {
  return (
    <div className="space-y-6 text-hacker-text">
      {/* How to play */}
      <section>
        <h3 className="text-lg font-semibold text-hacker-accent mb-2">How To Play</h3>
        <p className="text-sm text-hacker-text-dim mb-4">
          Guess the Albanian word in 6 tries. After each guess, the color of the tiles will
          change to show how close your guess was to the word.
        </p>
      </section>

      {/* Examples */}
      <section>
        <h3 className="text-lg font-semibold text-hacker-accent mb-3">Examples</h3>
        
        {/* Correct example */}
        <div className="mb-4">
          <div className="flex gap-1 mb-2">
            <Cell token="SH" state="correct" />
            <Cell token="Q" state="empty" />
            <Cell token="I" state="empty" />
            <Cell token="P" state="empty" />
          </div>
          <p className="text-sm text-hacker-text-dim">
            The token <strong className="text-hacker-correct">SH</strong> is in the word and in the correct position.
          </p>
        </div>

        {/* Present example */}
        <div className="mb-4">
          <div className="flex gap-1 mb-2">
            <Cell token="M" state="empty" />
            <Cell token="I" state="present" />
            <Cell token="K" state="empty" />
            <Cell token="U" state="empty" />
          </div>
          <p className="text-sm text-hacker-text-dim">
            The token <strong className="text-hacker-present">I</strong> is in the word but in the wrong position.
          </p>
        </div>

        {/* Absent example */}
        <div className="mb-4">
          <div className="flex gap-1 mb-2">
            <Cell token="Z" state="empty" />
            <Cell token="E" state="empty" />
            <Cell token="M" state="absent" />
            <Cell token="Ë" state="empty" />
          </div>
          <p className="text-sm text-hacker-text-dim">
            The token <strong className="text-hacker-text-dim">M</strong> is not in the word in any position.
          </p>
        </div>
      </section>

      {/* Albanian letters */}
      <section>
        <h3 className="text-lg font-semibold text-hacker-accent mb-2">Albanian Letters</h3>
        <p className="text-sm text-hacker-text-dim mb-3">
          Albanian has special two-letter combinations (digraphs) that count as one logical letter:
        </p>
        <div className="grid grid-cols-3 gap-2 text-sm font-mono bg-hacker-surface p-3 rounded">
          <span className="text-hacker-accent">DH</span>
          <span className="text-hacker-accent">GJ</span>
          <span className="text-hacker-accent">LL</span>
          <span className="text-hacker-accent">NJ</span>
          <span className="text-hacker-accent">RR</span>
          <span className="text-hacker-accent">SH</span>
          <span className="text-hacker-accent">TH</span>
          <span className="text-hacker-accent">XH</span>
          <span className="text-hacker-accent">ZH</span>
        </div>
        <p className="text-sm text-hacker-text-dim mt-3">
          Example: The word <strong>SHQIP</strong> has 4 logical letters: 
          <span className="font-mono text-hacker-accent"> SH-Q-I-P</span>
        </p>
        <p className="text-sm text-hacker-text-dim mt-2">
          The keyboard shows individual letters (S, H) but the game intelligently combines
          them into digraphs (SH) based on the word context.
        </p>
      </section>

      {/* Hard mode */}
      <section>
        <h3 className="text-lg font-semibold text-hacker-accent mb-2">Hard Mode</h3>
        <p className="text-sm text-hacker-text-dim">
          In Hard Mode, you must use all revealed hints in subsequent guesses. Any correct
          letters must be in the same position, and any present letters must be included.
        </p>
      </section>

      {/* Modes */}
      <section>
        <h3 className="text-lg font-semibold text-hacker-accent mb-2">Game Modes</h3>
        <ul className="text-sm text-hacker-text-dim space-y-2">
          <li>
            <strong className="text-hacker-text">Daily:</strong> One puzzle per day, same for everyone
          </li>
          <li>
            <strong className="text-hacker-text">Practice:</strong> Unlimited random puzzles
          </li>
        </ul>
      </section>
    </div>
  );
}
