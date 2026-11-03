"use client";

import { motion } from "framer-motion";
import ThemeToggle from "@/components/ThemeToggle";

// Admin/POS now follows the same theme as the rest of the site (the old
// "deliberately flat, no sticker treatment" convention was retired) - same
// bordered/offset-shadow card as the customer auth layout, just without the
// hero photo backdrop. bg-admin-bg (not a hardcoded color) so it respects
// the light/dark toggle like every other admin surface now does.
export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-admin-bg flex items-center justify-center px-4">
      <ThemeToggle variant="neutral" className="absolute top-4 right-4 z-10" />

      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98, rotate: -1 }}
        animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md bg-admin-surface rounded-2xl border-2 border-ink shadow-[6px_6px_0_var(--color-admin-action)] p-8"
      >
        {children}
      </motion.div>
    </div>
  );
}
