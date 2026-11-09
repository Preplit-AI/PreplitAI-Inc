// Writes the static pages from site/render.mjs: the landing page, index.html (Korean)
// and en/index.html (English), and the pricing page, pricing/index.html and
// en/pricing/index.html. Runs before `vite` and `vite build`.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { render, renderPricing } from "../site/render.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pages = [
  ["ko", "index.html", render],
  ["en", "en/index.html", render],
  ["ko", "pricing/index.html", renderPricing],
  ["en", "en/pricing/index.html", renderPricing],
];

for (const [lang, file, page] of pages) {
  const out = resolve(root, file);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, page(lang));
  console.log(`site: wrote ${file}`);
}
