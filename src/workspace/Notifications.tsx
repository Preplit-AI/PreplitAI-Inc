import { useEffect, useState } from "react";
import { JunoAvatar } from "@/brand/Juno";
import { ErrorLine } from "@/app/ui";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/cn";
import { useLang } from "@/lib/lang";
import { disablePush, enablePush, pushState, type PushState } from "@/lib/push";

const DISMISSED = "junbee-notification-prompt-dismissed";

function usePushState() {
  const [state, setState] = useState<PushState | null>(null);
  useEffect(() => {
    let alive = true;
    pushState()
      .then((next) => {
        if (alive) setState(next);
      })
      .catch(() => {
        if (alive) setState("unavailable");
      });
    return () => {
      alive = false;
    };
  }, []);
  return [state, setState] as const;
}

/** Asked once, on the semester screen. Saying no is remembered and not asked again. */
export function NotificationPrompt({ className }: { className?: string }) {
  const en = useLang().lang === "en";
  const [state, setState] = usePushState();
  const [hidden, setHidden] = useState(() => localStorage.getItem(DISMISSED) === "1");
  const [error, setError] = useState<string | null>(null);

  if (hidden || state !== "off") return null;

  const dismiss = () => {
    localStorage.setItem(DISMISSED, "1");
    setHidden(true);
  };

  const turnOn = async () => {
    setError(null);
    try {
      setState(await enablePush());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : en ? "Couldn't turn on notifications." : "알림을 켜지 못했어요.");
    }
  };

  return (
    <div className={cn("window flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3", className)}>
      <JunoAvatar size={28} />
      <p className="min-w-0 flex-1 basis-64 text-sm leading-relaxed">{en ? "Should Juno let you know on your phone on class days, when a note is ready and when an exam is close?" : "수업 날, 노트가 끝났을 때, 시험이 다가올 때 Juno가 휴대폰으로 알려 드릴까요?"}</p>
      <div className="flex items-center gap-3">
        <button type="button" onClick={turnOn} className="btn-ink">{en ? "Turn on" : "알림 켜기"}</button>
        <button type="button" onClick={dismiss} className="btn-text text-slate">{en ? "No thanks" : "괜찮아요"}</button>
      </div>
      {error ? <div className="w-full"><ErrorLine>{error}</ErrorLine></div> : null}
    </div>
  );
}

const STATE_TEXT: Record<"ko" | "en", Partial<Record<PushState, string>>> = {
  ko: {
    "needs-install": "아이폰은 사파리 공유 버튼에서 홈 화면에 추가한 뒤에 알림을 켤 수 있어요.",
    denied: "브라우저에서 알림을 막아 두었어요. 브라우저 설정에서 허용해 주세요.",
    unavailable: "이 기기에서는 지금 알림을 켤 수 없어요.",
  },
  en: {
    "needs-install": "On an iPhone, add Preplit AI to the home screen from Safari's share button first, then turn notifications on.",
    denied: "Notifications are blocked in your browser. Allow them in the browser's settings.",
    unavailable: "Notifications can't be turned on on this device right now.",
  },
};

/** The switch in account settings. */
export function NotificationSettings() {
  const { lang } = useLang();
  const en = lang === "en";
  const [state, setState] = usePushState();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const change = async (next: "on" | "off") => {
    setBusy(true);
    setError(null);
    try {
      if (next === "on") setState(await enablePush());
      else {
        await disablePush();
        setState("off");
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : en ? "Couldn't change it." : "바꾸지 못했어요.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="window mt-3 p-4 sm:p-5">
      <h2 className="text-sm font-semibold">{en ? "Notifications" : "알림"}</h2>
      <p className="mt-0.5 text-xs leading-relaxed text-slate">{en ? "On the morning of a class, when a note is ready, before an exam and when cards are left that day. Never at night." : "수업 날 아침, 노트가 끝났을 때, 시험 전, 그날 카드가 남았을 때 알려 드려요. 밤에는 보내지 않아요."}</p>
      {state === "on" || state === "off" ? (
        <button type="button" disabled={busy} onClick={() => change(state === "on" ? "off" : "on")} className="btn-ink mt-3">
          {state === "on" ? (en ? "Turn off" : "알림 끄기") : en ? "Turn on" : "알림 켜기"}
        </button>
      ) : state ? (
        <p className="mt-2 text-sm leading-relaxed text-ink">{STATE_TEXT[lang][state]}</p>
      ) : null}
      <div className="mt-2"><ErrorLine>{error}</ErrorLine></div>
    </div>
  );
}
