/**
 * Game Over Modal Component
 * 
 * Shows the answer when the user loses or wins the game
 */

import { X } from 'lucide-react';
import { cn } from '../utils/cn';

interface GameOverModalProps {
  isOpen: boolean;
  onClose: () => void;
  won: boolean;
  answer: string;
  guesses: number;
  onNewGame?: () => void;
}

export function GameOverModal({ isOpen, onClose, won, answer, guesses, onNewGame }: GameOverModalProps) {
  if (!isOpen) return null;

  const handleClose = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    console.log('Modal close called, calling onClose');
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      console.log('Backdrop clicked');
      handleClose(e);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={handleBackdropClick}
      style={{ pointerEvents: 'auto' }}
    >
      <div
        className="relative w-[90vw] max-w-md rounded-lg border border-hacker-border bg-hacker-surface p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{ pointerEvents: 'auto' }}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={(e) => {
            console.log('X button clicked');
            handleClose(e);
          }}
          className="absolute right-4 top-4 rounded-md p-1 text-hacker-text-dim transition-colors hover:bg-hacker-border hover:text-hacker-text z-10"
          aria-label="Close"
          style={{ pointerEvents: 'auto', cursor: 'pointer' }}
        >
          <X className="h-5 w-5" />
        </button>

        {/* Content */}
        <div className="space-y-4 text-center">
          <h2 className={cn(
            "text-2xl font-bold",
            won ? "text-hacker-accent" : "text-hacker-error"
          )}>
            {won ? '🎉 You Won!' : '😔 Game Over'}
          </h2>

          {won ? (
            <div className="space-y-2">
              <p className="text-hacker-text">
                You guessed the word in <span className="font-bold text-hacker-accent">{guesses}</span> {guesses === 1 ? 'try' : 'tries'}!
              </p>
              <p className="text-3xl font-bold tracking-wider text-hacker-accent">
                {answer.toUpperCase()}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-hacker-text">
                Better luck next time!
              </p>
              <p className="text-sm text-hacker-text-dim">
                The word was:
              </p>
              <p className="text-3xl font-bold tracking-wider text-hacker-accent">
                {answer.toUpperCase()}
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            {onNewGame && (
              <button
                type="button"
                onClick={(e) => {
                  console.log('New Game button clicked');
                  e.preventDefault();
                  e.stopPropagation();
                  onNewGame();
                  handleClose(e);
                }}
                className="flex-1 rounded-md bg-hacker-accent px-4 py-2 font-semibold text-hacker-bg transition-colors hover:bg-hacker-accent-dim focus:outline-none focus:ring-2 focus:ring-hacker-accent z-10"
                style={{ pointerEvents: 'auto', cursor: 'pointer' }}
              >
                New Game
              </button>
            )}
            <button
              type="button"
              onClick={(e) => {
                console.log('Close button clicked');
                handleClose(e);
              }}
              className="flex-1 rounded-md border border-hacker-border bg-hacker-bg px-4 py-2 font-semibold text-hacker-text transition-colors hover:bg-hacker-border focus:outline-none focus:ring-2 focus:ring-hacker-accent z-10"
              style={{ pointerEvents: 'auto', cursor: 'pointer' }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
