import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link, useMatch } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowUpRight, PanelRightClose, Trash2, X } from "lucide-react";
import { JunoAvatar } from "@/brand/Juno";
import { useLecture } from "@/app/queries";
import { ErrorLine, Marked } from "@/app/ui";
import { request } from "@/lib/api";
import { cn } from "@/lib/cn";
import { useCopy, useLang } from "@/lib/lang";
import type { ChatMessage, Citation, ConversationSummary } from "@/lib/types";
import { Answer, SourceMark } from "./Answer";
import { citationNumbers } from "./citations";
import { Composer } from "./Composer";
import type { Asked } from "./JunoDock";
import { dayCount, examLabel } from "./junoLine";
import { chatKeys, useConversation, useConversations, useCourseSpace, useSemester } from "./queries";
import { useRecorder } from "./recorder/Recorder";
import { useChat, type Pending } from "./useChat";

/*
 * Asking Juno, from wherever the student is. It already knows the screen: on a
 * note it means that lecture, in a course it means that course. There is one
 * running conversation per course rather than a list of chats to manage.
 *
 * Answers carry the same checks as ever: cited from the student's lectures, or
 * labelled as not. On a laptop the panel is framed like a tablet beside the
 * work; on a phone it is a sheet.
 */

const COPY = {
  ko: {
    tools: {
      search_lectures: "강의에서 찾는 중이에요.",
      get_exam_flags: "시험에 나온다고 한 부분을 모으는 중이에요.",
      get_lecture_notes: "노트를 읽는 중이에요.",
      get_transcript_at: "녹취록을 확인하는 중이에요.",
      list_courses: "과목을 확인하는 중이에요.",
      list_lectures: "강의 목록을 확인하는 중이에요.",
      get_review_status: "오늘의 카드를 세는 중이에요.",
      get_semester_status: "이번 학기를 확인하는 중이에요.",
    } as Record<string, string>,
    thinking: "답을 찾는 중이에요.",
    idle: "내 강의에서 찾아서 답해요",
    lectureScope: (course: string, title: string) => `${course} ${title}를 보는 중`,
    courseScope: (course: string) => `${course}을 보는 중`,
    allScope: "이번 학기 전체",
    suggest: {
      lecture: ["이 강의 요약해 줘", "이 강의에서 시험에 나온다고 한 부분 알려 줘"],
      course: ["시험에 나온다고 한 부분 정리해 줘", "가장 최근 강의 요약해 줘", "녹음이 빠진 주가 있어?"],
      organize: ["녹음이 빠진 주가 있어?", "과목마다 강의가 몇 개야?", "이번 주에 뭐 배웠어?"],
      build: ["다음 시험까지 뭘 봐야 해?", "시험에 나온다고 한 부분 정리해 줘", "어려운 카드가 많은 과목은?"],
      remember: ["오늘 복습할 카드 몇 장이야?", "어려운 카드가 많은 과목은?"],
      all: ["시험까지 며칠 남았어?", "오늘 복습할 카드 몇 장이야?", "이번 주에 뭐 배웠어?"],
    },
    deleteThread: "이 대화 지우기",
    collapse: "Juno 접기",
    close: "닫기",
    confirm: "이 대화를 지우면 되돌릴 수 없어요.",
    confirmYes: "대화 지우기",
    cancel: "취소",
    disclosure: "답변은 틀릴 수 있으니 출처를 확인하세요. 질문과 관련 강의 내용은 미국의 Groq, Inc.로 전송돼요.",
    privacy: "개인정보 처리방침",
    hello: "무엇이 궁금해요?",
    helloSub: "올린 강의에서 찾아서, 어디서 나온 말인지 함께 보여 드려요.",
    tryThese: "이렇게 물어보세요",
    examples: "질문 예시",
    today: "오늘",
    classToday: "오늘 수업",
    record: "녹음",
    cardsToday: "오늘 카드",
    cards: (n: number) => `${n}장`,
    review: "복습",
    prepare: "준비",
    making: "노트 만드는 중",
    see: "보기",
    answer: "Juno의 답변",
    sources: "출처",
    source: (n: number) => `출처 ${n}`,
    deletedLecture: "지워진 강의",
    general: "강의 자료에서 가져온 답변이 아니에요.",
    deletedSource: "이 출처의 강의는 지워졌어요. 답변은 대화를 지울 때까지 남아요.",
    kinds: { transcript: "녹취록", summary: "노트 요약", section: "노트", flagged: "시험에 나온다고 한 부분" },
    fullNote: "노트 전체 보기",
  },
  en: {
    tools: {
      search_lectures: "Searching your lectures.",
      get_exam_flags: "Gathering what was flagged for the exam.",
      get_lecture_notes: "Reading the notes.",
      get_transcript_at: "Checking the transcript.",
      list_courses: "Checking your courses.",
      list_lectures: "Checking your lectures.",
      get_review_status: "Counting today's cards.",
      get_semester_status: "Checking this semester.",
    } as Record<string, string>,
    thinking: "Finding the answer.",
    idle: "Answers from your own lectures",
    lectureScope: (course: string, title: string) => `Looking at ${course} · ${title}`,
    courseScope: (course: string) => `Looking at ${course}`,
    allScope: "The whole semester",
    suggest: {
      lecture: ["Summarize this lecture", "What did the professor flag for the exam in this lecture?"],
      course: ["Sum up what was flagged for the exam", "Summarize the latest lecture", "Is any week missing a recording?"],
      organize: ["Is any week missing a recording?", "How many lectures does each course have?", "What did I learn this week?"],
      build: ["What should I study before the next exam?", "Sum up what was flagged for the exam", "Which course has the most hard cards?"],
      remember: ["How many cards do I have today?", "Which course has the most hard cards?"],
      all: ["How many days until the exam?", "How many cards do I have today?", "What did I learn this week?"],
    },
    deleteThread: "Delete this conversation",
    collapse: "Fold Juno away",
    close: "Close",
    confirm: "Deleting this conversation can't be undone.",
    confirmYes: "Delete conversation",
    cancel: "Cancel",
    disclosure: "Answers can be wrong, so check the sources. Your question and the lecture content it needs are sent to Groq, Inc. in the United States.",
    privacy: "Privacy notice",
    hello: "What would you like to know?",
    helloSub: "Juno searches the lectures you recorded and shows where each answer came from.",
    tryThese: "Try asking",
    examples: "Example questions",
    today: "Today",
    classToday: "Class today",
    record: "Record",
    cardsToday: "Cards today",
    cards: (n: number) => `${n} card${n === 1 ? "" : "s"}`,
    review: "Review",
    prepare: "Prepare",
    making: "Making a note",
    see: "See",
    answer: "Juno's answer",
    sources: "Sources",
    source: (n: number) => `Source ${n}`,
    deletedLecture: "Deleted lecture",
    general: "This answer doesn't come from your lectures.",
    deletedSource: "This source's lecture was deleted. The answer stays until you delete the conversation.",
    kinds: { transcript: "Transcript", summary: "Note summary", section: "Note", flagged: "Flagged for the exam" },
    fullNote: "Open the full note",
  },
};

