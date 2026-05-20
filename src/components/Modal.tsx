/**
 * Modal Component
 * 
 * Reusable modal dialog
 */

import { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-3 sm:p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[calc(100dvh-1.5rem)] w-full max-w-md overflow-y-auto rounded-lg border border-hacker-border bg-hacker-surface"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-hacker-border p-4">
          <h2
            id="modal-title"
            className="min-w-0 text-lg font-bold uppercase tracking-wider text-hacker-text sm:text-xl"
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-hacker-border rounded transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6 text-hacker-text-dim" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">{children}</div>
      </div>
    </div>
  );
}
