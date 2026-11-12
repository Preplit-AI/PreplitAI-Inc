// Builds the mobile app's web version and puts it where the website serves it: /m.
//
//   npm run mobile:web
//
// The app is one Expo project (mobile/) for Android, iOS and the web. Its web
// build is what www.preplitai.com/m shows: a preview anyone with the developer
// pass can open on a phone or tablet without installing anything.
//
// The build is committed (public/m) rather than made on Vercel, so a problem in
// the app's build can never stop the website from deploying. Run this after
// changing anything in mobile/, then commit public/m with the change.
import { execSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const app = path.join(root, "mobile");
const built = path.join(app, "dist");
const served = path.join(root, "public", "m");

if (!fs.existsSync(path.join(app, "node_modules"))) {
  console.log("mobile: installing dependencies");
  execSync("npm install", { cwd: app, stdio: "inherit" });
}

console.log("mobile: exporting the web build");
execSync("npx expo export --platform web", { cwd: app, stdio: "inherit" });

// Replace the served copy with the new build. Both paths are inside this repository.
fs.rmSync(served, { recursive: true, force: true });
fs.cpSync(built, served, { recursive: true });

// Expo keeps the fonts and icons that come from packages under assets/node_modules.
// Git and Vercel both leave out any folder with that name, so the files would never
// be deployed and the app would start without its fonts. They move to assets/vendor,
// and every script that names them is pointed there.
const packaged = path.join(served, "assets", "node_modules");
if (fs.existsSync(packaged)) {
  fs.renameSync(packaged, path.join(served, "assets", "vendor"));
  const scripts = path.join(served, "_expo", "static", "js", "web");
  const page = path.join(served, "index.html");

  // A script is named after its contents (name-<hash>.js) and cached for a long
  // time under that name. So a script that is changed here must also be renamed,
  // or browsers and the CDN would keep serving the copy they already have. And
  // renaming one changes every script that loads it by name, so this repeats
  // until nothing changes.
  const hashOf = (text) => crypto.createHash("md5").update(text).digest("hex");
  const renamed = new Map();
  let touched = new Set();
  for (const name of fs.readdirSync(scripts)) {
    const file = path.join(scripts, name);
    const before = fs.readFileSync(file, "utf8");
    const after = before.replaceAll("/assets/node_modules/", "/assets/vendor/");
    if (after === before) continue;
    fs.writeFileSync(file, after);
    touched.add(name);
  }
  for (let round = 0; touched.size; round += 1) {
    if (round > 20) throw new Error("mobile: scripts refer to each other in a loop; cannot rename them");
    const moves = [];
    for (const name of touched) {
      const fresh = name.replace(/-[a-f0-9]{32}\.js$/, `-${hashOf(fs.readFileSync(path.join(scripts, name), "utf8"))}.js`);
      if (fresh === name) continue;
      fs.renameSync(path.join(scripts, name), path.join(scripts, fresh));
      moves.push([name, fresh]);
      renamed.set(name, fresh);
    }
    touched = new Set();
    if (!moves.length) break;
    for (const file of [page, ...fs.readdirSync(scripts).map((name) => path.join(scripts, name))]) {
      const before = fs.readFileSync(file, "utf8");
      let after = before;
      for (const [old, fresh] of moves) after = after.replaceAll(old, fresh);
      if (after === before) continue;
      fs.writeFileSync(file, after);
      if (file !== page) touched.add(path.basename(file));
    }
  }
  console.log(`mobile: moved packaged assets to assets/vendor (${renamed.size} scripts renamed)`);
}
const leftover = fs.readdirSync(served, { recursive: true }).filter((f) => String(f).split(path.sep).includes("node_modules"));
if (leftover.length) throw new Error(`public/m still has files under node_modules, which would not deploy: ${leftover[0]}`);

const files = fs.readdirSync(served, { recursive: true }).filter((f) => fs.statSync(path.join(served, f)).isFile());
const bytes = files.reduce((sum, f) => sum + fs.statSync(path.join(served, f)).size, 0);
console.log(`mobile: wrote public/m (${files.length} files, ${(bytes / 1024 / 1024).toFixed(1)} MB)`);
