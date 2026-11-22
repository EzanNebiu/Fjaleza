# Fjalëza

A daily Albanian word game: guess the 5-letter word in 6 tries. It's a static site with no backend, it works offline after the first visit, and it's free to host on Netlify or Cloudflare Pages.

Made by [Ezan Nebija](https://ezannebija.dev/).

## Run it

Requires Node.js 22 or later.

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # unit tests (evaluation, daily word, storage, share, word lists)
npm run lint
npm run build      # production build in dist/
npm run preview    # serve dist/ on http://localhost:4173
```

`dev`, `build` and `test` first run `scripts/compile-words.mjs`, which validates the word lists and generates `src/data/generated/`. That folder is git-ignored, so don't edit it by hand.

## Game rules

- A word is exactly **5 characters**. `Ë` and `Ç` are single letters, distinct from `E` and `C`. Digraphs such as `SH`, `GJ` and `DH` take two tiles, one per character.
- The daily word changes at **local midnight**. Everyone on the same calendar date gets the same word.
- Puzzle #1 is 22 November 2026 (`EPOCH` in `src/game/constants.ts`). Don't change it once the game is live.
- Practice mode picks random answers and doesn't count toward statistics.
- Hard mode: green letters must stay in place and yellow letters must be reused. It locks after the first guess of the day.

## Word lists

| File | What it is |
| --- | --- |
| `words/answers.txt` | Daily answer schedule. Line N is puzzle N; the list wraps around after the last line. |
| `words/guesses.txt` | Every accepted guess. |
| `words/needs-review.json` | Words kept out of the answers until a person checks them. |
| `words/review-decisions.json` | Your decisions: `approve` promotes a word to the answers, `reject` keeps it out (with a reason). |
| `words/REPORT.md` | Latest audit report. |

The lists are built from two open sources, which `scripts/build-word-lists.mjs` downloads into `scripts/.cache/`:

- **Hunspell sq_AL** by Luan Kelmendi (LibreOffice dictionaries, GPL-2.0-or-later): is the word real, correctly spelled, and not a proper noun?
- **FrequencyWords sq 2018** by Hermit Dave (OpenSubtitles, CC-BY-SA-4.0): is the word common in everyday speech?

An answer must be in the dictionary, appear at least 100 times in the frequency list, and not be a function word, a sensitive word or an offensive word (`scripts/lib/exclusions.mjs`). A guess only needs to be a 5-character dictionary form.

### Updating the list

1. Edit `words/review-decisions.json`: add words to `approve`, or add `"word": "reason"` to `reject`.
2. Run `npm run words:build`. This rebuilds the lists and `REPORT.md`. Existing answers keep their positions, new answers go at the end, and removed answers are reported.
3. Run `npm test` and commit the `words/` changes.

Removing an answer that's already scheduled shifts every later puzzle by one day. Prefer rejecting words before they go live.

Licensing note: `guesses.txt` is derived from the GPL-licensed Hunspell dictionary. Keep it under a GPL-compatible license and keep the attribution on the About page.

## Ads, consent and analytics

Everything is configured in `src/config/monetization.ts`. Nothing third-party loads unless it's enabled there **and** the visitor consents.

### Switching on Google AdSense

1. Deploy the site and apply at <https://adsense.google.com>. AdSense reviews the live site, including the About and Privacy pages.
2. Paste your publisher ID into `ads.publisherId` (for example `ca-pub-1234567890123456`).
3. Create one display ad unit per placement and paste each slot ID:
   - `banner` 320×50, under the header on phones and tablets (only on screens at least 700px tall)
   - `endOfGame` 300×250, in the results dialog after the game is over
   - `sidebar` 160×600, right-hand column on screens 1200px and wider
4. Set `ads.enabled: true`, then rebuild and deploy. `ads.txt` and the Content-Security-Policy are generated from this config automatically.

Ads never cover the board or keyboard, never appear during guessing on top of play, and there are no pop-ups, interstitials or autoplay video. Each slot reserves its exact size, so there's no layout shift.

**EU/UK traffic:** Google requires a Google-certified consent management platform (CMP) that supports IAB TCF v2.2 to serve ads to visitors in the EEA, the UK and Switzerland. The built-in banner gates every script correctly, but it isn't TCF-certified. Before you rely on ad revenue from Europe, turn on Google's own CMP (AdSense, then Privacy & messaging, then European regulations message) or use another certified CMP, and replace or complement `src/components/ConsentBanner.tsx`.

### Analytics

Set `analytics.provider` to `goatcounter`, `cloudflare` or `plausible` and fill in its code, token or domain. All three are cookieless. The script loads only after analytics consent.

### Ad-free upgrade (optional, not functional)

`adFree` in the config and `src/monetization/adFree.ts` hold the structure for a one-time "remove ads" purchase. There's no payment logic; see the comments in that file before enabling it.

## Deploy

### Netlify

1. Create a site from this repository. `netlify.toml` already sets the build command (`npm run build`), the publish folder (`dist`) and Node 22.
2. Netlify passes its site address to the build as `URL`, which becomes the canonical URL, the Open Graph URLs, the sitemap and the share link. If you use a custom domain, set `SITE_URL` (for example `https://fjaleza.al`) under Site configuration, then Environment variables.
3. Security headers (CSP, HSTS, X-Frame-Options and others) and caching rules come from the generated `dist/_headers`.

### Cloudflare Pages

Build command `npm run build`, output directory `dist`, and set the environment variable `SITE_URL` to your production address. Cloudflare Pages reads the same `_headers` file and serves `404.html` for unknown paths.

## Project layout

```
scripts/            word list build and validation, icon and OG image generation
words/              word lists, review file and report
src/game/           pure game logic with tests (evaluate, daily, storage, share, words)
src/hooks/          React state: game, settings, keyboard input, toasts
src/components/     UI: board, keyboard, dialogs, consent banner, ad slot
src/monetization/   consent store, AdSense and analytics loaders, ad-free scaffold
src/config/         monetization.ts, the one file to edit for ads and analytics
rreth/, privatesia/ About and Privacy pages
public/             manifest, icons, OG image, theme script, 404 page
```

To regenerate the icons and the Open Graph image after a design change, run `npm run assets`.

## License

MIT for the code. The word lists are derived from the sources above and keep their licenses.
