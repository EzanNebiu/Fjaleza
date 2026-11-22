import { MAX_GUESSES } from './constants';
import { evaluateGuess } from './evaluate';

export interface ShareInput {
  puzzle: number;
  guesses: string[];
  answer: string;
  won: boolean;
  hardMode: boolean;
  colorBlind: boolean;
  dark: boolean;
  url: string;
}

export function buildShareText(s: ShareInput): string {
  const correct = s.colorBlind ? '🟧' : '🟩';
  const present = s.colorBlind ? '🟦' : '🟨';
  const absent = s.dark ? '⬛' : '⬜';
  const rows = s.guesses.map((g) =>
    evaluateGuess(g, s.answer)
      .map((t) => (t === 'correct' ? correct : t === 'present' ? present : absent))
      .join('')
  );
  const score = `${s.won ? s.guesses.length : 'X'}/${MAX_GUESSES}${s.hardMode ? '*' : ''}`;
  return `Fjalëza #${s.puzzle} ${score}\n\n${rows.join('\n')}\n\n${s.url}`;
}

export type ShareOutcome = 'shared' | 'copied' | 'failed';

/** Native share sheet on touch devices, clipboard elsewhere, execCommand as a last resort. */
export async function shareResult(text: string): Promise<ShareOutcome> {
  const touch = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;
  if (touch && typeof navigator.share === 'function') {
    try {
      await navigator.share({ text });
      return 'shared';
    } catch (err) {
      if ((err as DOMException)?.name === 'AbortError') return 'shared';
    }
  }
  try {
    await navigator.clipboard.writeText(text);
    return 'copied';
  } catch {
    /* fall through */
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok ? 'copied' : 'failed';
  } catch {
    return 'failed';
  }
}
