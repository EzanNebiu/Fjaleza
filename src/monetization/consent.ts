/**
 * Consent store (GDPR / ePrivacy / UK PECR). Strictly necessary storage (game
 * progress, settings, this choice) needs no consent. Analytics and ads do, and
 * their scripts are only fetched after the matching category is granted.
 */
import { useSyncExternalStore } from 'react';
import { adsActive, analyticsActive } from '../config/monetization';
import { KEYS, safeStorage } from '../game/storage';

/** Bump when the categories or the policy change materially: everyone is asked again. */
const CONSENT_VERSION = 1;

/** Fired on window whenever the visitor saves a choice. */
export const CONSENT_EVENT = 'fjaleza:consent';

export interface Consent {
  version: number;
  analytics: boolean;
  ads: boolean;
  decidedAt: string;
}

export const needsConsent = (): boolean => adsActive() || analyticsActive();

function read(): Consent | null {
  try {
    const c = JSON.parse(safeStorage.get(KEYS.consent) ?? 'null') as Consent | null;
    return c && c.version === CONSENT_VERSION ? c : null;
  } catch {
    return null;
  }
}

let current: Consent | null = read();
let managerOpen = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function getConsent(): Consent | null {
  return current;
}

export function setConsent(choice: { analytics: boolean; ads: boolean }): void {
  const previous = current;
  current = {
    version: CONSENT_VERSION,
    analytics: analyticsActive() && choice.analytics,
    ads: adsActive() && choice.ads,
    decidedAt: new Date().toISOString(),
  };
  safeStorage.set(KEYS.consent, JSON.stringify(current));
  managerOpen = false;
  emit();
  window.dispatchEvent(new Event(CONSENT_EVENT));
  // Withdrawing consent must stop scripts that already run: a reload is the only
  // reliable way to unload third-party code.
  if ((previous?.ads && !current.ads) || (previous?.analytics && !current.analytics)) {
    window.location.reload();
  }
}

export function openConsentManager(): void {
  managerOpen = true;
  emit();
}

export function closeConsentManager(): void {
  managerOpen = false;
  emit();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useConsent(): { consent: Consent | null; managerOpen: boolean } {
  const consent = useSyncExternalStore(subscribe, () => current);
  const open = useSyncExternalStore(subscribe, () => managerOpen);
  return { consent, managerOpen: open };
}
