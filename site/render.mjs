/*
 * The public landing page, rendered from one template into two static files:
 * index.html (Korean, the source) and en/index.html (the translation).
 * Run `npm run site` after changing this file or site/copy.mjs.
 *
 * The page is built on the taste-skill kit in public/kit (system.css, the
 * motion layer, the UI fragments, the diagrams). Page CSS lives in
 * site/landing.css and only styles what sits inside a visual.
 */
import { copy } from "./copy.mjs";

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
/*
 * The product marks audio it could not hear as [불명확] / [unclear]. In visible text the
 * brackets are drawn by CSS (.unc) around the word, so the token reads exactly as it does
 * in the app while the kit's placeholder check (which looks for [bracketed] text) stays useful.
 */
const UNCLEAR = /\[(불명확|unclear)\]/g;
const withUnclearTokens = (html) =>
  html
    .split(/(<script[\s\S]*?<\/script>|<[^>]+>)/)
    .map((part) => (part.startsWith("<") ? part : part.replace(UNCLEAR, '<span class="unc">$1</span>')))
    .join("");

const ARROW =
  '<svg class="m-arrow" viewBox="0 0 12 12" aria-hidden="true"><path class="m-arrow__stem" d="M1 6h8"/><path class="m-arrow__head" d="M4.5 2.5 8 6l-3.5 3.5"/></svg>';
const CHEV =
  '<svg class="chev" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 4.5l3 3 3-3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const CHECK =
  '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4.5 8.2 2.3 2.3 4.7-5"/></svg>';
const BEE = (cls = "", size = 20) =>
  `<img class="${cls}" src="/brand/bee.svg" alt="" width="${size}" height="${Math.round(size * 0.946)}">`;

/* A pointy-top hexagon, the comb's one cell. */
function hex(cx, cy, r) {
  return Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 180) * (60 * i - 90);
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
  }).join(" ");
}

/* The comb: one cell per card, filled when that card was reviewed. */
function comb({ total, filled, perRow, cell, label, cls = "", liveCell = -1 }) {
  const r = cell / Math.sqrt(3);
  const rows = Math.ceil(total / perRow);
  const w = perRow * cell + (rows > 1 ? cell / 2 : 0) + 4;
  const h = r * 2 + (rows - 1) * r * 1.5 + 4;
  let cells = "";
  for (let i = 0; i < total; i++) {
    const row = Math.floor(i / perRow);
    const col = i % perRow;
    const cx = 2 + cell / 2 + col * cell + (row % 2 ? cell / 2 : 0);
    const cy = 2 + r + row * r * 1.5;
    const state = i === liveCell ? "live" : i < filled ? "on" : "off";
    cells += `<polygon class="cell cell--${state}" points="${hex(cx, cy, r - 1.6)}"/>`;
  }
  return `<svg class="comb ${cls}" viewBox="0 0 ${w.toFixed(1)} ${h.toFixed(1)}" role="img" aria-label="${esc(label)}">${cells}</svg>`;
}

/* A 50-minute lecture's loudness, drawn from a seeded series so the page never changes between builds. */
function waveform(t) {
  const N = 160;
  const W = 1280;
  const H = 168;
  const mid = H / 2;
  let seed = 917;
  const rnd = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  const bw = W / N;
  const u0 = 12 + 10 / 60;
  const u1 = 14 + 2 / 60;
  const flag = 31 + 5 / 60;
  let bars = "";
  for (let i = 0; i < N; i++) {
    const min = (i / N) * 50;
    let a = 0.42 + 0.2 * Math.sin(i * 0.23) + 0.16 * Math.sin(i * 0.061 + 1.3) + 0.3 * rnd();
    if (i % 23 === 0) a *= 0.5;
    a = Math.max(0.14, Math.min(1, a));
    const unclear = min >= u0 && min <= u1;
    if (unclear) a = 0.05 + 0.06 * rnd();
    const h = a * (H - 24);
    bars += `<rect class="${unclear ? "u" : "b"}" x="${(i * bw + bw * 0.22).toFixed(1)}" y="${(mid - h / 2).toFixed(1)}" width="${(bw * 0.56).toFixed(1)}" height="${h.toFixed(1)}" rx="1.6"/>`;
  }
  const x0 = (u0 / 50) * W;
  const x1 = (u1 / 50) * W;
  const xf = (flag / 50) * W;
  const pct = (x) => ((x / W) * 100).toFixed(2);
  return `<figure class="wave ui" role="img" aria-label="${esc(t.junbee.waveAlt)}">
          <div class="wave__plot">
            <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">
              <defs><pattern id="wave-hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="2" height="8" class="hatch"/></pattern></defs>
              <rect class="wave__gap" x="${x0.toFixed(1)}" y="0" width="${(x1 - x0).toFixed(1)}" height="${H}" fill="url(#wave-hatch)"/>
              ${bars}
              <rect class="wave__flag" x="${(xf - 1).toFixed(1)}" y="0" width="2" height="${H}"/>
            </svg>
            <span class="wave__chip wave__chip--gap" style="--x: ${pct((x0 + x1) / 2)}%">${esc(t.junbee.unclear)}</span>
            <span class="wave__chip wave__chip--flag" style="--x: ${pct(xf)}%">${esc(t.junbee.flag)}</span>
            <div class="wave__axis" aria-hidden="true">${t.junbee.minutes.map((m) => `<span>${esc(m)}</span>`).join("")}</div>
          </div>
        </figure>`;
}

