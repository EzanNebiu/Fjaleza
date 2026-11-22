/**
 * OPTIONAL SCAFFOLD, NOT FUNCTIONAL: one-time ad-free upgrade.
 *
 * What exists: a config flag (MONETIZATION.adFree), a button in Settings, and a
 * stored flag that hides every AdSlot when set.
 *
 * What is still needed before enabling it:
 *   - a checkout (e.g. a Stripe Payment Link) that redirects back with a licence code
 *   - a way to verify that code. A static site cannot keep a secret, so this needs
 *     either a signed code checked here with a public key, or a serverless function.
 *   - restoring the purchase on a new device (enter the code again).
 */
import { MONETIZATION } from '../config/monetization';
import { safeStorage } from '../game/storage';

const KEY = 'fjaleza:adfree:v1';

export function isAdFree(): boolean {
  return safeStorage.get(KEY) === 'yes';
}

/** Call only after a purchase has been verified. */
export function grantAdFree(): void {
  safeStorage.set(KEY, 'yes');
}

export function startAdFreeCheckout(): void {
  if (!MONETIZATION.adFree.enabled || !MONETIZATION.adFree.checkoutUrl) {
    throw new Error('Ad-free checkout is not configured');
  }
  window.location.assign(MONETIZATION.adFree.checkoutUrl);
}
