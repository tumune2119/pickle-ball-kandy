import { cn } from "@/lib/cn";

// A small signature touch for the editorial rebrand - a bouncing pickleball
// (perforations and all) used sparingly as a decorative flourish, not a
// loading indicator. Pure CSS animation (see --animate-ball-bounce in
// globals.css) so it costs nothing to render in a few spots.
export default function PickleballBounce({ className }: { className?: string }) {
  return (
    <span className={cn("relative inline-block", className)} aria-hidden="true">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="w-full h-full animate-ball-bounce motion-reduce:animate-none"
      >
        <circle cx="12" cy="12" r="10" className="fill-yellow-300 stroke-yellow-600" strokeWidth="1.5" />
        <circle cx="8.5" cy="7.5" r="1" className="fill-sage-700" />
        <circle cx="15.5" cy="6.5" r="1" className="fill-sage-700" />
        <circle cx="18" cy="12" r="1" className="fill-sage-700" />
        <circle cx="15.5" cy="17.5" r="1" className="fill-sage-700" />
        <circle cx="8.5" cy="16.5" r="1" className="fill-sage-700" />
        <circle cx="6" cy="12" r="1" className="fill-sage-700" />
        <circle cx="12" cy="12" r="1" className="fill-sage-700" />
      </svg>
      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3/5 h-1.5 rounded-full bg-black/15 dark:bg-black/30 blur-[2px] animate-ball-shadow motion-reduce:animate-none" />
    </span>
  );
}