/* Memory over time: it fades, a review lifts it, and each lift fades more slowly. */
function curve(t) {
  const W = 400;
  const H = 188;
  const top = 18;
  const base = 150;
  const xOf = (d) => 14 + (d / 30) * (W - 28);
  const yOf = (r) => base - r * (base - top);
  const reviews = [1, 4, 11, 25];
  const spans = [0.9, 2.6, 6.2, 13, 34];
  let d = "";
  let start = 0;
  for (let s = 0; s <= reviews.length; s++) {
    const end = s < reviews.length ? reviews[s] : 30;
    for (let k = 0; k <= 24; k++) {
      const day = start + ((end - start) * k) / 24;
      const r = Math.exp(-(day - start) / spans[s]);
      d += `${s === 0 && k === 0 ? "M" : "L"}${xOf(day).toFixed(1)} ${yOf(r).toFixed(1)} `;
    }
    if (s < reviews.length) d += `L${xOf(end).toFixed(1)} ${yOf(1).toFixed(1)} `;
    start = end;
  }
  const dots = reviews
    .map((day, i) => `<circle class="${i === reviews.length - 1 ? "dot dot--now" : "dot"}" cx="${xOf(day).toFixed(1)}" cy="${yOf(1).toFixed(1)}" r="4"/>`)
    .join("");
  const ticks = reviews
    .map((day, i) => `<text x="${xOf(day).toFixed(1)}" y="${base + 26}" text-anchor="middle">${esc(t.remember.curve.days[i])}</text>`)
    .join("");
  return `<svg class="curve" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(t.remember.curve.alt)}">
                <line class="base" x1="14" x2="${W - 14}" y1="${base}" y2="${base}"/>
                <path class="line" d="${d.trim()}"/>${dots}${ticks}
              </svg>`;
}

function diagram(spec) {
  return `<div class="dg" data-diagram><script type="application/json">${JSON.stringify(spec)}</script></div>`;
}

