import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { ApiError, request } from "@/lib/api";
import { formatDate, formatDuration, formatMinuteRange } from "@/lib/format";
import { useCopy, useLang } from "@/lib/lang";
import type { LectureDetail } from "@/lib/types";
import { AskJuno } from "@/workspace/kit";
import { JunoSlot } from "./JunoSlot";
import { CourseMark, LectureTimeline, NoteFlow } from "./parts";
import { keys, useJunoMessage, useLecture } from "./queries";
import { AppTitle, ErrorLine, LoadingLine, Marked } from "./ui";

/** Models sometimes leave markdown emphasis or list markers in plain strings. */
const plain = (s: string) => s.replace(/\*\*(.+?)\*\*/g, "$1").replace(/^\s*[-•]\s+/, "");

const COPY = {
  ko: {
    lecture: "강의",
    notFound: "이 강의를 찾을 수 없어요.",
    notFoundSub: "지워졌거나, 노트를 만들지 못한 강의일 수 있어요.",
    back: "배움",
    recorded: (d: string) => `${d} 녹음`,
    transcriptSource: "녹취록",
    cards: (n: number) => `카드 ${n}장`,
    ask: "이 강의 묻기",
    askQ: "이 강의 요약해 줘",
    making: "Juno가 노트를 만드는 중이에요.",
    makingSub: "이 페이지를 닫아도 계속돼요. 끝나면 배움에서 Juno가 알려 줘요.",
    flagged: "시험에 나온다고 한 부분",
    noFlags: "교수님이 시험을 언급한 부분을 찾지 못했어요.",
    lectureCards: (n: number) => `이 강의의 카드 ${n}장`,
    open: "펼치기",
    close: "접기",
    transcript: "녹취록",
    unclear: (r: string) => `${r} 구간은 잘 안 들려서 [불명확]으로 남겼어요.`,
    deleteWarn: (t: string) => `${t}의 노트, 녹취록, 카드가 모두 지워지고 되돌릴 수 없어요.`,
    deleteLecture: "강의 지우기",
    cancel: "취소",
    deleteThis: "이 강의 지우기",
    deleteFailed: "지우지 못했어요.",
  },
  en: {
    lecture: "Lecture",
    notFound: "This lecture can't be found.",
    notFoundSub: "It may have been deleted, or its note couldn't be made.",
    back: "Learn",
    recorded: (d: string) => `${d} recording`,
    transcriptSource: "Transcript",
    cards: (n: number) => `${n} card${n === 1 ? "" : "s"}`,
    ask: "Ask about this lecture",
    askQ: "Summarize this lecture",
    making: "Juno is making the note.",
    makingSub: "It keeps going if you close this page. Juno tells you in Learn when it's done.",
    flagged: "Flagged for the exam",
    noFlags: "No mention of the exam was found in this lecture.",
    lectureCards: (n: number) => `This lecture's ${n} card${n === 1 ? "" : "s"}`,
    open: "Show",
    close: "Hide",
    transcript: "Transcript",
    unclear: (r: string) => `${r} could not be heard well and is marked [unclear].`,
    deleteWarn: (t: string) => `The note, transcript and cards of ${t} will all be deleted, and this can't be undone.`,
    deleteLecture: "Delete lecture",
    cancel: "Cancel",
    deleteThis: "Delete this lecture",
    deleteFailed: "Couldn't delete.",
  },
};

