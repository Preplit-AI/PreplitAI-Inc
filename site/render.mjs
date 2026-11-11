/*
 * The public landing page, rendered from one template into two static files:
 * index.html (English, the first language, at /) and ko/index.html (Korean, at /ko/).
 * Run `npm run site` after changing this file or site/copy.mjs.
 *
 * Built on the taste-skill kit in public/kit (system.css, the motion layer, the
 * effect grounds). Page CSS lives in site/landing.css.
 */
import { copy } from "./copy.mjs";
import ART from "./juno-art.json" with { type: "json" };

/* Juno, the magpie, as the app draws him (src/brand/Juno.tsx), in every mood. Written by
   src/test/juno.test.tsx; inlined here so the page needs no extra requests. */
const junoFig = (mood = "idle", cls = "") =>
  `<svg class="juno-fig ${cls}" viewBox="${ART.figureViewBox}" aria-hidden="true" focusable="false">${ART.figure[mood]}</svg>`;
const junoFace = (mood = "idle", cls = "") =>
  `<span class="juno ${cls}" aria-hidden="true"><svg viewBox="${ART.avatarViewBox}" focusable="false">${ART.avatar[mood]}</svg></span>`;

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/* [불명확] / [unclear] is the product's own token: in visible text its brackets are drawn by CSS (.unc). */
const UNCLEAR = /\[(불명확|unclear)\]/g;
const withUnclearTokens = (html) =>
  html
    .split(/(<script[\s\S]*?<\/script>|<[^>]+>)/)
    .map((part) => (part.startsWith("<") ? part : part.replace(UNCLEAR, '<span class="unc">$1</span>')))
    .join("");

const I = {
  chev: '<svg class="i-chev" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 4.5l3 3 3-3"/></svg>',
  right: '<svg class="i-right" viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3.5 10.5 8 6 12.5"/></svg>',
  expand: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M9.5 3.5h3v3M12.5 3.5 9 7M6.5 12.5h-3v-3M3.5 12.5 7 9"/></svg>',
  menu: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 6h10M3 10h7"/></svg>',
  edit: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10.5 2.5l3 3L6 13H3v-3z"/></svg>',
  dots: '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="4" cy="8" r="1"/><circle cx="8" cy="8" r="1"/><circle cx="12" cy="8" r="1"/></svg>',
  search: '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="7" cy="7" r="4.5"/><path d="m10.5 10.5 3 3"/></svg>',
  check: '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.5"/><path d="m5.2 8.2 1.9 1.9 3.8-4"/></svg>',
  tick: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="m3.5 8.4 2.8 2.8 6.2-6.4"/></svg>',
  copy: '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="5" y="5" width="8" height="8" rx="1.5"/><path d="M3 10.5V3h7.5"/></svg>',
  thumb: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 7v6H3V7zM5 7l3-4.5c1 0 1.5.7 1.3 1.7L9 6.5h3.5c.8 0 1.4.8 1.2 1.6l-1 4c-.2.6-.7.9-1.3.9H5"/></svg>',
  share: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 10V2.5M5 5.5l3-3 3 3M3.5 9v4h9V9"/></svg>',
  plus: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 3v10M3 8h10"/></svg>',
  mic: '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="6" y="2" width="4" height="8" rx="2"/><path d="M3.5 8a4.5 4.5 0 0 0 9 0M8 12.5V14"/></svg>',
  wave: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 6v4M5.5 4v8M8 6.5v3M10.5 3.5v9M13 6v4"/></svg>',
  bell: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 11V7a4 4 0 0 1 8 0v4l1 1.5H3zM6.5 14h3"/></svg>',
  cal: '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="2.5" y="3.5" width="11" height="10" rx="2"/><path d="M2.5 6.5h11M5.5 2v3M10.5 2v3"/></svg>',
  lock: '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="3.5" y="7" width="9" height="6.5" rx="1.5"/><path d="M5.5 7V5.5a2.5 2.5 0 0 1 5 0V7"/></svg>',
  trash: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.7 9h5.6l.7-9"/></svg>',
  eye: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M1.5 8S4 3.5 8 3.5 14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8z"/><circle cx="8" cy="8" r="2"/></svg>',
  shield: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.8 13 3.6v4c0 3.2-2.2 5.5-5 6.6-2.8-1.1-5-3.4-5-6.6v-4z"/><path d="M8 5.5v3.5M8 11v.01"/></svg>',
  file: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2h5.5L12 4.5V14H4z"/><path d="M6 7.5h4M6 10h4"/></svg>',
  note: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 2.5h7l2 2v9h-9z"/><path d="M5.5 6h5M5.5 8.5h5M5.5 11h3"/></svg>',
  cards: '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="2.5" y="5" width="9" height="8.5" rx="1.5"/><path d="M5 3h7.5a1 1 0 0 1 1 1v7"/></svg>',
  flag: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 14V2.5M4 3h7.5l-1.5 2.5L11.5 8H4"/></svg>',
  audio: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 6.5v3h2.5L9 12.5v-9L5.5 6.5z"/><path d="M11.5 5.5a3.5 3.5 0 0 1 0 5"/></svg>',
  task: '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="2.5" y="2.5" width="11" height="11" rx="2"/><path d="m5.3 8.2 1.8 1.8 3.6-3.8"/></svg>',
  globe: '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6"/><path d="M2 8h12M8 2c1.7 1.7 2.5 3.7 2.5 6S9.7 12.3 8 14C6.3 12.3 5.5 10.3 5.5 8S6.3 3.7 8 2z"/></svg>',
  arrow: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 11 11 5M6 5h5v5"/></svg>',
  down: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 3v10M4 9l4 4 4-4"/></svg>',
  back: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3.5 5.5 8l4.5 4.5"/></svg>',
  close: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4 4 8 8M12 4l-8 8"/></svg>',
  clock: '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6"/><path d="M8 4.8V8l2.2 1.6"/></svg>',
  sparkle: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.8c.4 3.2 1.4 4.6 4.2 5.2-2.8.6-3.8 2-4.2 5.2-.4-3.2-1.4-4.6-4.2-5.2 2.8-.6 3.8-2 4.2-5.2zM12.6 10.6c.2 1.3.6 1.9 1.7 2.1-1.1.2-1.5.8-1.7 2.1-.2-1.3-.6-1.9-1.7-2.1 1.1-.2 1.5-.8 1.7-2.1z"/></svg>',
  msg: '<svg viewBox="0 0 16 16" aria-hidden="true"><path class="fill" d="M8 2.6c3.3 0 6 2.1 6 4.7S11.3 12 8 12c-.6 0-1.2-.1-1.8-.2L3.2 13.6l.8-2.5C2.8 10.2 2 8.8 2 7.3 2 4.7 4.7 2.6 8 2.6z"/></svg>',
};

