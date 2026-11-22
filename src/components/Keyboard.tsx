import { memo } from 'react';
import { CornerDownLeft, Delete } from 'lucide-react';
import { KEYBOARD_ROWS } from '../game/constants';
import type { TileState } from '../game/types';

const STATE_LABEL: Record<TileState, string> = {
  correct: 'në vendin e duhur',
  present: 'në fjalë',
  absent: 'nuk është në fjalë',
};

interface KeyboardProps {
  states: Map<string, TileState>;
  onKey: (key: string) => void;
}

export const Keyboard = memo(function Keyboard({ states, onKey }: KeyboardProps) {
  return (
    <div className="keyboard" role="group" aria-label="Tastiera">
      {KEYBOARD_ROWS.map((row, r) => (
        <div className="kb-row" key={r}>
          {row.map((key) => {
            const special = key === 'enter' || key === 'backspace';
            const state = special ? undefined : states.get(key);
            const label =
              key === 'enter'
                ? 'Dërgo'
                : key === 'backspace'
                  ? 'Fshi shkronjën'
                  : `${key.toLocaleUpperCase('sq')}${state ? `, ${STATE_LABEL[state]}` : ''}`;
            return (
              <button
                key={key}
                type="button"
                className={special ? 'key wide' : 'key'}
                data-state={state}
                data-key={key}
                aria-label={label}
                onClick={(e) => {
                  onKey(key);
                  // A mouse or touch tap leaves focus on the key, and a later physical
                  // Enter would press it again. Keep focus only for keyboard users.
                  if (e.detail > 0) e.currentTarget.blur();
                }}
              >
                {key === 'enter' ? (
                  <CornerDownLeft aria-hidden="true" />
                ) : key === 'backspace' ? (
                  <Delete aria-hidden="true" />
                ) : (
                  key
                )}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
});
