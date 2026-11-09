import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Mic, Square } from "lucide-react";
import { JunoAvatar } from "@/brand/Juno";
import { CourseMark } from "@/app/parts";
import { Dialog, ErrorLine } from "@/app/ui";
import { cn } from "@/lib/cn";
import { useCopy } from "@/lib/lang";
import { useSemester } from "../queries";
import { useRecorder } from "./Recorder";

/**
 * Everything about recording that shows on screen: the course picker, the bar
 * in class (Juno listening along), and what is left over on the device.
 */

const COPY = {
  ko: {
    record: "수업 녹음 시작",
    title: "수업 녹음",
    noCourses: "녹음은 과목별로 모여요. 과목을 먼저 추가해 주세요.",
    toSemester: "이번 학기로",
    which: "어떤 수업이에요?",
    today: "오늘 수업",
    tips: ["수업이 끝나면 수업 끝을 누르세요. 노트는 Juno가 이 과목에 정리해요.", "녹음은 교수님이 허락한 수업에서만 해 주세요.", "녹음하는 동안 이 화면을 켜 두세요. 휴대폰은 화면이 꺼지면 녹음이 멈출 수 있어요."],
    starting: "마이크를 켜는 중이에요",
    start: "녹음 시작",
    unsupported: "이 브라우저는 녹음을 지원하지 않아요. 크롬이나 사파리 최신 버전에서 열어 주세요.",
    warnings: {
      silent: "소리가 들어오지 않아요. 마이크를 확인해 주세요.",
      paused: "화면이 꺼진 동안 녹음이 멈췄을 수 있어요. 지금은 다시 녹음하고 있어요.",
      storage: "이 기기에 저장하지 못하고 있어요. 수업이 끝날 때까지 창을 닫지 마세요.",
    },
    uploading: (p: number) => `녹음을 올리는 중이에요 ${p}%`,
    finishing: "녹음을 마무리하는 중이에요.",
    recording: (c: string) => `${c} 녹음 중`,
    listening: "Juno가 같이 듣고 있어요. 수업이 끝날 때까지 이 화면을 켜 두세요.",
    discardAsk: "이 녹음을 버릴까요?",
    discard: "버리기",
    keep: "계속 녹음",
    end: "수업 끝",
    failed: (c: string, m: number) => `${c} 녹음으로 노트를 만들지 못했어요. ${m}분 녹음은 이 기기에 남아 있어요.`,
    interrupted: (c: string, m: number) => `${c} 녹음이 중간에 끊겼어요. ${m}분까지는 이 기기에 저장돼 있어요.`,
    waiting: (c: string, m: number) => `${c} 녹음을 아직 올리지 못했어요. ${m}분 녹음은 이 기기에 저장돼 있어요.`,
    cantUndo: "지우면 되돌릴 수 없어요.",
    deleteRec: "녹음 지우기",
    cancel: "취소",
    remake: "다시 만들기",
    make: "노트 만들기",
    remove: "지우기",
  },
  en: {
    record: "Record a class",
    title: "Record a class",
    noCourses: "Recordings are filed by course. Add a course first.",
    toSemester: "Go to This semester",
    which: "Which class is it?",
    today: "Class today",
    tips: ["Press End class when it's over. Juno files the note under this course.", "Only record classes your professor has allowed.", "Keep this screen on while recording. A phone can stop recording when its screen turns off."],
    starting: "Turning on the microphone",
    start: "Start recording",
    unsupported: "This browser can't record. Open Preplit AI in a recent Chrome or Safari.",
    warnings: {
      silent: "No sound is coming in. Check the microphone.",
      paused: "Recording may have paused while the screen was off. It's recording again now.",
      storage: "Can't save to this device. Keep the window open until class ends.",
    },
    uploading: (p: number) => `Uploading the recording ${p}%`,
    finishing: "Finishing the recording.",
    recording: (c: string) => `Recording ${c}`,
    listening: "Juno is listening along. Keep this screen on until class ends.",
    discardAsk: "Discard this recording?",
    discard: "Discard",
    keep: "Keep recording",
    end: "End class",
    failed: (c: string, m: number) => `The ${c} recording couldn't be made into a note. ${m} min of audio is still on this device.`,
    interrupted: (c: string, m: number) => `The ${c} recording was cut off. ${m} min is saved on this device.`,
    waiting: (c: string, m: number) => `The ${c} recording hasn't been uploaded yet. ${m} min is saved on this device.`,
    cantUndo: "This can't be undone.",
    deleteRec: "Delete recording",
    cancel: "Cancel",
    remake: "Try again",
    make: "Make the note",
    remove: "Delete",
  },
};

