import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ApiError, request } from "./api";
import type { Take } from "./listen";
import type { LectureSummary } from "./types";

/*
 * Sending a recorded class, once, after Stop.
 *
 * A request to the server can carry about 4.5 MB, so the file goes in slices
 * of 4 MB. The server says which slices it already has, so a send that was cut
 * off (no signal, the app closed) carries on where it stopped. Until the server
 * has turned the slices into a lecture, the recording stays on the phone as a
 * pending class that can be sent again or thrown away.
 */

export type Pending = Take & { courseId: string; recordedAt: string; uploadId?: string };

const KEY = "preplit.recording.pending";
// A browser cannot keep a recording in storage across a reload, so it is held here.
let inMemory: Pending | null = null;

export async function loadPending(): Promise<Pending | null> {
  if (Platform.OS === "web") return inMemory;
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Pending) : null;
  } catch {
    return null;
  }
}

export async function savePending(pending: Pending) {
  if (Platform.OS === "web") {
    inMemory = pending;
    return;
  }
  const { blob: _blob, ...stored } = pending;
  await AsyncStorage.setItem(KEY, JSON.stringify(stored)).catch(() => {});
}

export async function clearPending() {
  inMemory = null;
  if (Platform.OS !== "web") await AsyncStorage.removeItem(KEY).catch(() => {});
}

/** Throws away a pending class: on the server too, if part of it was sent. */
export async function discardPending(pending: Pending | null) {
  if (pending?.uploadId) request(`/recordings/${pending.uploadId}`, { method: "DELETE" }).catch(() => {});
  await clearPending();
}

type Upload = { id: string; parts: number; bytes: number; received: number[] };

async function fileOf(pending: Pending): Promise<Blob> {
  if (pending.blob) return pending.blob;
  if (!pending.uri) throw new ApiError(0, "RecordingMissing", "");
  try {
    return await (await fetch(pending.uri)).blob();
  } catch {
    throw new ApiError(0, "RecordingMissing", "");
  }
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const retryable = (err: unknown) => {
  const status = err instanceof ApiError ? err.status : 0;
  return status === 0 || status === 408 || status === 429 || status >= 500;
};

/**
 * Sends the class and asks for its notes. `progress` goes from 0 to 1 as the
 * slices arrive. Resolves with the lecture, which is then being written.
 */
export async function sendRecording(pending: Pending, progress: (share: number) => void): Promise<LectureSummary> {
  const file = await fileOf(pending);
  let upload: Upload | null = null;
  let partBytes = 4 * 1024 * 1024;

  if (pending.uploadId) {
    upload = await request<{ upload: Upload }>(`/recordings/${pending.uploadId}`)
      .then((r) => r.upload)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) return null;
        throw err;
      });
  }
  if (!upload) {
    const parts = Math.ceil(file.size / partBytes);
    const made = await request<{ upload: Upload; partBytes: number }>("/recordings", {
      method: "POST",
      body: { courseId: pending.courseId, ext: pending.ext, parts, bytes: file.size, seconds: Math.round(pending.seconds), recordedAt: pending.recordedAt },
    });
    upload = made.upload;
    partBytes = made.partBytes;
    pending.uploadId = upload.id;
    await savePending(pending);
  }

  const have = new Set(upload.received);
  let done = have.size;
  progress(done / upload.parts);
  for (let n = 0; n < upload.parts; n++) {
    if (have.has(n)) continue;
    const slice = file.slice(n * partBytes, Math.min(file.size, (n + 1) * partBytes));
    for (let attempt = 0; ; attempt++) {
      try {
        await request(`/recordings/${upload.id}/parts/${n}`, { method: "PUT", raw: slice });
        break;
      } catch (err) {
        if (attempt >= 3 || !retryable(err)) throw err;
        await wait(1500 * (attempt + 1));
      }
    }
    done += 1;
    progress(done / upload.parts);
  }

  const finished = await request<{ lecture: LectureSummary }>(`/recordings/${upload.id}/finish`, { method: "POST", body: {} });
  await clearPending();
  return finished.lecture;
}
