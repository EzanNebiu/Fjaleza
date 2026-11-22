import { useEffect, useRef } from 'react';
import { MONETIZATION, type AdPlacement } from '../config/monetization';
import { useAdAllowed } from '../hooks/useAdAllowed';

/**
 * Fixed-size ad container. The box (ad + "Reklamë" label) is reserved before the
 * ad loads, so there is no layout shift. Renders nothing unless ads are enabled,
 * the slot has an ID, the visitor consented, and they are not ad-free.
 * In development it shows a dashed placeholder of the exact size instead.
 */
export function AdSlot({ placement, className }: { placement: AdPlacement; className?: string }) {
  const allowed = useAdAllowed(placement);
  const { width, height, slotId } = MONETIZATION.ads.slots[placement];
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!allowed || import.meta.env.DEV || !ref.current) return;
    const el = ref.current;
    import('../monetization/adsense')
      .then((m) => m.fillSlot(el, slotId, width, height))
      .catch(() => {
        /* blocked by an ad blocker or offline: leave the reserved space empty */
      });
  }, [allowed, slotId, width, height]);

  if (!allowed) return null;
  return (
    <aside className={className} aria-label="Reklamë">
      <div className="ad-label" aria-hidden="true">
        Reklamë
      </div>
      <div ref={ref} className="ad-slot" style={{ width, height, maxWidth: '100%' }}>
        {import.meta.env.DEV && (
          <div className="ad-dev">
            {placement} {width}×{height}
          </div>
        )}
      </div>
    </aside>
  );
}
