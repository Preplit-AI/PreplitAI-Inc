import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { ApiError, request } from "@/lib/api";
import { formatDate, formatDuration, formatMinuteRange } from "@/lib/format";
import type { LectureDetail } from "@/lib/types";
import { JunbeeSlot } from "./JunbeeSlot";
import { keys, useJunbee, useLecture } from "./queries";
import { AppTitle, ErrorLine, LoadingLine } from "./ui";

/** Models sometimes leave markdown emphasis or list markers in plain strings. */
const plain = (s: string) => s.replace(/\*\*(.+?)\*\*/g, "$1").replace(/^\s*[-•]\s+/, "");

export default function LectureNote() {
  const { id = "" } = useParams();
  const lecture = useLecture(id);
  const junbee = useJunbee(lecture.data?.status === "processing");

  if (lecture.isLoading) return <LoadingLine />;
  if (lecture.error || !lecture.data) {
    return (
      <div className="py-10">
        <AppTitle>강의</AppTitle>
        <p className="text-lg font-semibold">이 강의를 찾을 수 없어요.</p>
        <p className="mt-2 text-slate">지워졌거나, 노트를 만들지 못한 강의일 수 있어요.</p>
        <BackLink />
      </div>
    );
  }

  const l = lecture.data;
  return (
    <article className="mx-auto max-w-read">
      <AppTitle>{l.notes?.title || l.title}</AppTitle>
      <BackLink />

      <header className="mt-6">
        <p className="text-slate">
          {l.courseName} <span aria-hidden="true">/</span> {l.title}
        </p>
        <h1 className="display mt-1 text-[2rem] leading-tight sm:text-4xl">{l.notes?.title || l.title}</h1>
        {l.status === "ready" ? (
          <p className="mt-2 text-sm text-slate">
            {l.durationSeconds ? `${formatDuration(l.durationSeconds)} 녹음 · ` : l.source === "text" ? "녹취록 · " : ""}
            카드 {l.cardCount}장 · {formatDate(l.createdAt)}
          </p>
        ) : null}
      </header>

      <JunbeeSlot message={junbee.data} onlyFor={l.id} className="mt-6" />

      {l.status === "processing" ? (
        <div className="mt-10 border-t border-rule pt-8" aria-live="polite">
          <p className="flex items-center gap-3 text-lg font-semibold">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-honey" aria-hidden="true" />
            노트를 만드는 중이에요.
          </p>
          <p className="mt-2 leading-relaxed text-slate">이 페이지를 닫아도 계속돼요. 끝나면 배움에서 Junbee가 알려 줘요.</p>
        </div>
      ) : l.notes ? (
        <NoteBody lecture={l} />
      ) : null}

      <DeleteLecture id={l.id} title={l.title} />
    </article>
  );
}

function BackLink() {
  return (
    <Link to="/app/learn" className="inline-flex min-h-[44px] items-center gap-1.5 text-sm font-semibold text-slate hover:text-ink">
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      배움
    </Link>
  );
}

