"use client";

import { cn } from "@/lib/cn";

// CSS-only (group-hover/group-focus) tooltip for icon-only buttons - no JS
// positioning library needed since every call site anchors it to a small,
// predictably-placed trigger (a table action icon).
const SIDE_CLASSES = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-1.5",
  right: "left-full top-1/2 -translate-y-1/2 ml-1.5",
};

export default function Tooltip({
  label,
  children,
  className,
  side = "top",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
  side?: "top" | "right";
}) {
  return (
    <span className={cn("relative inline-flex group", className)}>
      {children}
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute whitespace-nowrap rounded-md bg-ink px-2 py-1 text-xs font-medium text-white opacity-0 scale-95 transition-[opacity,transform] duration-100 group-hover:opacity-100 group-hover:scale-100 group-focus-within:opacity-100 group-focus-within:scale-100 z-20",
          SIDE_CLASSES[side]
        )}
      >
        {label}
      </span>
    </span>
  );
}
