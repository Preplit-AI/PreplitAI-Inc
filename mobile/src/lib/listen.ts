import { useCallback, useEffect, useRef, useState } from "react";
import { AudioModule, RecordingPresets, setAudioModeAsync, useAudioRecorder } from "expo-audio";

/*
 * Recording a class on a phone: one file from Start to Stop. Nothing is sent
 * while the class goes on; the file is sent once, after Stop (recording.ts).
 * (The browser's version of this is listen.web.ts.)
 *
 * The app has to stay open while it records: recording with the screen off
 * needs a development build with background recording switched on.
 */

export type ListenState = "idle" | "asking" | "recording" | "denied" | "unsupported";
/** A finished recording: a Blob in a browser, a file on a phone. */
export type Take = { blob?: Blob; uri?: string; ext: string; type: string; seconds: number };

// Speech does not need music's quality: mono, 16 kHz, 32 kbps is about 14 MB an hour.
const SPEECH = { ...RecordingPresets.HIGH_QUALITY, sampleRate: 16_000, numberOfChannels: 1, bitRate: 32_000 };

export function useClassRecorder() {
  const recorder = useAudioRecorder(SPEECH);
  const [state, setState] = useState<ListenState>("idle");
  const live = useRef({ active: false, startedAt: 0 });

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
    live.current = { active: true, startedAt: Date.now() };
    setState("recording");
    return true;
  }, [recorder]);

  /** Stops and returns the recording, or null if there was none. */
  const stop = useCallback(async (): Promise<Take | null> => {
    const now = live.current;
    if (!now.active) return null;
    now.active = false;
    const seconds = (Date.now() - now.startedAt) / 1000;
    try {
      await recorder.stop();
    } finally {
      await setAudioModeAsync({ allowsRecording: false }).catch(() => {});
      setState("idle");
    }
    const uri = recorder.uri;
    return uri && seconds > 0.5 ? { uri, ext: ".m4a", type: "audio/m4a", seconds } : null;
  }, [recorder]);

  // Leaving the screen lets go of the microphone.
  useEffect(() => () => {
    if (live.current.active) {
      live.current.active = false;
      recorder.stop().catch(() => {});
    }
  }, [recorder]);

  return { state, start, stop };
}
