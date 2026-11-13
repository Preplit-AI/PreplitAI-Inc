// CampusGo tokens: one source for the system page, the CSS, and the app's theme file.

const c = (name, light, dark, usage) => ({ name, value: dark === undefined ? light : { light, dark }, usage });

export const tokens = {
  name: 'CampusGo',
  version: 1,
  color: {
    themes: [{ id: 'light', name: 'Day' }, { id: 'dark', name: 'Night' }],
    tokens: [
      c('ground', '#F5F8FF', '#0A1330', 'Page background. Day is a clear, pale sky; Night is deep navy.'),
      c('surface', '#FFFFFF', '#131F47', 'Cards, sheets and rows that sit on ground.'),
      c('surface-sunken', '#E8EEFB', '#060C22', 'Wells, pressed rows, the track behind a progress line.'),
      c('rule', '#D8E1F4', '#243263', 'Hairlines between rows. Decorative only, never the sole edge of a control.'),
      c('rule-strong', '#7685AC', '#6C7FBC', 'Borders of inputs and quiet buttons on ground and surface (3:1).'),

      c('ink', '#0B1A45', '#EEF2FF', 'Headings and body copy on ground, surface and surface-sunken.'),
      c('ink-soft', '#35456F', '#C2CCEA', 'Secondary copy on ground and surface.'),
      c('ink-muted', '#56658F', '#95A3CC', 'Captions, timestamps and sources on ground and surface.'),

      c('go', '#2B5FF5', '#2B5FF5', 'The brand blue: the app icon, the splash, the G in the logo, large brand fields. Same in both themes.'),
      c('on-go', '#FFFFFF', '#FFFFFF', 'Text and the logo on go.'),
      c('go-soft', '#E3EBFF', '#1A2960', 'A quiet blue ground: the selected tab, the tile behind Juno, a highlighted row.'),
      c('go-ink', '#1F4FD6', '#A3BBFF', 'Blue text and icons: links, the active tab, section labels. On ground, surface and go-soft.'),
      c('action', '#2B5FF5', '#7FA2FF', 'Fill of the primary button. One per screen.'),
      c('action-hover', '#1F4FD6', '#9DB8FF', 'Primary button fill on hover and press.'),
      c('on-action', '#FFFFFF', '#0A1330', 'Label on action and action-hover.'),

      c('navy', '#0B1A45', '#0B1A45', 'The brand navy: the cap in the logo, dark brand fields, the logo on light grounds. Same in both themes.'),
      c('navy-deep', '#060F2E', '#060F2E', 'The deepest navy, behind Juno at night.'),
      c('navy-raise', '#1B2A63', '#1B2A63', 'Shapes raised off navy.'),
      c('on-navy', '#F5F8FF', '#F5F8FF', 'Text and the logo on navy, navy-deep and navy-raise.'),

      c('lamp', '#F0A63A', '#F0A63A', "The tassel on the cap and Juno's eye. Marks the one thing that matters now: a single dot, chip or card per screen. Never a background for a whole screen."),
      c('lamp-soft', '#FCEBCB', '#3A2D14', 'Ground of the one card that matters now.'),
      c('lamp-ink', '#7D4A05', '#F6C672', 'Text and icons for the thing that matters now, on ground, surface and lamp-soft.'),
      c('on-lamp', '#0B1A45', '#0B1A45', 'Text and icons on a lamp fill.'),

      c('bark', '#8A7560', '#8A7560', "Juno's plumage. Illustration only, never UI."),
      c('bark-deep', '#55463A', '#55463A', "Juno's wing and rim. Illustration only."),
      c('down', '#EBE0CD', '#EBE0CD', "Juno's breast. Illustration only."),

      c('settled', '#0E6F60', '#78D6C5', 'A step that is done, with the word Done or a check. Text and icons on ground, surface and settled-soft.'),
      c('settled-soft', '#D9F0EA', '#12322E', 'Ground behind a done chip.'),
      c('clock', '#B0371A', '#FFA283', 'A legal deadline only, always with the word and the date. Text and icons on ground, surface and clock-soft.'),
      c('clock-soft', '#FBE4DC', '#3C1F17', 'Ground behind a legal-deadline chip.'),
      c('error', '#B0371A', '#FFA283', 'Something failed, always with words that say what happened. Text and icons on ground, surface and error-soft.'),
      c('error-soft', '#FBE4DC', '#3C1F17', 'Ground behind an error message.'),

      c('focus', '#0B1A45', '#F8CF8A', 'Focus ring: 2px solid, 2px offset, on every surface.'),
    ],
  },
  type: {
    fonts: [
      { family: 'Lexend', file: 'fonts/Lexend_400Regular.ttf', weight: '400', style: 'normal' },
      { family: 'Lexend', file: 'fonts/Lexend_500Medium.ttf', weight: '500', style: 'normal' },
      { family: 'Lexend', file: 'fonts/Lexend_600SemiBold.ttf', weight: '600', style: 'normal' },
      { family: 'Schibsted Grotesk', file: 'fonts/SchibstedGrotesk_400Regular.ttf', weight: '400', style: 'normal' },
      { family: 'Schibsted Grotesk', file: 'fonts/SchibstedGrotesk_500Medium.ttf', weight: '500', style: 'normal' },
      { family: 'Schibsted Grotesk', file: 'fonts/SchibstedGrotesk_600SemiBold.ttf', weight: '600', style: 'normal' },
      { family: 'Schibsted Grotesk', file: 'fonts/SchibstedGrotesk_700Bold.ttf', weight: '700', style: 'normal' },
    ],
    families: {
      display: '"Lexend", "Pretendard", "Apple SD Gothic Neo", "Noto Sans KR", system-ui, sans-serif',
      sans: '"Schibsted Grotesk", "Pretendard", "Apple SD Gothic Neo", "Noto Sans KR", system-ui, sans-serif',
    },
    groups: [
      {
        name: 'Display', family: 'display',
        styles: [
          { name: 'display-xl', fontSize: '52px', lineHeight: '58px', fontWeight: 600, letterSpacing: '-0.03em', sample: 'Tell it once.', usage: 'One line on a splash or a marketing hero.' },
          { name: 'display-lg', fontSize: '38px', lineHeight: '44px', fontWeight: 600, letterSpacing: '-0.025em', sample: 'Your arrival path', usage: 'Screen titles on tablet, section heads in print.' },
          { name: 'display-md', fontSize: '28px', lineHeight: '34px', fontWeight: 600, letterSpacing: '-0.02em', sample: 'What is next', usage: 'Screen titles on phone.' },
          { name: 'display-sm', fontSize: '20px', lineHeight: '26px', fontWeight: 600, letterSpacing: '-0.015em', sample: 'Residence registration', usage: 'Card titles.' },
          { name: 'voice', fontSize: '18px', lineHeight: '26px', fontWeight: 500, letterSpacing: '-0.01em', sample: 'I don’t know. The office decides.', usage: 'Juno speaking in the first person. Medium weight, never bold.' },
          { name: 'count', fontSize: '28px', lineHeight: '30px', fontWeight: 600, letterSpacing: '-0.01em', sample: 'D-21', usage: 'Day counts on a legal deadline. Tabular numerals.' },
        ],
      },
      {
        name: 'Text', family: 'sans',
        styles: [
          { name: 'title', fontSize: '17px', lineHeight: '24px', fontWeight: 600, sample: 'Open a bank account', usage: 'Row and list titles.' },
          { name: 'body-lg', fontSize: '17px', lineHeight: '26px', fontWeight: 400, sample: 'CampusGo holds your context once, so you never tell it twice.', usage: 'Reading copy, onboarding.' },
          { name: 'body', fontSize: '15px', lineHeight: '22px', fontWeight: 400, sample: 'Opens after residence registration.', usage: 'Default UI copy.' },
          { name: 'label', fontSize: '14px', lineHeight: '18px', fontWeight: 600, sample: 'Mark as done', usage: 'Buttons, chips, tabs.' },
          { name: 'caption', fontSize: '12.5px', lineHeight: '17px', fontWeight: 500, sample: 'Office of International Affairs · 2 h ago', usage: 'Sources and timestamps, in ink-muted.' },
          { name: 'overline', fontSize: '11.5px', lineHeight: '14px', fontWeight: 600, letterSpacing: '0.09em', sample: 'CAMPUS RADAR', usage: 'Section labels, uppercase, in go-ink or ink-muted.' },
        ],
      },
    ],
  },
  spacing: {
    tokens: [
      { name: 'space-1', value: '4px', usage: 'Icon to label inside a chip.' },
      { name: 'space-2', value: '8px', usage: 'Between a title and its caption.' },
      { name: 'space-3', value: '12px', usage: 'Between rows in a list.' },
      { name: 'space-4', value: '16px', usage: 'Card padding on phone; the side gutter.' },
      { name: 'space-5', value: '20px', usage: 'Card padding on tablet.' },
      { name: 'space-6', value: '24px', usage: 'Between cards.' },
      { name: 'space-8', value: '32px', usage: 'Between sections on a screen.' },
      { name: 'space-12', value: '48px', usage: 'Above a screen title.' },
      { name: 'space-16', value: '64px', usage: 'Clear space on a splash or a poster.' },
    ],
  },
  radius: {
    tokens: [
      { name: 'radius-sm', value: '10px', usage: 'Checkbox, small icon wells.' },
      { name: 'radius-md', value: '14px', usage: 'Buttons and inputs.' },
      { name: 'radius-lg', value: '20px', usage: 'Cards and rows.' },
      { name: 'radius-xl', value: '28px', usage: 'Sheets, the phone frame, large brand tiles.' },
      { name: 'radius-full', value: '999px', usage: 'Chips and the lamp dot.' },
    ],
  },
  shadow: {
    tokens: [
      { name: 'shadow-card', value: { light: '0 1px 2px rgba(11,26,69,0.04), 0 8px 24px rgba(43,95,245,0.08)', dark: '0 1px 2px rgba(0,0,0,0.35)' }, usage: 'A card on ground. Night relies on surface colour, not shadow.' },
      { name: 'shadow-float', value: { light: '0 2px 6px rgba(11,26,69,0.08), 0 20px 48px rgba(43,95,245,0.16)', dark: '0 2px 6px rgba(0,0,0,0.5), 0 18px 48px rgba(0,0,0,0.5)' }, usage: 'Sheets and the phone frame in mock-ups.' },
    ],
  },
};

