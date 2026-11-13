// CampusGo: the mark (a graduation cap on a G), the wordmark as outlines, and the lockups.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const opentype = require('opentype.js');
const here = path.dirname(fileURLToPath(import.meta.url));
const fonts = {};
const font = (w) => (fonts[w] ||= opentype.loadSync(path.join(here, 'node_modules/@expo-google-fonts/lexend', w, `Lexend_${w}.ttf`)));
const r2 = (v) => Math.round(v * 100) / 100;

export const BRAND = {
  go: '#2B5FF5', goDeep: '#1F4FD6', goLight: '#7AA0FF', goSoft: '#E3EBFF',
  navy: '#0B1A45', navyDeep: '#060F2E', navyRaise: '#1B2A63',
  paper: '#F5F8FF', white: '#FFFFFF', lamp: '#F0A63A',
};

/*
 * The mark, in a 96 box. A bold G with a mortarboard set on it at a slight tilt,
 * and a short tassel: the one warm note. `gap` is the ground colour, drawn as a
 * thin line where the cap crosses the G when both are the same ink.
 */
export function markInner({ cap, g, tassel, gap }) {
  const cx = 50, cy = 60.5, R = 21;
  const a = (-66 * Math.PI) / 180;
  const sx = r2(cx + R * Math.cos(a)), sy = r2(cy + R * Math.sin(a));
  const G = `<path d="M${sx} ${sy} A${R} ${R} 0 1 0 ${cx + R} ${cy} L${cx + 3} ${cy}" fill="none" stroke="${g}" stroke-width="13.5" stroke-linecap="butt" stroke-linejoin="round"/>`;
  const board = 'M50 9.5 L88 24.5 L50 39.5 L12 24.5 Z';
  const capShape = `<g transform="rotate(-7 50 26)">` +
    (gap ? `<path d="${board}" fill="${gap}" stroke="${gap}" stroke-width="8.5" stroke-linejoin="round"/>` : '') +
    `<path d="${board}" fill="${cap}" stroke="${cap}" stroke-width="3" stroke-linejoin="round"/>` +
    `<path d="M21 28.5 L21 43" fill="none" stroke="${tassel}" stroke-width="3" stroke-linecap="round"/>` +
    `<rect x="17.6" y="42" width="6.8" height="11" rx="3.2" fill="${tassel}"/>` +
    `</g>`;
  return G + capShape;
}

export const MARKS = {
  color: { cap: BRAND.navy, g: BRAND.go, tassel: BRAND.lamp, gap: BRAND.white },
  onGo: { cap: BRAND.white, g: BRAND.white, tassel: BRAND.lamp, gap: BRAND.go },
  onNavy: { cap: BRAND.white, g: BRAND.goLight, tassel: BRAND.lamp, gap: BRAND.navy },
  monoInk: { cap: BRAND.navy, g: BRAND.navy, tassel: BRAND.navy, gap: BRAND.white },
  monoWhite: { cap: BRAND.white, g: BRAND.white, tassel: BRAND.white, gap: BRAND.navy },
};

export function mark(variant = 'color', gap) {
  const v = { ...MARKS[variant], ...(gap ? { gap } : {}) };
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" role="img" aria-label="CampusGo">${markInner(v)}</svg>`;
}

/** Outlines for runs of text set one after another: [{ text, weight, fill }]. */
export function outline(runs, size = 100, tracking = -0.02) {
  let x = 0;
  const paths = [];
  let box = { x1: Infinity, y1: Infinity, x2: -Infinity, y2: -Infinity };
  for (const run of runs) {
    const f = font(run.weight);
    const p = f.getPath(run.text, x, 0, size, { kerning: true, letterSpacing: tracking });
    const b = p.getBoundingBox();
    box = { x1: Math.min(box.x1, b.x1), y1: Math.min(box.y1, b.y1), x2: Math.max(box.x2, b.x2), y2: Math.max(box.y2, b.y2) };
    paths.push(`<path d="${p.toPathData(2)}" fill="${run.fill}"/>`);
    x += f.getAdvanceWidth(run.text, size, { kerning: true, letterSpacing: tracking });
  }
  const f0 = font(runs[0].weight);
  const cap = (f0.tables.os2.sCapHeight / f0.unitsPerEm) * size;
  return { paths: paths.join(''), box, cap };
}

const word = (campus, go) => [{ text: 'Campus', weight: '600SemiBold', fill: campus }, { text: 'Go', weight: '600SemiBold', fill: go }];
export const WORDS = { ink: word(BRAND.navy, BRAND.go), paper: word(BRAND.white, BRAND.goLight), onGo: word(BRAND.white, BRAND.white) };

export function wordmark(variant = 'ink') {
  const o = outline(WORDS[variant]);
  const pad = 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${r2(o.box.x1 - pad)} ${r2(o.box.y1 - pad)} ${r2(o.box.x2 - o.box.x1 + pad * 2)} ${r2(o.box.y2 - o.box.y1 + pad * 2)}" role="img" aria-label="CampusGo">${o.paths}</svg>`;
}

const PAIR = { ink: 'color', paper: 'onNavy', onGo: 'onGo' };

/** Mark and wordmark side by side. */
export function lockup(variant = 'ink') {
  const o = outline(WORDS[variant]);
  const markSize = 156, s = markSize / 96, gap = 14;
  const baseline = markSize * 0.63 + o.cap * 0.5;
  const W = markSize + gap + (o.box.x2 - o.box.x1) + 2;
  const H = Math.max(markSize, baseline + o.box.y2 + 2);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${r2(W)} ${r2(H)}" role="img" aria-label="CampusGo">` +
    `<g transform="scale(${r2(s)})">${markInner(MARKS[PAIR[variant]])}</g>` +
    `<g transform="translate(${r2(markSize + gap - o.box.x1)} ${r2(baseline)})">${o.paths}</g></svg>`;
}

/** Mark above the wordmark, centred. */
export function stacked(variant = 'ink') {
  const o = outline(WORDS[variant], 62);
  const markSize = 150, s = markSize / 96, wordW = o.box.x2 - o.box.x1;
  const W = Math.max(markSize, wordW) + 4, baseline = markSize + 14 + o.cap;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${r2(W)} ${r2(baseline + o.box.y2 + 3)}" role="img" aria-label="CampusGo">` +
    `<g transform="translate(${r2((W - markSize) / 2)} 0) scale(${r2(s)})">${markInner(MARKS[PAIR[variant]])}</g>` +
    `<g transform="translate(${r2((W - wordW) / 2 - o.box.x1)} ${r2(baseline)})">${o.paths}</g></svg>`;
}

/** The app icon: a full square of the brand blue, the mark in white, the tassel lit. */
export function appIcon({ rounded = false, ground = BRAND.go, variant = 'onGo' } = {}) {
  const S = 1024, k = 6.9, off = (S - 96 * k) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S} ${S}" role="img" aria-label="CampusGo app icon">` +
    `<rect width="${S}" height="${S}" ${rounded ? 'rx="230"' : ''} fill="${ground}"/>` +
    `<g transform="translate(${r2(off - 13.8)} ${r2(off)}) scale(${k})">${markInner({ ...MARKS[variant], gap: ground })}</g></svg>`;
}