export const formatElapsed = (ms: number) => {
  const total = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return hours ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`;
};

/** The button for the one action a student takes in class. */
export function RecordButton({ courseId, className, label }: { courseId?: string; className?: string; label?: string }) {
  const { openDialog, phase } = useRecorder();
  const t = useCopy(COPY);
  if (phase === "recording" || phase === "finishing") return null;
  return (
    <button type="button" onClick={() => openDialog(courseId ?? null)} className={cn("btn-ink", className)}>
      <span className="h-2 w-2 shrink-0 rounded-full bg-maroon ring-2 ring-white/90" aria-hidden="true" />
      {label ?? t.record}
    </button>
  );
}

export function RecordDialog() {
  const { dialogCourseId, closeDialog, start, phase, error, supported } = useRecorder();
  const t = useCopy(COPY);
  const open = dialogCourseId !== undefined;
  const semester = useSemester();
  const courses = semester.data?.courses ?? [];
  const ordered = [...courses].sort((a, b) => Number(b.classToday && !b.recordedToday) - Number(a.classToday && !a.recordedToday));
  const [chosen, setChosen] = useState<string | null>(null);

  useEffect(() => {
    if (open) setChosen(dialogCourseId ?? null);
  }, [open, dialogCourseId]);

  const selected = courses.find((c) => c.id === chosen) ?? ordered[0];

  return (
    <Dialog open={open} onClose={closeDialog} title={t.title}>
      {!courses.length ? (
        <>
          <p className="text-sm leading-relaxed text-ink">{t.noCourses}</p>
          <Link to="/workspace" onClick={closeDialog} className="btn-ink mt-4 w-full">{t.toSemester}</Link>
        </>
      ) : (
        <div className="flex flex-col gap-4">
          <fieldset>
            <legend className="field-label">{t.which}</legend>
            <div className="flex flex-col gap-1.5">
              {ordered.map((course) => (
                <label
                  key={course.id}
                  className={cn(
                    "flex min-h-[44px] cursor-pointer items-center gap-3 rounded-xl border px-3 transition-colors",
                    selected?.id === course.id ? "border-ink bg-white" : "border-rule hover:border-rule-strong",
                  )}
                >
                  <input type="radio" name="record-course" className="sr-only" checked={selected?.id === course.id} onChange={() => setChosen(course.id)} />
                  <CourseMark name={course.name} id={course.id} size="sm" />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{course.name}</span>
                  {course.classToday ? <span className="shrink-0 rounded-full bg-maroon-tint px-2 py-0.5 text-2xs font-medium text-maroon">{t.today}</span> : null}
                  <span className={cn("h-4 w-4 shrink-0 rounded-full border-2", selected?.id === course.id ? "border-ink bg-ink shadow-[inset_0_0_0_2.5px_white]" : "border-rule-strong")} aria-hidden="true" />
                </label>
              ))}
            </div>
          </fieldset>

          <div className="flex items-start gap-3 rounded-xl bg-bone p-3">
            <JunoAvatar size={26} />
            <ul className="space-y-1 text-xs leading-relaxed text-ink">
              {t.tips.map((tip, i) => <li key={tip} className={i ? "text-slate" : undefined}>{tip}</li>)}
            </ul>
          </div>

          <ErrorLine>{error}</ErrorLine>
          {supported ? (
            <button type="button" disabled={phase !== "idle" || !selected} onClick={() => selected && start(selected.id, selected.name)} className="btn-record min-h-[44px]">
              <Mic className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
              {phase === "starting" ? t.starting : t.start}
            </button>
          ) : (
            <p className="text-sm leading-relaxed text-ink">{t.unsupported}</p>
          )}
        </div>
      )}
    </Dialog>
  );
}

/** The dark band at the top of every screen while a class is being recorded. */
function Band({ children, role }: { children: ReactNode; role?: string }) {
  return (
    <div className="sticky top-12 z-20 lg:top-0" role={role}>
      <div className="on-night border-b border-night-line bg-night text-night-text">{children}</div>
    </div>
  );
}

const ROW = "mx-auto flex w-full max-w-[74rem] flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2 sm:px-6 lg:px-8";

/** Shown on every screen while recording, so the student can look at notes and still see it is running. */
export function RecordingBar() {
  const { phase, live, progress, warning, finish, discardLive, readLevel } = useRecorder();
  const t = useCopy(COPY);
  const [now, setNow] = useState(Date.now());
  const [level, setLevel] = useState(0);
  const [discarding, setDiscarding] = useState(false);

  useEffect(() => {
    if (phase !== "recording") {
      setDiscarding(false);
      return;
    }
    const timer = window.setInterval(() => {
      setNow(Date.now());
      setLevel(readLevel());
    }, 250);
    return () => window.clearInterval(timer);
  }, [phase, readLevel]);

  if (phase === "uploading") {
    const percent = Math.round(progress * 100);
    return (
      <Band role="status">
        <div className={ROW}>
          <JunoAvatar size={26} tone="night" speaking />
          <p className="shrink-0 text-sm font-medium text-white">{t.uploading(percent)}</p>
          <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-night-3" aria-hidden="true">
            <div className="h-full rounded-full bg-gold transition-[width] duration-200" style={{ width: `${percent}%` }} />
          </div>
        </div>
      </Band>
    );
  }
  if (phase === "finishing") {
    return (
      <Band role="status">
        <div className={ROW}>
          <JunoAvatar size={26} tone="night" speaking />
          <p className="text-sm font-medium text-white">{t.finishing}</p>
        </div>
      </Band>
    );
  }
  if (phase !== "recording" || !live) return null;

  return (
    <Band>
      <div className={ROW}>
        <JunoAvatar size={28} tone="night" speaking mood="listen" />
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-medium text-white">
            <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-maroon opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#ff3b4e]" />
            </span>
            <span className="truncate">{t.recording(live.courseName)}</span>
          </p>
          <p className="hidden text-2xs text-night-muted sm:block">{t.listening}</p>
        </div>
        <p className="text-sm tabular-nums text-white" role="timer">{formatElapsed(now - live.startedAt)}</p>
        <div className="flex h-3.5 items-end gap-0.5" aria-hidden="true">
          {[0.12, 0.28, 0.46, 0.66, 0.86].map((step) => (
            <span key={step} className={cn("w-1 rounded-sm transition-colors", level >= step ? "bg-gold" : "bg-night-line")} style={{ height: `${step * 100 + 14}%` }} />
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          {discarding ? (
            <>
              <span className="text-xs text-night-muted">{t.discardAsk}</span>
              <button type="button" onClick={discardLive} className="min-h-[32px] px-2 text-xs font-medium text-[#ff8a96] underline underline-offset-4">{t.discard}</button>
              <button type="button" onClick={() => setDiscarding(false)} className="min-h-[32px] px-2 text-xs font-medium text-white underline underline-offset-4">{t.keep}</button>
            </>
          ) : (
            <>
              <button type="button" onClick={() => setDiscarding(true)} className="hidden min-h-[32px] px-2 text-xs text-night-muted hover:text-white sm:inline-flex sm:items-center">{t.discard}</button>
              <button type="button" onClick={finish} className="btn-record min-h-[34px] px-4">
                <Square className="h-3 w-3 fill-current" aria-hidden="true" />
                {t.end}
              </button>
            </>
          )}
        </div>
      </div>
      {warning ? <p role="alert" className="mx-auto max-w-[74rem] px-4 pb-2 text-xs font-medium text-gold sm:px-6 lg:px-8">{t.warnings[warning]}</p> : null}
    </Band>
  );
}

/** Recordings on this device that still need something. Nothing here is ever lost silently. */
export function RecordingNotices({ className }: { className?: string }) {
  const { recordings, upload, discard, phase, error } = useRecorder();
  const t = useCopy(COPY);
  const [confirming, setConfirming] = useState<string | null>(null);
  const waiting = recordings.filter((r) => r.status === "stopped" || r.status === "failed");
  if (!waiting.length && !(error && phase === "idle")) return null;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {waiting.map((recording) => {
        const minutes = Math.max(1, Math.round(recording.durationMs / 60000));
        const text = recording.status === "failed" ? t.failed(recording.courseName, minutes) : recording.interrupted ? t.interrupted(recording.courseName, minutes) : t.waiting(recording.courseName, minutes);
        return (
          <div key={recording.id} className="window flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3" role="status">
            <JunoAvatar size={28} />
            <p className="min-w-0 flex-1 basis-64 text-sm leading-relaxed">
              {text}
              {recording.error ? <span className="block text-xs text-slate">{recording.error}</span> : null}
            </p>
            {confirming === recording.id ? (
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate">{t.cantUndo}</span>
                <button type="button" onClick={() => discard(recording.id)} className="btn-text text-maroon">{t.deleteRec}</button>
                <button type="button" onClick={() => setConfirming(null)} className="btn-text">{t.cancel}</button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button type="button" disabled={phase !== "idle"} onClick={() => upload(recording.id)} className="btn-ink">{recording.status === "failed" ? t.remake : t.make}</button>
                <button type="button" onClick={() => setConfirming(recording.id)} className="btn-text text-slate">{t.remove}</button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
