/*
 * CampusOwl: the owl and the mark, drawn in one place.
 *
 * The bird is an Oriental scops owl (소쩍새): small, upright, short ear tufts
 * set at the corners of a flat crown, a soft facial disc with a dark outer rim,
 * pale brows, a streaked breast, yellow eyes.
 * It is never sad and never round-and-bright. Five stages, six moods.
 *
 * Every figure shares one viewBox (0 0 240 300) and one perch line (y = 264),
 * so stages can sit side by side on a common baseline.
 */

export const PALETTE = {
  night950: '#0B101C', night900: '#131A2B', night800: '#1C2640', night700: '#283556',
  night600: '#3A4A70', night500: '#56678F', night400: '#7E8DAE', night300: '#A9B4CC',
  night200: '#CDD4E2', night100: '#E5E9F1', night50: '#F2F4F8',
  paper: '#F5F4EF', paperDeep: '#ECEAE2', white: '#FFFFFF',
  lamp300: '#F8CF8A', lamp500: '#F0A63A', lamp600: '#D98A1C', lamp700: '#9A5A08',
};

const n = (v) => Math.round(v * 100) / 100;
const P = (x, y) => n(x) + ' ' + n(y);

export function mix(a, b, t) {
  const h = (s) => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16));
  const [x, y] = [h(a), h(b)];
  return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, '0')).join('').toUpperCase();
}

/** A closed shape that is the same on both sides of x = cx, from its right half. */
export function sym(start, segs, cx = 120) {
  const m = ([x, y]) => [2 * cx - x, y];
  let d = 'M' + P(...start);
  for (const [a, b, p] of segs) d += ' C' + P(...a) + ' ' + P(...b) + ' ' + P(...p);
  const pts = [start, ...segs.map((s) => s[2])];
  for (let i = segs.length - 1; i >= 0; i--) {
    const [a, b] = segs[i];
    d += ' C' + P(...m(b)) + ' ' + P(...m(a)) + ' ' + P(...m(pts[i]));
  }
  return d + ' Z';
}

/** A soft, slightly uneven outline, the way down looks. */
function downy(cx, cy, rx, ry, { bumps = 22, depth = 2.2, top = 1 } = {}) {
  const pts = [];
  for (let i = 0; i < bumps * 2; i++) {
    const a = (i / (bumps * 2)) * Math.PI * 2 - Math.PI / 2;
    const out = i % 2 === 0 ? depth : -depth * 0.6;
    const egg = 1 - 0.1 * top * (Math.sin(a) < 0 ? -Math.sin(a) : 0);
    pts.push([cx + Math.cos(a) * (rx * egg + out), cy + Math.sin(a) * (ry + out)]);
  }
  let d = '';
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    const q = pts[(i + 1) % pts.length];
    const last = pts[(i + pts.length - 1) % pts.length];
    if (i === 0) d += 'M' + P((last[0] + p[0]) / 2, (last[1] + p[1]) / 2);
    d += ' Q' + P(...p) + ' ' + P((p[0] + q[0]) / 2, (p[1] + q[1]) / 2);
  }
  return d + ' Z';
}

let uid = 0;

/* ---------- the face ---------- */

const MOODS = {
  attentive: { lid: 0.12, dx: 0, dy: 0, tilt: 0, pupil: 1 },
  resting: { closed: true, tilt: 0 },
  noticing: { lid: 0.02, dx: 0, dy: -0.4, tilt: 0, pupil: 1.12 },
  unsure: { lid: 0.12, dx: 4, dy: -1, tilt: 9, pupil: 1 },
  next: { lid: 0.18, dx: -3.2, dy: 3, tilt: -5, pupil: 1 },
  settled: { lid: 0.27, dx: 0, dy: 0.6, tilt: 0, pupil: 1 },
};
export const MOOD_NAMES = Object.keys(MOODS);

