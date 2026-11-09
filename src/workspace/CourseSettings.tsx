import { useEffect, useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { keys } from "@/app/queries";
import { Dialog, ErrorLine } from "@/app/ui";
import { ApiError, request } from "@/lib/api";
import { cn } from "@/lib/cn";
import { useLang } from "@/lib/lang";
import type { Course } from "@/lib/types";
import { semesterKeys } from "./queries";

const DAYS = [
  { value: 1, ko: "월", en: "Mon" },
  { value: 2, ko: "화", en: "Tue" },
  { value: 3, ko: "수", en: "Wed" },
  { value: 4, ko: "목", en: "Thu" },
  { value: 5, ko: "금", en: "Fri" },
  { value: 6, ko: "토", en: "Sat" },
  { value: 0, ko: "일", en: "Sun" },
];

/**
 * A course and its schedule. Only the name is required: without days or exam
 * dates Juno stays quiet about them rather than guessing.
 */
export function CourseSettings({
  open,
  course,
  onClose,
  onCreated,
}: {
  open: boolean;
  course: Pick<Course, "id" | "name" | "classDays" | "midtermOn" | "finalOn"> | null;
  onClose: () => void;
  onCreated?: (course: Course) => void;
}) {
  const client = useQueryClient();
  const en = useLang().lang === "en";
  const [days, setDays] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setDays(course?.classDays ?? []);
      setError(null);
    }
  }, [open, course]);

  const toggle = (day: number) => setDays((list) => (list.includes(day) ? list.filter((d) => d !== day) : [...list, day]));

  const save = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    if (!name) return setError(en ? "Please enter a course name." : "과목 이름을 입력해 주세요.");
    const body = {
      name,
      classDays: days,
      midtermOn: String(data.get("midtermOn") ?? "") || null,
      finalOn: String(data.get("finalOn") ?? "") || null,
    };
    setBusy(true);
    setError(null);
    try {
      if (course) {
        await request(`/courses/${course.id}`, { method: "PATCH", body });
      } else {
        const created = await request<{ course: Course }>("/courses", { method: "POST", body });
        onCreated?.(created.course);
      }
      await Promise.all([
        client.invalidateQueries({ queryKey: semesterKeys.all }),
        client.invalidateQueries({ queryKey: keys.courses }),
      ]);
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : en ? "Couldn't save." : "저장하지 못했어요.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title={course ? (en ? `${course.name} schedule` : `${course.name} 일정`) : en ? "Add a course" : "과목 추가"}>
      <form key={course?.id ?? "new"} onSubmit={save} className="flex flex-col gap-4">
        <div>
          <label htmlFor="course-settings-name" className="field-label">{en ? "Course name" : "과목 이름"}</label>
          <input id="course-settings-name" name="name" className="field" defaultValue={course?.name ?? ""} placeholder={en ? "e.g. Operating Systems" : "예: 운영체제"} maxLength={80} />
        </div>

        <fieldset>
          <legend className="field-label">{en ? "Class days" : "수업 요일"} <span className="font-normal text-slate">{en ? "(optional)" : "(선택)"}</span></legend>
          <div className="flex flex-wrap gap-1.5">
            {DAYS.map((day) => (
              <button
                key={day.value}
                type="button"
                aria-pressed={days.includes(day.value)}
                onClick={() => toggle(day.value)}
                className={cn(
                  "h-9 min-w-[2.25rem] rounded-lg border px-2 text-sm font-medium transition-colors",
                  days.includes(day.value) ? "border-ink bg-ink text-white" : "border-rule-strong text-ink hover:border-ink",
                )}
              >
                {en ? day.en : day.ko}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-xs text-slate">{en ? "Juno reminds you to record on class days." : "수업 날 녹음을 잊지 않게 알려 드려요."}</p>
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="course-settings-midterm" className="field-label">{en ? "Midterm" : "중간고사"} <span className="font-normal text-slate">{en ? "(optional)" : "(선택)"}</span></label>
            <input id="course-settings-midterm" name="midtermOn" type="date" className="field" defaultValue={course?.midtermOn ?? ""} />
          </div>
          <div>
            <label htmlFor="course-settings-final" className="field-label">{en ? "Final" : "기말고사"} <span className="font-normal text-slate">{en ? "(optional)" : "(선택)"}</span></label>
            <input id="course-settings-final" name="finalOn" type="date" className="field" defaultValue={course?.finalOn ?? ""} />
          </div>
        </div>
        <p className="-mt-2 text-xs leading-relaxed text-slate">{en ? "Leave a date empty if you don't know it yet. You can add it here later." : "날짜를 모르면 비워 두세요. 알게 되면 여기서 넣을 수 있어요."}</p>

        <ErrorLine>{error}</ErrorLine>
        <button type="submit" disabled={busy} className="btn-ink">{course ? (en ? "Save" : "저장") : en ? "Add course" : "과목 추가"}</button>
      </form>
    </Dialog>
  );
}