const MARK = (cls = "", size = 24, white = false, lazy = true) =>
  `<img class="${cls}" src="/brand/${white ? "preplit-mark-white-256" : "preplit-mark-256"}.png" alt="" width="${size}" height="${Math.round(size * 1.37)}"${lazy ? ' loading="lazy"' : ""}>`;
/* Juno, the magpie: the app's avatar drawing (src/brand/Juno.tsx), saved as public/brand/juno.svg. */
const JUNO = (cls = "") => `<span class="juno ${cls}" aria-hidden="true"><img src="/brand/juno.svg" alt="" width="38" height="38"></span>`;

function phone(inner, cls = "") {
  return `<div class="phone ${cls}" aria-hidden="true"><div class="phone__screen">
          <div class="phone__status"><span>9:41</span><span class="phone__sig"><i></i><i></i><i></i><b>82</b></span></div>
          ${inner}
        </div></div>`;
}
function chatTop(title, actions = true) {
  return `<div class="phone__top"><span class="pbtn">${I.menu}</span><b>${esc(title)}</b>${actions ? `<span class="pbtn pbtn--pair">${I.edit}${I.dots}</span>` : `<span class="pbtn">${I.dots}</span>`}</div>`;
}

/* The document head, shared by the landing page and the pricing page. */
function pageHead(t, other, { title, description, path, koPath, enPath }) {
  return `<!doctype html>
<html lang="${t.lang}" data-type="software" data-radius="round" data-buttons="pill" data-ground="sky" data-motion>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="site-kind" content="software">
<meta name="page-type" content="software">
<meta name="theme-color" content="#ffffff">
<link rel="canonical" href="https://preplitai.com${path}">
<link rel="alternate" hreflang="ko" href="https://preplitai.com${koPath}">
<link rel="alternate" hreflang="en" href="https://preplitai.com${enPath}">
<link rel="alternate" hreflang="x-default" href="https://preplitai.com${enPath}">
<link rel="icon" href="/favicon.ico?v=3" sizes="48x48">
<link rel="icon" href="/favicon-32.png?v=3" type="image/png" sizes="32x32">
<link rel="apple-touch-icon" href="/apple-touch-icon.png?v=3">
<link rel="manifest" href="/site.webmanifest">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:type" content="website">
<meta property="og:url" content="https://preplitai.com${path}">
<meta property="og:image" content="https://preplitai.com/icon-512.png">
<meta property="og:locale" content="${t.ogLocale}">
<meta property="og:locale:alternate" content="${other.ogLocale}">
<meta name="twitter:card" content="summary">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:wght@400..700&family=IBM+Plex+Sans+KR:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/kit/system.css">
<link rel="stylesheet" href="/kit/ui/cards.css">
<link rel="stylesheet" href="/kit/motion/motion.css">
<link rel="stylesheet" href="/kit/backgrounds/backgrounds.css">
<link rel="stylesheet" href="/kit/layout/layout.css">
<link rel="stylesheet" href="/site/landing.css">
<script src="/kit/backgrounds/backgrounds.js"></script>
<script src="/js/lang.js"></script>
<script type="application/ld+json">
{"@context":"https://schema.org","@graph":[{"@type":"Organization","@id":"https://preplitai.com/#organization","name":"Preplit AI, Inc.","url":"https://preplitai.com","logo":"https://preplitai.com/icon-512.png","email":"info@preplitai.com"},{"@type":"WebSite","@id":"https://preplitai.com/#website","url":"https://preplitai.com","name":"Preplit AI","publisher":{"@id":"https://preplitai.com/#organization"},"inLanguage":["ko","en"]},{"@type":"SoftwareApplication","name":"Preplit AI","applicationCategory":"EducationalApplication","operatingSystem":"Web","description":${JSON.stringify(t.description)},"inLanguage":"${t.lang}","publisher":{"@id":"https://preplitai.com/#organization"}}]}
</script>
</head>`;
}

/* The header: one white bar floating over the page, the mark on the left, four words in capitals,
   the language, log in and the black Start button. On the pricing page the words lead back home. */
function siteHeader(t, other, page) {
  const home = page === "home";
  const base = home ? "" : t.path;
  const links = [
    [`${base}#features`, t.nav.product, false],
    [`${base}#juno`, t.nav.juno, false],
    [t.pricing.path, t.nav.pricing, !home],
    [`${base}#faq`, t.nav.faq, false],
  ];
  return `<header class="nav pv-nav">
  <div class="nav__bar">
    <a class="skip" href="#top">${esc(t.skip)}</a>
    <a class="nav__logo" href="${home ? "#top" : t.path}" aria-label="Preplit AI">${MARK("nav__mark", 26, false, false)}</a>
    <nav class="nav__links" aria-label="${t.lang === "ko" ? "주 메뉴" : "Main"}">
      ${links.map(([href, label, current]) => `<div class="nav__item"><a class="nav__link" href="${href}"${current ? ' aria-current="page"' : ""}>${esc(label)}</a></div>`).join("\n      ")}
    </nav>
    <div class="nav__actions">
      <a class="pv-lang" href="${home ? other.path : other.pricing.path}" hreflang="${other.lang}" lang="${other.lang}" aria-label="${esc(t.nav.switchLabel)}">${I.globe}<span>${esc(t.nav.switchText)}</span></a>
      <a class="nav__link pv-login" href="/login">${esc(t.nav.login)}</a>
      <a class="btn btn--primary pv-start" href="/signup">${esc(t.nav.start)}${I.arrow}</a>
    </div>
    <button class="nav__toggle" type="button" aria-expanded="false" aria-label="${esc(t.nav.menu)}">
      <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M2 5h14M2 13h14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
    </button>
  </div>
</header>`;
}

