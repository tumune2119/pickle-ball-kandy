"use client";

import { motion } from "framer-motion";
import ThemeToggle from "@/components/ThemeToggle";

// Deliberately flat and quiet - no photo, no blurred gradient blobs, no
// graffiti/sticker treatment - the admin surface stays "same brand, toned
// down" even on its own login screen.
export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-concrete-900 flex items-center justify-center px-4">
      <ThemeToggle variant="on-color" className="absolute top-4 right-4 z-10" />

      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md bg-admin-surface rounded-xl shadow-xl border border-admin-border p-8"
      >
        {children}
      </motion.div>
    </div>
  );
}
