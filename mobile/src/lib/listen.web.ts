import { useCallback, useEffect, useRef, useState } from "react";
import type { ListenState, Take } from "./listen";

/*
 * Recording a class in a browser: one recording from Start to Stop. The
 * recorder hands over what it has every few seconds, so a long class is held
 * as many small pieces of one file rather than one growing buffer; at Stop they
 * are joined into a single Blob. Nothing is sent while the class goes on.
 */

function pickFormat(): { mime: string; ext: string } | null {
  if (typeof MediaRecorder === "undefined") return null;
  const options = [
    { mime: "audio/webm;codecs=opus", ext: ".webm" },
    { mime: "audio/webm", ext: ".webm" },
    { mime: "audio/mp4", ext: ".m4a" },
    { mime: "audio/ogg;codecs=opus", ext: ".ogg" },
  ];
  return options.find((o) => MediaRecorder.isTypeSupported(o.mime)) ?? null;
}

type Live = { stream: MediaStream; recorder: MediaRecorder; parts: Blob[]; startedAt: number; ext: string; type: string };

export function useClassRecorder() {
  const [state, setState] = useState<ListenState>(() => (pickFormat() && typeof navigator !== "undefined" && navigator.mediaDevices ? "idle" : "unsupported"));
  const live = useRef<Live | null>(null);

  const release = useCallback(() => {
    live.current?.stream.getTracks().forEach((track) => track.stop());
    live.current = null;
  }, []);

  const start = useCallback(async () => {
    const format = pickFormat();
    if (!format || !navigator.mediaDevices) {
      setState("unsupported");
      return false;
    }
    setState("asking");
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: true, autoGainControl: true } });
    } catch {
      setState("denied");
      return false;
    }
    const recorder = new MediaRecorder(stream, { mimeType: format.mime, audioBitsPerSecond: 32_000 });
    const session: Live = { stream, recorder, parts: [], startedAt: Date.now(), ext: format.ext, type: format.mime.split(";")[0] };
    recorder.ondataavailable = (event) => {
      if (event.data.size) session.parts.push(event.data);
    };
    live.current = session;
    recorder.start(10_000);
    setState("recording");
    return true;
  }, []);

  /** Stops and returns the recording, or null if there was none. */
  const stop = useCallback((): Promise<Take | null> => {
    const session = live.current;
    if (!session) return Promise.resolve(null);
    return new Promise<Take | null>((resolve) => {
      const finish = () => {
        const blob = new Blob(session.parts, { type: session.type });
        const seconds = (Date.now() - session.startedAt) / 1000;
        release();
        setState("idle");
        resolve(blob.size && seconds > 0.5 ? { blob, ext: session.ext, type: session.type, seconds } : null);
      };
      if (session.recorder.state === "inactive") finish();
      else {
        session.recorder.onstop = finish;
        session.recorder.stop();
      }
    });
  }, [release]);

  // Leaving the screen lets go of the microphone.
  useEffect(() => () => {
    const session = live.current;
    if (session && session.recorder.state !== "inactive") {
      session.recorder.onstop = null;
      session.recorder.stop();
    }
    release();
  }, [release]);

  return { state, start, stop };
}
