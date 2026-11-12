import fs from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { AVATAR_VIEWBOX, JunoArt, JunoAvatar, JunoFigure, type JunoMood } from "@/brand/Juno";

/*
 * Juno is a magpie. The app draws it with JunoAvatar; the static landing page
 * shows public/brand/juno.svg and inlines the moods from site/juno-art.json.
 * To redraw both files after changing the drawing:
 *   UPDATE_JUNO_SVG=1 npx vitest run src/test/juno.test.tsx
 */

const FILE = path.resolve(__dirname, "../../public/brand/juno.svg");
const ART = path.resolve(__dirname, "../../site/juno-art.json");
const MOODS: JunoMood[] = ["idle", "happy", "listen", "work", "found", "rest"];

function landingSvg() {
  const art = renderToStaticMarkup(<JunoArt mood="idle" />);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${AVATAR_VIEWBOX}">${art}</svg>\n`;
}

function landingArt() {
  const each = (around: boolean) => Object.fromEntries(MOODS.map((m) => [m, renderToStaticMarkup(<JunoArt mood={m} around={around} />)]));
  return `${JSON.stringify({ avatarViewBox: AVATAR_VIEWBOX, figureViewBox: "0 0 120 120", avatar: each(false), figure: each(true) }, null, 1)}\n`;
}

/** The mobile app's Juno: one file per mood, his face (mood.svg) and the whole bird (figure-mood.svg). */
const MOBILE = path.resolve(__dirname, "../../mobile/assets/juno");
function mobileFiles(): [string, string][] {
  return MOODS.flatMap((mood) => [
    [`${mood}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${AVATAR_VIEWBOX}">${renderToStaticMarkup(<JunoArt mood={mood} />)}</svg>\n`],
    [`figure-${mood}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">${renderToStaticMarkup(<JunoArt mood={mood} around />)}</svg>\n`],
  ] as [string, string][]);
}

describe("Juno, the magpie", () => {
  it("the mobile app's Juno is the same drawing", () => {
    if (process.env.UPDATE_JUNO_SVG) {
      fs.mkdirSync(MOBILE, { recursive: true });
      for (const [name, svg] of mobileFiles()) fs.writeFileSync(path.join(MOBILE, name), svg);
    }
    for (const [name, svg] of mobileFiles()) expect(fs.readFileSync(path.join(MOBILE, name), "utf8").replace(/\r\n/g, "\n"), name).toBe(svg);
  });

  it("the landing page's Juno is the app's Juno", () => {
    if (process.env.UPDATE_JUNO_SVG) {
      fs.writeFileSync(FILE, landingSvg());
      fs.writeFileSync(ART, landingArt());
    }
    expect(fs.readFileSync(FILE, "utf8")).toBe(landingSvg());
    expect(fs.readFileSync(ART, "utf8").replace(/\r\n/g, "\n")).toBe(landingArt());
  });

  it("is decoration next to its name, and named when it stands alone", () => {
    expect(renderToStaticMarkup(<JunoAvatar />)).toContain('aria-hidden="true"');
    const alone = renderToStaticMarkup(<JunoAvatar title="Juno" />);
    expect(alone).toContain('role="img"');
    expect(alone).toContain('aria-label="Juno"');
  });

  it("speaking means working unless Juno is listening to a lecture", () => {
    const quiet = renderToStaticMarkup(<JunoAvatar />);
    const working = renderToStaticMarkup(<JunoAvatar speaking />);
    expect(working).not.toBe(quiet);
    expect(working).toBe(renderToStaticMarkup(<JunoAvatar speaking mood="work" />));
    expect(renderToStaticMarkup(<JunoAvatar speaking mood="listen" />)).not.toBe(working);
  });

  it("shows what is around it only when there is room for the whole bird", () => {
    expect(renderToStaticMarkup(<JunoAvatar mood="listen" />)).not.toContain("juno-wave");
    expect(renderToStaticMarkup(<JunoFigure mood="listen" />)).toContain("juno-wave");
    expect(renderToStaticMarkup(<JunoFigure mood="found" />)).toContain("juno-spark");
  });
});
