"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut, LayoutDashboard, CircleUserRound } from "lucide-react";
import { type CurrentUser, getInitials } from "@/lib/useCurrentUser";

// Avatar (initials) + dropdown, sitting to the right of the primary CTA in
// the public nav - replaces inline "Admin Dashboard"/"My Account"/"Logout"
// text links with a single always-visible element that opens to reveal them.
export default function UserMenu({ user, onLogout }: { user: CurrentUser; onLogout: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isStaff = user.role === "admin" || user.role === "staff";

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={open}
        className="w-10 h-10 rounded-full border-2 border-ink bg-action-lime text-text-on-lime font-display text-sm flex items-center justify-center shrink-0 shadow-[2px_2px_0_var(--color-ink)] hover:-translate-y-0.5 hover:shadow-[3px_3px_0_var(--color-ink)] active:translate-y-0 active:shadow-[1px_1px_0_var(--color-ink)] transition-[transform,box-shadow]"
      >
        {getInitials(user.fullName)}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-60 rounded-lg border-2 border-ink bg-surface shadow-[4px_4px_0_var(--color-ink)] overflow-hidden z-50"
          >
            <div className="px-4 py-3 border-b-2 border-border-subtle">
              <p className="font-bold text-text-primary truncate">{user.fullName}</p>
              <p className="text-xs text-text-muted truncate">{user.email}</p>
            </div>
            <div className="p-1.5">
              {isStaff ? (
                <Link
                  href="/admin/dashboard"
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg font-bold text-text-muted hover:bg-highlight hover:text-lime-800 dark:hover:text-lime-300 transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" aria-hidden="true" />
                  Admin Dashboard
                </Link>
              ) : (
                <Link
                  href="/dashboard"
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg font-bold text-text-muted hover:bg-highlight hover:text-lime-800 dark:hover:text-lime-300 transition-colors"
                >
                  <CircleUserRound className="w-4 h-4" aria-hidden="true" />
                  My Account
                </Link>
              )}
              <button
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg font-bold text-text-muted hover:bg-highlight hover:text-lime-800 dark:hover:text-lime-300 transition-colors"
              >
                <LogOut className="w-4 h-4" aria-hidden="true" />
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
