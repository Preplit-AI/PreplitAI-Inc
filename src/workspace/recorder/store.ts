/*
 * Recordings on this device, in the browser's own database.
 *
 * A lecture cannot be recorded twice, so the audio is written here every few
 * seconds while recording and stays until the notes exist. A crash, a closed
 * tab, a lost connection or a failed transcription therefore loses nothing: the
 * recording is still here to upload again.
 */

export type StoredRecording = {
  id: string;
  /** Recordings belong to an account, so a shared computer never mixes them up. */
  userId: string;
  courseId: string;
  courseName: string;
  startedAt: string;
  mimeType: string;
  durationMs: number;
  size: number;
  /** recording: in progress or cut off. stopped: waiting to upload. uploaded: being turned into notes. failed: notes could not be made. */
  status: "recording" | "stopped" | "uploaded" | "failed";
  interrupted?: boolean;
  lectureId?: string;
  error?: string;
};

const DB_NAME = "junbee-recordings";
const RECORDINGS = "recordings";
const CHUNKS = "chunks";
/** Past this, a recording nobody came back for is removed. */
const KEEP_MS = 14 * 24 * 60 * 60 * 1000;

let opening: Promise<IDBDatabase> | null = null;

function open(): Promise<IDBDatabase> {
  if (!opening) {
    opening = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        req.result.createObjectStore(RECORDINGS, { keyPath: "id" });
        req.result.createObjectStore(CHUNKS, { keyPath: ["recordingId", "seq"] });
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => {
        opening = null;
        reject(req.error);
      };
    });
  }
  return opening;
}

function run<T>(stores: string[], mode: IDBTransactionMode, work: (tx: IDBTransaction) => IDBRequest<T> | void): Promise<T | undefined> {
  return open().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(stores, mode);
        const req = work(tx);
        tx.oncomplete = () => resolve(req ? req.result : undefined);
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
      }),
  );
}

export const saveRecording = (recording: StoredRecording) =>
  run([RECORDINGS], "readwrite", (tx) => {
    tx.objectStore(RECORDINGS).put(recording);
  });

export const addChunk = (recordingId: string, seq: number, blob: Blob) =>
  run([CHUNKS], "readwrite", (tx) => {
    tx.objectStore(CHUNKS).put({ recordingId, seq, blob });
  });

export async function listRecordings(userId: string): Promise<StoredRecording[]> {
  const all = await run<StoredRecording[]>([RECORDINGS], "readonly", (tx) => tx.objectStore(RECORDINGS).getAll());
  return (all ?? []).filter((r) => r.userId === userId);
}

const chunkRange = (id: string) => IDBKeyRange.bound([id, 0], [id, Number.MAX_SAFE_INTEGER]);

export async function readAudio(recording: StoredRecording): Promise<Blob> {
  const chunks = await run<{ blob: Blob }[]>([CHUNKS], "readonly", (tx) => tx.objectStore(CHUNKS).getAll(chunkRange(recording.id)));
  return new Blob((chunks ?? []).map((c) => c.blob), { type: recording.mimeType });
}

export const deleteRecording = (id: string) =>
  run([RECORDINGS, CHUNKS], "readwrite", (tx) => {
    tx.objectStore(RECORDINGS).delete(id);
    tx.objectStore(CHUNKS).delete(chunkRange(id));
  });

/** Anything recording in storage but not in memory was cut off by a crash or a closed tab. */
export async function tidyRecordings(userId: string, activeId: string | null, now = Date.now()) {
  const recordings = await listRecordings(userId);
  const kept: StoredRecording[] = [];
  for (const recording of recordings) {
    if (recording.id !== activeId && now - Date.parse(recording.startedAt) > KEEP_MS) {
      await deleteRecording(recording.id);
      continue;
    }
    if (recording.status === "recording" && recording.id !== activeId) {
      const cutOff: StoredRecording = { ...recording, status: "stopped", interrupted: true };
      await saveRecording(cutOff);
      kept.push(cutOff);
    } else {
      kept.push(recording);
    }
  }
  return kept;
}
