/**
 * Header Component
 * 
 * App header with branding, mode toggle, and action buttons
 */

import { useState } from 'react';
import { BarChart3, Settings as SettingsIcon, HelpCircle } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Stats } from './Stats';
import { Help } from './Help';
import { Modal } from './Modal';
import { clearValidationCache } from '../services/fjalorthi';

export function Header() {
  const { mode, toggleMode, stats, settings, updateSetting, resetStats, newGame } = useApp();
  const [showStats, setShowStats] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const handleClearCache = () => {
    if (!confirm('Clear the word validation cache? This will remove all cached word validations.')) {
      return;
    }

    clearValidationCache();
    alert('Validation cache cleared successfully!');
  };

  return (
    <>
      <header className="border-b border-hacker-border px-3 py-3 sm:px-4 sm:py-4">
        <div className="mx-auto grid w-full max-w-5xl grid-cols-[1fr_auto_1fr] items-center gap-2">
          {/* Stats button */}
          <button
            onClick={() => setShowStats(true)}
            className="justify-self-start p-2 hover:bg-hacker-surface rounded transition-colors"
            aria-label="View statistics"
          >
            <BarChart3 className="h-5 w-5 text-hacker-accent sm:h-6 sm:w-6" />
          </button>

          {/* Title */}
          <div className="min-w-0 text-center">
            <h1 className="text-2xl font-bold text-hacker-accent tracking-wider sm:text-4xl">
              FJALËZA
            </h1>
            <p className="mt-1 text-[11px] text-hacker-text-dim sm:text-xs">
              Albanian Word Puzzle
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex justify-self-end gap-1 sm:gap-2">
            <button
              onClick={() => setShowHelp(true)}
              className="p-2 hover:bg-hacker-surface rounded transition-colors"
              aria-label="Help"
            >
              <HelpCircle className="h-5 w-5 text-hacker-accent sm:h-6 sm:w-6" />
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 hover:bg-hacker-surface rounded transition-colors"
              aria-label="Settings"
            >
              <SettingsIcon className="h-5 w-5 text-hacker-accent sm:h-6 sm:w-6" />
            </button>
          </div>
        </div>

        {/* Mode toggle */}
        <div className="mx-auto mt-3 flex w-full max-w-5xl justify-center sm:mt-4">
          <div className="inline-flex border border-hacker-border rounded-lg overflow-hidden">
            <button
              onClick={() => mode === 'practice' && toggleMode()}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                mode === 'daily'
                  ? 'bg-hacker-accent text-hacker-bg'
                  : 'bg-hacker-surface text-hacker-text-dim hover:bg-hacker-border'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => mode === 'daily' && toggleMode()}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                mode === 'practice'
                  ? 'bg-hacker-accent text-hacker-bg'
                  : 'bg-hacker-surface text-hacker-text-dim hover:bg-hacker-border'
              }`}
            >
              Practice
            </button>
          </div>
        </div>
      </header>

      {/* Stats Modal */}
      <Modal isOpen={showStats} onClose={() => setShowStats(false)} title="Statistics">
        <Stats stats={stats} />
        {mode === 'practice' && (
          <button
            onClick={() => {
              newGame();
              setShowStats(false);
            }}
            className="w-full mt-6 bg-hacker-accent text-hacker-bg font-semibold py-3 rounded-lg hover:bg-hacker-accent-dim transition-colors"
          >
            New Game
          </button>
        )}
      </Modal>

      {/* Help Modal */}
      <Modal isOpen={showHelp} onClose={() => setShowHelp(false)} title="How To Play">
        <Help />
      </Modal>

      {/* Settings Modal */}
      <Modal isOpen={showSettings} onClose={() => setShowSettings(false)} title="Settings">
        <div className="space-y-4">
          {/* Hard Mode */}
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-hacker-text">Hard Mode</div>
              <div className="text-sm text-hacker-text-dim">
                Must use revealed hints
              </div>
            </div>
            <button
              onClick={() => updateSetting('hardMode', !settings.hardMode)}
              className={`w-12 h-6 rounded-full transition-colors ${
                settings.hardMode ? 'bg-hacker-accent' : 'bg-hacker-border'
              }`}
              role="switch"
              aria-checked={settings.hardMode}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                  settings.hardMode ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Reduced Motion */}
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-hacker-text">Reduced Motion</div>
              <div className="text-sm text-hacker-text-dim">
                Disable animations
              </div>
            </div>
            <button
              onClick={() => updateSetting('reducedMotion', !settings.reducedMotion)}
              className={`w-12 h-6 rounded-full transition-colors ${
                settings.reducedMotion ? 'bg-hacker-accent' : 'bg-hacker-border'
              }`}
              role="switch"
              aria-checked={settings.reducedMotion}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                  settings.reducedMotion ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* High Contrast */}
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-hacker-text">High Contrast</div>
              <div className="text-sm text-hacker-text-dim">
                Improved color visibility
              </div>
            </div>
            <button
              onClick={() => updateSetting('highContrast', !settings.highContrast)}
              className={`w-12 h-6 rounded-full transition-colors ${
                settings.highContrast ? 'bg-hacker-accent' : 'bg-hacker-border'
              }`}
              role="switch"
              aria-checked={settings.highContrast}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                  settings.highContrast ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Clear Validation Cache */}
          <div className="pt-4 border-t border-hacker-border">
            <button
              onClick={handleClearCache}
              className="w-full bg-hacker-surface text-hacker-text font-semibold py-3 rounded-lg hover:bg-hacker-border transition-colors"
            >
              Clear Validation Cache
            </button>
            <p className="text-xs text-hacker-text-dim mt-2 text-center">
              Remove cached word validations from Fjalorthi API
            </p>
          </div>

          {/* Reset Stats */}
          <div className="pt-4 border-t border-hacker-border">
            <button
              onClick={() => {
                if (confirm('Are you sure you want to reset all statistics?')) {
                  resetStats();
                }
              }}
              className="w-full bg-hacker-error text-white font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity"
            >
              Reset Statistics
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
