import fs from "node:fs";
import path from "node:path";
import { render, screen } from "@testing-library/react";
import { Comb } from "@/brand/Comb";
import { junbeeText } from "@/brand/JunbeeMessage";
import { formatRanges } from "@/lib/format";

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

describe("Junbee says exactly three things", () => {
  const base = { lectureId: "x", lectureTitle: "9주차", source: "audio" as const };

  it("notes are ready: a fact and a count, no praise", () => {
    expect(junbeeText({ ...base, kind: "ready", cardCount: 8, unclearRanges: [] })).toBe("9주차 노트 정리했어요. 카드 8장.");
  });

  it("part of the audio was unusable: says which minutes, and that it did not guess", () => {
    const text = junbeeText({ ...base, kind: "unclear", cardCount: 8, unclearRanges: [{ start: 720, end: 840 }] });
    expect(text).toBe("9주차 노트 정리했어요. 카드 8장. 12~14분은 잘 안 들려서 [불명확]으로 두었어요 — 추측해서 채우지 않았습니다.");
  });

  it("nothing could be produced: says nothing was saved", () => {
    expect(junbeeText({ ...base, kind: "failed", cardCount: 0, unclearRanges: [] })).toBe(
      "‘9주차’ 녹음은 노트로 만들지 못했어요. 저장된 건 없습니다.",
    );
  });

  it("never celebrates", () => {
    const all = [
      junbeeText({ ...base, kind: "ready", cardCount: 3, unclearRanges: [] }),
      junbeeText({ ...base, kind: "unclear", cardCount: 3, unclearRanges: [{ start: 0, end: 60 }] }),
      junbeeText({ ...base, kind: "failed", cardCount: 0, unclearRanges: [] }),
    ].join(" ");
    expect(all).not.toMatch(/[!]|잘했|축하|대단|훌륭/);
  });
});

describe("the comb", () => {
  it("draws one cell per card and fills only what was done", () => {
    const { container } = render(<Comb total={5} filled={3} label="오늘 카드 5장 중 3장 복습함" />);
    expect(screen.getByRole("img", { name: "오늘 카드 5장 중 3장 복습함" })).toBeInTheDocument();
    const cells = container.querySelectorAll("polygon");
    expect(cells).toHaveLength(5);
    expect(container.querySelectorAll("polygon.fill-maroon")).toHaveLength(3);
  });

  it("draws nothing when there is nothing to do", () => {
    const { container } = render(<Comb total={0} filled={0} label="없음" />);
    expect(container.querySelector("svg")).toBeNull();
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

  it("no app screen hardcodes a percentage", () => {
    for (const f of files.filter((f) => f.includes(`${path.sep}app${path.sep}`))) {
      expect(text(f), f).not.toMatch(/\b\d{1,3}(\.\d+)?%/);
    }
  });

  it("the app's navigation is Learn and Remember and nothing else", () => {
    const layout = text(path.join(SRC, "app", "AppLayout.tsx")).replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, "");
    const tabs = [...layout.matchAll(/<Tab to="([^"]+)">([^<]+)<\/Tab>/g)].map((m) => m[2]);
    expect(tabs).toEqual(["배움", "기억"]);
    expect(layout).not.toMatch(/정리|쌓기|Organize|Build/);
  });

  it("no access token is ever written to browser storage", () => {
    for (const f of files) expect(text(f), f).not.toMatch(/localStorage\.setItem\([^)]*[Tt]oken/);
  });
});