/* The black footer, shared too; its in-page links lead back to the landing page from elsewhere. */
function siteFooter(t, other, page) {
  const home = page === "home";
  const ft = t.footer;
  const fix = (href) => (href.startsWith("#") && !home ? `${t.path}${href}` : href);
  return `<footer class="pv-footer" id="contact" aria-label="Preplit AI">
  <div class="wrap">
    <div class="pv-footer__top">
      <div class="pv-footer__brand">
        <a href="${home ? "#top" : t.path}" class="pv-footer__logo">${MARK("", 26, true)}<span>Preplit AI</span></a>
        <p>${esc(t.hero.h1)}</p>
      </div>
      <div class="pv-footer__cols">
        ${ft.cols.map(([title, links]) => `<div><h4>${esc(title)}</h4><ul>${links.map(([href, label]) => `<li><a href="${fix(href)}">${esc(label)}</a></li>`).join("")}</ul></div>`).join("\n        ")}
      </div>
    </div>
    <div class="pv-footer__legal">${ft.legal.map((p) => `<p>${esc(p)}</p>`).join("")}</div>
    <div class="pv-footer__bottom">
      <span>${esc(ft.company)}<a href="/privacy">${esc(ft.privacy)}</a></span>
      <a href="${home ? other.path : other.pricing.path}" hreflang="${other.lang}" lang="${other.lang}">${t.lang === "ko" ? "English" : "한국어"}</a>
    </div>
  </div>
</footer>`;
}

/* The workspace isn't public yet: a link into it opens this note instead (public/js/early.js);
   sign-up and log-in work. The backend is unchanged; a developer passes once with ?dev=1 on any page. */
function earlyDialog(t) {
  const e = t.early;
  return `<dialog class="early" id="early" aria-labelledby="early-h" aria-describedby="early-p">
  <div class="early__card">
    <button class="early__x" type="button" data-early-close aria-label="${esc(e.close)}">${I.close}</button>
    <span class="early__mark" aria-hidden="true">${MARK("", 40, false, false)}<i class="early__dot"></i></span>
    <p class="early__badge">${I.sparkle}<span>${esc(e.badge)}</span></p>
    <h2 id="early-h">${esc(e.title)}</h2>
    <p class="early__feature" data-early-feature></p>
    <p class="early__body" id="early-p">${esc(e.body)}</p>
    <button class="early__ok" type="button" data-early-close autofocus>${esc(e.button)}</button>
  </div>
</dialog>
<script src="/js/early.js"></script>`;
}

const SCRIPTS = `<script type="module" src="/kit/system.js"></script>
<script type="module" src="/kit/motion/motion.js"></script>
<script type="module" src="/kit/layout/layout.js"></script>`;

