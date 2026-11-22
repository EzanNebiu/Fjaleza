/**
 * Ads, analytics and the ad-free upgrade. This is the only file you need to edit
 * to switch monetisation on. Nothing here loads until the visitor consents.
 *
 * Steps to turn on Google AdSense:
 *   1. Get approved at https://adsense.google.com and copy your publisher ID (ca-pub-...).
 *   2. Create one display ad unit per placement below and paste each slot ID.
 *   3. Set ads.enabled to true and rebuild. ads.txt is generated from publisherId.
 */

export type AdPlacement = 'banner' | 'endOfGame' | 'sidebar';

export interface AdSlotConfig {
  /** AdSense data-ad-slot value (digits only). Empty string = slot disabled. */
  slotId: string;
  /** Reserved box. The ad is requested at exactly this size, so nothing shifts. */
  width: number;
  height: number;
}

export const MONETIZATION = {
  ads: {
    /** Master switch. false = no ad code, no ad space, no consent category for ads. */
    enabled: false,
    network: 'adsense' as const,
    /** Your AdSense publisher ID, for example "ca-pub-1234567890123456". */
    publisherId: '',
    slots: {
      /** Under the header on phones and tablets. Hidden on very short screens. */
      banner: { slotId: '', width: 320, height: 50 },
      /** Inside the results dialog after the game is over. */
      endOfGame: { slotId: '', width: 300, height: 250 },
      /** Right-hand column on wide desktop screens (1200px and up). */
      sidebar: { slotId: '', width: 160, height: 600 },
    } satisfies Record<AdPlacement, AdSlotConfig>,
  },

  analytics: {
    /**
     * Privacy-friendly, cookieless analytics. Pick one:
     *   'none'       nothing is loaded
     *   'goatcounter' free for non-commercial use, https://www.goatcounter.com (set code)
     *   'cloudflare' Cloudflare Web Analytics, free (set token)
     *   'plausible'  https://plausible.io or self-hosted (set domain, optionally scriptUrl)
     */
    provider: 'none' as 'none' | 'goatcounter' | 'cloudflare' | 'plausible',
    goatcounterCode: '',
    cloudflareToken: '',
    plausibleDomain: '',
    plausibleScriptUrl: 'https://plausible.io/js/script.js',
  },

  /**
   * OPTIONAL, NOT FUNCTIONAL YET: one-time "remove ads" purchase.
   * Only the structure exists (button, storage flag, hook). There is no payment
   * logic: see src/monetization/adFree.ts for what is still needed.
   */
  adFree: {
    enabled: false,
    priceLabel: '',
    /** e.g. a Stripe Payment Link. Required before enabling. */
    checkoutUrl: '',
  },
};

export const adsActive = (): boolean =>
  MONETIZATION.ads.enabled && MONETIZATION.ads.publisherId.startsWith('ca-pub-');

export const analyticsActive = (): boolean => {
  const a = MONETIZATION.analytics;
  switch (a.provider) {
    case 'goatcounter':
      return a.goatcounterCode !== '';
    case 'cloudflare':
      return a.cloudflareToken !== '';
    case 'plausible':
      return a.plausibleDomain !== '';
    default:
      return false;
  }
};
