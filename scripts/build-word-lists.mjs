#!/usr/bin/env node
/**
 * Build and audit the Fjalëza word lists from open Albanian sources.
 *
 *   npm run words:build            rebuild words/answers.txt, words/guesses.txt,
 *                                  words/needs-review.json and words/REPORT.md
 *
 * Game rule: a word is exactly 5 CHARACTERS (Ç and Ë are one character each,
 * digraphs such as SH or GJ count as two). Only letters of the Albanian alphabet.
 *
 * Valid-guess list = every 5-character, lowercase (non proper noun) form in the
 *   Hunspell sq_AL dictionary, minus offensive words.
 * Answer list = valid guesses that ALSO appear at least ANSWER_MIN_FREQ times in the
 *   OpenSubtitles frequency list, minus function words, sensitive words and anything
 *   flagged for review.
 *
 * The answer schedule order is preserved across rebuilds: words already in
 * words/answers.txt keep their position, new words are appended in a seeded
 * shuffle, removed words are reported. Past and current daily words therefore
 * never change unless a word is removed.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadFrequency, loadHunspell, isAlbanianAlphabetic, norm, SOURCES } from './lib/sources.mjs';
import { FUNCTION_WORDS, SENSITIVE, isOffensive } from './lib/exclusions.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const WORDS_DIR = join(root, 'words');
const ANSWER_MIN_FREQ = 100; // occurrences in the subtitle corpus to count as "common"
const REVIEW_MIN_FREQ = 30; // below this an old answer is just rare, not "uncertain"
const LENGTH = 5;

const chars = (w) => [...w].length;

/** Deterministic PRNG (mulberry32) so the schedule shuffle is reproducible. */
function rng(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffle(list, seed) {
  const r = rng(seed);
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function readList(file) {
  const p = join(WORDS_DIR, file);
  if (!existsSync(p)) return null;
  return readFileSync(p, 'utf8')
    .split(/\r?\n/)
    .map((l) => l.replace(/#.*/, '').trim())
    .filter(Boolean)
    .map(norm);
}

/** The original ChatGPT-generated answer list, kept as input for the audit report. */
function readLegacyAnswers() {
  return readList('legacy-answers.txt') ?? [];
}

/** Variant with ASCII e/c replaced by ë/ç, used to catch missing diacritics. */
function diacriticVariants(w) {
  const out = new Set();
  const idx = [...w].map((c, i) => (c === 'e' || c === 'c' ? i : -1)).filter((i) => i >= 0);
  for (let mask = 1; mask < 1 << idx.length; mask++) {
    const arr = [...w];
    idx.forEach((i, b) => {
      if (mask & (1 << b)) arr[i] = arr[i] === 'e' ? 'ë' : 'ç';
    });
    out.add(arr.join(''));
  }
  return [...out];
}

const { lower, proper } = await loadHunspell();
const freq = await loadFrequency();
const f = (w) => freq.get(w) ?? 0;

// ---- Valid guesses ---------------------------------------------------------
const guesses = [...lower]
  .filter((w) => chars(w) === LENGTH && isAlbanianAlphabetic(w) && !proper.has(w) && !isOffensive(w))
  .sort((a, b) => a.localeCompare(b, 'sq'));
const guessSet = new Set(guesses);

// ---- Answer candidates -----------------------------------------------------
const review = [];
const reviewSet = new Set();
function flag(word, reason, extra = {}) {
  if (reviewSet.has(word)) return;
  reviewSet.add(word);
  review.push({ word, reason, frequency: f(word), ...extra });
}

function answerProblem(w) {
  if (chars(w) !== LENGTH) return `length ${chars(w)}, not ${LENGTH}`;
  if (!isAlbanianAlphabetic(w)) return 'contains characters outside the Albanian alphabet';
  if (proper.has(w) && !lower.has(w)) return 'proper noun in the Hunspell dictionary';
  if (!lower.has(w)) return 'not in the Hunspell sq_AL dictionary';
  if (isOffensive(w)) return 'offensive';
  return null;
}

const candidates = [];
for (const w of guesses) {
  if (f(w) < ANSWER_MIN_FREQ) continue;
  if (FUNCTION_WORDS.has(w) || SENSITIVE.has(w)) continue;
  // A word that is also a proper noun (e.g. a first name) is ambiguous as an answer.
  if (proper.has(w)) {
    flag(w, 'also a proper noun in the dictionary');
    continue;
  }
  // Subtitles often drop diacritics. If a ë/ç variant is far more common, the plain
  // form's frequency is probably inflated by misspellings.
  const better = diacriticVariants(w).find((v) => guessSet.has(v) && f(v) > f(w) * 3);
  if (better) {
    flag(w, `diacritic variant "${better}" is much more frequent; frequency may come from misspellings`, {
      variant: better,
      variantFrequency: f(better),
    });
    continue;
  }
  candidates.push(w);
}

// ---- Audit the legacy answer list ------------------------------------------
const legacy = readLegacyAnswers();
const legacyAudit = { kept: [], flagged: [], removed: [] };
for (const w of [...new Set(legacy)]) {
  const problem = answerProblem(w);
  if (problem) {
    if (problem.startsWith('not in the Hunspell') && f(w) >= REVIEW_MIN_FREQ) {
      flag(w, `legacy answer: ${problem}, but appears ${f(w)} times in subtitles (dialect or spelling variant?)`);
      legacyAudit.flagged.push(w);
    } else {
      legacyAudit.removed.push({ word: w, reason: problem });
    }
    continue;
  }
  if (FUNCTION_WORDS.has(w) || SENSITIVE.has(w)) {
    legacyAudit.removed.push({ word: w, reason: 'function or sensitive word, not a good answer' });
    continue;
  }
  if (candidates.includes(w)) {
    legacyAudit.kept.push(w);
  } else if (reviewSet.has(w)) {
    legacyAudit.flagged.push(w);
  } else if (f(w) >= REVIEW_MIN_FREQ) {
    flag(w, `legacy answer: real word but only ${f(w)} subtitle occurrences (below ${ANSWER_MIN_FREQ})`);
    legacyAudit.flagged.push(w);
  } else {
    legacyAudit.removed.push({ word: w, reason: `real word but rare (${f(w)} occurrences), kept as a valid guess only` });
  }
}

// ---- Manual review decisions -----------------------------------------------
// words/review-decisions.json: { "approve": [...], "reject": [...] } lets a human
// promote a flagged word to the answer list or block a candidate.
const decisionsPath = join(WORDS_DIR, 'review-decisions.json');
const decisions = existsSync(decisionsPath)
  ? JSON.parse(readFileSync(decisionsPath, 'utf8'))
  : { approve: [], reject: [] };
const approve = new Set((decisions.approve ?? []).map(norm));
const rejectReasons = new Map(
  Array.isArray(decisions.reject)
    ? decisions.reject.map((w) => [norm(w), 'rejected manually'])
    : Object.entries(decisions.reject ?? {}).map(([w, r]) => [norm(w), r])
);
const reject = new Set(rejectReasons.keys());
for (const w of approve) {
  if (answerProblem(w)) throw new Error(`Cannot approve "${w}": ${answerProblem(w)}`);
}

const finalAnswers = new Set(
  [...candidates, ...approve].filter((w) => !reject.has(w))
);
for (const w of reject) {
  if (!reviewSet.has(w) && guessSet.has(w)) flag(w, `manual review: ${rejectReasons.get(w)}`);
}
for (const w of [...legacyAudit.kept]) {
  if (reject.has(w)) {
    legacyAudit.kept.splice(legacyAudit.kept.indexOf(w), 1);
    legacyAudit.flagged.push(w);
  }
}
const reviewOut = review.filter((r) => !approve.has(r.word) && !finalAnswers.has(r.word));

// ---- Preserve the schedule order -------------------------------------------
const previous = readList('answers.txt') ?? [];
const keptInOrder = previous.filter((w) => finalAnswers.has(w));
const droppedFromSchedule = previous.filter((w) => !finalAnswers.has(w));
const newOnes = shuffle(
  [...finalAnswers].filter((w) => !keptInOrder.includes(w)).sort((a, b) => a.localeCompare(b, 'sq')),
  20261122
);
const schedule = [...keptInOrder, ...newOnes];

// ---- Write outputs ---------------------------------------------------------
mkdirSync(WORDS_DIR, { recursive: true });
const header = (title) =>
  `# ${title}\n# Generated by scripts/build-word-lists.mjs. One word per line, lowercase.\n`;
writeFileSync(
  join(WORDS_DIR, 'answers.txt'),
  `${header('Fjalëza answer schedule (order matters: line N is puzzle N)')}# Append-only in practice: removing a line shifts every later puzzle.\n${schedule.join('\n')}\n`
);
writeFileSync(join(WORDS_DIR, 'guesses.txt'), `${header('Fjalëza valid guesses')}${guesses.join('\n')}\n`);
writeFileSync(
  join(WORDS_DIR, 'needs-review.json'),
  `${JSON.stringify(
    {
      note: 'Words kept out of the answer list until a human checks them. To promote one, add it to "approve" in words/review-decisions.json and rerun npm run words:build.',
      count: reviewOut.length,
      words: reviewOut.sort((a, b) => b.frequency - a.frequency),
    },
    null,
    2
  )}\n`
);
if (!existsSync(decisionsPath)) {
  writeFileSync(decisionsPath, `${JSON.stringify({ approve: [], reject: [] }, null, 2)}\n`);
}

const sample = (arr, n = 15) => arr.slice(0, n).join(', ') || 'none';
const report = `# Word list report

Generated by \`scripts/build-word-lists.mjs\`.

## Sources

| Source | Used for | License |
| --- | --- | --- |
| [Hunspell sq_AL ${'1.6.4'}](${SOURCES.dic.url.replace('raw.githubusercontent.com', 'github.com').replace('/master/', '/tree/master/').replace('/sq_AL.dic', '')}) by Luan Kelmendi | Is the word real and correctly spelled? Is it a proper noun? | GPL-2.0-or-later |
| [FrequencyWords sq 2018](https://github.com/hermitdave/FrequencyWords/tree/master/content/2018/sq) (OpenSubtitles) | Is the word common in everyday speech? | CC-BY-SA-4.0 |

Rules: exactly ${LENGTH} characters, Albanian alphabet only (a-z without w, plus ç and ë),
lowercase dictionary entry (not a proper noun), not offensive. Answers also need at least
${ANSWER_MIN_FREQ} subtitle occurrences and must not be function words or sensitive words.

## Totals

| List | Count |
| --- | --- |
| Valid guesses | ${guesses.length} |
| Answers (daily schedule) | ${schedule.length} (about ${Math.floor(schedule.length / 365)} years of daily puzzles) |
| Needs review | ${reviewOut.length} |

## Audit of the previous answer list (${legacy.length} words)

| Outcome | Count |
| --- | --- |
| Kept as answers | ${legacyAudit.kept.length} |
| Flagged to needs-review.json | ${legacyAudit.flagged.length} |
| Removed from answers | ${legacyAudit.removed.length} |

Kept (sample): ${sample(legacyAudit.kept, 20)}

Flagged (sample): ${sample(legacyAudit.flagged, 20)}

Removed (sample, with reason):

${legacyAudit.removed
  .slice(0, 25)
  .map((r) => `- \`${r.word}\`: ${r.reason}`)
  .join('\n')}

Full removed list: ${legacyAudit.removed.map((r) => r.word).join(', ')}

## New answer list

Sample: ${sample(schedule, 30)}

${droppedFromSchedule.length ? `Dropped from the existing schedule on this run: ${droppedFromSchedule.join(', ')}` : 'No words were dropped from the existing schedule on this run.'}

## Needs review (sample)

${reviewOut
  .slice(0, 20)
  .map((r) => `- \`${r.word}\` (${r.frequency}): ${r.reason}`)
  .join('\n')}
`;
writeFileSync(join(WORDS_DIR, 'REPORT.md'), report);

console.log(
  `guesses=${guesses.length} answers=${schedule.length} review=${reviewOut.length} | legacy kept=${legacyAudit.kept.length} flagged=${legacyAudit.flagged.length} removed=${legacyAudit.removed.length}`
);
