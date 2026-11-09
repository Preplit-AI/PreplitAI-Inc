import { useId, useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { FileAudio } from "lucide-react";
import { ApiError, request, uploadWithProgress } from "@/lib/api";
import { cn } from "@/lib/cn";
import { useLang } from "@/lib/lang";
import type { Course, LectureSummary } from "@/lib/types";
import { keys } from "./queries";
import { Dialog, ErrorLine } from "./ui";

const ACCEPT = "audio/*,.m4a,.mp3,.wav,.webm,.ogg,.opus,.aac,.flac,.amr,.3gp,.mp4";
const MAX_MB = 200;

type Mode = "audio" | "text";

/** The way to fill a week the in-class recorder missed: an audio file, or a transcript pasted as text. */
export function UploadDialog({
  open,
  onClose,
  courses,
  defaultCourseId,
}: {
  open: boolean;
  onClose: () => void;
  courses: Course[];
  defaultCourseId?: string;
}) {
  const client = useQueryClient();
  const en = useLang().lang === "en";
  const ids = { course: useId(), newCourse: useId(), title: useId(), file: useId(), text: useId() };
  const [mode, setMode] = useState<Mode>("audio");
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    if (progress !== null) return; // do not abandon an upload half-way
    setFile(null);
    setError(null);
    setMode("audio");
    onClose();
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setError(null);

    if (mode === "audio" && !file) return setError(en ? "Choose a recording file." : "녹음 파일을 골라 주세요.");
    if (mode === "audio" && file && file.size > MAX_MB * 1024 * 1024) return setError(en ? `The file is too big. Up to ${MAX_MB} MB.` : `파일이 너무 커요. ${MAX_MB}MB까지 올릴 수 있어요.`);
    const text = String(data.get("text") ?? "").trim();
    if (mode === "text" && !text) return setError(en ? "Paste the transcript." : "녹취록을 붙여 넣어 주세요.");

    try {
      let courseId = String(data.get("courseId") ?? "");
      if (!courses.length) {
        const name = String(data.get("newCourse") ?? "").trim();
        if (!name) return setError(en ? "Please enter a course name." : "과목 이름을 입력해 주세요.");
        const created = await request<{ course: Course }>("/courses", { method: "POST", body: { name } });
        courseId = created.course.id;
        client.invalidateQueries({ queryKey: keys.courses });
      }

      const form = new FormData();
      form.append("courseId", courseId);
      form.append("title", String(data.get("title") ?? "").trim());
      if (mode === "audio" && file) form.append("audio", file, file.name);
      else form.append("text", text);

      setProgress(0);
      await uploadWithProgress<{ lecture: LectureSummary }>("/lectures", form, setProgress);
      setProgress(null);
      client.invalidateQueries({ queryKey: keys.lectures });
      client.invalidateQueries({ queryKey: ["semester"] });
      setFile(null);
      onClose();
    } catch (err) {
      setProgress(null);
      setError(err instanceof ApiError ? err.message : en ? "Couldn't upload. Please try again." : "올리지 못했어요. 다시 해 주세요.");
    }
  };

  const uploading = progress !== null;

  return (
    <Dialog open={open} onClose={close} title={en ? "Upload a file" : "파일 올리기"}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        {courses.length ? (
          <div>
            <label htmlFor={ids.course} className="field-label">{en ? "Course" : "과목"}</label>
            <select id={ids.course} name="courseId" defaultValue={defaultCourseId ?? courses[0].id} className="field">
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        ) : (
          <div>
            <label htmlFor={ids.newCourse} className="field-label">{en ? "Course" : "과목"}</label>
            <input id={ids.newCourse} name="newCourse" className="field" placeholder={en ? "e.g. Operating Systems" : "예: 운영체제"} maxLength={80} required />
          </div>
        )}

        <div>
          <label htmlFor={ids.title} className="field-label">{en ? "Title" : "제목"} <span className="font-normal text-slate">{en ? "(optional)" : "(선택)"}</span></label>
          <input id={ids.title} name="title" className="field" placeholder={en ? "e.g. Week 9" : "예: 9주차"} maxLength={120} />
        </div>

        <fieldset>
          <legend className="field-label">{en ? "What are you uploading?" : "무엇을 올리나요?"}</legend>
          <div className="grid grid-cols-2 gap-1 rounded-full bg-bone p-1">
            {(["audio", "text"] as const).map((m) => (
              <label
                key={m}
                className={cn(
                  "flex min-h-[32px] cursor-pointer items-center justify-center rounded-full text-sm font-medium transition-colors",
                  mode === m ? "bg-white text-ink shadow-window" : "text-slate hover:text-ink",
                )}
              >
                <input type="radio" name="mode" value={m} checked={mode === m} onChange={() => setMode(m)} className="sr-only" />
                {m === "audio" ? (en ? "Audio file" : "녹음 파일") : en ? "Paste a transcript" : "녹취록 붙여넣기"}
              </label>
            ))}
          </div>
        </fieldset>

        {mode === "audio" ? (
          <div>
            <label
              htmlFor={ids.file}
              className="flex min-h-[5.5rem] cursor-pointer items-center gap-3 rounded-xl border border-dashed border-rule-strong bg-bone/50 px-4 py-4 transition-colors hover:border-ink"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-rule bg-white">
                <FileAudio className="h-4 w-4" strokeWidth={1.6} aria-hidden="true" />
              </span>
              {file ? (
                <span className="min-w-0">
                  <span className="block break-all font-medium">{file.name}</span>
                  <span className="mt-0.5 block text-xs text-slate">{(file.size / 1024 / 1024).toFixed(1)}MB · {en ? "choose another file" : "다른 파일 고르기"}</span>
                </span>
              ) : (
                <span className="min-w-0">
                  <span className="block text-sm font-medium">{en ? "Choose a recording" : "녹음 파일 고르기"}</span>
                  <span className="mt-0.5 block text-xs text-slate">{en ? `m4a, mp3, wav and more · up to ${MAX_MB} MB` : `m4a, mp3, wav 등 · ${MAX_MB}MB까지`}</span>
                </span>
              )}
            </label>
            <input
              id={ids.file}
              type="file"
              accept={ACCEPT}
              className="sr-only"
              onChange={(e) => setFile(e.currentTarget.files?.[0] ?? null)}
            />
          </div>
        ) : (
          <div>
            <label htmlFor={ids.text} className="field-label">{en ? "Transcript" : "녹취록"}</label>
            <textarea id={ids.text} name="text" rows={7} className="field resize-y" placeholder={en ? "Paste the lecture transcript." : "강의 녹취록을 붙여 넣으세요."} />
          </div>
        )}

        <p className="text-xs leading-relaxed text-slate">
          {en
            ? "The note takes a few minutes and keeps going if you close the window. Audio is deleted after transcription."
            : "노트를 만드는 데 몇 분 걸려요. 창을 닫아도 계속돼요. 녹음 파일은 글로 옮긴 직후 지워요."}
        </p>

        <ErrorLine>{error}</ErrorLine>

        {uploading ? (
          <div aria-live="polite">
            <div className="h-2 overflow-hidden rounded-full bg-bone-deep" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round((progress ?? 0) * 100)} aria-label={en ? "Uploading" : "올리는 중"}>
              <div className="h-full rounded-full bg-maroon transition-[width] duration-200" style={{ width: `${Math.round((progress ?? 0) * 100)}%` }} />
            </div>
            <p className="mt-2 text-sm text-slate">{en ? "Uploading" : "올리는 중"} {Math.round((progress ?? 0) * 100)}%</p>
          </div>
        ) : (
          <button type="submit" className="btn-ink">{en ? "Upload" : "올리기"}</button>
        )}
      </form>
    </Dialog>
  );
}
