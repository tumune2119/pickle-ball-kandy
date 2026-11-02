"use client";

import { MotionConfig } from "framer-motion";

// Wraps the app so every framer-motion animation - reveals, the theme
// toggle, the booking wizard, etc. - collapses to instant transitions for
// visitors with prefers-reduced-motion set, without hiding any content.
export default function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
