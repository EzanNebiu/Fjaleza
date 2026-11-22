import { useEffect, useRef } from 'react';
import type { Toast } from '../hooks/useToasts';

/**
 * Toast region. Open dialogs live in the browser's top layer, so a normal
 * fixed element would be hidden behind them. The region is a manual popover,
 * re-shown for every new toast so it stacks above any open dialog.
 */
export function Toasts({ toasts, announcement }: { toasts: Toast[]; announcement: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const newest = toasts[0]?.id;

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof el.showPopover !== 'function') return;
    try {
      if (el.matches(':popover-open')) el.hidePopover();
      if (newest !== undefined) el.showPopover();
    } catch {
      /* popover unsupported or element detached */
    }
  }, [newest]);

  return (
    <>
      <div ref={ref} className="toasts" role="status" aria-live="polite" popover="manual">
        {toasts.map((t) => (
          <div className="toast" key={t.id}>
            {t.message}
          </div>
        ))}
      </div>
      <div className="visually-hidden" aria-live="polite">
        {announcement}
      </div>
    </>
  );
}
