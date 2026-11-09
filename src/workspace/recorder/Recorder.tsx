import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { keys } from "@/app/queries";
import { ApiError, request, uploadWithProgress } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { LectureSummary } from "@/lib/types";
import { semesterKeys } from "../queries";
import { addChunk, deleteRecording, listRecordings, readAudio, saveRecording, tidyRecordings, type StoredRecording } from "./store";

/*
 * The in-class recorder. Press record, sit through the lecture, press 수업 끝:
 * the audio uploads itself and becomes notes under the right course and week.
 *
 * It lives above the routes, so a student can read last week's notes in the
 * middle of class without stopping the recording.
 */

const TIMESLICE_MS = 10_000;
const BITRATE = 64_000;
/** Longer than any class. Stops a recording someone forgot, which would spend transcription budget for nothing. */
const MAX_DURATION_MS = 4 * 60 * 60 * 1000;
const SILENCE_RMS = 0.006;
const SILENCE_WARN_MS = 60_000;
const RECONCILE_MS = 15_000;
const MIME_TYPES = ["audio/webm;codecs=opus", "audio/mp4", "audio/webm", "audio/ogg;codecs=opus"];

export type RecorderPhase = "idle" | "starting" | "recording" | "finishing" | "uploading";

export type LiveRecording = { id: string; courseId: string; courseName: string; startedAt: number };

export type RecorderWarning = "silent" | "paused" | "storage" | null;

type RecorderValue = {
  phase: RecorderPhase;
  live: LiveRecording | null;
  progress: number;
  warning: RecorderWarning;
  error: string | null;
  clearError: () => void;
  /** Recordings on this device still waiting for something. */
  recordings: StoredRecording[];
  supported: boolean;
  dialogCourseId: string | null | undefined;
  /** Opens the course picker; pass a course to have it already chosen. */
  openDialog: (courseId?: string | null) => void;
  closeDialog: () => void;
  start: (courseId: string, courseName: string) => Promise<void>;
  finish: () => void;
  discardLive: () => void;
  upload: (id: string) => Promise<void>;
  discard: (id: string) => Promise<void>;
  /** The microphone's current level, from 0 to 1, for the meter. */
  readLevel: () => number;
};

const RecorderContext = createContext<RecorderValue | null>(null);

export function useRecorder() {
  const value = useContext(RecorderContext);
  if (!value) throw new Error("useRecorder must be used inside RecorderProvider");
  return value;
}

const extensionFor = (mimeType: string) => (mimeType.includes("mp4") ? "mp4" : mimeType.includes("ogg") ? "ogg" : "webm");

function micErrorMessage(err: unknown) {
  const name = (err as Error).name;
  if (name === "NotAllowedError" || name === "SecurityError") return "마이크 권한이 꺼져 있어요. 브라우저 설정에서 마이크를 허용해 주세요.";
  if (name === "NotFoundError") return "이 기기에서 마이크를 찾지 못했어요.";
  if (name === "NotReadableError") return "다른 앱이 마이크를 쓰고 있어요. 그 앱을 닫고 다시 해 주세요.";
  return "녹음을 시작하지 못했어요. 다시 해 주세요.";
}

