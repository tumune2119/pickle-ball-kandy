"use client";

import { motion } from "framer-motion";
import ThemeToggle from "@/components/ThemeToggle";

export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-slate-800 via-blue-900 to-gray-950 flex items-center justify-center px-4">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-float" />
        <div
          className="absolute -bottom-32 -right-16 w-md h-112 bg-sky-400/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "1.5s" }}
        />
      </div>

      <ThemeToggle variant="on-color" className="absolute top-4 right-4 z-10" />

      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl shadow-blue-950/30 p-8"
      >
        {children}
      </motion.div>
    </div>
  );
}