/** tokens.css as the system page compiles it, for local previews and the repo copy. */
export function compileCss(t = tokens, fontPrefix = '') {
  const themes = t.color.themes.map((x) => x.id);
  const val = (tok, th) => (typeof tok.value === 'string' ? tok.value : tok.value[th] ?? tok.value[themes[0]]);
  let css = `/* CampusGo — generated from tokens.json */\n`;
  for (const f of t.type.fonts) css += `@font-face { font-family: "${f.family}"; src: url("${fontPrefix}${f.file}") format("truetype"); font-weight: ${f.weight}; font-style: ${f.style}; font-display: swap; }\n`;
  const themed = [...t.color.tokens, ...t.shadow.tokens];
  css += `:root, [data-theme="${themes[0]}"] {\n` + themed.map((k) => `  --${k.name}: ${val(k, themes[0])};`).join('\n') + '\n}\n';
  for (const th of themes.slice(1)) css += `[data-theme="${th}"] {\n` + themed.map((k) => `  --${k.name}: ${val(k, th)};`).join('\n') + '\n}\n';
  css += ':root {\n' + [...t.spacing.tokens, ...t.radius.tokens].map((k) => `  --${k.name}: ${k.value};`).join('\n') + '\n' +
    Object.entries(t.type.families).map(([k, v]) => `  --font-${k}: ${v};`).join('\n') + '\n}\n';
  for (const g of t.type.groups) for (const s of g.styles) {
    css += `.${s.name} { font-family: var(--font-${s.family || g.family}); font-size: ${s.fontSize}; line-height: ${s.lineHeight}; font-weight: ${s.fontWeight};` +
      (s.letterSpacing ? ` letter-spacing: ${s.letterSpacing};` : '') + (s.fontStyle ? ` font-style: ${s.fontStyle};` : '') + ' }\n';
  }
  return css;
}