export default function LectureNote() {
  const { id = "" } = useParams();
  const lecture = useLecture(id);
  const t = useCopy(COPY);
  const { lang } = useLang();
  const juno = useJunoMessage(lecture.data?.status === "processing");

  if (lecture.isLoading) return <LoadingLine />;
  if (lecture.error || !lecture.data) {
    return (
      <div className="py-10">
        <AppTitle>{t.lecture}</AppTitle>
        <p className="text-base font-semibold">{t.notFound}</p>
        <p className="mt-1 text-sm text-slate">{t.notFoundSub}</p>
        <BackLink />
      </div>
    );
  }

  const l = lecture.data;
  return (
    <article>
      <AppTitle>{l.notes?.title || l.title}</AppTitle>
      <BackLink />

      <header className="mt-1 flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b border-rule pb-5">
        <div className="min-w-0 max-w-[46rem]">
          <p className="flex items-center gap-2 text-xs text-slate">
            <CourseMark name={l.courseName} id={l.courseId} size="sm" />
            <Link to={`/workspace/courses/${l.courseId}`} className="underline decoration-rule-strong underline-offset-4 hover:text-ink hover:decoration-ink">{l.courseName}</Link>
            <span aria-hidden="true">/</span> <span className="min-w-0 truncate">{l.title}</span>
          </p>
          <h1 className="display mt-2 text-[1.625rem] leading-tight sm:text-[1.875rem]">{l.notes?.title || l.title}</h1>
          {l.status === "ready" ? (
            <p className="mt-1 text-xs text-slate">
              {l.durationSeconds ? `${t.recorded(formatDuration(l.durationSeconds, lang))} · ` : l.source === "text" ? `${t.transcriptSource} · ` : ""}
              {t.cards(l.cardCount)} · {formatDate(l.createdAt, lang)}
            </p>
          ) : null}
        </div>
        {l.status === "ready" ? <AskJuno question={t.askQ}>{t.ask}</AskJuno> : null}
      </header>

      <JunoSlot message={juno.data} onlyFor={l.id} className="mt-5 max-w-[46rem]" />

      {l.status === "processing" ? (
        <div className="window mt-5 max-w-[46rem] px-5 py-6" aria-live="polite">
          <p className="text-base font-semibold">{t.making}</p>
          <p className="mt-1 text-sm leading-relaxed text-slate">{t.makingSub}</p>
          <NoteFlow live className="mt-5 max-w-sm" />
        </div>
      ) : l.notes ? (
        <NoteBody lecture={l} />
      ) : null}

      <DeleteLecture id={l.id} title={l.title} />
    </article>
  );
}

function BackLink() {
  const t = useCopy(COPY);
  return (
    <Link to="/app/learn" className="inline-flex min-h-[28px] items-center gap-1 text-xs font-medium text-slate transition-colors hover:text-ink">
      <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
      {t.back}
    </Link>
  );
}

