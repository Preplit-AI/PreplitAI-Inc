import fs from "node:fs";
import path from "node:path";
import { copy } from "../../site/copy.mjs";
import { render, renderPricing } from "../../site/render.mjs";

/*
 * The static landing page: the brand's rules and the things that break quietly,
 * checked against the copy, the rendered pages and the files they point at.
 */

const ROOT = path.resolve(__dirname, "../..");
const langs = ["ko", "en"] as const;
const pages = [
  ["en", "index.html", render, "/"],
  ["ko", "ko/index.html", render, "/ko/"],
  ["en", "pricing/index.html", renderPricing, "/pricing/"],
  ["ko", "ko/pricing/index.html", renderPricing, "/ko/pricing/"],
] as const;

function strings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === "object") return Object.values(value).flatMap(strings);
  return [];
}

function shape(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(shape);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => [k, shape(v)]));
  }
  return typeof value;
}

describe("the landing page's copy", () => {
  it.each(langs)("%s: holds to the brand's rules", (lang) => {
    const all = strings(copy[lang]).join("\n");
    // Spelled out so this test file does not contain the word it bans.
    expect(all).not.toMatch(new RegExp(["st", "reak"].join(""), "i"));
    expect(all).not.toMatch(/연속 학습/);
    // The one exclamation mark is the early-access badge, in the client's own words ("You're early!").
    const { early, ...withoutEarly } = copy[lang];
    expect(strings(withoutEarly).join("\n"), "no exclamation marks").not.toMatch(/!/);
    expect(strings({ ...early, badge: "" }).join("\n")).not.toMatch(/!/);
    // The only percentages are the pilot's targets, set before it starts, and the pricing page's
    // semester discount; nothing claims the product counted one.
    const { measure, ...course } = copy[lang].course;
    const { pricing: _pricing, ...page } = copy[lang];
    const rest = strings({ ...page, course }).join(" ");
    expect(rest, "no percentages outside the pilot's targets").not.toMatch(/\d\s?%/);
    for (const [, target] of measure.rows) expect(target).toMatch(/^\d+(%|개|)$|^\d+ lectures?$/);
  });

  it.each(langs)("%s: the Semester Pass discount is what the two prices say", (lang) => {
    const pr = copy[lang].pricing;
    const pro = pr.plans.find((p) => p.id === "pro");
    const n = (v: string) => Number(v.replace(/[^\d.]/g, ""));
    const off = 1 - n(pro!.semester) / n(pro!.monthly);
    const stated = n(pr.billing.off) / 100;
    expect(Math.abs(off - stated)).toBeLessThan(0.005);
    for (const [, answer] of pr.faq) for (const m of answer.matchAll(/(\d+)\s?%/g)) expect(Number(m[1]) / 100).toBe(stated);
  });

  it("has the same parts in both languages", () => {
    expect(shape(copy.en)).toEqual(shape(copy.ko));
  });

  it.each(langs)("%s: the first screen says what it is: the headline, then Juno the companion, from lectures to deadlines to a career", (lang) => {
    const { h1, lead } = copy[lang].hero;
    expect(h1.length).toBeLessThanOrEqual(40);
    expect(h1).toMatch(lang === "ko" ? /대학 생활/ : /student life/i);
    expect(lead).toMatch(lang === "ko" ? /Juno.*수업.*마감.*커리어/ : /Juno.*companion.*lecture.*due.*career/i);
  });

  it.each(langs)("%s: tells all six stages of the semester, setup to career", (lang) => {
    expect(copy[lang].features.stages).toHaveLength(6);
    expect(copy[lang].how.steps).toHaveLength(4);
  });

  it.each(langs)("%s: states the product's real limits", (lang) => {
    const all = strings(copy[lang]).join("\n");
    expect(all, "the monthly limit in server/config/constants.js").toMatch(/40/);
    expect(all, "the longest recording in src/workspace/recorder/Recorder.tsx").toMatch(lang === "ko" ? /4시간/ : /4 hours/);
    expect(all, "the pilot size in the pilot plan").toMatch(/20/);
  });
});

describe.each(pages)("the rendered page (%s, %s)", (lang, file, page, canonical) => {
  const html = page(lang);

  it("is what is on disk: run npm run site after changing site/", () => {
    const onDisk = fs.readFileSync(path.join(ROOT, file), "utf8").replace(/\r\n/g, "\n");
    expect(onDisk).toBe(html);
  });

  it("declares its language and kind, and links its other language", () => {
    expect(html).toContain(`<html lang="${lang}"`);
    expect(html).toContain('<meta name="site-kind" content="software">');
    expect(html).toContain('hreflang="ko"');
    expect(html).toContain('hreflang="en"');
    expect(html).toContain(`<link rel="canonical" href="https://preplitai.com${canonical}">`);
  });

  it("has one h1 and sends every in-page link somewhere", () => {
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
    for (const [, target] of html.matchAll(/href="#([^"]+)"/g)) expect(ids, `#${target}`).toContain(target);
  });

  it("points only at files that exist", () => {
    for (const [, url] of html.matchAll(/(?:href|src)="(\/(?:kit|brand|js)\/[^"]+)"/g)) {
      expect(fs.existsSync(path.join(ROOT, "public", url)), url).toBe(true);
    }
  });

  it("sends sign-up and log-in to their pages, keeps the early-access note for the workspace, and has no footer wordmark", () => {
    expect(html).toContain('href="/signup"');
    expect(html).not.toMatch(/href="\/(workspace|app)[/"]/);
    expect(html).toContain('<dialog class="early" id="early"');
    expect(html).toContain('<script src="/js/early.js"></script>');
    expect(html).not.toContain("pv-word");
  });

  it("runs no inline script, so the Content-Security-Policy can stay script-src 'self'", () => {
    const inline = [...html.matchAll(/<script(?![^>]*\bsrc=)([^>]*)>/g)].map((m) => m[1]);
    for (const attrs of inline) expect(attrs).toMatch(/application\/(ld\+)?json/);
  });
});

describe("the pages' stylesheet", () => {
  it("points only at pictures that exist", () => {
    const css = fs.readFileSync(path.join(ROOT, "site/landing.css"), "utf8");
    const urls = [...css.matchAll(/url\((\.\/[^)]+)\)/g)].map((m) => m[1]);
    expect(urls.length).toBeGreaterThan(0);
    for (const url of urls) expect(fs.existsSync(path.join(ROOT, "site", url)), url).toBe(true);
  });
});
