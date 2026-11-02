// Minimal in-memory sliding-window rate limiter. Deliberately simple - no
// external dependency, no Redis/KV - so it works out of the box on the
// Docker single-process deployment this project already documents. It does
// NOT work correctly across multiple serverless instances (each instance
// has its own memory), since a limit tracked in one instance's memory is
// invisible to another. If this app ever moves to a multi-instance
// serverless deployment, swap the Map below for a shared store (e.g.
// Upstash/Vercel KV) behind the same `check()` signature.
const attempts = new Map<string, number[]>();

// Sweep old keys occasionally so this doesn't grow unbounded on a
// long-running process - cheap since it only runs every CLEANUP_INTERVAL.
const CLEANUP_INTERVAL_MS = 10 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  for (const [key, timestamps] of attempts) {
    const fresh = timestamps.filter((t) => now - t < windowMs);
    if (fresh.length === 0) attempts.delete(key);
    else attempts.set(key, fresh);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

// Returns whether `key` is still within `maxAttempts` over the last
// `windowMs` milliseconds, and records this attempt regardless (so repeated
// calls while blocked keep extending nothing - the window is fixed from the
// oldest attempt still in range, not reset on each check).
export function checkRateLimit(key: string, maxAttempts: number, windowMs: number): RateLimitResult {
  cleanup(windowMs);
  const now = Date.now();
  const existing = attempts.get(key) ?? [];
  const inWindow = existing.filter((t) => now - t < windowMs);

  if (inWindow.length >= maxAttempts) {
    const oldest = Math.min(...inWindow);
    const retryAfterSeconds = Math.ceil((windowMs - (now - oldest)) / 1000);
    attempts.set(key, inWindow);
    return { allowed: false, retryAfterSeconds };
  }

  inWindow.push(now);
  attempts.set(key, inWindow);
  return { allowed: true, retryAfterSeconds: 0 };
}
