/**
 * Cookieless analytics loader. Imported dynamically, only after analytics consent.
 */
import { MONETIZATION } from '../config/monetization';

let started = false;

function addScript(src: string, attrs: Record<string, string> = {}) {
  const s = document.createElement('script');
  s.async = true;
  s.defer = true;
  s.src = src;
  for (const [k, v] of Object.entries(attrs)) s.setAttribute(k, v);
  document.head.appendChild(s);
}

export function startAnalytics(): void {
  if (started) return;
  started = true;
  const a = MONETIZATION.analytics;
  if (a.provider === 'goatcounter') {
    addScript('https://gc.zgo.at/count.js', {
      'data-goatcounter': `https://${a.goatcounterCode}.goatcounter.com/count`,
    });
  } else if (a.provider === 'cloudflare') {
    addScript('https://static.cloudflareinsights.com/beacon.min.js', {
      'data-cf-beacon': JSON.stringify({ token: a.cloudflareToken }),
    });
  } else if (a.provider === 'plausible') {
    addScript(a.plausibleScriptUrl, { 'data-domain': a.plausibleDomain });
  }
}

/** Optional custom events (game finished). Silently ignored by providers without events. */
export function trackEvent(name: string, props: Record<string, string | number> = {}): void {
  const w = window as unknown as {
    plausible?: (n: string, o: { props: object }) => void;
    goatcounter?: { count?: (o: { path: string; title: string; event: boolean }) => void };
  };
  w.plausible?.(name, { props });
  w.goatcounter?.count?.({ path: name, title: name, event: true });
}
