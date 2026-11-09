// Writes the static pages from site/render.mjs. English is the first language: the
// landing page is index.html (English, at /) and ko/index.html (Korean, at /ko/), and
// the pricing page pricing/index.html and ko/pricing/index.html. Runs before `vite`
// and `vite build`.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { render, renderPricing } from "../site/render.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pages = [
  ["en", "index.html", render],
  ["ko", "ko/index.html", render],
  ["en", "pricing/index.html", renderPricing],
  ["ko", "ko/pricing/index.html", renderPricing],
];

for (const [lang, file, page] of pages) {
  const out = resolve(root, file);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, page(lang));
  console.log(`site: wrote ${file}`);
}
