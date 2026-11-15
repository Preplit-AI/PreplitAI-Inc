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

const DB_NAME = "preplit-recordings";
/**
 * Where recordings were kept before the product had its current name. Anything
 * still there is moved across the first time this device opens the store, then
 * the old database is deleted. Remove this once no device can still hold one
 * (recordings are kept 14 days at most).
 */
const OLD_DB_NAME = "junbee-recordings";
const RECORDINGS = "recordings";
const CHUNKS = "chunks";
/** Past this, a recording nobody came back for is removed. */
const KEEP_MS = 14 * 24 * 60 * 60 * 1000;

let opening: Promise<IDBDatabase> | null = null;

function openNamed(name: string, create: boolean): Promise<IDBDatabase | null> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(name, 1);
    req.onupgradeneeded = () => {
      // The old database is only read, never created: if it is not there, there is nothing to move.
      if (!create) {
        req.transaction?.abort();
        return;
      }
      req.result.createObjectStore(RECORDINGS, { keyPath: "id" });
      req.result.createObjectStore(CHUNKS, { keyPath: ["recordingId", "seq"] });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => (create ? reject(req.error) : resolve(null));
  });
}

const readAll = <T,>(db: IDBDatabase, store: string) =>
  new Promise<T[]>((resolve, reject) => {
    const req = db.transaction(store, "readonly").objectStore(store).getAll();
    req.onsuccess = () => resolve(req.result as T[]);
    req.onerror = () => reject(req.error);
  });

/** Moves recordings saved under the old name into the current store. A failure leaves them where they were. */
async function moveOldRecordings(db: IDBDatabase) {
  const old = await openNamed(OLD_DB_NAME, false).catch(() => null);
  if (!old) return;
  try {
    const recordings = await readAll<StoredRecording>(old, RECORDINGS);
    const chunks = await readAll<{ recordingId: string; seq: number; blob: Blob }>(old, CHUNKS);
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction([RECORDINGS, CHUNKS], "readwrite");
      for (const r of recordings) tx.objectStore(RECORDINGS).put(r);
      for (const c of chunks) tx.objectStore(CHUNKS).put(c);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    old.close();
    indexedDB.deleteDatabase(OLD_DB_NAME);
  } catch {
    old.close();
  }
}

function open(): Promise<IDBDatabase> {
  if (!opening) {
    opening = openNamed(DB_NAME, true)
      .then(async (db) => {
        await moveOldRecordings(db as IDBDatabase);
        return db as IDBDatabase;
      })
      .catch((err) => {
        opening = null;
        throw err;
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
