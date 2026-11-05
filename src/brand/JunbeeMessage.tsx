import { X } from "lucide-react";
import { Bee } from "./Bee";
import { cn } from "@/lib/cn";
import { formatRanges } from "@/lib/format";
import type { JunbeeMessageData } from "@/lib/types";

/*
 * What Junbee says. Four parts, in order, every time: the avatar, the name,
 * what it did, and what it could not do. In the pilot there are exactly three
 * messages (pilot plan, "Junbee the bot"), in 해요체, with no praise, no nudge
 * and no fourth case: the switch below is exhaustive over a three-member type.
 */
export function junbeeText(message: JunbeeMessageData): string {
  switch (message.kind) {
    case "ready":
      return `${message.lectureTitle} 노트 정리했어요. 카드 ${message.cardCount}장.`;
    case "unclear":
      return (
        `${message.lectureTitle} 노트 정리했어요. 카드 ${message.cardCount}장. ` +
        `${formatRanges(message.unclearRanges)}은 잘 안 들려서 [불명확]으로 두었어요 — 추측해서 채우지 않았습니다.`
      );
    case "failed":
      return `‘${message.lectureTitle}’ ${message.source === "audio" ? "녹음" : "녹취록"}은 노트로 만들지 못했어요. 저장된 건 없습니다.`;
  }
}

type Props = {
  /** Text to show, for the public site's examples. */
  text?: string;
  message?: JunbeeMessageData;
  onDismiss?: () => void;
  dismissLabel?: string;
  className?: string;
};

export function JunbeeMessage({ text, message, onDismiss, dismissLabel = "닫기", className }: Props) {
  const body = message ? junbeeText(message) : text;
  return (
    <div
      role={message ? "status" : undefined}
      className={cn("flex items-start gap-3 rounded-xl border border-rule bg-paper px-4 py-3.5", className)}
    >
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-bone">
        <Bee className="h-[22px] w-auto" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold leading-tight text-ink">Junbee</p>
        <p className="mt-1 font-kr text-[0.95rem] leading-relaxed text-ink">{body}</p>
      </div>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          aria-label={dismissLabel}
          className="-mr-1.5 -mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate hover:bg-bone hover:text-ink"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}