function eye(cx, cy, r, mood, c, id) {
  const ring = r + r * 0.12;
  if (mood.closed) {
    return `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(ring)}" fill="${c.lid}"/>` +
      `<path d="M${P(cx - r * 0.74, cy + r * 0.05)} Q${P(cx, cy + r * 0.66)} ${P(cx + r * 0.74, cy + r * 0.05)}" fill="none" stroke="${c.line}" stroke-width="${n(r * 0.16)}" stroke-linecap="round"/>`;
  }
  const top = cy - ring + ring * 2 * mood.lid;
  const ry = ring * 1.4;
  const rx = ring * 1.4;
  const pr = r * 0.55 * mood.pupil;
  const px = cx + (mood.dx * r) / 15.5;
  const py = cy + (mood.dy * r) / 15.5;
  return `<clipPath id="${id}"><ellipse cx="${n(cx)}" cy="${n(top + ry)}" rx="${n(rx)}" ry="${n(ry)}"/></clipPath>` +
    `<clipPath id="${id}c"><circle cx="${n(cx)}" cy="${n(cy)}" r="${n(ring)}"/></clipPath>` +
    `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(ring)}" fill="${c.lid}"/>` +
    `<g clip-path="url(#${id}c)"><g clip-path="url(#${id})">` +
    `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(ring)}" fill="${c.line}"/>` +
    `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}" fill="${c.iris}"/>` +
    `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r * 0.93)}" fill="none" stroke="${c.irisDeep}" stroke-width="${n(r * 0.14)}" opacity=".5"/>` +
    `<circle cx="${n(px)}" cy="${n(py)}" r="${n(pr)}" fill="${c.pupil}"/>` +
    `<circle cx="${n(px - pr * 0.4)}" cy="${n(py - pr * 0.48)}" r="${n(pr * 0.27)}" fill="#FFFDF6"/>` +
    `</g>` +
    `<ellipse cx="${n(cx)}" cy="${n(top + ry)}" rx="${n(rx)}" ry="${n(ry)}" fill="none" stroke="${c.line}" stroke-width="${n(r * 0.15)}"/></g>`;
}

function bill(cx, cy, s, c) {
  const x = (v) => n(cx + v * s);
  const y = (v) => n(cy + v * s);
  return `<path d="M${x(-6)} ${y(-6)} C${x(-3.6)} ${y(-9)} ${x(3.6)} ${y(-9)} ${x(6)} ${y(-6)} C${x(5.6)} ${y(3)} ${x(2.8)} ${y(9)} ${x(0)} ${y(13)} C${x(-2.8)} ${y(9)} ${x(-5.6)} ${y(3)} ${x(-6)} ${y(-6)} Z" fill="${c.bill}"/>` +
    `<path d="M${x(-2.4)} ${y(-5)} C${x(-1.2)} ${y(-6.4)} ${x(1.2)} ${y(-6.4)} ${x(2.4)} ${y(-5)}" fill="none" stroke="#FFFDF6" stroke-opacity=".3" stroke-width="${n(1.3 * s)}" stroke-linecap="round"/>`;
}

/** Discs, rim, brows, eyes and bill, around (cx, cy), at scale k. */
function face(cx, cy, k, mood, c, id, { rim = 1, brow = 1 } = {}) {
  const X = (v) => n(cx + v * k);
  const Y = (v) => n(cy + v * k);
  const disc = (s) => `<circle cx="${X(26 * s)}" cy="${Y(0)}" r="${n(33 * k)}" fill="${c.face}"/>`;
  // The rim shows on the outer side only, as on the real bird.
  const arc = (s) => `<path d="M${X(s * 38.5)} ${Y(-31.6)} A${n(34 * k)} ${n(34 * k)} 0 0 ${s > 0 ? 1 : 0} ${X(s * 13.5)} ${Y(31.6)}" fill="none" stroke="${c.rim}" stroke-width="${n(3.4 * k)}" stroke-linecap="round" opacity="${rim}"/>`;
  const browShape = (s) => `<path d="M${X(s * 6)} ${Y(-20)} C${X(s * 14)} ${Y(-32)} ${X(s * 27)} ${Y(-40)} ${X(s * 42)} ${Y(-43)} C${X(s * 30)} ${Y(-36)} ${X(s * 19)} ${Y(-29)} ${X(s * 10.5)} ${Y(-13.5)} C${X(s * 8.6)} ${Y(-11.6)} ${X(s * 4.6)} ${Y(-15)} ${X(s * 6)} ${Y(-20)} Z" fill="${c.brow}" opacity="${brow * 0.9}"/>`;
  return disc(-1) + disc(1) + arc(-1) + arc(1) + browShape(-1) + browShape(1) +
    eye(cx - 25 * k, cy, 15 * k, mood, c, id + 'l') + eye(cx + 25 * k, cy, 15 * k, mood, c, id + 'r') +
    bill(cx, cy + 13 * k, k, c);
}

/* ---------- perch, feet, leaves ---------- */

function feet(y, c, spread = 17) {
  let out = '';
  for (const fx of [120 - spread, 120 + spread]) {
    for (const o of [-6.2, 0, 6.2]) {
      out += `<rect x="${n(fx + o - 2.7)}" y="${n(y - 8.5)}" width="5.4" height="12.5" rx="2.7" fill="${c.feet}"/>`;
    }
  }
  return out;
}

