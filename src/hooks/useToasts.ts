import { useCallback, useRef, useState } from 'react';

export interface Toast {
  id: number;
  message: string;
}

export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [announcement, setAnnouncement] = useState('');
  const nextId = useRef(1);

  const show = useCallback((message: string, opts: { duration?: number } = {}) => {
    const id = nextId.current++;
    setToasts((t) => [{ id, message }, ...t].slice(0, 3));
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), opts.duration ?? 2000);
  }, []);

  /** Screen-reader only message (for example the colours of a revealed row). */
  const announce = useCallback((message: string) => {
    setAnnouncement('');
    window.setTimeout(() => setAnnouncement(message), 50);
  }, []);

  return { toasts, show, announcement, announce };
}
