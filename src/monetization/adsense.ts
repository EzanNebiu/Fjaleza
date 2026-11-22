/**
 * Google AdSense loader. Imported dynamically, only after ad consent.
 * To use another network, replace loadAdNetwork() and fillSlot() here; the
 * AdSlot component does not need to change.
 */
import { MONETIZATION } from '../config/monetization';

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

let loading: Promise<void> | null = null;

export function loadAdNetwork(): Promise<void> {
  loading ??= new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.async = true;
    s.crossOrigin = 'anonymous';
    s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(
      MONETIZATION.ads.publisherId
    )}`;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Ad script blocked or offline'));
    document.head.appendChild(s);
  });
  return loading;
}

/** Render one fixed-size ad into `container`. */
export async function fillSlot(container: HTMLElement, slotId: string, width: number, height: number) {
  await loadAdNetwork();
  const ins = document.createElement('ins');
  ins.className = 'adsbygoogle';
  ins.style.display = 'inline-block';
  ins.style.width = `${width}px`;
  ins.style.height = `${height}px`;
  ins.dataset.adClient = MONETIZATION.ads.publisherId;
  ins.dataset.adSlot = slotId;
  container.replaceChildren(ins);
  (window.adsbygoogle = window.adsbygoogle || []).push({});
}
