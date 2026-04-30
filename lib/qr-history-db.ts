import type { QrMode, QrStoredFields } from "./qr-payload";

const DB_NAME = "qrcode-generator-history";
const STORE = "qr_history";
const DB_VERSION = 1;

export const QR_HISTORY_MAX = 1000;

export interface QrHistoryRecord {
  id: string;
  mode: QrMode;
  fields: QrStoredFields;
  payload: string;
  createdAt: number;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error ?? new Error("indexedDB.open failed"));
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const os = db.createObjectStore(STORE, { keyPath: "id" });
        os.createIndex("createdAt", "createdAt", { unique: false });
      }
    };
  });
}

function reqDone<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onerror = () => reject(req.error ?? new Error("IDBRequest failed"));
    req.onsuccess = () => resolve(req.result as T);
  });
}

/**
 * Insert a row; if at capacity, delete oldest (by createdAt) in the same
 * readwrite transaction before add — avoids closing the tx between trim and add.
 */
export async function addQrHistoryRecord(
  input: Omit<QrHistoryRecord, "id" | "createdAt">,
): Promise<QrHistoryRecord> {
  const record: QrHistoryRecord = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  };

  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    tx.oncomplete = () => resolve(record);
    tx.onerror = () => reject(tx.error ?? new Error("transaction failed"));
    tx.onabort = () => reject(tx.error ?? new Error("transaction aborted"));

    const countReq = store.count();
    countReq.onerror = () =>
      reject(countReq.error ?? new Error("count failed"));
    countReq.onsuccess = () => {
      const count = countReq.result;
      const toRemove = Math.max(0, count - QR_HISTORY_MAX + 1);

      const doAdd = () => {
        const addReq = store.add(record);
        addReq.onerror = () => reject(addReq.error ?? new Error("add failed"));
      };

      if (toRemove <= 0) {
        doAdd();
        return;
      }

      const index = store.index("createdAt");
      let left = toRemove;
      const curReq = index.openCursor();
      curReq.onerror = () =>
        reject(curReq.error ?? new Error("trim cursor failed"));
      curReq.onsuccess = () => {
        const cursor = curReq.result;
        if (!cursor || left <= 0) {
          doAdd();
          return;
        }
        const delReq = cursor.delete();
        delReq.onerror = () =>
          reject(delReq.error ?? new Error("trim delete failed"));
        delReq.onsuccess = () => {
          left--;
          if (left <= 0) {
            doAdd();
          } else {
            cursor.continue();
          }
        };
      };
    };
  });
}

export async function listQrHistory(
  limit: number,
  offset = 0,
): Promise<QrHistoryRecord[]> {
  const db = await openDb();
  const tx = db.transaction(STORE, "readonly");
  const store = tx.objectStore(STORE);
  const index = store.index("createdAt");
  const out: QrHistoryRecord[] = [];
  return new Promise((resolve, reject) => {
    let skipped = 0;
    const req = index.openCursor(null, "prev");
    req.onerror = () => reject(req.error ?? new Error("list cursor failed"));
    req.onsuccess = () => {
      const cursor = req.result;
      if (!cursor) {
        resolve(out);
        return;
      }
      if (skipped < offset) {
        skipped++;
        cursor.continue();
        return;
      }
      if (out.length < limit) {
        out.push(cursor.value as QrHistoryRecord);
        cursor.continue();
      } else {
        resolve(out);
      }
    };
  });
}

export async function deleteQrHistoryRecord(id: string): Promise<void> {
  const db = await openDb();
  const tx = db.transaction(STORE, "readwrite");
  await reqDone(tx.objectStore(STORE).delete(id));
}

export async function clearQrHistory(): Promise<void> {
  const db = await openDb();
  const tx = db.transaction(STORE, "readwrite");
  await reqDone(tx.objectStore(STORE).clear());
}

export async function countQrHistory(): Promise<number> {
  const db = await openDb();
  const tx = db.transaction(STORE, "readonly");
  return reqDone(tx.objectStore(STORE).count());
}
