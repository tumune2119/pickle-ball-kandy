"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center px-4">
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
        <Image
          src="/images/hero-court-bg.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/50 to-sage-950/85" />
      </div>

      <Link
        href="/"
        className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        Back to Home
      </Link>

      <ThemeToggle variant="on-color" className="absolute top-4 right-4 z-10" />

      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md bg-white/55 dark:bg-white/[0.06] backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-2xl shadow-2xl shadow-sage-950/30 p-8"
      >
        {children}
      </motion.div>
    </div>
  );
}