type Copy = (typeof COPY)["ko"];
type Scope = { courseId: string | null; lectureId: string | null; label: string; suggestions: string[] };

function useScope(t: Copy): Scope {
  const noteMatch = useMatch("/app/learn/:id");
  const courseMatch = useMatch("/workspace/courses/:id");
  const organize = useMatch("/workspace/organize");
  const build = useMatch("/workspace/build");
  const remember = useMatch("/app/remember");
  const lecture = useLecture(noteMatch?.params.id ?? "");
  const space = useCourseSpace(courseMatch?.params.id ?? "");

  if (noteMatch && lecture.data) {
    return {
      courseId: lecture.data.courseId,
      lectureId: lecture.data.status === "ready" ? lecture.data.id : null,
      label: t.lectureScope(lecture.data.courseName, lecture.data.title),
      suggestions: t.suggest.lecture,
    };
  }
  if (courseMatch && space.data) {
    return { courseId: space.data.course.id, lectureId: null, label: t.courseScope(space.data.course.name), suggestions: t.suggest.course };
  }
  const all = { courseId: null, lectureId: null, label: t.allScope };
  if (organize) return { ...all, suggestions: t.suggest.organize };
  if (build) return { ...all, suggestions: t.suggest.build };
  if (remember) return { ...all, suggestions: t.suggest.remember };
  return { ...all, suggestions: t.suggest.all };
}

