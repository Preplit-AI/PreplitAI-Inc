import { useCallback, useEffect, useRef, useState } from "react";
import { AudioModule, RecordingPresets, setAudioModeAsync, useAudioRecorder } from "expo-audio";

/*
 * Listening on a phone. The microphone is recorded in short pieces: every
 * PIECE_MS the recorder is stopped, which finishes a file of its own, and
 * started again at once. Each finished piece is handed to `onPiece`, in order.
 * (The browser's version of this is listen.web.ts.)
 *
 * The app has to stay open while it listens: recording with the screen off
 * needs a development build with background recording switched on.
 */

export const PIECE_MS = 20_000;

export type ListenState = "idle" | "asking" | "recording" | "denied" | "unsupported";
/** One finished piece of the class: a Blob in a browser, a file on a phone. */
export type Piece = { blob?: Blob; uri?: string; name: string; type: string; seconds: number };

// Speech does not need music's quality: mono, 16 kHz, small enough to send over a campus network.
const SPEECH = { ...RecordingPresets.HIGH_QUALITY, sampleRate: 16_000, numberOfChannels: 1, bitRate: 32_000 };

export function usePieceRecorder(onPiece: (piece: Piece) => void) {
  const recorder = useAudioRecorder(SPEECH);
  const [state, setState] = useState<ListenState>("idle");
  const handler = useRef(onPiece);
  handler.current = onPiece;
  const live = useRef({ active: false, startedAt: 0, timer: null as ReturnType<typeof setTimeout> | null, turning: Promise.resolve() });

  /** Finishes the piece being recorded and hands it over; starts the next one unless the class is over. */
  const turn = useCallback(async () => {
    const now = live.current;
    if (now.timer) clearTimeout(now.timer);
    const seconds = (Date.now() - now.startedAt) / 1000;
    await recorder.stop();
    const uri = recorder.uri;
    if (uri && seconds > 0.5) handler.current({ uri, name: "piece.m4a", type: "audio/m4a", seconds });
    if (!now.active) return;
    await recorder.prepareToRecordAsync();
    recorder.record();
    now.startedAt = Date.now();
    now.timer = setTimeout(() => { now.turning = now.turning.then(turn).catch(() => {}); }, PIECE_MS);
  }, [recorder]);

  const start = useCallback(async () => {
    setState("asking");
    const permission = await AudioModule.requestRecordingPermissionsAsync();
    if (!permission.granted) {
      setState("denied");
      return false;
    }
    try {
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
    } catch {
      setState("unsupported");
      return false;
    }
    const now = live.current;
    now.active = true;
    now.startedAt = Date.now();
    now.timer = setTimeout(() => { now.turning = now.turning.then(turn).catch(() => {}); }, PIECE_MS);
    setState("recording");
    return true;
  }, [recorder, turn]);

  /** Stops, and resolves once the last piece has been handed over. */
  const stop = useCallback(async () => {
    const now = live.current;
    if (!now.active) return;
    now.active = false;
    now.turning = now.turning.then(turn).catch(() => {});
    await now.turning;
    await setAudioModeAsync({ allowsRecording: false }).catch(() => {});
    setState("idle");
  }, [turn]);

  // Leaving the screen lets go of the microphone.
  useEffect(() => () => {
    const now = live.current;
    if (now.timer) clearTimeout(now.timer);
    if (now.active) {
      now.active = false;
      recorder.stop().catch(() => {});
    }
  }, [recorder]);

  return { state, start, stop };
}

export function appendPiece(form: FormData, piece: Piece) {
  // React Native's FormData takes a file by where it is on the phone.
  if (piece.uri) form.append("audio", { uri: piece.uri, name: piece.name, type: piece.type } as unknown as Blob);
}
