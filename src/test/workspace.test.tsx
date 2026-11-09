import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { parseChatEvent } from "@/lib/api";
import type { Citation } from "@/lib/types";
import { Answer } from "@/workspace/Answer";
import { citationNumbers, prepareAnswer } from "@/workspace/citations";
import { Composer } from "@/workspace/Composer";

const citation: Citation = {
  label: "S3",
  lectureId: "l1",
  lectureTitle: "9주차",
  courseName: "운영체제",
  kind: "transcript",
  at: "05:20",
  excerpt: "[05:20] 네 가지 조건",
};

describe("citations", () => {
  it("are numbered from 1 in reading order, whatever the model's own labels are", () => {
    expect([...citationNumbers("가 [S3] 나 [S1] 다 [S3]")]).toEqual([["S3", 1], ["S1", 2]]);
  });

  it("accept the other forms real models write", () => {
    expect([...citationNumbers("가 [S2, S5]")]).toEqual([["S2", 1], ["S5", 2]]);
    expect([...citationNumbers("가 [ S2 ]")]).toEqual([["S2", 1]]);
    expect([...citationNumbers("가 【S3】")]).toEqual([["S3", 1]]);
    expect(prepareAnswer("가 [ S2 ]")).toBe("가 [S2](#cite-S2)");
  });

  it("are held back while still arriving, so raw text never flashes up", () => {
    expect(prepareAnswer("조건이에요. [", true)).toBe("조건이에요. ");
    expect(prepareAnswer("조건이에요. [S", true)).toBe("조건이에요. ");
    expect(prepareAnswer("조건이에요. [S1", true)).toBe("조건이에요. ");
    expect(prepareAnswer("조건이에요. [S1, S", true)).toBe("조건이에요. ");
    expect(prepareAnswer("조건이에요. [ S", true)).toBe("조건이에요. ");
    expect(prepareAnswer("조건이에요. [S1]", true)).toBe("조건이에요. [S1](#cite-S1)");
  });

  it("do not show a mark for having no source", () => {
    expect(prepareAnswer("일반적인 설명이에요. [출처 없음]")).toBe("일반적인 설명이에요. ");
  });

  it("leave ordinary brackets alone, including the mark for unclear audio", () => {
    expect(prepareAnswer("[불명확] 부분이에요.")).toBe("[불명확] 부분이에요.");
    expect(prepareAnswer("배열 a[1] 이에요.")).toBe("배열 a[1] 이에요.");
  });
});

describe("an answer on screen", () => {
  it("opens the source when its cell is pressed", () => {
    const onOpen = vi.fn();
    render(<Answer content="네 가지 조건이에요. [S3]" citations={[citation]} onOpenCitation={onOpen} />);
    fireEvent.click(screen.getByRole("button", { name: "출처 1" }));
    expect(onOpen).toHaveBeenCalledWith(citation);
  });

  it("shows a cell that does nothing while the answer is still being written", () => {
    render(<Answer content="네 가지 조건이에요. [S3]" streaming />);
    expect(screen.getByRole("img", { name: "출처 1" })).toBeInTheDocument();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("marks unclear audio", () => {
    render(<Answer content="그 부분은 [불명확]으로 남아 있어요." />);
    expect(screen.getByText("[불명확]").tagName).toBe("MARK");
  });

  it("has no way to send a student off to an address the model wrote", () => {
    const { container } = render(
      <Answer content={"[여기를 누르세요](https://evil.example/?q=secret) https://evil.example ![x](https://evil.example/p.png) <img src=x onerror=alert(1)> <script>alert(1)</script>"} />,
    );
    expect(container.querySelector("a")).toBeNull();
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("script")).toBeNull();
    expect(container.textContent).toContain("여기를 누르세요");
  });
});

describe("the question box", () => {
  function Harness({ onSend }: { onSend: () => void }) {
    const [value, setValue] = useState("교착 상태");
    return <Composer value={value} onChange={setValue} onSend={onSend} onStop={() => {}} busy={false} scope="찾는 범위: 모든 과목" />;
  }

  it("sends on Enter", () => {
    const onSend = vi.fn();
    render(<Harness onSend={onSend} />);
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });
    expect(onSend).toHaveBeenCalledTimes(1);
  });

  it("does not send on the Enter that confirms a Korean syllable", () => {
    const onSend = vi.fn();
    render(<Harness onSend={onSend} />);
    const box = screen.getByRole("textbox");
    fireEvent.keyDown(box, { key: "Enter", isComposing: true });
    fireEvent.keyDown(box, { key: "Process", keyCode: 229 });
    expect(onSend).not.toHaveBeenCalled();
  });

  it("makes a new line on Shift+Enter", () => {
    const onSend = vi.fn();
    render(<Harness onSend={onSend} />);
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter", shiftKey: true });
    expect(onSend).not.toHaveBeenCalled();
  });

  it("offers Stop instead of Send while answering", () => {
    const onStop = vi.fn();
    render(<Composer value="" onChange={() => {}} onSend={() => {}} onStop={onStop} busy scope="범위" />);
    fireEvent.click(screen.getByRole("button", { name: "답변 멈추기" }));
    expect(onStop).toHaveBeenCalledTimes(1);
  });
});

describe("reading the stream", () => {
  it("reads events and skips heartbeats and anything unreadable", () => {
    expect(parseChatEvent('event: delta\ndata: {"text":"안녕"}')).toEqual({ event: "delta", data: { text: "안녕" } });
    expect(parseChatEvent(": ping")).toBeNull();
    expect(parseChatEvent("event: delta\ndata: {broken")).toBeNull();
  });
});