function NoteBody({ lecture: l }: { lecture: LectureDetail }) {
  const notes = l.notes!;
  return (
    <>
      {notes.summary ? <p className="mt-8 text-lg leading-relaxed text-ink">{plain(notes.summary)}</p> : null}

      <section className="mt-8 border-l-[3px] border-honey pl-5" aria-labelledby="flagged">
        <h2 id="flagged" className="text-base font-semibold">시험에 나온다고 한 부분</h2>
        {notes.flagged.length ? (
          <ul className="mt-3 space-y-3">
            {notes.flagged.map((f, i) => (
              <li key={i} className="leading-relaxed">
                {f.note ? <p className="font-semibold text-ink">{plain(f.note)}</p> : null}
                {f.quote ? (
                  <p className="text-ink/80">
                    “{plain(f.quote)}”{f.at ? <span className="ml-2 whitespace-nowrap text-sm tabular-nums text-slate">{f.at}</span> : null}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 leading-relaxed text-slate">교수님이 시험을 언급한 부분을 찾지 못했어요.</p>
        )}
      </section>

      {notes.sections.map((s, i) => (
        <section key={i} className="mt-10">
          <h2 className="text-xl font-semibold">{plain(s.heading)}</h2>
          <ul className="mt-3 space-y-2.5">
            {s.points.map((p, j) => (
              <li key={j} className="relative pl-5 leading-relaxed text-ink/90 before:absolute before:left-0 before:top-[0.7em] before:h-1.5 before:w-1.5 before:rounded-full before:bg-slate-light">
                <Marked text={plain(p)} />
              </li>
            ))}
          </ul>
        </section>
      ))}

      {l.cards.length ? (
        <details className="group mt-12 border-t border-rule pt-6">
          <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between text-lg font-semibold">
            이 강의의 카드 {l.cards.length}장
            <span className="text-sm font-normal text-slate group-open:hidden">펼치기</span>
            <span className="hidden text-sm font-normal text-slate group-open:inline">접기</span>
          </summary>
          <ol className="mt-4 divide-y divide-rule">
            {l.cards.map((c) => (
              <li key={c.id} className="py-4">
                <p className="font-semibold">{c.front}</p>
                <p className="mt-1 leading-relaxed text-ink/75">{c.back}</p>
              </li>
            ))}
          </ol>
        </details>
      ) : null}

      {l.transcript ? (
        <details className="group mt-6 border-t border-rule pt-6">
          <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between text-lg font-semibold">
            녹취록
            <span className="text-sm font-normal text-slate group-open:hidden">펼치기</span>
            <span className="hidden text-sm font-normal text-slate group-open:inline">접기</span>
          </summary>
          {l.unclearRanges.length ? (
            <p className="mt-3 text-sm leading-relaxed text-slate">
              {l.unclearRanges.map(formatMinuteRange).join(", ")} 구간은 잘 안 들려서 [불명확]으로 남겼어요.
            </p>
          ) : null}
          <div className="mt-4 space-y-1.5 text-[0.95rem] leading-relaxed">
            {l.transcript.split("\n").map((line, i) => {
              const m = line.match(/^\[(\d{2}:\d{2})\]\s?(.*)$/);
              return (
                <p key={i} className="flex gap-3">
                  {m ? <span className="w-12 shrink-0 tabular-nums text-slate">{m[1]}</span> : null}
                  <span><Marked text={m ? m[2] : line} /></span>
                </p>
              );
            })}
          </div>
        </details>
      ) : null}
    </>
  );
}

/** Shows "[불명확]" as a mark, so the gap is visible rather than read past. */
function Marked({ text }: { text: string }) {
  const parts = text.split(/(\[불명확\])/);
  return (
    <>
      {parts.map((part, i) =>
        part === "[불명확]" ? (
          <mark key={i} className="rounded bg-honey-tint px-1 text-ink">[불명확]</mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

function DeleteLecture({ id, title }: { id: string; title: string }) {
  const client = useQueryClient();
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remove = async () => {
    try {
      await request(`/lectures/${id}`, { method: "DELETE" });
      client.removeQueries({ queryKey: keys.lecture(id) });
      await Promise.all([
        client.invalidateQueries({ queryKey: keys.lectures }),
        client.invalidateQueries({ queryKey: keys.review }),
        client.invalidateQueries({ queryKey: keys.junbee }),
        client.invalidateQueries({ queryKey: keys.courses }),
      ]);
      navigate("/app/learn", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "지우지 못했어요.");
    }
  };

  return (
    <div className="mt-16 border-t border-rule pt-6">
      {confirming ? (
        <div>
          <p className="text-sm leading-relaxed">{title}의 노트, 녹취록, 카드가 모두 지워지고 되돌릴 수 없어요.</p>
          <div className="mt-3 flex gap-3">
            <button type="button" onClick={remove} className="btn-quiet min-h-[44px] border-maroon text-maroon">강의 지우기</button>
            <button type="button" onClick={() => setConfirming(false)} className="btn-text">취소</button>
          </div>
          <div className="mt-3"><ErrorLine>{error}</ErrorLine></div>
        </div>
      ) : (
        <button type="button" onClick={() => setConfirming(true)} className="btn-text text-slate">
          이 강의 지우기
        </button>
      )}
    </div>
  );
}
