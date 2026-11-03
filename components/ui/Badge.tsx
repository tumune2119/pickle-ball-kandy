import { cn } from "@/lib/cn";

export type BadgeTone = "success" | "warning" | "danger" | "neutral" | "info" | "brand";

const TONES: Record<BadgeTone, string> = {
  success:
    "bg-success-100 dark:bg-success-900/40 text-success-800 dark:text-success-300 border-success-300 dark:border-success-700/60",
  warning:
    "bg-warning-100 dark:bg-warning-900/40 text-warning-800 dark:text-warning-300 border-warning-300 dark:border-warning-700/60",
  danger:
    "bg-danger-100 dark:bg-danger-900/40 text-danger-800 dark:text-danger-300 border-danger-300 dark:border-danger-700/60",
  neutral:
    "bg-surface-sunken text-text-muted border-border-default",
  info: "bg-info-100 dark:bg-info-900/40 text-info-800 dark:text-info-300 border-info-300 dark:border-info-700/60",
  brand:
    "bg-highlight text-lime-800 dark:text-lime-300 border-lime-400 dark:border-lime-700/60",
};

interface BadgeProps {
  tone?: BadgeTone;
  /** Sticker treatment: thick ink border, small rotate - for one-off
   * attention badges ("Popular", "New"), not status pills in tables/lists. */
  sticker?: boolean;
  className?: string;
  children: React.ReactNode;
}

// One status→color mapping for the whole app - replaces the 3 slightly
// different inline badge implementations previously in the customer
// dashboard, MyBookingsList (getStatusBadge/getPaymentBadge), and
// AdminBookingsTable (getStatusColor).
export default function Badge({ tone = "neutral", sticker = false, className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap",
        sticker
          ? "border-2 border-ink -rotate-2 shadow-[2px_2px_0_var(--color-ink)]"
          : "border",
        TONES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function bookingStatusTone(status: string): BadgeTone {
  switch (status) {
    case "confirmed":
      return "success";
    case "pending_payment":
      return "warning";
    case "cancelled":
      return "danger";
    default:
      return "neutral";
  }
}

export function paymentStatusTone(status: string): BadgeTone {
  switch (status) {
    case "paid":
      return "success";
    case "unpaid":
      return "warning";
    case "refunded":
      return "neutral";
    default:
      return "neutral";
  }
}