/* ---- contrast ---- */
const lum = (hex) => {
  const v = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
  return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
};
export const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

export const PAIRS = [
  ['ink', 'ground', 4.5], ['ink', 'surface', 4.5], ['ink', 'surface-sunken', 4.5],
  ['ink-soft', 'ground', 4.5], ['ink-soft', 'surface', 4.5], ['ink-soft', 'surface-sunken', 4.5],
  ['ink-muted', 'ground', 4.5], ['ink-muted', 'surface', 4.5],
  ['on-action', 'action', 4.5], ['on-go', 'go', 4.5], ['go-ink', 'ground', 4.5], ['go-ink', 'surface', 4.5], ['go-ink', 'go-soft', 4.5], ['ink', 'go-soft', 4.5], ['on-action', 'action-hover', 4.5],
  ['on-lamp', 'lamp', 4.5], ['lamp-ink', 'ground', 4.5], ['lamp-ink', 'surface', 4.5], ['lamp-ink', 'lamp-soft', 4.5], ['ink', 'lamp-soft', 4.5],
  ['on-navy', 'navy', 4.5], ['on-navy', 'navy-deep', 4.5], ['on-navy', 'navy-raise', 4.5], ['lamp', 'navy', 3], ['lamp', 'navy-raise', 3], ['lamp', 'go', 0],
  ['settled', 'ground', 4.5], ['settled', 'surface', 4.5], ['settled', 'settled-soft', 4.5],
  ['clock', 'ground', 4.5], ['clock', 'surface', 4.5], ['clock', 'clock-soft', 4.5],
  ['error', 'ground', 4.5], ['error', 'surface', 4.5], ['error', 'error-soft', 4.5],
  ['rule-strong', 'ground', 3], ['rule-strong', 'surface', 3], ['focus', 'ground', 3], ['focus', 'surface', 3], ['focus', 'surface-sunken', 3],
  ['lamp', 'surface', 0], ['lamp', 'ground', 0],
];

export function checkContrast() {
  const by = Object.fromEntries(tokens.color.tokens.map((k) => [k.name, k.value]));
  const v = (name, th) => (typeof by[name] === 'string' ? by[name] : by[name][th]);
  const out = [];
  for (const th of ['light', 'dark']) for (const [fg, bg, min] of PAIRS) {
    const r = contrast(v(fg, th), v(bg, th));
    out.push({ th, fg, bg, ratio: Math.round(r * 100) / 100, min, ok: r >= min });
  }
  return out;
}

if (process.argv[1] && process.argv[1].endsWith('tokens.mjs')) {
  const rows = checkContrast();
  for (const r of rows) if (!r.ok || r.min === 0) console.log(r.ok ? 'info' : 'FAIL', r.th, r.fg, 'on', r.bg, r.ratio, 'needs', r.min);
  console.log(rows.filter((r) => !r.ok).length, 'failing of', rows.length);
}