// A ginkgo leaf: a fan on a stem, with the small notch at the top.
const GINKGO = 'M0 -8 C-6 -12 -16 -19 -20 -26 C-14.5 -32.5 -5.5 -34 -1.3 -31 L0 -28.4 L1.3 -31 C5.5 -34 14.5 -32.5 20 -26 C16 -19 6 -12 0 -8 Z';

function leaf(x, y, rot, scale, fill, stem) {
  return `<g transform="translate(${n(x)} ${n(y)}) rotate(${rot}) scale(${scale})"><path d="M0 3 L0 -9" stroke="${stem}" stroke-width="2" stroke-linecap="round"/><path d="${GINKGO}" fill="${fill}"/></g>`;
}

function perch(stage, c) {
  const twig = `<path d="M22 268 C74 263 150 269 220 263" fill="none" stroke="${c.branch}" stroke-width="8.5" stroke-linecap="round"/>`;
  const side = stage >= 2 ? `<path d="M184 265 C194 259 203 251 208 241" fill="none" stroke="${c.branch}" stroke-width="4.2" stroke-linecap="round"/>` : '';
  const leaves = [
    '',
    `<circle cx="209" cy="239" r="3.4" fill="${c.leafDeep}"/>`,
    leaf(208, 242, 26, 0.62, c.leaf, c.branch),
    leaf(208, 242, 26, 0.66, c.leaf, c.branch) + leaf(195, 258, -44, 0.52, c.leafDeep, c.branch),
    leaf(208, 242, 26, 0.7, c.leaf, c.branch) + leaf(195, 258, -44, 0.56, c.leafDeep, c.branch) + leaf(44, 265, -18, 0.56, c.leaf, c.branch),
  ][stage - 1];
  return twig + side + leaves;
}

/* ---------- the plumage, by stage ---------- */

const COAT = {
  1: { body: '#B4AA9E', bodyDeep: '#9F9487', chest: '#E4DDD2', face: '#D3CABE', rim: '#8C8072', wing: '#A1968A', streak: '#8D8173' },
  2: { body: '#A19282', bodyDeep: '#89796A', chest: '#E6DDCF', face: '#C9BCAB', rim: '#6F6052', wing: '#84746A', streak: '#6E5E50' },
  3: { body: '#927F6B', bodyDeep: '#7A6756', chest: '#E9DECC', face: '#C4B39E', rim: '#5A4B3F', wing: '#74614F', streak: '#58483B' },
  4: { body: '#8A7560', bodyDeep: '#705D4C', chest: '#EBE0CD', face: '#C0AE97', rim: '#514338', wing: '#6B5847', streak: '#4D3F34' },
  5: { body: '#846E58', bodyDeep: '#6A5746', chest: '#EDE2CE', face: '#BFAC94', rim: '#4C3F35', wing: '#655241', streak: '#463930' },
};
const SHARED = { bill: '#39322D', feet: '#CDBBA1', branch: '#5B4B3F', line: '#2A2420', iris: PALETTE.lamp500, irisDeep: PALETTE.lamp600, pupil: '#151A27', leaf: '#E7AE4A', leafDeep: '#CF9230' };

export const STAGES = [
  { n: 1, name: 'Owlet', ko: '아기 소쩍새', earns: 'Profile started, before you land' },
  { n: 2, name: 'Fledged', ko: '첫 날갯짓', earns: 'Arrival sequence complete: residence registration, bank, phone, housing' },
  { n: 3, name: 'Perched', ko: '자리 잡기', earns: 'First term registered, courses added, first month done' },
  { n: 4, name: 'Seasoned', ko: '한 학기', earns: 'First semester finished' },
  { n: 5, name: 'At home', ko: '제집처럼', earns: 'Second year. You know the place now' },
];

function streak(x, y, len, w, fill, opacity = 1) {
  return `<path d="M${P(x, y - len * 0.46)} C${P(x + w, y - len * 0.16)} ${P(x + w * 0.7, y + len * 0.36)} ${P(x, y + len * 0.54)} C${P(x - w * 0.7, y + len * 0.36)} ${P(x - w, y - len * 0.16)} ${P(x, y - len * 0.46)} Z" fill="${fill}" opacity="${opacity}"/>`;
}