export function RecorderProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const client = useQueryClient();
  const userId = user?.id ?? null;

  const [phase, setPhase] = useState<RecorderPhase>("idle");
  const [live, setLive] = useState<LiveRecording | null>(null);
  const [progress, setProgress] = useState(0);
  const [warning, setWarning] = useState<RecorderWarning>(null);
  const [error, setError] = useState<string | null>(null);
  const [recordings, setRecordings] = useState<StoredRecording[]>([]);
  const [dialogCourseId, setDialogCourseId] = useState<string | null | undefined>(undefined);

  const supported = typeof window !== "undefined" && Boolean(navigator.mediaDevices?.getUserMedia) && typeof MediaRecorder !== "undefined";

  const active = useRef<{
    recorder: MediaRecorder;
    stream: MediaStream;
    audio: AudioContext | null;
    analyser: AnalyserNode | null;
    wakeLock: { release: () => Promise<void> } | null;
    record: StoredRecording;
    seq: number;
    writes: Promise<unknown>;
    lastChunkAt: number;
    lastSoundAt: number;
    discarded: boolean;
    timer: number;
  } | null>(null);
  const level = useRef(0);

  const reload = useCallback(async () => {
    if (!userId) return;
    try {
      setRecordings(await tidyRecordings(userId, active.current?.record.id ?? null));
    } catch {
      // Browser storage is unavailable, as in some private windows. Recording still warns about this itself.
    }
  }, [userId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const refreshLectures = useCallback(() => {
    client.invalidateQueries({ queryKey: semesterKeys.all });
    client.invalidateQueries({ queryKey: keys.lectures });
    client.invalidateQueries({ queryKey: keys.courses });
    client.invalidateQueries({ queryKey: keys.juno });
    client.invalidateQueries({ queryKey: keys.review });
  }, [client]);

  const upload = useCallback(
    async (id: string) => {
      if (!userId) return;
      const all = await listRecordings(userId);
      const recording = all.find((r) => r.id === id);
      if (!recording) return;
      setPhase("uploading");
      setProgress(0);
      setError(null);
      try {
        const audio = await readAudio(recording);
        if (!audio.size) throw new ApiError(0, "Empty", "녹음된 소리가 없어요.");
        const form = new FormData();
        form.append("courseId", recording.courseId);
        form.append("recordedAt", recording.startedAt);
        form.append("audio", audio, `lecture.${extensionFor(recording.mimeType)}`);
        const { lecture } = await uploadWithProgress<{ lecture: LectureSummary }>("/lectures", form, setProgress);
        await saveRecording({ ...recording, status: "uploaded", lectureId: lecture.id, interrupted: false, error: undefined });
        refreshLectures();
      } catch (err) {
        const message = err instanceof ApiError ? err.message : "올리지 못했어요. 다시 해 주세요.";
        await saveRecording({ ...recording, status: "stopped", error: message });
      } finally {
        setPhase("idle");
        await reload();
      }
    },
    [refreshLectures, reload, userId],
  );

  const teardown = useCallback(() => {
    const current = active.current;
    if (!current) return;
    window.clearInterval(current.timer);
    current.stream.getTracks().forEach((track) => track.stop());
    current.audio?.close().catch(() => {});
    current.wakeLock?.release().catch(() => {});
    level.current = 0;
  }, []);

  const finish = useCallback(() => {
    const current = active.current;
    if (!current || current.recorder.state === "inactive") return;
    setPhase("finishing");
    current.recorder.stop();
  }, []);

  const discardLive = useCallback(() => {
    const current = active.current;
    if (!current || current.recorder.state === "inactive") return;
    current.discarded = true;
    setPhase("finishing");
    current.recorder.stop();
  }, []);

  const start = useCallback(
    async (courseId: string, courseName: string) => {
      if (!userId || active.current) return;
      setError(null);
      setWarning(null);
      if (!supported) {
        setError("이 브라우저는 녹음을 지원하지 않아요. 크롬이나 사파리 최신 버전에서 열어 주세요.");
        return;
      }
      setPhase("starting");
      let stream: MediaStream;
      try {
        // A lecturer is far from the microphone. Noise suppression tends to treat a
        // distant voice as noise, so it stays off and gain control stays on.
        stream = await navigator.mediaDevices.getUserMedia({
          audio: { channelCount: 1, echoCancellation: false, noiseSuppression: false, autoGainControl: true },
        });
      } catch (err) {
        setPhase("idle");
        setError(micErrorMessage(err));
        return;
      }

      const mimeType = MIME_TYPES.find((type) => MediaRecorder.isTypeSupported(type)) ?? "";
      const recorder = new MediaRecorder(stream, { ...(mimeType ? { mimeType } : {}), audioBitsPerSecond: BITRATE });
      const startedAt = Date.now();
      const record: StoredRecording = {
        id: crypto.randomUUID(),
        userId,
        courseId,
        courseName,
        startedAt: new Date(startedAt).toISOString(),
        mimeType: recorder.mimeType || mimeType || "audio/webm",
        durationMs: 0,
        size: 0,
        status: "recording",
      };

      let audio: AudioContext | null = null;
      let analyser: AnalyserNode | null = null;
      try {
        audio = new AudioContext();
        analyser = audio.createAnalyser();
        analyser.fftSize = 1024;
        audio.createMediaStreamSource(stream).connect(analyser);
      } catch {
        audio = null;
        analyser = null;
      }

      const current = {
        recorder,
        stream,
        audio,
        analyser,
        wakeLock: null as { release: () => Promise<void> } | null,
        record,
        seq: 0,
        writes: saveRecording(record).catch(() => setWarning("storage")) as Promise<unknown>,
        lastChunkAt: startedAt,
        lastSoundAt: startedAt,
        discarded: false,
        timer: 0,
      };
      active.current = current;

      recorder.ondataavailable = (event) => {
        if (!event.data.size) return;
        const seq = current.seq;
        current.seq += 1;
        current.lastChunkAt = Date.now();
        current.record = { ...current.record, durationMs: Date.now() - startedAt, size: current.record.size + event.data.size };
        const snapshot = current.record;
        current.writes = current.writes
          .then(() => addChunk(record.id, seq, event.data))
          .then(() => saveRecording(snapshot))
          .catch(() => setWarning("storage"));
      };

      recorder.onstop = async () => {
        teardown();
        await current.writes;
        active.current = null;
        setLive(null);
        setWarning(null);
        if (current.discarded) {
          await deleteRecording(record.id).catch(() => {});
          setPhase("idle");
          await reload();
          return;
        }
        await saveRecording({ ...current.record, status: "stopped", durationMs: Date.now() - startedAt }).catch(() => {});
        await upload(record.id);
      };

      // A microphone unplugged or a call taking over ends the track. Keep what there is.
      stream.getAudioTracks()[0]?.addEventListener("ended", () => finish());

      recorder.start(TIMESLICE_MS);

      const samples = new Float32Array(analyser ? analyser.fftSize : 0);
      current.timer = window.setInterval(() => {
        const now = Date.now();
        if (now - startedAt > MAX_DURATION_MS) {
          finish();
          return;
        }
        if (current.analyser) {
          current.analyser.getFloatTimeDomainData(samples);
          let sum = 0;
          for (const sample of samples) sum += sample * sample;
          const rms = Math.sqrt(sum / samples.length);
          level.current = Math.min(1, rms * 6);
          if (rms > SILENCE_RMS) current.lastSoundAt = now;
          setWarning((w) => {
            if (now - current.lastSoundAt > SILENCE_WARN_MS) return w ?? "silent";
            return w === "silent" ? null : w;
          });
        }
      }, 400);

      const lockScreen = async () => {
        try {
          current.wakeLock = await (navigator as unknown as { wakeLock?: { request: (t: string) => Promise<{ release: () => Promise<void> }> } }).wakeLock?.request("screen") ?? null;
        } catch {
          current.wakeLock = null;
        }
      };
      lockScreen();

      setLive({ id: record.id, courseId, courseName, startedAt });
      setPhase("recording");
      setDialogCourseId(undefined);
      setRecordings((list) => list.filter((r) => r.id !== record.id));
    },
    [finish, reload, supported, teardown, upload, userId],
  );

  // Coming back to the tab: keep the screen on again, and say so if the browser stopped recording meanwhile.
  useEffect(() => {
    const onVisible = async () => {
      const current = active.current;
      if (document.visibilityState !== "visible" || !current) return;
      try {
        current.wakeLock = await (navigator as unknown as { wakeLock?: { request: (t: string) => Promise<{ release: () => Promise<void> }> } }).wakeLock?.request("screen") ?? null;
      } catch {
        current.wakeLock = null;
      }
      if (Date.now() - current.lastChunkAt > TIMESLICE_MS * 3) setWarning("paused");
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  // Leaving the page mid-recording asks first. What was saved so far is recovered on return.
  useEffect(() => {
    if (phase !== "recording" && phase !== "uploading") return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [phase]);

  // A recording stays on the device until its notes exist, then it is removed.
  const uploaded = recordings.filter((r) => r.status === "uploaded");
  const checking = uploaded.map((r) => r.id).join(",");
  useEffect(() => {
    if (!checking) return;
    const check = async () => {
      if (!userId) return;
      for (const recording of await listRecordings(userId)) {
        if (recording.status !== "uploaded" || !recording.lectureId) continue;
        try {
          const { lecture } = await request<{ lecture: LectureSummary }>(`/lectures/${recording.lectureId}`);
          if (lecture.status === "ready") {
            await deleteRecording(recording.id);
            refreshLectures();
          }
        } catch (err) {
          if (err instanceof ApiError && err.status === 404) {
            await saveRecording({ ...recording, status: "failed" });
            refreshLectures();
          }
        }
      }
      await reload();
    };
    check();
    const timer = window.setInterval(check, RECONCILE_MS);
    return () => window.clearInterval(timer);
  }, [checking, refreshLectures, reload, userId]);

  // Retry by itself when the connection comes back.
  useEffect(() => {
    const onOnline = () => {
      const waiting = recordings.find((r) => r.status === "stopped" && !r.interrupted);
      if (waiting && phase === "idle") upload(waiting.id);
    };
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [phase, recordings, upload]);

  useEffect(() => teardown, [teardown]);

  const discard = useCallback(
    async (id: string) => {
      await deleteRecording(id);
      await reload();
    },
    [reload],
  );

  const value = useMemo<RecorderValue>(
    () => ({
      phase,
      live,
      progress,
      warning,
      error,
      clearError: () => setError(null),
      recordings,
      supported,
      dialogCourseId,
      openDialog: (courseId = null) => {
        setError(null);
        setDialogCourseId(courseId);
      },
      closeDialog: () => setDialogCourseId(undefined),
      start,
      finish,
      discardLive,
      upload,
      discard,
      readLevel: () => level.current,
    }),
    [phase, live, progress, warning, error, recordings, supported, dialogCourseId, start, finish, discardLive, upload, discard],
  );

  return <RecorderContext.Provider value={value}>{children}</RecorderContext.Provider>;
}
