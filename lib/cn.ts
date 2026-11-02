import { clsx, type ClassValue } from "clsx";

// Thin wrapper around clsx for conditional className composition across
// components/ui/*. No Tailwind class merging/de-duping (tailwind-merge) is
// needed since ui/* components own their base classes and callers only add
// non-conflicting extras via `className`.
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
