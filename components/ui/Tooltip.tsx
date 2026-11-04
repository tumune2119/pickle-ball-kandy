"use client";

import { cn } from "@/lib/cn";

// CSS-only (group-hover/group-focus) tooltip for icon-only buttons - no JS
// positioning library needed since every call site anchors it to a small,
// predictably-placed trigger (a table action icon).
export default function Tooltip({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("relative inline-flex group", className)}>
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap rounded-md bg-ink px-2 py-1 text-xs font-medium text-white opacity-0 scale-95 transition-[opacity,transform] duration-100 group-hover:opacity-100 group-hover:scale-100 group-focus-within:opacity-100 group-focus-within:scale-100 z-20"
      >
        {label}
      </span>
    </span>
  );
}