function owlet(mood, c, id) {
  const cy = 204, rx = 50, ry = 58;
  const body = downy(120, cy, rx, ry, { bumps: 24, depth: 2.3 });
  const chest = downy(120, cy + 22, 31, 33, { bumps: 13, depth: 1.5, top: 0.3 });
  let ticks = '';
  [[cy + 20, 14], [cy + 36, 8]].forEach(([y, w], r) => {
    for (let x = -w; x <= w; x += r ? 16 : 14) ticks += streak(120 + x, y, 9, 1.7, c.streak, 0.42);
  });
  const wisps = `<path d="M112 ${cy - ry + 3} C113 ${cy - ry - 4} 116 ${cy - ry - 7} 118 ${cy - ry - 8} C118 ${cy - ry - 3} 119 ${cy - ry + 1} 121 ${cy - ry + 3} C123 ${cy - ry - 2} 125 ${cy - ry - 5} 128 ${cy - ry - 6} C127 ${cy - ry - 1} 128 ${cy - ry + 3} 129 ${cy - ry + 5} Z" fill="${c.body}"/>`;
  return `<path d="M110 252 L130 252 L128 270 Q120 274 112 270 Z" fill="${c.bodyDeep}"/>` + wisps +
    `<path d="${body}" fill="${c.body}"/><path d="${chest}" fill="${c.chest}"/>` + ticks +
    `<g transform="rotate(${mood.tilt * 0.7} 120 ${cy})">` + face(120, cy - 20, 0.7, mood, c, id, { rim: 0.6, brow: 0.75 }) + `</g>`;
}

function adult(stage, mood, c, id) {
  const t = { 2: 0.3, 3: 0.65, 4: 1, 5: 1 }[stage];
  const head = sym([120, 47], [
    [[134, 46.5], [148, 47], [158, 48]],
    [[166, 48.5], [178, 45 - 9 * t], [185 + 2 * t, 48 - 20 * t]],
    [[189, 50 - 4 * t], [188.5, 72], [187, 92]],
    [[185.5, 120], [172, 142], [150, 150]],
    [[140, 153], [128, 153], [120, 153]],
  ]);
  const body = sym([120, 118], [
    [[152, 118], [184, 134], [188, 168]],
    [[190, 204], [176, 240], [152, 254]],
    [[142, 260], [130, 262], [120, 262]],
  ]);
  const chest = sym([120, 140], [
    [[142, 140], [162, 152], [166, 176]],
    [[168, 206], [160, 240], [142, 254]],
    [[134, 258], [126, 259], [120, 259]],
  ]);
  // The soft shade the head throws on the breast.
  const shade = sym([120, 152], [
    [[136, 152], [152, 156], [160, 164]],
    [[150, 162], [134, 162], [120, 162]],
  ]);
  let streaks = '';
  const rows = stage === 2 ? [[182, 30], [206, 22]] : [[178, 36], [199, 34], [220, 27], [240, 16]];
  rows.forEach(([y, w], r) => {
    for (let x = -w + (r % 2 ? 7 : 0); x <= w + 0.1; x += 14) {
      const edge = 1 - Math.abs(x) / 60;
      streaks += streak(120 + x, y + (Math.abs(x) % 28 ? 0 : 1.5), 15 * (0.82 + edge * 0.24), 2.3, c.streak);
    }
  });
  const spots = stage >= 4
    ? [[167.5, 174], [167.5, 191], [166, 208], [163.5, 224]].map(([x, y], i) => `<ellipse cx="${x}" cy="${y}" rx="2.4" ry="${4.2 - i * 0.3}" fill="${c.chest}" opacity="${stage === 5 ? 0.95 : 0.7}"/>`).join('')
    : '';
  const wing = `<g id="${id}w"><path d="M185 146 C198 176 192 228 158 258 C164 232 166 198 165 166 C170 152 178 146 185 146 Z" fill="${c.wing}"/>` +
    `<path d="M179 170 C180 198 174 226 164 246" fill="none" stroke="${c.bodyDeep}" stroke-width="1.5" stroke-linecap="round" opacity=".75"/>` +
    `<path d="M186.5 166 C190 192 185 220 173 240" fill="none" stroke="${c.streak}" stroke-width="1.5" stroke-linecap="round" opacity=".4"/>` + spots + `</g>`;
  const crown = stage >= 3
    ? [[120, 60, 0], [108, 59, -8], [132, 59, 8], [96, 58, -16], [144, 58, 16]].map(([x, y, r]) => `<g transform="rotate(${r} ${x} ${y})">${streak(x, y, 7.5, 1.3, c.streak, stage === 3 ? 0.45 : 0.6)}</g>`).join('')
    : '';
  const headGroup = `<g transform="rotate(${mood.tilt} 120 146)">` +
    `<path d="${head}" fill="${c.body}" stroke="${c.body}" stroke-width="5" stroke-linejoin="round"/>` + crown +
    face(120, 100, 1, mood, c, id, { rim: stage === 2 ? 0.75 : 1, brow: stage === 2 ? 0.8 : 1 }) + `</g>`;
  return `<path d="M107 250 L133 250 L130 281 Q120 287 110 281 Z" fill="${c.bodyDeep}"/>` +
    `<path d="${body}" fill="${c.body}"/>` + wing + `<use href="#${id}w" transform="translate(240 0) scale(-1 1)"/>` +
    `<path d="${chest}" fill="${c.chest}"/><path d="${shade}" fill="${c.streak}" opacity=".16"/><g opacity="${stage === 2 ? 0.5 : stage === 3 ? 0.68 : 1}">${streaks}</g>` + headGroup;
}

