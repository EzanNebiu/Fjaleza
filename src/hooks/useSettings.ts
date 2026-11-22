import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { loadSettings, saveSettings, type Settings } from '../game/storage';

function mediaStore(query: string) {
  return (cb: () => void) => {
    const mq = window.matchMedia(query);
    mq.addEventListener('change', cb);
    return () => mq.removeEventListener('change', cb);
  };
}
const subscribeDark = mediaStore('(prefers-color-scheme: dark)');
const subscribeMotion = mediaStore('(prefers-reduced-motion: reduce)');
const systemDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches;
const systemReduce = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const prefersDark = useSyncExternalStore(subscribeDark, systemDark, () => false);
  const prefersReduce = useSyncExternalStore(subscribeMotion, systemReduce, () => false);

  const dark = settings.theme === 'dark' || (settings.theme === 'system' && prefersDark);
  const motion = !(settings.reducedMotion === 'on' || prefersReduce);

  // Mirrors public/theme-init.js, which applies the same attributes before first paint.
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = dark ? 'dark' : 'light';
    root.dataset.cb = settings.colorBlind ? 'on' : 'off';
    root.dataset.motion = settings.reducedMotion === 'on' ? 'reduce' : 'system';
    document
      .querySelector('meta[name="theme-color"]:not([media])')
      ?.setAttribute('content', dark ? '#14110e' : '#f5efe4');
  }, [dark, settings.colorBlind, settings.reducedMotion]);

  const update = useCallback(<K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((s) => {
      const next = { ...s, [key]: value };
      saveSettings(next);
      return next;
    });
  }, []);

  return { settings, update, dark, motion };
}
