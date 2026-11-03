"use client";

// Offline queue for the POS till (app/pos). The venue's counter wifi can
// drop mid-sale - rather than blocking checkout, a sale/booking that can't
// reach the server is queued here (localStorage, so it survives a page
// reload) and the UI proceeds as if it succeeded: the ticket still prints,
// staff keeps working. A reconnect listener and a periodic timer flush the
// queue in order. Every queued payload carries a client-generated `id`
// (set by the caller before enqueueing), which is what makes a resynced
// write safe to retry - see the onConflictDoNothing/already-exists handling
// in app/api/pos/sales and app/api/pos/bookings.

const STORAGE_KEY = "pos-offline-queue";

export interface QueuedOperation {
  id: string; // matches the sale/booking's own id - the idempotency key
  kind: "sale" | "booking";
  endpoint: string;
  payload: unknown;
  authHeader: string;
  queuedAt: string;
}

export function getQueue(): QueuedOperation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as QueuedOperation[]) : [];
  } catch {
    return [];
  }
}

function saveQueue(queue: QueuedOperation[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  } catch {
    // Storage full or unavailable - the in-memory attempt already happened;
    // losing the persisted queue on a reload is the worst case, not a crash.
  }
}

function enqueue(op: QueuedOperation) {
  const queue = getQueue();
  queue.push(op);
  saveQueue(queue);
}

function removeFromQueue(id: string) {
  saveQueue(getQueue().filter((op) => op.id !== id));
}

// A thrown fetch (network unreachable) or a 5xx (server temporarily down)
// queues for later. A 4xx is a real validation problem - surfaced to the
// user immediately, never silently queued and retried forever.
export async function attemptOrQueue(op: Omit<QueuedOperation, "queuedAt">): Promise<
  | { status: "synced"; data: unknown }
  | { status: "queued" }
  | { status: "error"; message: string }
> {
  try {
    const res = await fetch(op.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: op.authHeader },
      body: JSON.stringify(op.payload),
    });

    if (res.ok) {
      return { status: "synced", data: await res.json() };
    }

    if (res.status >= 500) {
      enqueue({ ...op, queuedAt: new Date().toISOString() });
      return { status: "queued" };
    }

    const body = await res.json().catch(() => ({}));
    return { status: "error", message: body.error || `Request failed (${res.status})` };
  } catch {
    // fetch() itself threw - no connection at all.
    enqueue({ ...op, queuedAt: new Date().toISOString() });
    return { status: "queued" };
  }
}

// Attempts every queued item in order, stopping at the first failure so
// nothing gets resent out of order. Returns how many synced this pass.
export async function flushQueue(): Promise<{ synced: number; remaining: number }> {
  const queue = getQueue();
  let synced = 0;

  for (const op of queue) {
    try {
      const res = await fetch(op.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: op.authHeader },
        body: JSON.stringify(op.payload),
      });
      if (!res.ok) break; // still down or still failing - stop, try again later
      removeFromQueue(op.id);
      synced++;
    } catch {
      break; // still offline
    }
  }

  return { synced, remaining: getQueue().length };
}
