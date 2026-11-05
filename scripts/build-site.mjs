// Writes the static landing pages from site/render.mjs: index.html (Korean)
// and en/index.html (English). Runs before `vite` and `vite build`.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { render } from "../site/render.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pages = [
  ["ko", "index.html"],
  ["en", "en/index.html"],
];

for (const [lang, file] of pages) {
  const out = resolve(root, file);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, render(lang));
  console.log(`site: wrote ${file}`);
}
