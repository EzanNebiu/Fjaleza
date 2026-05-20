/**
 * Welcome Modal Content
 * 
 * First-time player welcome and explanation
 */

import { useApp } from '../contexts/AppContext';

interface WelcomeProps {
  onClose: () => void;
}

export function Welcome({ onClose }: WelcomeProps) {
  const { updateSetting } = useApp();

  const handleStart = () => {
    updateSetting('hasSeenWelcome', true);
    onClose();
  };

  return (
    <div className="space-y-6">
      {/* Welcome message */}
      <div className="text-center">
        <h2 className="text-4xl font-bold text-hacker-accent mb-2">Mirë se vini!</h2>
        <p className="text-hacker-text-dim">Welcome to FJALËZA</p>
      </div>

      {/* Description */}
      <div className="space-y-4 text-hacker-text">
        <p>
          FJALËZA is an Albanian word puzzle game. Guess the 5-letter Albanian word in 6 tries.
        </p>
        
        <div className="bg-hacker-surface p-4 rounded-lg border border-hacker-border">
          <h3 className="text-hacker-accent font-semibold mb-2">Albanian Letter System</h3>
          <p className="text-sm text-hacker-text-dim">
            Albanian uses special two-letter combinations (digraphs) like <strong className="text-hacker-accent">SH</strong>, 
            {' '}<strong className="text-hacker-accent">DH</strong>, <strong className="text-hacker-accent">GJ</strong>, 
            {' '}<strong className="text-hacker-accent">LL</strong>, etc. that count as <strong>one logical letter</strong>.
          </p>
          <p className="text-sm text-hacker-text-dim mt-2">
            Don't worry! The game automatically combines letters intelligently based on the word.
            Just type normally using the keyboard.
          </p>
        </div>

        <p className="text-sm text-hacker-text-dim">
          After each guess, tiles change color to show:
        </p>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-2">
            <span className="w-8 h-8 bg-hacker-correct rounded flex items-center justify-center text-xs font-bold text-hacker-bg">✓</span>
            <span><strong className="text-hacker-correct">Green</strong> - Letter is correct and in the right position</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-8 h-8 bg-hacker-present rounded flex items-center justify-center text-xs font-bold text-hacker-bg">?</span>
            <span><strong className="text-hacker-present">Yellow</strong> - Letter is in the word but wrong position</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-8 h-8 bg-hacker-absent rounded flex items-center justify-center text-xs font-bold text-hacker-text-dim">✗</span>
            <span><strong className="text-hacker-text-dim">Gray</strong> - Letter is not in the word</span>
          </li>
        </ul>
      </div>

      {/* Start button */}
      <button
        onClick={handleStart}
        className="w-full bg-hacker-accent text-hacker-bg font-bold py-4 rounded-lg hover:bg-hacker-accent-dim transition-colors text-lg"
      >
        Start Playing
      </button>

      <p className="text-center text-xs text-hacker-text-dim">
        You can view help anytime by clicking the menu button
      </p>
    </div>
  );
}
