import { useCallback, useEffect, useRef, useState } from "react";
import type { ListenState, Piece } from "./listen";

/*
 * Listening in a browser. The microphone is recorded in short pieces: every
 * PIECE_MS the recorder is stopped, which makes a complete file of its own, and
 * a new one is started on the same microphone at once. Each finished piece is
 * handed to `onPiece`, in order.
 */

export const PIECE_MS = 20_000;

function pickFormat(): { mime: string; ext: string } | null {
  if (typeof MediaRecorder === "undefined") return null;
  const options = [
    { mime: "audio/webm;codecs=opus", ext: "webm" },
    { mime: "audio/webm", ext: "webm" },
    { mime: "audio/mp4", ext: "m4a" },
    { mime: "audio/ogg;codecs=opus", ext: "ogg" },
  ];
  return options.find((o) => MediaRecorder.isTypeSupported(o.mime)) ?? null;
}

export function usePieceRecorder(onPiece: (piece: Piece) => void) {
  const [state, setState] = useState<ListenState>(() => (pickFormat() && typeof navigator !== "undefined" && navigator.mediaDevices ? "idle" : "unsupported"));
  const handler = useRef(onPiece);
  handler.current = onPiece;
  const live = useRef<{ stream: MediaStream; recorder: MediaRecorder | null; timer: ReturnType<typeof setTimeout> | null; active: boolean; done: (() => void) | null } | null>(null);

  const release = useCallback(() => {
    const now = live.current;
    if (!now) return;
    if (now.timer) clearTimeout(now.timer);
    now.stream.getTracks().forEach((track) => track.stop());
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
    const session = { stream, recorder: null as MediaRecorder | null, timer: null as ReturnType<typeof setTimeout> | null, active: true, done: null as (() => void) | null };
    live.current = session;

    const begin = () => {
      const recorder = new MediaRecorder(stream, { mimeType: format.mime, audioBitsPerSecond: 32_000 });
      const parts: Blob[] = [];
      const startedAt = Date.now();
      recorder.ondataavailable = (event) => {
        if (event.data.size) parts.push(event.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(parts, { type: format.mime.split(";")[0] });
        const seconds = (Date.now() - startedAt) / 1000;
        // Less than half a second is the click of stopping, not speech.
        if (blob.size && seconds > 0.5) handler.current({ blob, name: `piece.${format.ext}`, type: blob.type, seconds });
        if (session.active) begin();
        else {
          session.done?.();
          release();
        }
      };
      session.recorder = recorder;
      recorder.start();
      session.timer = setTimeout(() => recorder.state === "recording" && recorder.stop(), PIECE_MS);
    };
    begin();
    setState("recording");
    return true;
  }, [release]);

  /** Stops, and resolves once the last piece has been handed over. */
  const stop = useCallback(() => {
    const session = live.current;
    if (!session || !session.active) return Promise.resolve();
    session.active = false;
    if (session.timer) clearTimeout(session.timer);
    return new Promise<void>((resolve) => {
      session.done = resolve;
      if (session.recorder && session.recorder.state === "recording") session.recorder.stop();
      else {
        resolve();
        release();
      }
      setState("idle");
    });
  }, [release]);

  // Leaving the screen lets go of the microphone.
  useEffect(() => () => {
    const session = live.current;
    if (session) {
      session.active = false;
      session.done = null;
      if (session.recorder && session.recorder.state === "recording") session.recorder.stop();
      else release();
    }
  }, [release]);

  return { state, start, stop };
}

export function appendPiece(form: FormData, piece: Piece) {
  if (piece.blob) form.append("audio", piece.blob, piece.name);
}
