"use client";

import { useEffect, useState, useCallback } from "react";
import { CloudOff, RefreshCw } from "lucide-react";
import { getQueue, flushQueue } from "@/lib/pos-queue";

// Shows how many sales/bookings are waiting to sync (queued while offline),
// and retries them automatically on reconnect + a periodic timer. A manual
// "Retry" button covers the case where `online` fired but the connection is
// still flaky.
export default function OfflineQueueBadge() {
  const [pending, setPending] = useState<number>(() => (typeof window === "undefined" ? 0 : getQueue().length));
  const [syncing, setSyncing] = useState(false);

  const refreshCount = useCallback(() => setPending(getQueue().length), []);

  const sync = useCallback(async () => {
    if (getQueue().length === 0) return;
    setSyncing(true);
    await flushQueue();
    refreshCount();
    setSyncing(false);
  }, [refreshCount]);

  useEffect(() => {
    const interval = setInterval(() => {
      refreshCount();
      sync();
    }, 15000);
    window.addEventListener("online", sync);
    window.addEventListener("storage", refreshCount);
    return () => {
      clearInterval(interval);
      window.removeEventListener("online", sync);
      window.removeEventListener("storage", refreshCount);
    };
  }, [sync, refreshCount]);

  if (pending === 0) return null;

  return (
    <button
      onClick={sync}
      disabled={syncing}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-warning-100 dark:bg-warning-900/40 text-warning-800 dark:text-warning-300 text-sm font-medium border border-warning-300 dark:border-warning-800/60"
      title="Some sales haven't synced yet - click to retry now"
    >
      {syncing ? <RefreshCw className="w-4 h-4 animate-spin" aria-hidden="true" /> : <CloudOff className="w-4 h-4" aria-hidden="true" />}
      {pending} pending sync
    </button>
  );
}