export function render(lang) {
  const t = copy[lang];
  const other = lang === "ko" ? copy.en : copy.ko;
  const h = t.hero;

  const head = pageHead(t, other, { title: t.title, description: t.description, path: t.path, koPath: "/ko/", enPath: "/" });

  const plan = `<!-- Generated by site/render.mjs from site/copy.mjs: edit those, then run npm run site.
     type: software (page-type software, site-kind software)
     look: the client's reference (a white page, near-black grotesk, black pill buttons, phones in dark UI
           with white floating cards), in Preplit AI's own colours (black, maroon #A00020, gold #F8D000).
           The header is a white bar floating over the page. The hero stands on the client's autumn campus sky.
           Black grounds carry the white logo. Every phone and window is shown whole.
     story: the student companion that lowers cognitive load (site/copy.mjs): the six stages, Juno, a day with
           Juno, his text messages, the workspace he keeps, and the career his courses lead to.
     screens at 1440x900: hero 1 · stages 2 · juno 1 · how 1 · nudge 1 · workspace 1 · career 1 · safe 1 · course 1 · faq 1 · get 1;
     the footer runs to its own height -->`;

  const header = siteHeader(t, other, "home");

  /* the hero phone: Juno writing first, the morning of a class day */
  const hp = h.phone;
  const today = `<div class="day">
            <p class="day__label">${esc(hp.today)}</p>
            ${hp.rows.map(([when, what, meta], i) => `<p class="day__row"><em>${esc(when)}</em><span><b>${esc(what)}</b><small>${esc(meta)}</small></span><i class="day__ico">${[I.note, I.task, I.cards][i]}</i></p>`).join("")}
          </div>`;
  const hero = `<section class="hero hero--split pv-hero pv-hero--sky" aria-labelledby="hero-h">
    <div class="wrap"><div class="hero-text grid hero__grid">
      <div class="hero__text span-6">
        <h1 id="hero-h">${esc(h.h1)}</h1>
        <p class="hero__lead">${esc(h.lead)}</p>
        <div class="btn-row"><a class="btn btn--primary" href="/signup">${esc(t.cta)}</a><a class="btn btn--secondary" href="#how">${esc(h.second)}</a></div>
        <div class="rec-card" aria-hidden="true">
          <span class="rec-card__dot"></span>
          <span class="rec-card__text"><b>${esc(h.rec.label)}</b><span>${esc(h.rec.course)}</span></span>
          <span class="rec-card__timer">${esc(h.rec.timer)}</span>
          <span class="rec-card__stop">${esc(h.rec.stop)}</span>
        </div>
      </div>
      <div class="pv-hero__stage span-6 start-7" role="img" aria-label="${esc(h.alt)}">
        ${phone(`${chatTop(hp.title)}
          <div class="chat">
            <p class="chat__who">${JUNO("juno--xs")}Juno<em>${esc(hp.time)}</em></p>
            <p class="chat__bot">${esc(hp.brief)}</p>
            ${today}
            <p class="chat__me">${esc(hp.ask)}</p>
            <p class="chat__bot">${esc(hp.answer)}</p>
          </div>
          <div class="composer"><span class="composer__ph">${esc(hp.composer)}</span><span class="composer__row">${I.plus}<span class="composer__who">${JUNO("juno--xs")}Juno</span>${I.mic}<span class="composer__send">${I.wave}</span></span></div>`)}
        <div class="pv-hero__mini" aria-hidden="true">
          <p class="chat__who">${JUNO("juno--xs")}Juno<em>${esc(hp.time)}</em></p>
          <p class="chat__bot">${esc(hp.brief)}</p>
          ${today}
        </div>
        <div class="float float--review" aria-hidden="true">${JUNO("juno--md")}<span><b>${esc(h.floatGame.title)}</b><span>${esc(h.floatGame.body)}</span></span></div>
        <div class="float float--sem" aria-hidden="true"><span class="float__label">${MARK("", 12)}${esc(h.floatSemester.label)}</span><b>${esc(h.floatSemester.value)}<small> ${esc(h.floatSemester.of)}</small></b></div>
      </div>
    </div></div>
  </section>`;

  /* ---- the six stages, each with a piece of the product ---- */
  const f = t.features;
  const wave = (n) => Array.from({ length: n }, (_, i) => `<i style="--k: ${(0.2 + 0.7 * Math.abs(Math.sin(i * 1.3) * Math.cos(i * 0.45))).toFixed(2)}"></i>`).join("");
  const visuals = [
    `<div class="sv sv-setup">
            <p class="sv-bubble">${junoFace("idle", "juno--xs")}<span>${esc(f.setup.ask)}</span></p>
            <p class="sv-chips"><span>${I.task}${esc(f.setup.major)}</span><span>${I.flag}${esc(f.setup.goal)}</span></p>
            <ul class="sv-files">${f.setup.files.map((x) => `<li>${I.file}<span>${esc(x)}</span></li>`).join("")}</ul>
            <ul class="sv-times">${f.setup.times.map(([d, tm, c]) => `<li><b>${esc(d)}</b><em>${esc(tm)}</em><span>${esc(c)}</span></li>`).join("")}</ul>
          </div>`,
    `<div class="sv sv-before">
            <p class="sv-head"><span class="sv-code">OS</span><span><b>${esc(f.before.course)}</b><small>${esc(f.before.time)}</small></span></p>
            ${f.before.rows.map(([k, v], i) => `<p class="sv-row">${[I.file, I.flag, I.search][i]}<small>${esc(k)}</small><span>${esc(v)}</span></p>`).join("")}
          </div>`,
    `<div class="sv sv-during">
            <p class="sv-live"><i></i><span>${esc(f.during.status)}</span><em>${esc(f.during.timer)}</em></p>
            <div class="rec__wave">${wave(22)}</div>
            <p class="sv-to">${I.note}<span>${esc(f.during.to)}</span></p>
          </div>`,
    `<div class="sv sv-after">
            <p class="sv-path">${f.after.path.map((x) => `<span>${esc(x)}</span>`).join("<i>›</i>")}</p>
            <p class="sv-terms">${f.after.terms.map((x) => `<span>${esc(x)}</span>`).join("")}</p>
            <p class="sv-links">${f.after.links.map((x, i) => `<span>${[I.file, I.audio][i]}${esc(x)}</span>`).join("")}<span class="sv-q">${I.cards}${esc(f.after.questions)}</span></p>
          </div>`,
    `<div class="sv sv-study">
            ${f.study.rows.map(([d, x, m, st]) => `<p class="sv-plan${st ? ` sv-plan--${st}` : ""}"><b>${esc(d)}</b><span>${esc(x)}</span><em>${esc(m)}</em></p>`).join("")}
            <p class="sv-quiet">${I.bell}<span>${esc(f.study.quiet)}</span></p>
          </div>`,
    `<div class="sv sv-career">
            <p class="sv-terms">${f.career.skills.map((x) => `<span>${esc(x)}</span>`).join("")}</p>
            <p class="sv-proj">${I.task}<span>${esc(f.career.project)}</span></p>
            <p class="sv-proj sv-proj--path">${I.flag}<span>${esc(f.career.path)}</span></p>
          </div>`,
  ];
  const features = `<section class="section pv-stages" id="features" aria-labelledby="features-h">
    <div class="wrap">
      <div class="section-head pv-head"><p class="pv-eyebrow">${esc(f.label)}</p><h2 id="features-h">${esc(f.h2)}</h2><p>${esc(f.p)}</p></div>
      <ol class="st-cards">
        ${f.stages
          .map(
            (s, i) => `<li class="st-card st-card--${i}">
          <p class="st-card__k"><b>${esc(s.n)}</b><span>${esc(s.name)}</span></p>
          <h3>${esc(s.title)}</h3>
          <p class="st-card__text">${esc(s.text)}</p>
          <div class="st-card__vis" aria-hidden="true">${visuals[i]}</div>
        </li>`,
          )
          .join("\n        ")}
      </ol>
    </div>
  </section>`;

  /* ---- Meet Juno: who he is ---- */
  const jn = t.juno;
  const moodKeys = ["listen", "work", "found", "rest"];
  const traitIcons = [I.note, I.bell, I.file, I.lock];
  const juno = `<section class="section pv-juno" id="juno" aria-labelledby="juno-h">
    <div class="wrap grid pv-juno__grid">
      <div class="pv-juno__text span-6">
        <p class="pv-eyebrow">${esc(jn.label)}</p>
        <h2 id="juno-h">${esc(jn.h2)}</h2>
        <p class="pv-juno__lead">${esc(jn.p)}</p>
        <ul class="pv-traits">
          ${jn.traits.map(([n, d], i) => `<li><span class="pv-traits__ico">${traitIcons[i]}</span><b>${esc(n)}</b><span>${esc(d)}</span></li>`).join("\n          ")}
        </ul>
      </div>
      <div class="pv-juno__stage span-6 start-7" role="img" aria-label="${esc(jn.alt)}">
        <div class="pv-juno__sky">
          ${junoFig("idle", "pv-juno__bird")}
          ${jn.says.map(([b, s], i) => `<p class="say say--${i}">${i === 2 ? `<span class="say__flag">${I.flag}</span>` : junoFace(i === 0 ? "found" : "idle", "juno--xs")}<span><b>${esc(b)}</b><small>${esc(s)}</small></span></p>`).join("\n          ")}
          <ul class="moods">${moodKeys.map((m, i) => `<li>${junoFace(m, "juno--mood")}<span>${esc(jn.moods[i])}</span></li>`).join("")}</ul>
        </div>
      </div>
    </div>
  </section>`;

  /* ---- a day with Juno: before class, in class, after class, the evening game ---- */
  const hw = t.how;
  const bars = wave(26);
  const screens = [
    phone(`<div class="ph-brief">
            <div class="phone__top"><span class="pbtn">${I.menu}</span><b>${esc(hw.brief.title)}</b><span class="pbtn">${I.bell}</span></div>
            <p class="ph-brief__course"><span class="sv-code">OS</span><span><b>${esc(hw.brief.course)}</b><small>${esc(hw.brief.time)}</small></span></p>
            <p class="ph-brief__file">${I.file}<span><b>${esc(hw.brief.ready)}</b><small>${esc(hw.brief.readyMeta)}</small></span>${I.check}</p>
            <div class="ph-brief__box"><p class="ph-brief__k">${esc(hw.brief.open)}</p><p class="ph-brief__v">${esc(hw.brief.openText)}</p></div>
            <div class="ph-brief__box"><p class="ph-brief__k">${esc(hw.brief.ask)}</p>${hw.brief.questions.map((q, i) => `<p class="ph-brief__q"><b>${i + 1}</b><span>${esc(q)}</span></p>`).join("")}</div>
            <p class="ph-brief__foot">${junoFace("idle", "juno--xs")}<span>${esc(hw.brief.foot)}</span></p>
          </div>`, "phone--light"),
    phone(`<div class="ph-rec">
            <div class="phone__top"><span class="pbtn">${I.back}</span><b>${esc(hw.rec.course)}</b><span class="ph-live"><i></i>REC</span></div>
            <div class="ph-rec__bird">${junoFig("listen")}</div>
            <p class="ph-rec__status">${esc(hw.rec.status)}</p>
            <p class="ph-rec__timer">${esc(hw.rec.timer)}</p>
            <p class="ph-rec__course">${esc(hw.rec.course)} · ${esc(hw.rec.week)}</p>
            <div class="rec__wave">${bars}</div>
            <p class="ph-rec__line">${I.note}<span>${esc(hw.rec.note)}</span></p>
            <p class="ph-rec__line">${I.clock}<span>${esc(hw.rec.limit)}</span></p>
            <span class="rec__stop">${esc(hw.rec.stop)}</span>
          </div>`),
    phone(`<div class="ph-note">
            <div class="phone__top"><span class="pbtn">${I.back}</span><b>${esc(hw.note.course)}</b><span class="pbtn">${I.dots}</span></div>
            <p class="ph-note__ready">${junoFace("found", "juno--xs")}${esc(hw.note.ready)}</p>
            <p class="ph-note__meta">${esc(hw.note.path)}</p>
            <p class="ph-note__title">${esc(hw.note.title)}</p>
            <p class="ph-note__sum">${esc(hw.note.summary)}</p>
            <p class="ph-note__terms">${hw.note.terms.map((x) => `<span>${esc(x)}</span>`).join("")}</p>
            <div class="ph-note__hint"><span>${I.flag}${esc(hw.note.hint)}</span>${esc(hw.note.hintText)}</div>
            <p class="ph-note__links">${hw.note.links.map((x, i) => `<span>${[I.file, I.audio][i]}${esc(x)}</span>`).join("")}</p>
            <p class="ph-note__foot">${I.cards}<span>${esc(hw.note.foot)}</span></p>
          </div>`, "phone--light"),
    phone(`<div class="ph-game">
            <div class="phone__top"><span class="pbtn">${I.close}</span><b>${esc(hw.game.title)}</b><span class="ph-count">${esc(hw.game.count)}</span></div>
            <span class="ph-rev__bar" style="--v: .6"><i></i></span>
            <p class="ph-game__meta"><span>${esc(hw.game.from)}</span><em>${I.clock}${esc(hw.game.timer)}</em></p>
            <p class="ph-game__q">${esc(hw.game.q)}</p>
            <ul class="ph-game__opts">${hw.game.options.map((o, i) => `<li${i === hw.game.right ? ' class="is-right"' : ""}><b>${"ABCD"[i]}</b><span>${esc(o)}</span>${i === hw.game.right ? I.tick : ""}</li>`).join("")}</ul>
            <p class="ph-game__foot">${junoFace("happy", "juno--xs")}<span>${esc(hw.game.foot)}</span></p>
          </div>`, "phone--light"),
  ];
  const how = `<section class="section pv-how" id="how" aria-labelledby="how-h">
    <div class="wrap">
      <div class="section-head pv-head"><p class="pv-eyebrow">${esc(hw.label)}</p><h2 id="how-h">${esc(hw.h2)}</h2><p>${esc(hw.p)}</p></div>
      <ol class="pv-steps">
        ${hw.steps.map(([when, title], i) => `<li class="pv-step"><p class="pv-step__k"><b>0${i + 1}</b><span>${esc(when)}</span></p><p class="pv-step__t">${esc(title)}</p><div class="pv-step__phone">${screens[i]}</div></li>`).join("\n        ")}
      </ol>
    </div>
  </section>`;

  /* ---- Juno's text messages on the lock screen ---- */
  const nd = t.nudge;
  const nudge = `<section class="section pv-nudge" id="nudge" aria-labelledby="nudge-h">
    <div class="wrap grid pv-split">
      <div class="pv-nudge__stage span-5" aria-hidden="true">
        ${phone(`<div class="lock">
            <p class="lock__date">${esc(nd.lock.date)}</p>
            <p class="lock__time">${esc(nd.lock.time)}</p>
            <div class="lock__notes">${nd.lock.notes.map(([title, body, when]) => `<div class="lock__note"><span class="lock__app lock__app--msg">${I.msg}</span><div class="lock__txt"><p class="lock__head"><b>${esc(nd.lock.app)}</b><em>${esc(when)}</em></p><p class="lock__title">${esc(title)}</p><p class="lock__body">${esc(body)}</p></div></div>`).join("")}</div>
            <span class="lock__home"></span>
          </div>`, "phone--lock")}
        ${junoFig("found", "pv-nudge__bird")}
      </div>
      <div class="pv-nudge__text span-6 start-7">
        <p class="pv-eyebrow">${esc(nd.label)}</p>
        <h2 id="nudge-h">${esc(nd.h2)}</h2>
        <p class="pv-nudge__lead">${esc(nd.p)}</p>
        <ul class="pv-list">
          ${nd.items.map(([n, d], i) => `<li><span class="pv-list__ico">${[I.cal, I.note, I.flag][i]}</span><span><b>${esc(n)}</b><span>${esc(d)}</span></span></li>`).join("\n          ")}
        </ul>
        <p class="pv-nudge__app">${esc(nd.app)}</p>
        <div class="btn-row"><a class="btn btn--primary" href="/signup">${esc(nd.cta)}</a></div>
      </div>
    </div>
  </section>`;

  /* ---- the workspace Juno keeps: the week planned, the weak topics, the next class's material ---- */
  const w = t.workspace;
  const navIcons = [I.cal, I.file, I.note, I.cards, I.task];
  const dots = ["#7fa3d6", "#e2b100", "#86b38c", "#e7a86e"];
  const workspace = `<section class="section pv-sem pv-ws" id="workspace" aria-labelledby="ws-h">
    <div class="wrap">
      <div class="pv-rowhead">
        <div><p class="pv-eyebrow">${esc(w.label)}</p><h2 id="ws-h">${esc(w.h2)}</h2><p>${esc(w.p)}</p></div>
        <a class="btn btn--primary" href="/signup">${esc(t.cta)}</a>
      </div>
      <div class="pv-sem__stage fill">
        <div class="appwin" role="img" aria-label="${esc(w.alt)}">
          <div class="appwin__bar"><span class="browser__dots"><i></i><i></i><i></i></span><span class="browser__url">${I.lock}${esc(w.url)}</span></div>
          <div class="appwin__body">
            <div class="aw-side">
              <p class="aw-logo">${MARK("", 16, false)}<b>Preplit AI</b></p>
              <p class="aw-rec"><i></i>${esc(w.record)}</p>
              <ul class="aw-navs">${w.nav.map((label, i) => `<li class="aw-nav${i === 0 ? " is-on" : ""}">${navIcons[i]}<span>${esc(label)}</span>${i ? `<em>0${i}</em>` : ""}</li>`).join("")}</ul>
              <p class="aw-label">${esc(w.coursesLabel)}</p>
              <ul class="aw-courses">${w.courses.map((c, i) => `<li><i style="background:${dots[i]}"></i>${esc(c)}</li>`).join("")}</ul>
            </div>
            <div class="aw-main">
              <p class="aw-eyebrow"><b>${esc(w.page.eyebrow)}</b><i></i>${esc(w.page.sub)}</p>
              <div class="aw-head"><p class="aw-title">${esc(w.page.title)}</p></div>
              <p class="aw-juno">${JUNO("juno--sm")}<span><b>${esc(w.juno.say)}</b><small>${esc(w.juno.sub)}</small></span></p>
              <div class="ws-cols">
                <div class="ws-box ws-plan">
                  <p class="ws-label">${esc(w.plan.label)}</p>
                  ${w.plan.rows.map(([d, task, meta, mins, st]) => `<p class="ws-task ws-task--${st || "later"}"><b>${esc(d)}</b><span class="ws-check">${st === "done" ? I.tick : ""}</span><span><strong>${esc(task)}</strong><small>${esc(meta)}</small></span><em>${esc(mins)}</em></p>`).join("")}
                </div>
                <div class="ws-side">
                  <div class="ws-box">
                    <p class="ws-label">${esc(w.weak.label)}</p>
                    ${w.weak.rows.map(([topic, course, detail, lvl]) => `<p class="ws-topic"><span><strong>${esc(topic)}</strong><small>${esc(course)} · ${esc(detail)}</small></span><span class="ws-lvl ws-lvl--${lvl}"><i></i><i></i><i></i></span></p>`).join("")}
                  </div>
                  <div class="ws-box">
                    <p class="ws-label">${esc(w.files.label)}</p>
                    ${w.files.rows.map(([n, m], i) => `<p class="ws-file">${[I.file, I.note][i]}<span><strong>${esc(n)}</strong><small>${esc(m)}</small></span></p>`).join("")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>`;

  /* ---- across semesters: skills, a project, internship paths ---- */
  const cr = t.career;
  const career = `<section class="section ground-inverse pv-black pv-career" id="career" aria-labelledby="career-h">
    <div class="wrap grid pv-pair">
      <div class="pv-pair__text span-5">
        <p class="pv-eyebrow">${esc(cr.label)}</p>
        <h2 id="career-h">${esc(cr.h2)}</h2>
        <p class="pv-pair__lead">${esc(cr.p)}</p>
        <ul class="cr-items">
          ${cr.items.map(([n, d], i) => `<li><span class="cr-items__ico">${[I.cards, I.task, I.flag][i]}</span><span><b>${esc(n)}</b><span>${esc(d)}</span></span></li>`).join("\n          ")}
        </ul>
      </div>
      <div class="cr-stage span-6 start-7" aria-hidden="true">
        <div class="cr-card cr-skills">${cr.courses.map(([c, sk]) => `<div class="cr-course"><p class="cr-course__name">${esc(c)}</p><p class="cr-chips">${sk.map((x) => `<span>${esc(x)}</span>`).join("")}</p></div>`).join("")}</div>
        <div class="cr-card cr-project">
          <p class="cr-k">${junoFace("found", "juno--xs")}${esc(cr.project.label)}</p>
          <p class="cr-title">${esc(cr.project.title)}</p>
          <p class="cr-why">${esc(cr.project.why)}</p>
          <p class="cr-meta">${esc(cr.project.meta)}</p>
        </div>
        <div class="cr-card cr-paths">
          <p class="cr-k">${esc(cr.paths.label)}</p>
          ${cr.paths.rows.map(([r, fit]) => `<p class="cr-path"><span><b>${esc(r)}</b><small>${esc(fit)}</small></span>${I.right}</p>`).join("")}
        </div>
        <p class="cr-port">${MARK("", 12, true)}<span>${esc(cr.portfolio)}</span></p>
      </div>
    </div>
  </section>`;

  const sf = t.safe;
  const safeIcons = [I.trash, I.eye, I.shield];
  const safe = `<section class="section pv-safe" id="safe" aria-labelledby="safe-h">
    <div class="wrap">
      <div class="grid grid--top pv-split">
        <div class="pv-safe__visual span-5" aria-hidden="true">
          <div class="perm-panel">
            <div class="perm-panel__head"><span><b>${esc(sf.panel.title)}</b><small>${esc(sf.panel.sub)}</small></span><span class="perm-panel__badge"><i></i>${esc(sf.panel.badge)}</span></div>
            <p class="perm-panel__group">${esc(sf.panel.groupA)}</p>
            <div class="perm-panel__box">
              <p class="prow">${JUNO("juno--sm")}<span><b>${esc(sf.panel.rows[0][0])}</b><small>${esc(sf.panel.rows[0][1])}</small></span><span class="sw on"></span></p>
            </div>
            <p class="perm-panel__group">${esc(sf.panel.groupB)}</p>
            <div class="perm-panel__box">
              ${sf.panel.rows
                .slice(1)
                .map(([n, d, st]) => `<p class="prow"><span class="prow__ico">${st === "lock" ? I.lock : I.shield}</span><span><b>${esc(n)}</b><small>${esc(d)}</small></span>${st === "lock" ? `<span class="prow__lock">${I.lock}</span>` : `<span class="sw"></span>`}</p>`)
                .join("")}
            </div>
          </div>
        </div>
        <div class="pv-safe__text span-6 start-7">
          <h2 id="safe-h">${esc(sf.h2)}</h2>
          <p class="pv-safe__lead">${esc(sf.p)}</p>
          <ul class="pv-list">
            ${sf.items.map(([n, d], i) => `<li><span class="pv-list__ico">${safeIcons[i]}</span><span><b>${esc(n)}</b><span>${esc(d)}</span></span></li>`).join("\n            ")}
          </ul>
        </div>
      </div>
    </div>
  </section>`;

  const c = t.course;
  const pct = (v) => Number.parseInt(v, 10);
  const course = `<section class="section pv-course" id="course" aria-labelledby="course-h">
    <div class="wrap">
      <div class="pv-rowhead">
        <div><h2 id="course-h">${esc(c.h2)}</h2><p>${esc(c.p)}</p></div>
        <a class="btn btn--primary" href="mailto:info@preplitai.com?subject=Course%20pilot">${esc(c.cta)}</a>
      </div>
      <div class="grid fill pv-course__cards">
        <article class="ccard span-4">
          <p class="ccard__k">${I.note}${esc(c.get.title)}</p>
          <p class="ccard__lead">${esc(c.get.lead)}</p>
          <div class="ccard__note" aria-hidden="true">
            <p class="ccard__meta">${esc(c.get.note.meta)}</p>
            <p class="ccard__title">${esc(c.get.note.title)}</p>
            <p class="ccard__text">${esc(c.get.note.text)}</p>
            <p class="ccard__hint"><span>${I.flag}${esc(c.get.note.hint)}</span>${esc(c.get.note.hintText)}</p>
            <p class="ccard__foot">${JUNO("juno--xs")}${esc(c.get.note.foot)}</p>
          </div>
          <ul class="ccard__list">${c.get.rows.map(([n, d], i) => `<li><span class="ccard__ico">${[I.note, I.cards, JUNO("juno--xs")][i]}</span><b>${esc(n)}</b><span>${esc(d)}</span></li>`).join("")}</ul>
        </article>
        <article class="ccard span-4">
          <p class="ccard__k">${I.cal}${esc(c.plan.title)}</p>
          <p class="ccard__lead">${esc(c.plan.lead)}</p>
          <ol class="ccard__steps">${c.plan.rows.map(([w, n, d]) => `<li><em>${esc(w)}</em><b>${esc(n)}</b><span>${esc(d)}</span></li>`).join("")}</ol>
          <p class="ccard__facts">${c.plan.facts.map((f) => `<span>${esc(f)}</span>`).join("")}</p>
        </article>
        <article class="ccard span-4">
          <p class="ccard__k">${I.flag}${esc(c.measure.title)}</p>
          <p class="ccard__lead">${esc(c.measure.lead)}</p>
          <ul class="ccard__targets">${c.measure.rows
            .map(([d, v]) => {
              const share = v.includes("%") ? pct(v) : null;
              return `<li><b>${esc(v)}</b><span>${esc(d)}</span>${share !== null ? `<i class="ccard__bar" style="--v:${share}" aria-hidden="true"><i></i></i>` : `<i class="ccard__pips" aria-hidden="true">${"<i></i>".repeat(pct(v) || 0)}</i>`}</li>`;
            })
            .join("")}</ul>
        </article>
      </div>
    </div>
  </section>`;

  const q = t.faq;
  const faq = `<section class="section pv-faq" id="faq" aria-labelledby="faq-h">
    <div class="wrap">
      <div class="grid grid--top">
        <div class="span-4 pv-faq__head">
          <h2 id="faq-h">${esc(q.h2)}</h2>
          <p>${esc(q.p)} <a class="link" href="mailto:info@preplitai.com">${esc(q.email)}</a></p>
        </div>
        <div class="span-7 start-6 pv-faq__list">
          ${q.items.map(([qq, aa], i) => `<details${i === 0 ? " open" : ""}><summary><span>${esc(qq)}</span><i aria-hidden="true">${I.plus}</i></summary><p>${esc(aa)}</p></details>`).join("\n          ")}
        </div>
      </div>
    </div>
  </section>`;

  const g = t.get;
  const gp = g.phone;
  const get = `<section class="section ground-inverse pv-black pv-get g2m" id="get" aria-labelledby="get-h">
    <div class="wrap grid pv-pair">
        <div class="pv-pair__text span-6">
          ${MARK("pv-get__mark", 56, true)}
          <h2 id="get-h">${esc(g.h2)}</h2>
          <p class="pv-pair__lead">${esc(g.p)}</p>
          <div class="btn-row"><a class="btn btn--primary" href="/signup">${esc(t.cta)}</a><a class="btn btn--secondary" href="/login">${esc(g.login)}</a></div>
          <ul class="pv-get__facts">${g.facts.map((f) => `<li>${I.tick}${esc(f)}</li>`).join("")}</ul>
        </div>
        <div class="pv-pair__stage span-5 start-8" aria-hidden="true">
          ${phone(`<div class="home">
          <div class="home__top">${MARK("", 18, true)}<span class="pbtn">${I.bell}</span></div>
          <p class="home__label">${esc(gp.label)}</p>
          <p class="home__big">${esc(gp.week)} <small>${esc(gp.of)}</small></p>
          <div class="home__row">${JUNO("juno--sm")}<span><b>${esc(gp.review)}</b><small>${esc(gp.reviewMeta)}</small></span>${I.right}</div>
          <p class="home__sub"><span>${esc(gp.recent)}</span><small>${esc(gp.all)}</small></p>
          ${gp.rows.map(([cn, l, n]) => `<div class="home__row home__row--lec"><span class="home__course">${esc((t.ask.courses.find(([, name]) => name === cn) || [cn.slice(0, 2)])[0])}</span><span><b>${esc(cn)}</b><small>${esc(l)}</small></span><em>${esc(n)}</em></div>`).join("")}
        </div>`)}
        </div>
    </div>
  </section>`;

  const footer = siteFooter(t, other, "home");

  return withUnclearTokens(`${head}
<body>
${plan}
${header}

<main id="top">
  ${hero}

  ${features}

  ${juno}

  ${how}

  ${nudge}

  ${workspace}

  ${career}

  ${safe}

  ${course}

  ${faq}

  ${get}
</main>

${footer}

${earlyDialog(t)}
${SCRIPTS}
</body>
</html>
`);
}