type OpenSource = { messageId: string; citation: Citation; number: number };

type Props = {
  open: boolean;
  /** Beside the page on a wide screen, rather than over it. */
  docked: boolean;
  onClose: () => void;
  asked: Asked | null;
  focusKey: number;
};

export default function JunoPanel({ open, docked, onClose, asked, focusKey }: Props) {
  const t = useCopy(COPY);
  const scope = useScope(t);
  const client = useQueryClient();
  const conversations = useConversations();
  const [justSaved, setJustSaved] = useState<Record<string, string>>({});
  const scopeKey = scope.courseId ?? "all";
  const threadId = justSaved[scopeKey] ?? conversations.data?.find((c) => (c.courseId ?? null) === scope.courseId)?.id ?? null;
  const thread = useConversation(threadId);

  const [draft, setDraft] = useState("");
  const [source, setSource] = useState<OpenSource | null>(null);
  const [confirming, setConfirming] = useState(false);

  const onSaved = useCallback(
    (saved: ConversationSummary) => setJustSaved((map) => ({ ...map, [saved.courseId ?? "all"]: saved.id })),
    [],
  );
  const { pending, error, setError, send, stop } = useChat({
    conversationId: threadId,
    courseId: scope.courseId,
    lectureId: scope.lectureId,
    onUnanswered: setDraft,
    onSaved,
  });

  // A question handed over from a button elsewhere goes into the box, ready to send.
  useEffect(() => {
    if (asked) setDraft(asked.text);
  }, [asked]);

  // Moving to another course closes what belonged to the last one.
  const shownScope = useRef(scopeKey);
  useEffect(() => {
    if (shownScope.current === scopeKey) return;
    shownScope.current = scopeKey;
    setSource(null);
    setError(null);
    setConfirming(false);
    stop();
  }, [scopeKey, setError, stop]);

  const submit = useCallback(
    (text: string) => {
      const question = text.trim();
      if (!question) return;
      setDraft("");
      send(question);
    },
    [send],
  );

  const openSource = useCallback((messageId: string, citation: Citation, number: number) => {
    setSource((current) => (current?.messageId === messageId && current.citation.label === citation.label ? null : { messageId, citation, number }));
  }, []);

  const removeThread = async () => {
    if (!threadId) return;
    await request(`/chat/conversations/${threadId}`, { method: "DELETE" });
    client.removeQueries({ queryKey: chatKeys.conversation(threadId) });
    setJustSaved((map) => {
      const next = { ...map };
      delete next[scopeKey];
      return next;
    });
    await client.invalidateQueries({ queryKey: chatKeys.conversations });
    setConfirming(false);
    setSource(null);
  };

  // Escape closes Juno when it is over the page; beside the page it stays until closed.
  useEffect(() => {
    if (!open || docked) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, docked, onClose]);

  const messages = useMemo(() => (threadId ? thread.data?.messages ?? [] : []), [threadId, thread.data?.messages]);
  const exchanges = useMemo(() => toExchanges(messages), [messages]);

  const scroller = useRef<HTMLDivElement>(null);
  const following = useRef(true);
  const toBottom = () => {
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
  };
  useLayoutEffect(() => {
    following.current = true;
    toBottom();
  }, [open, threadId, exchanges.length, pending?.question]);
  useLayoutEffect(() => {
    if (following.current) toBottom();
  }, [pending?.answer, pending?.tool]);

  // The box takes focus when the student opens Juno on a big screen; on a phone that would cover the sheet with the keyboard.
  const [canFocus] = useState(() => window.matchMedia?.("(min-width: 1024px)").matches ?? false);

  if (!open) return null;

  const status = pending ? (pending.tool && t.tools[pending.tool]) || t.thinking : t.idle;

  return (
    <>
      <button type="button" aria-label={t.close} tabIndex={-1} onClick={onClose} className="fixed inset-0 z-40 bg-ink/40 lg:hidden" />
      <aside
        aria-label="Juno"
        className={cn(
          "on-night fixed inset-x-0 bottom-0 z-50 h-[88dvh] text-night-text",
          // a tablet beside the work: a dark bezel round a dark screen
          "lg:inset-x-auto lg:bottom-4 lg:right-4 lg:top-4 lg:h-auto lg:w-[36rem] lg:max-w-[calc(100vw-17rem)] lg:rounded-[38px] lg:bg-[#1c1c1f] lg:p-[11px] lg:shadow-float lg:ring-1 lg:ring-black/80",
        )}
      >
        <span className="pointer-events-none absolute left-1/2 top-[4px] hidden h-[4px] w-[4px] -translate-x-1/2 rounded-full bg-[#3c3c42] lg:block" aria-hidden="true" />
        <div className="flex h-full flex-col overflow-hidden rounded-t-[22px] bg-night lg:rounded-[28px]">
          <header className="flex shrink-0 items-center gap-3 px-5 pb-3 pt-4">
            <JunoAvatar size={36} tone="night" speaking={Boolean(pending)} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-tight text-white">Juno</p>
              <p className="mt-0.5 truncate text-xs leading-tight text-night-muted" role={pending ? "status" : undefined}>{status}</p>
            </div>
            {threadId && !confirming ? (
              <button type="button" onClick={() => setConfirming(true)} aria-label={t.deleteThread} className="flex h-9 w-9 items-center justify-center rounded-full text-night-muted hover:bg-night-2 hover:text-white">
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              aria-label={docked ? t.collapse : t.close}
              className="-mr-1 flex h-9 w-9 items-center justify-center rounded-full text-night-muted hover:bg-night-2 hover:text-white"
            >
              {docked ? <PanelRightClose className="h-[18px] w-[18px]" aria-hidden="true" /> : <X className="h-5 w-5" aria-hidden="true" />}
            </button>
          </header>

          {confirming ? (
            <div className="mx-4 mb-2 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-2xl bg-night-2 px-4 py-2.5 text-sm">
              <span>{t.confirm}</span>
              <button type="button" onClick={removeThread} className="font-medium text-white underline underline-offset-4">{t.confirmYes}</button>
              <button type="button" onClick={() => setConfirming(false)} className="font-medium text-night-muted hover:text-white">{t.cancel}</button>
            </div>
          ) : null}

          <div
            ref={scroller}
            onScroll={(e) => {
              const el = e.currentTarget;
              following.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
            }}
            className="scroll-thin min-h-0 flex-1 overflow-y-auto px-5 pb-6 pt-2 lg:px-7"
          >
            {!exchanges.length && !pending ? <Welcome t={t} suggestions={scope.suggestions} onAsk={submit} onNavigate={docked ? undefined : onClose} /> : null}
            {exchanges.map(({ question, answer }) => (
              <Exchange key={question.id} t={t} question={question.content} answer={answer} openSource={answer && source?.messageId === answer.id ? source : null} onOpen={openSource} />
            ))}
            {pending ? <PendingExchange t={t} pending={pending} /> : null}
          </div>

          <div className="shrink-0 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-2 lg:px-6 lg:pb-4">
            {error ? <div className="mb-2 px-1 [&_p]:text-[#ff8a96]"><ErrorLine>{error}</ErrorLine></div> : null}
            <Composer value={draft} onChange={setDraft} onSend={() => submit(draft)} onStop={stop} busy={Boolean(pending)} scope={scope.label} autoFocus={canFocus && focusKey > 0} focusKey={focusKey} />
            <p className="mt-2 px-1 text-2xs leading-relaxed text-night-muted">
              {t.disclosure}{" "}
              <Link to="/privacy" className="underline underline-offset-2 hover:text-white">{t.privacy}</Link>
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}

/** Before the first question: what Juno sees today, and questions to start with. */
function Welcome({ t, suggestions, onAsk, onNavigate }: { t: Copy; suggestions: string[]; onAsk: (text: string) => void; onNavigate?: () => void }) {
  return (
    <div className="pt-2">
      <p className="display text-2xl leading-tight text-white">{t.hello}</p>
      <p className="mt-1.5 text-sm leading-relaxed text-night-muted">{t.helloSub}</p>
      <Today t={t} onNavigate={onNavigate} />
      <p className="mt-6 text-2xs font-medium uppercase tracking-[0.12em] text-night-muted">{t.tryThese}</p>
      <ul className="mt-2 flex flex-wrap gap-2" aria-label={t.examples}>
        {suggestions.map((text) => (
          <li key={text}>
            <button type="button" onClick={() => onAsk(text)} className="min-h-[34px] rounded-full border border-night-line px-3.5 text-left text-sm text-night-text transition-colors hover:border-night-muted hover:bg-night-2">
              {text}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Today, as Juno sees it: only what the server counted, each with the one thing to do about it. */
function Today({ t, onNavigate }: { t: Copy; onNavigate?: () => void }) {
  const semester = useSemester();
  const { openDialog, phase } = useRecorder();
  const { lang } = useLang();
  const data = semester.data;
  if (!data) return null;

  type Row = { key: string; label: string; fact: string; record?: string; link?: { to: string; text: string } };
  const rows: Row[] = [];
  for (const c of data.classToday) {
    if (!c.recordedToday && phase === "idle") rows.push({ key: `class-${c.courseId}`, label: t.classToday, fact: c.courseName, record: c.courseId });
  }
  if (data.review.due) rows.push({ key: "review", label: t.cardsToday, fact: t.cards(data.review.due), link: { to: "/app/remember", text: t.review } });
  const exam = data.exams[0];
  if (exam) {
    rows.push({ key: "exam", label: `${examLabel(exam.exam, lang)} ${dayCount(exam.days, lang)}`, fact: exam.courseName, link: { to: `/workspace/courses/${exam.courseId}#exam`, text: t.prepare } });
  }
  if (data.processing && data.latestNote?.status === "processing") {
    rows.push({ key: "note", label: t.making, fact: data.latestNote.title, link: { to: "/app/learn", text: t.see } });
  }
  if (!rows.length) return null;

  return (
    <section aria-label={t.today} className="mt-5 rounded-[20px] bg-night-2 p-1.5">
      <p className="px-3 pb-1 pt-2 text-2xs font-medium uppercase tracking-[0.12em] text-night-muted">{t.today}</p>
      <ul className="grid gap-1 sm:grid-cols-2">
        {rows.slice(0, 4).map((row) => (
          <li key={row.key} className="flex min-h-[48px] items-center gap-3 rounded-2xl bg-night-3/50 px-3 py-2">
            <div className="min-w-0 flex-1">
              <p className="text-2xs text-night-muted">{row.label}</p>
              <p className="truncate text-sm font-medium text-white">{row.fact}</p>
            </div>
            {row.record ? (
              <button type="button" onClick={() => openDialog(row.record)} className="btn min-h-[30px] shrink-0 bg-maroon px-3 text-xs text-white hover:bg-maroon-deep">
                <span className="h-1.5 w-1.5 rounded-full bg-white" aria-hidden="true" />
                {t.record}
              </button>
            ) : row.link ? (
              <Link to={row.link.to} onClick={onNavigate} className="btn-light min-h-[30px] shrink-0 px-3 text-xs">
                {row.link.text}
                <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
              </Link>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

function toExchanges(messages: ChatMessage[]) {
  const exchanges: { question: ChatMessage; answer?: ChatMessage }[] = [];
  for (const message of messages) {
    if (message.role === "user") exchanges.push({ question: message });
    else if (exchanges.length) exchanges[exchanges.length - 1].answer = message;
  }
  return exchanges;
}

function Question({ text }: { text: string }) {
  return (
    <h3 className="ml-auto w-fit max-w-[17rem] whitespace-pre-wrap sm:max-w-[26rem] rounded-[18px] rounded-br-md bg-white px-4 py-2.5 text-sm font-normal leading-snug text-ink">{text}</h3>
  );
}

function Who() {
  return (
    <p className="flex items-center gap-2 text-xs font-semibold text-white">
      <JunoAvatar size={20} tone="night" />
      Juno
    </p>
  );
}

const Exchange = memo(function Exchange({
  t,
  question,
  answer,
  openSource,
  onOpen,
}: {
  t: Copy;
  question: string;
  answer?: ChatMessage;
  openSource: OpenSource | null;
  onOpen: (messageId: string, citation: Citation, number: number) => void;
}) {
  const numbers = useMemo(() => citationNumbers(answer?.content ?? ""), [answer?.content]);
  const answerId = answer?.id;
  const open = useCallback(
    (citation: Citation) => {
      if (answerId) onOpen(answerId, citation, numbers.get(citation.label) ?? 0);
    },
    [answerId, numbers, onOpen],
  );
  const activeLabel = openSource?.citation.label ?? null;
  const ordered = answer ? [...answer.citations].sort((a, b) => (numbers.get(a.label) ?? 0) - (numbers.get(b.label) ?? 0)) : [];

  return (
    <article className="pt-5 first:pt-1">
      <Question text={question} />
      {answer ? (
        <div className="mt-4">
          <Who />
          <span className="sr-only">{t.answer}</span>
          <div className="mt-2">
            <Answer content={answer.content} citations={answer.citations} activeLabel={activeLabel} onOpenCitation={open} />
          </div>
          {ordered.length ? (
            <ul className="mt-3 flex flex-wrap gap-1.5" aria-label={t.sources}>
              {ordered.map((citation) => {
                const number = numbers.get(citation.label) ?? 0;
                const active = activeLabel === citation.label;
                return (
                  <li key={citation.label}>
                    <button
                      type="button"
                      onClick={() => open(citation)}
                      aria-pressed={active}
                      className={cn(
                        "inline-flex min-h-[30px] max-w-full items-center gap-2 rounded-full py-1 pl-1 pr-3 text-left text-xs transition-colors",
                        active ? "bg-white text-ink" : "bg-night-2 text-night-text hover:bg-night-3",
                      )}
                    >
                      <SourceMark number={number} label={t.source(number)} />
                      {citation.deleted ? t.deletedLecture : (
                        <span className="min-w-0 truncate">
                          {citation.lectureTitle}
                          {citation.at ? <span className="ml-1.5 tabular-nums opacity-70">{citation.at}</span> : null}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : null}
          {openSource ? <SourceBlock t={t} citation={openSource.citation} /> : null}
          {answer.grounding === "general" ? <p className="mt-2 text-xs text-night-muted">{t.general}</p> : null}
        </div>
      ) : null}
    </article>
  );
});

/** What a citation points at, in the lecture's own words. */
function SourceBlock({ t, citation }: { t: Copy; citation: Citation }) {
  if (citation.deleted) {
    return <p className="mt-3 rounded-2xl bg-night-2 px-4 py-3 text-sm leading-relaxed">{t.deletedSource}</p>;
  }
  return (
    <div className="mt-3 rounded-2xl bg-night-2 p-4">
      <p className="text-xs text-night-muted">
        {citation.courseName} <span aria-hidden="true">/</span> {citation.lectureTitle} <span aria-hidden="true">/</span> {t.kinds[citation.kind]}
      </p>
      <div className="mt-2.5 space-y-1.5 border-l-2 border-gold pl-3 text-sm leading-relaxed text-night-text">
        {citation.excerpt.split("\n").map((line, i) => {
          const stamped = line.match(/^\[(\d{2,3}:\d{2})\]\s?(.*)$/);
          return (
            <p key={i} className="flex gap-2.5">
              {stamped ? <span className="w-11 shrink-0 tabular-nums text-night-muted">{stamped[1]}</span> : null}
              <span className="min-w-0"><Marked text={stamped ? stamped[2] : line} /></span>
            </p>
          );
        })}
      </div>
      <Link to={`/app/learn/${citation.lectureId}`} className="mt-2 inline-flex min-h-[32px] items-center gap-1 text-sm font-medium text-white underline decoration-night-line underline-offset-4 hover:decoration-white">
        {t.fullNote}
      </Link>
    </div>
  );
}

function PendingExchange({ t, pending }: { t: Copy; pending: Pending }) {
  return (
    <article className="pt-5 first:pt-1">
      <Question text={pending.question} />
      <div className="mt-4">
        <Who />
        <div className="mt-2">
          {pending.answer ? (
            <Answer content={pending.answer} streaming />
          ) : (
            <p className="flex items-center gap-2.5 text-sm text-night-muted">
              <span className="h-2 w-2 animate-pulse rounded-full bg-gold" aria-hidden="true" />
              {(pending.tool && t.tools[pending.tool]) || t.thinking}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
