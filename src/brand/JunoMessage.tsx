import { X } from "lucide-react";
import { JunoAvatar } from "./Juno";
import { cn } from "@/lib/cn";
import { formatRanges } from "@/lib/format";
import { useLang, type Lang } from "@/lib/lang";
import type { LectureMessage } from "@/lib/types";

/*
 * What Juno says about a lecture. Four parts, in order, every time: the avatar,
 * the name, what it did, and what it could not do. There are exactly three
 * messages (pilot plan, "the bot"), with no praise, no nudge and no fourth case:
 * the switch below is exhaustive over a three-member type.
 */
export function junoText(message: LectureMessage, lang: Lang = "ko"): string {
  if (lang === "en") {
    switch (message.kind) {
      case "ready":
        return `${message.lectureTitle}: notes are ready. ${message.cardCount} cards.`;
      case "unclear":
        return (
          `${message.lectureTitle}: notes are ready. ${message.cardCount} cards. ` +
          `${formatRanges(message.unclearRanges, "en")} could not be heard well, so it is marked [unclear] — nothing was guessed.`
        );
      case "failed":
        return `The ${message.source === "audio" ? "recording" : "transcript"} ‘${message.lectureTitle}’ could not be made into a note. Nothing was saved.`;
    }
  }
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
  message?: LectureMessage;
  onDismiss?: () => void;
  dismissLabel?: string;
  className?: string;
};

export function JunoMessage({ text, message, onDismiss, dismissLabel, className }: Props) {
  const { lang } = useLang();
  const body = message ? junoText(message, lang) : text;
  return (
    <div role={message ? "status" : undefined} className={cn("flex items-start gap-3 rounded-xl border border-rule bg-white px-4 py-3", className)}>
      <JunoAvatar size={30} mood={message?.kind === "ready" ? "found" : undefined} className="mt-0.5" />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold leading-tight text-ink">Juno</p>
        <p className="mt-0.5 text-sm leading-relaxed text-ink">{body}</p>
      </div>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          aria-label={dismissLabel ?? (lang === "en" ? "Dismiss" : "닫기")}
          className="-mr-1.5 -mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate hover:bg-bone hover:text-ink"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}
