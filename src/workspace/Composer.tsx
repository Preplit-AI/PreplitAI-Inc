import { useEffect, useRef, type KeyboardEvent } from "react";
import { ArrowUp, Square } from "lucide-react";
import { cn } from "@/lib/cn";
import { useLang } from "@/lib/lang";

const MAX_CHARS = 4000;

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onStop: () => void;
  busy: boolean;
  /** Which lectures this question will look through. */
  scope: string;
  autoFocus?: boolean;
  /** Changes each time the student opens Juno, so the box takes focus again. */
  focusKey?: number;
};

/** The question box on Juno's dark panel. */
export function Composer({ value, onChange, onSend, onStop, busy, scope, autoFocus, focusKey }: Props) {
  const box = useRef<HTMLTextAreaElement>(null);
  const en = useLang().lang === "en";

  // Grows with what is typed, up to the limit set in its class.
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  useEffect(() => {
    if (autoFocus) box.current?.focus();
  }, [autoFocus, focusKey]);

  const canSend = !busy && value.trim().length > 0;

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // While a Korean syllable is being composed, Enter confirms the syllable.
    // Sending then would post the question with its last character cut off.
    if (e.nativeEvent.isComposing || e.keyCode === 229) return;
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (canSend) onSend();
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (canSend) onSend();
      }}
      className="rounded-[22px] border border-night-line bg-night-2 transition-colors focus-within:border-night-muted"
    >
      <label htmlFor="question" className="sr-only">{en ? "Your question for Juno" : "Juno에게 물을 내용"}</label>
      <textarea
        id="question"
        ref={box}
        rows={1}
        value={value}
        maxLength={MAX_CHARS}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={en ? "Ask Juno about your lectures" : "Juno에게 강의에 관해 물어보세요"}
        className="block max-h-[12.5rem] w-full resize-none bg-transparent px-4 pb-1 pt-3 text-sm leading-relaxed text-white placeholder:text-night-muted focus:outline-none focus-visible:outline-none"
      />
      <div className="flex items-center justify-between gap-3 pb-2 pl-4 pr-2">
        <p className="min-w-0 truncate text-xs text-night-muted">{scope}</p>
        <button
          type={busy ? "button" : "submit"}
          onClick={busy ? onStop : undefined}
          disabled={!busy && !canSend}
          aria-label={busy ? (en ? "Stop the answer" : "답변 멈추기") : en ? "Send" : "보내기"}
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-ink transition-colors duration-150 hover:bg-bone",
            "disabled:cursor-not-allowed disabled:bg-night-3 disabled:text-night-muted",
          )}
        >
          {busy ? <Square className="h-3.5 w-3.5 fill-current" aria-hidden="true" /> : <ArrowUp className="h-[18px] w-[18px]" aria-hidden="true" />}
        </button>
      </div>
    </form>
  );
}
