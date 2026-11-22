import { MONETIZATION, adsActive, type AdPlacement } from '../config/monetization';
import { isAdFree } from '../monetization/adFree';
import { useConsent } from '../monetization/consent';

/** True when an ad for this placement may be shown right now. */
export function useAdAllowed(placement: AdPlacement): boolean {
  const { consent } = useConsent();
  const slot = MONETIZATION.ads.slots[placement];
  // In development, show dashed placeholders (no slot IDs needed) once ads are consented.
  if (import.meta.env.DEV) return MONETIZATION.ads.enabled && !!consent?.ads && !isAdFree();
  return adsActive() && !!slot.slotId && !!consent?.ads && !isAdFree();
}
