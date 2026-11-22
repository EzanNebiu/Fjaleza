/**
 * Open Albanian word sources used to validate the Fjalëza word lists.
 *
 * Both sources are downloaded on demand into scripts/.cache/ (git-ignored),
 * so the repository never ships a copy of them.
 *
 * 1. Hunspell Albanian dictionary (sq_AL) by Luan Kelmendi, v1.6.4,
 *    distributed with LibreOffice. License: GPL-2.0-or-later.
 *    https://github.com/LibreOffice/dictionaries/tree/master/sq_AL
 *    Used as the "is this a real, correctly spelled Albanian word" check.
 *    Proper nouns are capitalised in this dictionary, which lets us exclude them.
 *
 * 2. FrequencyWords, Albanian list (sq_full.txt) by Hermit Dave, 2018 edition,
 *    built from the OpenSubtitles corpus. License: CC-BY-SA-4.0 (content).
 *    https://github.com/hermitdave/FrequencyWords/tree/master/content/2018/sq
 *    Used as the "how common is this word in everyday speech" signal.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
export const CACHE_DIR = join(here, '..', '.cache');

export const SOURCES = {
  dic: {
    url: 'https://raw.githubusercontent.com/LibreOffice/dictionaries/master/sq_AL/sq_AL.dic',
    file: 'sq_AL.dic',
  },
  aff: {
    url: 'https://raw.githubusercontent.com/LibreOffice/dictionaries/master/sq_AL/sq_AL.aff',
    file: 'sq_AL.aff',
  },
  freq: {
    url: 'https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/sq/sq_full.txt',
    file: 'sq_full.txt',
  },
};

async function fetchCached({ url, file }) {
  mkdirSync(CACHE_DIR, { recursive: true });
  const path = join(CACHE_DIR, file);
  if (!existsSync(path)) {
    process.stdout.write(`Downloading ${url}\n`);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Download failed (${res.status}) for ${url}`);
    writeFileSync(path, Buffer.from(await res.arrayBuffer()));
  }
  return readFileSync(path, 'utf8');
}

/** Lowercase + NFC, the canonical form used everywhere in the scripts. */
export function norm(word) {
  return word.normalize('NFC').trim().toLocaleLowerCase('sq');
}

/** Parse a Hunspell .aff file (only the SFX/PFX features this dictionary uses). */
function parseAff(text) {
  const rules = new Map();
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const parts = lines[i].trim().split(/\s+/);
    if ((parts[0] === 'SFX' || parts[0] === 'PFX') && parts.length === 4 && /^\d+$/.test(parts[3])) {
      const [type, flag, cross, count] = parts;
      const entries = [];
      for (let j = 1; j <= Number(count); j++) {
        const p = lines[i + j].trim().split(/\s+/);
        const strip = p[2] === '0' ? '' : p[2];
        const add = p[3] === '0' ? '' : p[3].split('/')[0];
        const cond = p[4] && p[4] !== '.' ? p[4] : '';
        const re = cond ? new RegExp(type === 'SFX' ? `${cond}$` : `^${cond}`, 'u') : null;
        entries.push({ strip, add, re });
      }
      rules.set(flag, { type, cross: cross === 'Y', entries });
      i += Number(count);
    }
  }
  return rules;
}

function applyRule(word, rule) {
  const out = [];
  for (const { strip, add, re } of rule.entries) {
    if (re && !re.test(word)) continue;
    if (rule.type === 'SFX') {
      if (strip && !word.endsWith(strip)) continue;
      out.push(word.slice(0, word.length - strip.length) + add);
    } else {
      if (strip && !word.startsWith(strip)) continue;
      out.push(add + word.slice(strip.length));
    }
  }
  return out;
}

/**
 * Expand the Hunspell dictionary into every surface form.
 * Returns { lower: Set<string>, proper: Set<string> } where `lower` holds forms
 * whose dictionary entry is lowercase (common words) and `proper` holds the
 * lowercased form of capitalised entries (names, places, acronyms).
 */
export async function loadHunspell() {
  const [dicText, affText] = await Promise.all([fetchCached(SOURCES.dic), fetchCached(SOURCES.aff)]);
  const rules = parseAff(affText);
  const lower = new Set();
  const proper = new Set();
  const lines = dicText.split(/\r?\n/).slice(1);
  for (const line of lines) {
    if (!line.trim()) continue;
    const [stem, flags = ''] = line.trim().split('/');
    const forms = new Set([stem]);
    const sfx = [];
    const pfx = [];
    for (const f of flags) {
      const r = rules.get(f);
      if (!r) continue;
      (r.type === 'SFX' ? sfx : pfx).push(r);
    }
    for (const r of sfx) applyRule(stem, r).forEach((w) => forms.add(w));
    for (const p of pfx) {
      for (const w of [...forms]) {
        applyRule(w, p).forEach((x) => forms.add(x));
      }
    }
    const isProper = stem[0] !== stem[0].toLocaleLowerCase('sq');
    for (const w of forms) (isProper ? proper : lower).add(norm(w));
  }
  return { lower, proper };
}

/** Load the subtitle frequency list as Map<word, count>. */
export async function loadFrequency() {
  const text = await fetchCached(SOURCES.freq);
  const freq = new Map();
  for (const line of text.split(/\r?\n/)) {
    const [w, c] = line.split(' ');
    if (!w || !c) continue;
    const k = norm(w);
    freq.set(k, (freq.get(k) ?? 0) + Number(c));
  }
  return freq;
}

/** Albanian digraphs, each one letter of the 36-letter alphabet. */
export const DIGRAPHS = ['dh', 'gj', 'll', 'nj', 'rr', 'sh', 'th', 'xh', 'zh'];
// Latin a-z without w, plus ç and ë.
const ALPHABET_RE = /^[a-vx-zçë]+$/u;

/** Split a lowercase word into Albanian letters (greedy digraph match). */
export function splitLetters(word) {
  const out = [];
  for (let i = 0; i < word.length; ) {
    const two = word.slice(i, i + 2);
    if (DIGRAPHS.includes(two)) {
      out.push(two);
      i += 2;
    } else {
      out.push(word[i]);
      i += 1;
    }
  }
  return out;
}

export function isAlbanianAlphabetic(word) {
  return ALPHABET_RE.test(word);
}
