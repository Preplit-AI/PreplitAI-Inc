import fs from "node:fs";
import path from "node:path";
import { render, screen } from "@testing-library/react";
import { junoText } from "@/brand/JunoMessage";
import { Tally } from "@/brand/Tally";
import { formatRanges } from "@/lib/format";
import { MOVEMENTS, NAV } from "@/workspace/movements";

/*
 * The brand's rules from the pilot plan's definition of done, written as tests
 * so they are checked by something other than the person who wrote the code.
 */

const SRC = path.resolve(__dirname, "..");

function sourceFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === "test" ? [] : sourceFiles(full);
    return /\.(ts|tsx|css)$/.test(entry.name) ? [full] : [];
  });
}

describe("Juno says exactly three things about a lecture", () => {
  const base = { lectureId: "x", lectureTitle: "9주차", source: "audio" as const };

  it("notes are ready: a fact and a count, no praise", () => {
    expect(junoText({ ...base, kind: "ready", cardCount: 8, unclearRanges: [] })).toBe("9주차 노트 정리했어요. 카드 8장.");
  });

  it("part of the audio was unusable: says which minutes, and that it did not guess", () => {
    const text = junoText({ ...base, kind: "unclear", cardCount: 8, unclearRanges: [{ start: 720, end: 840 }] });
    expect(text).toBe("9주차 노트 정리했어요. 카드 8장. 12~14분은 잘 안 들려서 [불명확]으로 두었어요 — 추측해서 채우지 않았습니다.");
  });

  it("nothing could be produced: says nothing was saved", () => {
    expect(junoText({ ...base, kind: "failed", cardCount: 0, unclearRanges: [] })).toBe(
      "‘9주차’ 녹음은 노트로 만들지 못했어요. 저장된 건 없습니다.",
    );
  });

  it("never celebrates", () => {
    const all = [
      junoText({ ...base, kind: "ready", cardCount: 3, unclearRanges: [] }),
      junoText({ ...base, kind: "unclear", cardCount: 3, unclearRanges: [{ start: 0, end: 60 }] }),
      junoText({ ...base, kind: "failed", cardCount: 0, unclearRanges: [] }),
    ].join(" ");
    expect(all).not.toMatch(/[!]|잘했|축하|대단|훌륭/);
  });
});

describe("the tally", () => {
  it("draws one segment per card and fills only what was done", () => {
    const { container } = render(<Tally total={5} filled={3} label="오늘 카드 5장 중 3장 복습함" />);
    expect(screen.getByRole("img", { name: "오늘 카드 5장 중 3장 복습함" })).toBeInTheDocument();
    expect(container.querySelectorAll("[data-tally]")).toHaveLength(5);
    expect(container.querySelectorAll("[data-done]")).toHaveLength(3);
  });

  it("never fills more than there is", () => {
    const { container } = render(<Tally total={4} filled={9} label="오늘 카드 4장" />);
    expect(container.querySelectorAll("[data-done]")).toHaveLength(4);
  });

  it("draws nothing when there is nothing to do", () => {
    const { container } = render(<Tally total={0} filled={0} label="없음" />);
    expect(container.firstChild).toBeNull();
  });
});

describe("ranges are reported in whole minutes", () => {
  it("joins several and summarises the rest", () => {
    expect(formatRanges([{ start: 720, end: 840 }, { start: 1860, end: 1990 }])).toBe("12~14분, 31~34분");
    expect(formatRanges([0, 1, 2, 3, 4].map((m) => ({ start: m * 600, end: m * 600 + 30 })))).toBe("0~1분, 10~11분, 20~21분 외 2곳");
  });
});

describe("definition of done, checked against the source", () => {
  const files = sourceFiles(SRC);
  const text = (f: string) => fs.readFileSync(f, "utf8");

  it("the word for a days-in-a-row counter appears nowhere in the source", () => {
    // Spelled out so this test file does not contain the word it bans.
    const banned = new RegExp(["st", "reak"].join(""), "i");
    for (const f of files) expect(text(f), f).not.toMatch(banned);
  });

  it("no app or workspace screen hardcodes a percentage", () => {
    const screens = files.filter((f) => f.includes(`${path.sep}app${path.sep}`) || f.includes(`${path.sep}workspace${path.sep}`));
    expect(screens.some((f) => f.includes(`${path.sep}workspace${path.sep}`))).toBe(true);
    for (const f of screens) {
      expect(text(f), f).not.toMatch(/\b\d{1,3}(\.\d+)?%/);
    }
  });

  it("the workspace never puts text from the model into the page as HTML", () => {
    for (const f of files.filter((f) => f.includes(`${path.sep}workspace${path.sep}`))) {
      expect(text(f), f).not.toMatch(/dangerouslySetInnerHTML|rehypeRaw|rehype-raw/);
    }
  });

  it("the app's navigation is the semester and the four movements, in order, and nothing else", () => {
    expect(NAV.map((n) => n.label)).toEqual(["이번 학기", "정리", "배움", "기억", "쌓기"]);
    expect(MOVEMENTS.map((m) => `${m.n} ${m.en}`)).toEqual(["01 Organize", "02 Learn", "03 Remember", "04 Build"]);
  });

  it("every movement is a real screen: its route exists and nothing says it is coming", () => {
    const app = text(path.join(SRC, "App.tsx"));
    for (const { to } of NAV) expect(app, to).toContain(`path="${to}"`);
    for (const f of files) expect(text(f), f).not.toMatch(/coming soon|준비 중이에요|곧 만나요/i);
  });

  it("Junbee is gone from what students see: the app is Preplit AI and the companion is Juno", () => {
    // Storage names and the server's /junbee route stay, so recordings on a phone and old links keep working.
    const visible = /["'`>][^"'`<]*\bJunbee\b/;
    for (const f of files) expect(text(f), f).not.toMatch(visible);
  });

  it("no access token is ever written to browser storage", () => {
    for (const f of files) expect(text(f), f).not.toMatch(/localStorage\.setItem\([^)]*[Tt]oken/);
  });
});
