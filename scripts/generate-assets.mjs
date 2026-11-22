#!/usr/bin/env node
/**
 * Generate the app icons, favicon and Open Graph image into public/.
 *   npm run assets
 * Text is converted to vector paths with the brand fonts, so the PNGs look the
 * same on every machine. Re-run after changing colours or the name.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import opentype from 'opentype.js';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pub = join(root, 'public');
mkdirSync(join(pub, 'icons'), { recursive: true });

const font = (pkg, file) => {
  const buf = readFileSync(join(root, 'node_modules', '@fontsource', pkg, 'files', file));
  return opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
};
const display = font('bricolage-grotesque', 'bricolage-grotesque-latin-700-normal.woff');
const text = font('atkinson-hyperlegible', 'atkinson-hyperlegible-latin-400-normal.woff');

const C = {
  paper: '#f5efe4',
  ink: '#1f1a15',
  soft: '#5f564c',
  brand: '#b3262f',
  correct: '#2d7656',
  present: '#d39b18',
  absent: '#776e63',
  line: '#d9cfbf',
};

/** Lay out glyphs by hand (advance + kerning) to avoid unsupported GSUB lookups. */
function textPath(f, str, x, y, size) {
  const scale = size / f.unitsPerEm;
  const glyphs = [...str.normalize('NFC')].map((ch) => f.charToGlyph(ch));
  const path = new opentype.Path();
  let pen = x;
  glyphs.forEach((g, i) => {
    path.extend(g.getPath(pen, y, size));
    pen += g.advanceWidth * scale;
    if (glyphs[i + 1]) pen += f.getKerningValue(g, glyphs[i + 1]) * scale;
  });
  return path;
}

/** Path for `str` with its bounding box centred on (cx, cy). */
function centered(f, str, cx, cy, size, fill) {
  const b = textPath(f, str, 0, 0, size).getBoundingBox();
  const moved = textPath(f, str, cx - (b.x1 + b.x2) / 2, cy - (b.y1 + b.y2) / 2, size);
  return `<path d="${moved.toPathData(2)}" fill="${fill}"/>`;
}

function iconSvg(size, { maskable = false } = {}) {
  const r = maskable ? 0 : size * 0.22;
  const glyph = maskable ? size * 0.5 : size * 0.72;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
<rect width="${size}" height="${size}" rx="${r}" fill="${C.brand}"/>
${centered(display, 'ë', size / 2, size * 0.5, glyph, '#ffffff')}
</svg>`;
}

const png = (svg, out) => sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(join(pub, out));

await png(iconSvg(192), 'icons/icon-192.png');
await png(iconSvg(512), 'icons/icon-512.png');
await png(iconSvg(512, { maskable: true }), 'icons/icon-maskable-512.png');
await png(iconSvg(180, { maskable: true }), 'icons/apple-touch-icon.png');
await png(iconSvg(32), 'icons/favicon-32.png');
writeFileSync(join(pub, 'favicon.svg'), iconSvg(64));

// Open Graph image, 1200x630.
const W = 1200;
const H = 630;
const tiles = [
  ['f', C.correct],
  ['j', C.absent],
  ['a', C.present],
  ['l', C.correct],
  ['ë', C.correct],
];
const T = 132;
const gap = 16;
const startX = (W - (tiles.length * T + (tiles.length - 1) * gap)) / 2;
const tileY = 110;
const tileSvg = tiles
  .map(([ch, color], i) => {
    const x = startX + i * (T + gap);
    return `<rect x="${x}" y="${tileY}" width="${T}" height="${T}" rx="14" fill="${color}"/>
${centered(display, ch.toLocaleUpperCase('sq'), x + T / 2, tileY + T / 2, T * 0.56, color === C.present ? C.ink : '#ffffff')}`;
  })
  .join('\n');
const og = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<rect width="${W}" height="${H}" fill="${C.paper}"/>
<rect x="0" y="${H - 14}" width="${W}" height="14" fill="${C.brand}"/>
${tileSvg}
${centered(display, 'Fjalëza', W / 2, 382, 112, C.ink)}
${centered(text, 'Loja ditore e fjalëve shqipe', W / 2, 470, 44, C.soft)}
${centered(text, '5 shkronja, 6 përpjekje, një fjalë e re çdo ditë', W / 2, 532, 30, C.soft)}
</svg>`;
await png(og, 'og-image.png');
console.log('Generated icons, favicon and og-image.png in public/');