/* ---------------------------------------------------------------- the pricing page
   The client's own pricing page, rebuilt as it was: a large headline beside a line drawing, the
   monthly / semester switch, two plans (a white card and an orange one), then the questions. The
   switch is two radio buttons and CSS (:has), so the page still runs no script of its own. */
const DOODLE = `<svg class="pp-doodle" viewBox="0 0 380 270" aria-hidden="true" focusable="false">
  <g class="pp-spots">
    <rect x="44" y="12" width="84" height="56" rx="12" fill="#84dcc6" opacity=".85"/>
    <circle cx="300" cy="92" r="56" fill="#f28482" opacity=".8"/>
    <circle cx="308" cy="182" r="72" fill="#f4a261" opacity=".85"/>
  </g>
  <g class="pp-lines" fill="none" stroke="#111111" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <rect x="72" y="26" width="92" height="42" rx="4" fill="#ffffff" fill-opacity=".85"/>
    <path d="M87 47 Q117 37 147 47"/>
    <path d="M72 57 L60 64 L72 64" fill="#ffffff"/>
    <rect x="44" y="80" width="106" height="48" rx="4" fill="#ffffff" fill-opacity=".92"/>
    <path d="M60 102 Q92 94 122 106"/>
    <path d="M44 114 L34 122 L44 122" fill="#ffffff"/>
    <circle cx="272" cy="146" r="70" fill="#ffffff" fill-opacity=".35"/>
    <path d="M232 91 C262 116 282 176 272 211"/>
    <path d="M272 76 C302 106 322 156 312 206"/>
    <path d="M212 126 Q252 146 332 116"/>
    <path d="M217 166 Q272 181 327 156"/>
    <path d="M297 81 Q337 111 342 146"/>
    <ellipse cx="148" cy="190" rx="35" ry="12" transform="rotate(-25 148 190)"/>
    <circle cx="148" cy="190" r="14" fill="#ffffff"/>
  </g>
  <g fill="#111111"><circle cx="123" cy="175" r="2"/><circle cx="168" cy="158" r="2.5"/><circle cx="282" cy="61" r="2"/></g>
</svg>`;

