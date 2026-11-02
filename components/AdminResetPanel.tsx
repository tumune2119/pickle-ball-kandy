"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Loader2 } from "lucide-react";
import { getSession } from "@/lib/auth";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface AdminResetPanelProps {
  onReset?: () => void;
}

// TEMPORARY dev tool - lets the team wipe all test bookings/customers and
// start over while building the site. The user asked for this to be
// unmissable ("make obvious on top") since it's destructive and will be
// removed before launch - see app/api/admin/reset/route.ts.
export default function AdminResetPanel({ onReset }: AdminResetPanelProps) {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleReset = async () => {
    const session = await getSession();
    if (!session) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/reset", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setResult(`Deleted ${data.deleted.bookings} booking(s) and ${data.deleted.customers} customer account(s).`);
        setOpen(false);
        setConfirmText("");
        onReset?.();
      } else {
        setResult(data.error || "Reset failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-8 rounded-xl border-2 border-red-400 dark:border-red-700 bg-red-50 dark:bg-red-950/40 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-bold text-red-800 dark:text-red-300">Temporary developer tool - will be removed before launch</p>
            <p className="text-sm text-red-700 dark:text-red-400">
              Permanently deletes every customer account and booking so you can test from a clean slate. Admin/staff
              accounts are kept.
            </p>
          </div>
        </div>
        <Button variant="destructive" onClick={() => setOpen(true)} className="shrink-0">
          Reset All Test Data
        </Button>
      </div>

      {result && <p className="mt-3 text-sm font-medium text-red-800 dark:text-red-300">{result}</p>}

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !loading && setOpen(false)}
          >
            <motion.div
              className="w-full max-w-md bg-white dark:bg-gray-900 rounded-xl p-6 shadow-2xl"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-red-700 dark:text-red-400 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" aria-hidden="true" />
                This cannot be undone
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                Every customer account, guest booking, and payment record will be permanently deleted. Type{" "}
                <strong>RESET</strong> to confirm.
              </p>
              <Input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type RESET"
                autoFocus
              />
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="secondary" onClick={() => setOpen(false)} disabled={loading}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  disabled={confirmText !== "RESET" || loading}
                  onClick={handleReset}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                      Deleting…
                    </>
                  ) : (
                    "Delete Everything"
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
