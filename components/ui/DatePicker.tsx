"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { ymdInVenueTimezone } from "@/lib/utils";

interface DatePickerProps {
  label?: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  className?: string;
  id?: string;
}

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const PANEL_WIDTH = 288;
// Rough worst case (6-row month): header + weekday labels + 6 cell rows + padding.
const PANEL_HEIGHT_ESTIMATE = 336;

// value/min/max travel as yyyy-mm-dd strings (same contract as
// <input type="date">), parsed/formatted via local Y/M/D components rather
// than toISOString() - the latter shifts a date backward for any timezone
// ahead of UTC (see the schedule grid's toDateKey fix).
function parseYMD(s?: string): Date | null {
  if (!s) return null;
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function toYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

const subscribeNever = () => () => {};

// Portals can only render once mounted on the client (document.body isn't
// available during SSR). useSyncExternalStore gives a correct false->true
// flip across hydration without an effect that calls setState directly.
function useMounted(): boolean {
  return useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false
  );
}

export { toYMD };

export default function DatePicker({ label, hint, value, onChange, min, max, className, id }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const mounted = useMounted();
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const selected = parseYMD(value);
  const minD = parseYMD(min);
  const maxD = parseYMD(max);
  const [viewDate, setViewDate] = useState(() => selected ?? minD ?? new Date());
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Jump the visible month to match `value` when it changes externally -
  // done during render (React's documented pattern for this) rather than in
  // an effect, since a synchronizing effect here would just cause an extra
  // render pass for no benefit.
  const [trackedValue, setTrackedValue] = useState(value);
  if (value !== trackedValue) {
    setTrackedValue(value);
    if (selected) setViewDate(selected);
  }

  // Portaled to <body> and positioned via fixed coords (not a CSS-relative
  // absolute child) - the calendar's trigger commonly sits inside a `glass`
  // Card, and that Card's backdrop-blur creates its own stacking context,
  // which traps a same-context absolute popover beneath later sibling
  // cards on the page regardless of z-index. Portaling escapes that.
  useEffect(() => {
    if (!open) return;

    const updateCoords = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      // Fixed compact width regardless of how wide the trigger is (a
      // calendar stretched to a full-width input looks oversized) - just
      // clamped to the viewport on narrow screens.
      const width = Math.min(PANEL_WIDTH, window.innerWidth - 32);
      const left = Math.min(rect.left, window.innerWidth - width - 16);
      // Flip above the trigger when there isn't room below, so the panel
      // never runs off the bottom of the viewport.
      const fitsBelow = rect.bottom + 8 + PANEL_HEIGHT_ESTIMATE <= window.innerHeight;
      const top = fitsBelow ? rect.bottom + 8 : Math.max(8, rect.top - 8 - PANEL_HEIGHT_ESTIMATE);
      setCoords({ top, left: Math.max(16, left), width });
    };
    updateCoords();

    function onScrollOrResize() {
      updateCoords();
    }
    function onClick(e: MouseEvent) {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (popoverRef.current?.contains(target)) return;
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // The venue's "today", not the visitor's browser-local today - see
  // ymdInVenueTimezone.
  const today = parseYMD(ymdInVenueTimezone())!;

  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  const isDisabled = (d: Date) => (!!minD && d < minD) || (!!maxD && d > maxD);
  const canGoPrev = !minD || new Date(year, month, 0) >= minD;
  const canGoNext = !maxD || new Date(year, month + 1, 1) <= maxD;

  return (
    <div className={cn("relative", className)}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}

      <button
        ref={triggerRef}
        id={id}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={cn(
          "w-full flex items-center justify-between gap-2 px-4 py-3 rounded-lg border border-gray-300 dark:border-white/15 bg-surface text-left",
          "hover:border-sage-400 dark:hover:border-sage-600",
          "focus:outline-none focus:ring-2 focus:ring-sage-600 dark:focus:ring-sage-500 focus:border-transparent transition-colors"
        )}
      >
        <span className={cn("text-lg", selected ? "text-text-primary" : "text-gray-400 dark:text-gray-500")}>
          {selected
            ? selected.toLocaleDateString("en-LK", { weekday: "short", year: "numeric", month: "long", day: "numeric" })
            : "Pick a date to play"}
        </span>
        <CalendarIcon className="w-5 h-5 text-sage-600 dark:text-sage-400 shrink-0" aria-hidden="true" />
      </button>

      {hint && <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{hint}</p>}

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                ref={popoverRef}
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                role="dialog"
                aria-label="Choose a date"
                style={{ position: "fixed", top: coords.top, left: coords.left, width: coords.width }}
                className="z-50 max-w-[calc(100vw-2rem)] rounded-xl border border-white/60 dark:border-white/10 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-xl p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <button
                    type="button"
                    onClick={() => canGoPrev && setViewDate(new Date(year, month - 1, 1))}
                    disabled={!canGoPrev}
                    aria-label="Previous month"
                    className="p-1 rounded-lg hover:bg-sage-50 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 dark:text-gray-300"
                  >
                    <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                  </button>
                  <p className="font-display font-bold text-sm text-text-primary">
                    {viewDate.toLocaleDateString("en-LK", { month: "long", year: "numeric" })}
                  </p>
                  <button
                    type="button"
                    onClick={() => canGoNext && setViewDate(new Date(year, month + 1, 1))}
                    disabled={!canGoNext}
                    aria-label="Next month"
                    className="p-1 rounded-lg hover:bg-sage-50 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 dark:text-gray-300"
                  >
                    <ChevronRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-0.5 mb-0.5">
                  {WEEKDAYS.map((w, i) => (
                    <div key={i} className="text-center text-[11px] font-medium text-gray-500 dark:text-gray-400 py-0.5">
                      {w}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-0.5">
                  {cells.map((d, i) => {
                    if (!d) return <div key={i} />;
                    const disabled = isDisabled(d);
                    const isSelected = !!selected && isSameDay(d, selected);
                    const isToday = isSameDay(d, today);
                    return (
                      <button
                        key={i}
                        type="button"
                        disabled={disabled}
                        onClick={() => {
                          onChange(toYMD(d));
                          setOpen(false);
                        }}
                        aria-label={d.toLocaleDateString("en-LK", { weekday: "long", month: "long", day: "numeric" })}
                        aria-pressed={isSelected}
                        className={cn(
                          "aspect-square w-full rounded-full text-xs font-medium transition-colors flex items-center justify-center",
                          disabled && "text-gray-300 dark:text-gray-700 cursor-not-allowed",
                          !disabled && !isSelected && "text-text-primary hover:bg-sage-100 dark:hover:bg-sage-900/40",
                          isSelected && "bg-sage-600 text-white hover:bg-sage-700",
                          !isSelected && isToday && !disabled && "ring-1 ring-sage-400 dark:ring-sage-600"
                        )}
                      >
                        {d.getDate()}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