export function renderPricing(lang) {
  const t = copy[lang];
  const other = lang === "ko" ? copy.en : copy.ko;
  const pr = t.pricing;
  const head = pageHead(t, other, {
    title: pr.title,
    description: pr.description,
    path: pr.path,
    koPath: copy.ko.pricing.path,
    enPath: copy.en.pricing.path,
  });
  const plans = pr.plans
    .map(
      (p) => `<article class="pp-plan pp-plan--${p.id}" aria-labelledby="pp-${p.id}">
          <div class="pp-plan__head"><h2 id="pp-${p.id}">${esc(p.name)}</h2><p>${esc(p.sub)}</p></div>
          <div class="pp-card">
            <p class="pp-price"><b class="pp-price__m">${esc(p.monthly)}</b><b class="pp-price__s">${esc(p.semester)}</b><span>${esc(p.per)}</span></p>
            <p class="pp-metric">${esc(p.metric)}</p>
            <ul class="pp-feat">${p.features.map((f) => `<li><i aria-hidden="true">${I.tick}</i><span>${esc(f)}</span></li>`).join("")}</ul>
            <a class="pp-cta" href="${p.href}"><span>${esc(p.cta)}</span>${I.arrow}</a>
          </div>
        </article>`,
    )
    .join("\n        ");

  return withUnclearTokens(`${head}
<body class="pp-body">
<!-- Generated by site/render.mjs (renderPricing) from site/copy.mjs: edit those, then run npm run site. -->
${siteHeader(t, other, "pricing")}

<main id="top" class="pp">
  <section class="pp-sec pp-hero" aria-labelledby="pp-h">
    <div class="wrap pp-hero__grid">
      <div class="pp-hero__text">
        <h1 id="pp-h">${esc(pr.h1[0])}<br>${esc(pr.h1[1])}</h1>
        <p class="pp-hero__p">${esc(pr.p)}</p>
        <fieldset class="pp-bill">
          <legend class="pp-sr">${esc(pr.billing.label)}</legend>
          <input type="radio" name="bill" id="bill-m" value="monthly" checked>
          <label for="bill-m">${esc(pr.billing.monthly)}</label>
          <input type="radio" name="bill" id="bill-s" value="semester">
          <label for="bill-s">${esc(pr.billing.semester)}<span class="pp-off">${esc(pr.billing.off)}</span></label>
        </fieldset>
      </div>
      <div class="pp-art" aria-hidden="true">${DOODLE}</div>
    </div>
  </section>

  <section class="pp-sec pp-plans" id="plans" aria-label="${esc(t.nav.pricing)}">
    <div class="wrap">
      <div class="pp-cards">
        ${plans}
      </div>
      <p class="pp-faqlink"><a href="#faq">${esc(pr.faqLink)}${I.down}</a></p>
    </div>
  </section>

  <section class="pp-sec pp-faq" id="faq" aria-labelledby="pp-faq-h">
    <div class="wrap pp-faq__wrap">
      <h2 id="pp-faq-h">${esc(pr.faqH2)}</h2>
      <p class="pp-faq__p">${esc(pr.faqP)}</p>
      <div class="pp-faq__list">
        ${pr.faq.map(([q, ans]) => `<details><summary><span>${esc(q)}</span>${I.chev}</summary><p>${esc(ans)}</p></details>`).join("\n        ")}
      </div>
    </div>
  </section>
</main>

${siteFooter(t, other, "pricing")}

${earlyDialog(t)}
${SCRIPTS}
</body>
</html>
`);
}
