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

const files = fs.readdirSync(served, { recursive: true }).filter((f) => fs.statSync(path.join(served, f)).isFile());
const bytes = files.reduce((sum, f) => sum + fs.statSync(path.join(served, f)).size, 0);
console.log(`mobile: wrote public/m (${files.length} files, ${(bytes / 1024 / 1024).toFixed(1)} MB)`);