const SCALE = { 1: 1, 2: 0.78, 3: 0.89, 4: 0.96, 5: 1 };

/** The inner drawing only, for embedding. */
export function owlInner({ stage = 4, mood, withPerch = true } = {}) {
  const id = 'o' + (++uid);
  const m = MOODS[mood || (stage === 5 ? 'settled' : 'attentive')];
  const coat = COAT[stage];
  const c = { ...SHARED, ...coat, lid: mix(coat.face, coat.chest, 0.35), brow: mix(coat.chest, coat.face, 0.12) };
  const s = SCALE[stage];
  const bird = stage === 1 ? owlet(m, c, id) : adult(stage, m, c, id);
  return (withPerch ? perch(stage, c) : '') +
    `<g transform="translate(${n(120 * (1 - s))} ${n(262 * (1 - s))}) scale(${s})">${bird}</g>` +
    (withPerch ? feet(263, c, stage === 1 ? 12 : 17 * s) : '');
}

export function owl(opts = {}) {
  const title = opts.title || 'Juno, the CampusGo owl';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 300" role="img" aria-label="${title}">${owlInner(opts)}</svg>`;
}

/* ---------- the mark ---------- */

/*
 * The grown bird's head, reduced: the flat crown with its short corner tufts,
 * the two discs, two lamp eyes with the lids resting a little, a small bill.
 * It is the same outline the owl wears, drawn in a 96 box.
 */
const MARK_HEAD = sym([120, 47], [
  [[134, 46.5], [148, 47], [158, 48]],
  [[166, 48.5], [178, 40], [187, 33]],
  [[189, 48], [188.5, 72], [187, 92]],
  [[185.5, 124], [166, 148], [136, 152.5]],
  [[130, 153.4], [125, 153.6], [120, 153.6]],
]);

export function markInner({ head, disc, eyes, pupil, bill: billFill, lid = 0.15 }) {
  const id = 'm' + (++uid);
  const one = (cx, k) => {
    const cy = 100, r = 20.5, top = cy - r + 2 * r * lid, ry = r * 1.3;
    return `<clipPath id="${id}${k}"><ellipse cx="${cx}" cy="${n(top + ry)}" rx="${n(r * 1.3)}" ry="${n(ry)}"/></clipPath>` +
      `<g clip-path="url(#${id}${k})"><circle cx="${cx}" cy="${cy}" r="${r}" fill="${eyes}"/><circle cx="${cx}" cy="${cy + 1}" r="9.6" fill="${pupil}"/></g>`;
  };
  const discs = disc ? `<circle cx="92" cy="100" r="37.5" fill="${disc}"/><circle cx="148" cy="100" r="37.5" fill="${disc}"/>` : '';
  return `<g transform="translate(48 -10.4) scale(0.655) translate(-120 0)">` +
    `<path d="${MARK_HEAD}" fill="${head}" stroke="${head}" stroke-width="6" stroke-linejoin="round"/>` + discs + one(93.5, 'l') + one(146.5, 'r') +
    `<path d="M112.6 117 C115.4 113.4 124.6 113.4 127.4 117 C126.6 127 123.4 134.6 120 140.5 C116.6 134.6 113.4 127 112.6 117 Z" fill="${billFill || eyes}"/></g>`;
}

export const MARKS = {
  night: { head: PALETTE.night900, disc: PALETTE.night700, eyes: PALETTE.lamp500, pupil: PALETTE.night950, bill: PALETTE.lamp300 },
  paper: { head: PALETTE.paper, disc: '#DDDAD0', eyes: PALETTE.lamp500, pupil: PALETTE.night900, bill: PALETTE.night900 },
  inkOne: { head: PALETTE.night900, eyes: PALETTE.paper, pupil: PALETTE.night900 },
  paperOne: { head: PALETTE.paper, eyes: PALETTE.night900, pupil: PALETTE.paper },
};

export const MARK_VIEWBOX = '0 0 96 96';

export function mark(variant = 'night') {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${MARK_VIEWBOX}" role="img" aria-label="CampusOwl">${markInner(MARKS[variant])}</svg>`;
}
