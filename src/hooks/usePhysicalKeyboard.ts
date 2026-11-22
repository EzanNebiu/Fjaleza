import { useEffect, useRef } from 'react';

/**
 * Routes the physical keyboard into the game.
 * - Ignores shortcuts (Ctrl/Cmd/Alt + key) so browser shortcuts keep working;
 *   AltGr (Ctrl+Alt on Windows) is allowed because some layouts type ë and ç with it.
 * - Enter on a focused button activates that button only if the player reached it
 *   by keyboard navigation (Tab or arrows). After a mouse or touch click the button
 *   keeps focus, and Enter then submits the guess instead of pressing it again.
 * - Ignores typing inside form fields and while a dialog is open (enabled = false).
 */
export function usePhysicalKeyboard(
  enabled: boolean,
  handlers: { type: (key: string) => void; erase: () => void; submit: () => void }
) {
  const ref = useRef(handlers);
  useEffect(() => {
    ref.current = handlers;
  });

  /** How focus last moved: 'pointer' (click/tap) or 'keyboard' (Tab, arrows). */
  const modality = useRef<'pointer' | 'keyboard'>('pointer');

  useEffect(() => {
    const onPointer = () => {
      modality.current = 'pointer';
    };
    const onNavKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab' || e.key.startsWith('Arrow')) modality.current = 'keyboard';
    };
    window.addEventListener('pointerdown', onPointer, true);
    window.addEventListener('keydown', onNavKey, true);
    return () => {
      window.removeEventListener('pointerdown', onPointer, true);
      window.removeEventListener('keydown', onNavKey, true);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.isComposing) return;
      const altGr = e.ctrlKey && e.altKey;
      if ((e.ctrlKey || e.metaKey || e.altKey) && !altGr) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest('input, textarea, select, [contenteditable="true"]')) return;
      const control = target?.closest('button, a, [role="switch"], [role="radio"]');

      if (e.key === 'Enter') {
        if (control && modality.current === 'keyboard') return;
        e.preventDefault();
        ref.current.submit();
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        ref.current.erase();
      } else if (e.key.length === 1 && /\p{L}/u.test(e.key)) {
        e.preventDefault();
        ref.current.type(e.key);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [enabled]);
}
