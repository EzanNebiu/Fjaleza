import { ChartColumn, CircleHelp, Settings, Shuffle } from 'lucide-react';
import type { GameMode } from '../game/types';

interface HeaderProps {
  mode: GameMode;
  onPractice: () => void;
  onHelp: () => void;
  onStats: () => void;
  onSettings: () => void;
}

export function Header({ mode, onPractice, onHelp, onStats, onSettings }: HeaderProps) {
  return (
    <header className="header">
      <div className="brand">
        <span className="brand-mark" aria-hidden="true">
          ë
        </span>
        <h1 className="brand-name">Fjalëza</h1>
      </div>
      <nav className="header-actions" aria-label="Veprime">
        <button
          type="button"
          className="icon-btn"
          aria-pressed={mode === 'practice'}
          aria-label={mode === 'practice' ? 'Kthehu te fjala e ditës' : 'Luaj në praktikë'}
          title={mode === 'practice' ? 'Kthehu te fjala e ditës' : 'Praktikë'}
          onClick={onPractice}
        >
          <Shuffle aria-hidden="true" />
        </button>
        <button type="button" className="icon-btn" aria-label="Si të luash" title="Si të luash" onClick={onHelp}>
          <CircleHelp aria-hidden="true" />
        </button>
        <button type="button" className="icon-btn" aria-label="Statistikat" title="Statistikat" onClick={onStats}>
          <ChartColumn aria-hidden="true" />
        </button>
        <button type="button" className="icon-btn" aria-label="Cilësimet" title="Cilësimet" onClick={onSettings}>
          <Settings aria-hidden="true" />
        </button>
      </nav>
    </header>
  );
}