function NoteBody({ lecture: l }: { lecture: LectureDetail }) {
  const t = useCopy(COPY);
  const { lang } = useLang();
  const notes = l.notes!;
  return (
    <>
      {notes.summary ? <p className="mt-5 max-w-[46rem] text-base leading-relaxed text-ink">{plain(notes.summary)}</p> : null}

      <div className="mt-5">
        <LectureTimeline duration={l.durationSeconds} flagged={notes.flagged} unclear={l.unclearRanges} />
      </div>

      <div className="note-grid mt-7">
        <aside className="note-grid__aside">
          <section className="window p-4 lg:sticky lg:top-6" aria-labelledby="flagged">
            <h2 id="flagged" className="flex items-center gap-2 text-sm font-semibold">
              <span className="h-3.5 w-1 rounded-full bg-gold-deep" aria-hidden="true" />
              {t.flagged}
            </h2>
            {notes.flagged.length ? (
              <ul className="mt-2 divide-y divide-rule">
                {notes.flagged.map((f, i) => (
                  <li key={i} className="py-2.5 text-sm leading-relaxed">
                    {f.note ? <p className="font-medium text-ink">{plain(f.note)}</p> : null}
                    {f.quote ? (
                      <p className="text-ink/80">
                        “{plain(f.quote)}”{f.at ? <span className="ml-2 whitespace-nowrap text-xs tabular-nums text-slate">{f.at}</span> : null}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1.5 text-sm text-slate">{t.noFlags}</p>
            )}
          </section>
        </aside>

        <div className="min-w-0">
          {notes.sections.map((s, i) => (
            <section key={i} className={i === 0 ? "" : "mt-7"}>
              <h2 className="text-lg font-semibold leading-snug">{plain(s.heading)}</h2>
              <ul className="mt-2 space-y-1.5">
                {s.points.map((p, j) => (
                  <li key={j} className="relative pl-4 text-base leading-relaxed text-ink before:absolute before:left-0 before:top-[0.65em] before:h-1.5 before:w-1.5 before:rounded-full before:bg-slate-light">
                    <Marked text={plain(p)} />
                  </li>
                ))}
              </ul>
            </section>
          ))}

          {l.cards.length ? (
            <details className="group mt-9 border-t border-rule pt-4">
              <summary className="flex min-h-[36px] cursor-pointer list-none items-center justify-between text-base font-semibold">
                {t.lectureCards(l.cards.length)}
                <span className="text-xs font-normal text-slate group-open:hidden">{t.open}</span>
                <span className="hidden text-xs font-normal text-slate group-open:inline">{t.close}</span>
              </summary>
              <ol className="mt-2 divide-y divide-rule">
                {l.cards.map((c) => (
                  <li key={c.id} className="py-3 text-sm">
                    <p className="font-medium">{c.front}</p>
                    <p className="mt-0.5 leading-relaxed text-ink/75">{c.back}</p>
                  </li>
                ))}
              </ol>
            </details>
          ) : null}

          {l.transcript ? (
            <details className="group mt-4 border-t border-rule pt-4">
              <summary className="flex min-h-[36px] cursor-pointer list-none items-center justify-between text-base font-semibold">
                {t.transcript}
                <span className="text-xs font-normal text-slate group-open:hidden">{t.open}</span>
                <span className="hidden text-xs font-normal text-slate group-open:inline">{t.close}</span>
              </summary>
              {l.unclearRanges.length ? <p className="mt-2 text-xs leading-relaxed text-slate">{t.unclear(l.unclearRanges.map((r) => formatMinuteRange(r, lang)).join(", "))}</p> : null}
              <div className="mt-3 space-y-1 text-sm leading-relaxed">
                {l.transcript.split("\n").map((line, i) => {
                  const m = line.match(/^\[(\d{2}:\d{2})\]\s?(.*)$/);
                  return (
                    <p key={i} className="flex gap-3">
                      {m ? <span className="w-11 shrink-0 tabular-nums text-slate">{m[1]}</span> : null}
                      <span><Marked text={m ? m[2] : line} /></span>
                    </p>
                  );
                })}
              </div>
            </details>
          ) : null}
        </div>
      </div>
    </>
  );
}

function DeleteLecture({ id, title }: { id: string; title: string }) {
  const client = useQueryClient();
  const navigate = useNavigate();
  const t = useCopy(COPY);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remove = async () => {
    try {
      await request(`/lectures/${id}`, { method: "DELETE" });
      client.removeQueries({ queryKey: keys.lecture(id) });
      await Promise.all([
        client.invalidateQueries({ queryKey: keys.lectures }),
        client.invalidateQueries({ queryKey: keys.review }),
        client.invalidateQueries({ queryKey: keys.juno }),
        client.invalidateQueries({ queryKey: keys.courses }),
      ]);
      navigate("/app/learn", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t.deleteFailed);
    }
  };

  return (
    <div className="mt-12 max-w-[46rem] border-t border-rule pt-4">
      {confirming ? (
        <div>
          <p className="text-sm leading-relaxed">{t.deleteWarn(title)}</p>
          <div className="mt-3 flex gap-3">
            <button type="button" onClick={remove} className="btn-quiet border-maroon text-maroon">{t.deleteLecture}</button>
            <button type="button" onClick={() => setConfirming(false)} className="btn-text">{t.cancel}</button>
          </div>
          <div className="mt-2"><ErrorLine>{error}</ErrorLine></div>
        </div>
      ) : (
        <button type="button" onClick={() => setConfirming(true)} className="btn-text text-slate">{t.deleteThis}</button>
      )}
    </div>
  );
}