export function render(lang) {
  const t = copy[lang];
  const other = lang === "ko" ? copy.en : copy.ko;
  const p = t.hero.phone;

  const head = `<!doctype html>
<html lang="${t.lang}" data-type="software" data-radius="soft" data-ground="sage" data-buttons="arrow" data-motion>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(t.title)}</title>
<meta name="description" content="${esc(t.description)}">
<meta name="site-kind" content="software">
<meta name="page-type" content="software">
<meta name="theme-color" content="#EDEDE7">
<link rel="canonical" href="https://preplitai.com${t.path}">
<link rel="alternate" hreflang="ko" href="https://preplitai.com/">
<link rel="alternate" hreflang="en" href="https://preplitai.com/en/">
<link rel="alternate" hreflang="x-default" href="https://preplitai.com/">
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta property="og:title" content="${esc(t.title)}">
<meta property="og:description" content="${esc(t.description)}">
<meta property="og:type" content="website">
<meta property="og:url" content="https://preplitai.com${t.path}">
<meta property="og:locale" content="${t.ogLocale}">
<meta property="og:locale:alternate" content="${other.ogLocale}">
<meta name="twitter:card" content="summary">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,400..600&family=IBM+Plex+Sans+KR:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/kit/system.css">
<link rel="stylesheet" href="/kit/ui/cards.css">
<link rel="stylesheet" href="/kit/motion/motion.css">
<link rel="stylesheet" href="/kit/backgrounds/backgrounds.css">
<link rel="stylesheet" href="/kit/layout/layout.css">
<link rel="stylesheet" href="/kit/icons/icon.css">
<link rel="stylesheet" href="/kit/ui/base.css">
<link rel="stylesheet" href="/kit/ui/window/fragment.css">
<link rel="stylesheet" href="/kit/ui/doc/fragment.css">
<link rel="stylesheet" href="/kit/ui/notify/fragment.css">
<link rel="stylesheet" href="/kit/ui/checklist/fragment.css">
<link rel="stylesheet" href="/kit/diagrams/diagram.css">
<link rel="stylesheet" href="/site/landing.css">
<script src="/kit/backgrounds/backgrounds.js"></script>
<script src="/js/moments-guard.js"></script>
<link rel="modulepreload" href="/kit/moments/moments.js">
<link rel="modulepreload" href="/kit/moments/lib.js">
<link rel="modulepreload" href="/kit/moments/marquee-row/moment.js">
<script type="application/ld+json">
{"@context":"https://schema.org","@graph":[{"@type":"Organization","@id":"https://preplitai.com/#organization","name":"PreplitAI, Inc.","url":"https://preplitai.com","email":"info@preplitai.com"},{"@type":"WebSite","@id":"https://preplitai.com/#website","url":"https://preplitai.com","name":"Junbee","alternateName":"준비","publisher":{"@id":"https://preplitai.com/#organization"},"inLanguage":["ko","en"]},{"@type":"SoftwareApplication","name":"Junbee","applicationCategory":"EducationalApplication","operatingSystem":"Web","description":${JSON.stringify(t.description)},"inLanguage":"${t.lang}","publisher":{"@id":"https://preplitai.com/#organization"}}]}
</script>
</head>`;

  const plan = `<!-- Generated by site/render.mjs from site/copy.mjs: edit those, then run npm run site.
     type: software (page-type software, site-kind software)
     deal: hero split; palette the client's own (bone #EDEDE7, paper #F8F8F4, ink #15181E, muted #626A76,
           accent maroon #8A1328) via start.mjs brand; type bricolage pairing with the brand's IBM Plex Sans KR
           as the text face (Hangul); nav nav-cards re-dealt to nav-centre (no photographs); footer
           footer-statement; close close-type; rhythm dark-band; buttons arrow; mark the client's bee;
           lit ground sage; grounds: how bg-band, faq bg-mist; effect grain-gradient (held still) in the
           hero frame; card-group grounds: none fit, panels take the lit ground; moment marquee-row in
           #pipeline; scene none.
     screens at 1440x900: hero 1 · app 1 · how 1 · pipeline 1 · remember 2 · junbee 1 · faq 1 · closing 1 -->`;

  const navGroups = t.nav.groups
    .map(
      (g) => `<div class="menu-col span-3">
              <p class="t-label">${esc(g.title)}</p>
              ${g.links.map(([href, name, line]) => `<a href="${href}">${esc(name)}<span>${esc(line)}</span></a>`).join("\n              ")}
            </div>`,
    )
    .join("\n            ");

  const header = `<header class="nav nav--centre">
  <div class="wrap nav__bar">
    <a class="skip" href="#app">${esc(t.skip)}</a>
    <a class="nav__logo" href="#top">${BEE("nav__bee", 26)}Junbee</a>
    <nav class="nav__links" aria-label="${lang === "ko" ? "주 메뉴" : "Main"}">
      <div class="nav__item">
        <a class="nav__link" href="#app">${esc(t.nav.notes)} ${CHEV}</a>
        <div class="nav__menu">
          <div class="wrap grid">
            ${navGroups}
          </div>
        </div>
      </div>
      <div class="nav__item"><a class="nav__link" href="#how">${esc(t.nav.steps)}</a></div>
      <div class="nav__item"><a class="nav__link" href="#remember">${esc(t.nav.review)}</a></div>
      <div class="nav__item"><a class="nav__link" href="#junbee">${esc(t.nav.junbee)}</a></div>
      <div class="nav__item"><a class="nav__link" href="#faq">${esc(t.nav.faq)}</a></div>
    </nav>
    <div class="nav__actions">
      <a class="nav__link" href="${other.path}" hreflang="${other.lang}" lang="${other.lang}" aria-label="${esc(t.nav.switchLabel)}">${esc(t.nav.switchText)}</a>
      <a class="nav__link" href="/login">${esc(t.nav.login)}</a>
      <a class="btn btn--primary" href="/signup">${esc(t.cta)}${ARROW}</a>
    </div>
    <button class="nav__toggle" type="button" aria-expanded="false" aria-label="${esc(t.nav.menu)}">
      <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M2 5h14M2 13h14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
    </button>
  </div>
</header>`;

  const hero = `<section class="hero hero--split" aria-labelledby="hero-h">
    <div class="wrap"><div class="hero-text grid hero__grid">
      <div class="hero__text span-6">
        <p class="hero__kicker">${esc(t.hero.notice)}</p>
        <h1 id="hero-h">${esc(t.hero.h1)}</h1>
        <p class="hero__lead">${esc(t.hero.lead)}</p>
        <div class="btn-row"><a class="btn btn--primary" href="/signup">${esc(t.cta)}${ARROW}</a><a class="btn btn--secondary" href="#app">${esc(t.hero.second)}</a></div>
        <dl class="hero-facts">
          ${t.hero.facts.map(([dt, dd]) => `<div><dt>${esc(dt)}</dt><dd>${esc(dd)}</dd></div>`).join("\n          ")}
        </dl>
      </div>
      <div class="hero__media span-6 start-7" data-visual data-m-loop data-fx="grain-gradient" data-fx-seed="11" data-fx-palette='{"bg":"#cdd6c6","surface":"#dce3d6","ink":"#262d24","accent":"#6c8e63"}' data-fx-params='{"speed":0,"drift":0,"grainMotion":0}' role="img" aria-label="${esc(t.hero.alt)}">
        <div class="device ui" aria-hidden="true">
          <div class="device__screen">
            <div class="rv__bar"><span class="rv__title">${esc(p.title)}</span><span class="rv__count"><span class="rv__n3">3 / 8</span><span class="rv__n4">${esc(p.count)}</span></span></div>
            ${comb({ total: 8, filled: 3, perRow: 8, cell: 30, label: p.comb, cls: "rv__comb", liveCell: 3 })}
            <div class="rv__card">
              <p class="rv__course">${esc(p.course)}</p>
              <p class="rv__q">${esc(p.q)}</p>
              <div class="rv__answer"><p>${esc(p.a)}</p></div>
              <p class="rv__src"><span class="rv__flag" aria-hidden="true"></span><span>${esc(p.src)}</span></p>
              <span class="rv__reveal">${esc(p.reveal)}</span>
            </div>
            <div class="rv__rates">${p.ratings.map((r, i) => `<span class="rv__rate${i === 2 ? " rv__rate--pick" : ""}">${esc(r)}</span>`).join("")}</div>
          </div>
        </div>
        <div class="ly-float jb-float">
          <div class="ly-float__row"><span class="jb-float__who">${BEE("jb-float__bee", 20)}${esc(t.hero.float.who)}</span><span>${esc(t.hero.float.when)}</span></div>
          <div class="ly-float__title">${esc(t.hero.float.text)}</div>
        </div>
      </div>
    </div></div>
  </section>`;

  const a = t.app;
  const rows = a.rows
    .map(
      ([n, who, sub, st, label, date], i) =>
        `<li class="ui-win__row${i === 1 ? " is-sel" : ""}" data-row><span class="ui-avatar" data-tone="${(i % 5) + 1}">${esc(n)}</span><span class="ui-win__who">${esc(who)}</span><span class="ui-win__sub">${esc(sub)}</span><span class="ui-win__st${st === "done" ? " is-done" : " is-you"}" data-st>${esc(label)}</span><span class="ui-win__age">${esc(date)}</span></li>`,
    )
    .join("\n              ");
  const d = a.doc;
  const app = `<section class="section" id="app" aria-labelledby="app-h">
    <div class="wrap">
      <div class="grid grid--top">
        <h2 id="app-h" class="span-6">${esc(a.h2)}</h2>
        <div class="span-6 start-7 stack-4">
          <p class="app__lede">${esc(a.p)}</p>
          <a class="link" href="#pipeline">${esc(a.link)}</a>
        </div>
      </div>
      <div class="ui app fill" role="img" aria-label="${esc(a.alt)}" data-ui-pause-host>
        <div class="app__pane app__pane--list">
          <div class="ui ui-panel ui-win" data-open="${esc(a.states.open)}" data-work="${esc(a.states.work)}" data-done="${esc(a.states.done)}">
            <div class="ui-win__bar">
              <span class="ui-dots" aria-hidden="true"><i></i><i></i><i></i></span>
              <span class="ui-win__crumb">${BEE("ui-brand", 16)}${esc(a.crumb[0])} <i>/</i> <b>${esc(a.crumb[1])}</b></span>
              <span class="ui-spacer"></span>
              <span class="ui-win__search" aria-hidden="true"><svg class="ui-icon" viewBox="0 0 16 16"><circle cx="7" cy="7" r="4.5"/><path d="m10.5 10.5 3 3"/></svg><span class="ui-win__ph">${esc(a.search)}</span><span class="ui-kbd">/</span></span>
            </div>
            <div class="ui-win__body">
              <nav class="ui-win__side" aria-hidden="true">
                <span class="ui-win__nav is-on"><svg class="ui-icon" viewBox="0 0 16 16"><path d="M3 3.5h10v9H3z"/><path d="M5.5 6.5h5M5.5 9h3"/></svg>${esc(a.side[0][0])}<em>${a.side[0][1]}</em></span>
                <span class="ui-win__nav"><svg class="ui-icon" viewBox="0 0 16 16"><path d="M3 4.5h7.5v8H3z"/><path d="M5.5 2.5H13v8"/></svg>${esc(a.side[1][0])}<em>${a.side[1][1]}</em></span>
                <span class="ui-win__label">${esc(a.sideLabel)}</span>
                ${a.courses.map((c, i) => `<span class="ui-win__nav${i === 0 ? " is-on" : ""}"><span class="ui-win__hash">#</span>${esc(c)}</span>`).join("\n                ")}
              </nav>
              <div class="ui-win__main">
                <div class="ui-win__cols" aria-hidden="true">${a.cols.map((c) => `<span>${esc(c)}</span>`).join("")}</div>
                <ul class="ui-win__rows">
              ${rows}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div class="app__pane app__pane--open" data-ui-loop>
          <div class="ui ui-doc" data-ui="doc">
            <article class="ui-doc__page">
              <div class="ui-doc__label">${esc(d.label)}</div>
              <div class="ui-doc__title">${esc(d.title)}</div>
              <div class="ui-doc__text">${esc(d.p1a)}<mark class="ui-doc__mark is-on">${esc(d.mark1)}</mark>${esc(d.p1b)}</div>
              <div class="ui-doc__h">${esc(d.h1)}</div>
              <ul class="ui-doc__list">${d.concepts.map((c) => `<li class="ui-doc__text">${esc(c)}</li>`).join("")}</ul>
              <div class="ui-doc__h">${esc(d.h2)}</div>
              <div class="ui-doc__text">${esc(d.p2)}</div>
              <div class="ui-doc__text">${esc(d.p3a)}<mark class="ui-doc__mark" data-kind="${esc(d.note2.kind)}" data-msg="${esc(d.note2.msg)}" data-where="${esc(d.note2.where)}">${esc(d.mark2)}</mark>${esc(d.p3b)}</div>
              <div class="ui-doc__text">${esc(d.p4)}</div>
            </article>
            <aside class="ui-doc__note ui-panel is-on" aria-live="polite">
              <div class="ui-doc__kind"><span class="ui-doc__dot"></span><span data-doc-kind>${esc(d.note1.kind)}</span></div>
              <div class="ui-doc__msg" data-doc-msg>${esc(d.note1.msg)}</div>
              <div class="ui-doc__where" data-doc-where>${esc(d.note1.where)}</div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  </section>`;

  const h = t.how;
  const how = `<section class="section bg-band" id="how" aria-labelledby="how-h">
    <div class="wrap">
      <div class="section-head"><h2 id="how-h">${esc(h.h2)}</h2><p>${esc(h.p)}</p></div>
      <div class="grid">
        <article class="card card--row card--open span-4 m-nolift">
          <span class="step-num">1</span>
          <h3>${esc(h.steps[0].title)}</h3>
          <p>${esc(h.steps[0].body)}</p>
          <div class="panel">
            <div class="stage stage--fade-b"><div class="at-rise fit" style="--fit-max: 340px; --ax: max(24px, 50% - 170px); --ay: 40px; --ay-sm: 32px">
              <div class="ui ui-panel up" data-m-loop>
                <div class="up__head"><span class="ui-title">${lang === "ko" ? "녹음 올리기" : "Upload"}</span><span class="ui-spacer"></span><span class="ui-meta">2</span></div>
                <div class="up__file">
                  <span class="up__icon"><img data-icon="file:file-type-audio" src="/kit/icons/audio.svg" alt="" width="22" height="22"></span>
                  <span class="up__text"><span class="up__name">${esc(h.upload.file)}</span><span class="up__size">${esc(h.upload.size)}</span></span>
                  <span class="up__state"><span class="up__busy">${esc(h.upload.status)}</span><span class="up__done">${CHECK}${esc(h.upload.done)}</span></span>
                  <span class="up__bar"><i></i></span>
                </div>
                <div class="up__file up__file--next">
                  <span class="up__icon"><img data-icon="file:file-type-audio" src="/kit/icons/audio.svg" alt="" width="22" height="22"></span>
                  <span class="up__text"><span class="up__name">${esc(h.upload.next)}</span><span class="up__size">${esc(h.upload.nextSize)}</span></span>
                  <span class="up__state"><span class="up__wait">${esc(h.upload.waiting)}</span></span>
                </div>
              </div>
            </div></div>
          </div>
        </article>
        <article class="card card--row card--open span-4 m-nolift">
          <span class="step-num">2</span>
          <h3>${esc(h.steps[1].title)}</h3>
          <p>${esc(h.steps[1].body)}</p>
          <div class="panel">
            <div class="stage stage--fade-b"><div class="at-rise fit" style="--fit-max: 380px; --ax: max(24px, 50% - 190px); --ay: calc(100% - 196px); --ay-sm: calc(100% - 196px)">
              <div class="ui ui-notify" data-ui="notify" data-ui-still>
                <ul class="ui-notify__list" data-notify-list>
                  ${h.notes
                    .map(
                      ([title, body, time]) =>
                        `<li class="ui-note"><span class="ui-note__av jb-av">${BEE("", 18)}</span><span class="ui-note__text"><span class="ui-note__title"><span class="ui-note__t">${esc(title)}</span><time>${esc(time)}</time></span><span class="ui-note__body">${esc(body)}</span></span></li>`,
                    )
                    .join("\n                  ")}
                </ul>
              </div>
            </div></div>
          </div>
        </article>
        <article class="card card--row card--open span-4 m-nolift">
          <span class="step-num">3</span>
          <h3>${esc(h.steps[2].title)}</h3>
          <p>${esc(h.steps[2].body)}</p>
          <div class="panel">
            <div class="stage stage--fade-b"><div class="at-rise fit" style="--fit-max: 340px; --ax: max(24px, 50% - 170px); --ay: 40px; --ay-sm: 32px">
              <div class="ui ui-panel ui-checks" data-ui="checklist" data-ui-still>
                <div class="ui-checks__head"><div class="ui-title">${esc(h.checks.title)}</div><span class="ui-spacer"></span><div class="ui-meta" data-checks-count>${esc(h.checks.count)}</div></div>
                <div class="ui-checks__bar"><i data-checks-bar style="--k: 0.6"></i></div>
                <ul class="ui-checks__list">
                  ${h.checks.items
                    .map((it, i) => `<li class="ui-check${i < 3 ? " is-done" : ""}"><span class="ui-check__box">${CHECK}</span><span class="ui-check__label">${esc(it)}</span></li>`)
                    .join("\n                  ")}
                </ul>
              </div>
            </div></div>
          </div>
        </article>
      </div>
    </div>
  </section>`;

  const pl = t.pipeline;
  const lanes = diagram({
    layout: "lanes",
    alt: pl.diagramAlt,
    input: { label: pl.input[0], icon: "file:file-type-audio", sub: pl.input[1] },
    core: { label: "Junbee", icon: "/favicon.svg" },
    lanes: [
      { label: pl.lanes[0][0], icon: "ui:file-text", done: true, sub: pl.lanes[0][1] },
      { label: pl.lanes[1][0], icon: "ui:notebook-pen", done: true, sub: pl.lanes[1][1] },
      { label: pl.lanes[2][0], icon: "ui:layers", done: true, sub: pl.lanes[2][1] },
    ],
    ground: "dots",
  });
  const pipeline = `<section class="section" id="pipeline" aria-labelledby="pipeline-h">
    <div class="wrap">
      <div class="grid grid--top">
        <div class="span-6 split__text">
          <h2 id="pipeline-h">${esc(pl.h2)}</h2>
          <p class="t-lead">${esc(pl.p)}</p>
          <dl class="split__facts">
            ${pl.facts.map(([dt, dd]) => `<div><dt>${esc(dt)}</dt><dd>${esc(dd)}</dd></div>`).join("\n            ")}
          </dl>
          <a class="link" href="/privacy">${esc(pl.link)}</a>
        </div>
        <div class="frame frame--split frame--diagram span-6 start-7">
          ${lanes.replace('class="dg"', 'class="dg" data-dg-still')}
        </div>
      </div>
      <div class="subjects" data-moment="marquee-row" data-moment-opts='{"speed": 36}' aria-label="${esc(pl.subjectsLabel)}">
        <ul class="mo-mq__track">${pl.subjects.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>
      </div>
    </div>
  </section>`;

  const rm = t.remember;
  const hub = diagram({
    layout: "hub",
    alt: rm.hub.alt,
    center: { label: rm.hub.center, icon: "ui:book-open" },
    spokes: rm.hub.spokes.map(([label, icon]) => ({ label, icon })),
  });
  const remember = `<section class="section g2" id="remember" aria-labelledby="remember-h">
    <div class="wrap">
      <div class="group">
        <div class="section-head"><h2 id="remember-h">${esc(rm.h2)} <span class="muted">${esc(rm.h2muted)}</span></h2><a class="link" href="#faq">${esc(rm.link)}</a></div>
        <div class="grid">
          <article class="card card--row card--open span-6 m-nolift">
            <h3>${esc(rm.cards[0].title)}</h3>
            <p>${esc(rm.cards[0].body)}</p>
            <div class="panel">
              <div class="stage stage--fade-b"><div class="at-rise fit to-edge" style="--fit-max: 452px; --ax: max(24px, 50% - 226px); --ay: 40px; --ay-sm: 32px">
                <div class="ui ui-panel cv">
                  <div class="cv__head"><span class="ui-title">${esc(rm.curve.title)}</span><span class="ui-spacer"></span><span class="ui-meta">${esc(rm.curve.axis)} 4</span></div>
                  ${curve(t)}
                </div>
              </div></div>
            </div>
          </article>
          <article class="card card--row card--open span-6 m-nolift">
            <h3>${esc(rm.cards[1].title)}</h3>
            <p>${esc(rm.cards[1].body)}</p>
            <div class="panel">
              <div class="stage stage--fade-b"><div class="at-rise fit to-edge" style="--fit-max: 452px; --ax: max(24px, 50% - 226px); --ay: 40px; --ay-sm: 32px">
                <div class="ui ui-panel cb">
                  <div class="cb__head"><span class="ui-title">${esc(rm.comb.title)}</span><span class="ui-spacer"></span><span class="ui-meta">${esc(rm.comb.meta)}</span></div>
                  ${comb({ total: 20, filled: 20, perRow: 10, cell: 34, label: rm.comb.label, cls: "cb__comb" })}
                  <div class="cb__done">${BEE("cb__bee", 22)}<span><b>${esc(rm.comb.done)}</b><span>${esc(rm.comb.sub)}</span></span></div>
                  <ul class="cb__rows">${rm.comb.rows.map(([q, r]) => `<li><span>${esc(q)}</span><span class="cb__rate">${esc(r)}</span></li>`).join("")}</ul>
                </div>
              </div></div>
            </div>
          </article>
        </div>
      </div>
      <div class="grid">
        <article class="card card--row card--open span-6 m-nolift">
          <h3>${esc(rm.cards[2].title)}</h3>
          <p>${esc(rm.cards[2].body)}</p>
          <div class="panel">
            <div class="stage stage--fade-b"><div class="at-rise fit to-edge" style="--fit-max: 452px; --ax: max(24px, 50% - 226px); --ay: 40px; --ay-sm: 32px">
              <div class="ui ui-panel ht">
                <div class="ht__head"><span class="ui-title">${esc(rm.hints.title)}</span><span class="ui-spacer"></span><span class="ui-meta">${esc(rm.hints.meta)}</span></div>
                <ul class="ht__rows">
                  ${rm.hints.rows.map(([q, at], i) => `<li class="ht__row${i === 0 ? " is-on" : ""}"><span class="ht__flag" aria-hidden="true"></span><span class="ht__q">${esc(q)}</span><span class="ht__at">${esc(at)}</span></li>`).join("\n                  ")}
                </ul>
              </div>
            </div></div>
          </div>
        </article>
        <article class="card card--row card--open span-6 m-nolift">
          <h3>${esc(rm.cards[3].title)}</h3>
          <p>${esc(rm.cards[3].body)}</p>
          <div class="panel panel--diagram">
            ${hub}
          </div>
        </article>
      </div>
    </div>
  </section>`;

  const j = t.junbee;
  const junbee = `<section class="section ground-inverse" id="junbee" aria-labelledby="junbee-h">
    <div class="wrap">
      <div class="section-head"><h2 id="junbee-h">${esc(j.h2)}</h2><p>${esc(j.p)}</p></div>
      ${waveform(t)}
      <div class="grid says">
        ${j.messages
          .map(
            ([when, text]) => `<div class="span-4 say">
          <p class="t-label say__when">${esc(when)}</p>
          <p class="say__msg ui">${BEE("say__bee", 24)}<span>${esc(text)}</span></p>
        </div>`,
          )
          .join("\n        ")}
      </div>
    </div>
  </section>`;

  const half = Math.ceil(t.faq.items.length / 2);
  const faqCol = (items) =>
    items.map(([q, ans]) => `<div class="faq__item"><h3>${esc(q)}</h3><p>${esc(ans)}</p></div>`).join("\n          ");
  const faq = `<section class="section" id="faq" aria-labelledby="faq-h">
    <div class="wrap">
      <div class="section-head"><h2 id="faq-h">${esc(t.faq.h2)}</h2></div>
      <div class="ui keep" role="img" aria-label="${esc(t.faq.keep.alt)}">
        <div class="keep__item keep__item--gone"><span class="keep__icon"><img src="/kit/icons/audio.svg" alt="" width="22" height="22"></span><span class="keep__text"><b>${esc(t.faq.keep.gone[0])}</b><span>${esc(t.faq.keep.gone[1])}</span></span></div>
        ${t.faq.keep.kept
          .map(
            ([name, line], i) =>
              `<div class="keep__item"><span class="keep__icon"><img src="/kit/icons/${["ui-file-text", "ui-notebook-pen", "ui-layers"][i]}.svg" alt="" width="20" height="20"></span><span class="keep__text"><b>${esc(name)}</b><span>${esc(line)}</span></span></div>`,
          )
          .join("\n        ")}
      </div>
      <div class="grid grid--top">
        <div class="faq span-6">
          ${faqCol(t.faq.items.slice(0, half))}
        </div>
        <div class="faq span-6 start-7">
          ${faqCol(t.faq.items.slice(half))}
        </div>
      </div>
    </div>
  </section>`;

  const f = t.footer;
  const footer = `<footer class="footer closing footer--statement" id="contact" aria-labelledby="close-h">
  <div class="wrap">
    <div class="closing__cta close--type">
      <div class="section-head">
        <h2 id="close-h">${esc(t.close.h2)}</h2>
        <p>${esc(t.close.p)}</p>
      </div>
      <a class="btn btn--primary btn--xl btn--wide" href="/signup">${esc(t.cta)}${ARROW}</a>
    </div>
    <div class="closing__links">
      <div class="grid">
        <div class="span-4 stack-4">
          <a class="nav__logo" href="#top">${BEE("nav__bee", 26)}Junbee</a>
          <p class="footer__lede">${esc(f.lede)}</p>
        </div>
        ${f.cols
          .map(
            ([title, links]) =>
              `<div class="span-2 footer__col"><h4>${esc(title)}</h4><ul>${links.map(([href, label]) => `<li><a href="${href}">${esc(label)}</a></li>`).join("")}</ul></div>`,
          )
          .join("\n        ")}
      </div>
      <div class="footer__legal">
        <span>${esc(f.company)} &nbsp; <a href="/privacy">${esc(f.privacy)}</a></span>
        <a href="${other.path}" hreflang="${other.lang}" lang="${other.lang}">${esc(other.nav.switchText === "EN" ? "한국어" : "English")}</a>
      </div>
    </div>
  </div>
</footer>`;

  return withUnclearTokens(`${head}
<body>
${plan}
${header}

<main id="top">
  ${hero}

  ${app}

  ${how}

  ${pipeline}

  ${remember}

  ${junbee}

  ${faq}
</main>

${footer}

<script type="module" src="/kit/system.js"></script>
<script type="module" src="/kit/motion/motion.js"></script>
<script type="module" src="/kit/layout/layout.js"></script>
<script type="module" src="/kit/diagrams/mount.js"></script>
</body>
</html>
`);
}
