import { cn } from "@/lib/cn";

export type CardTint = "neutral" | "brand" | "admin" | "success" | "warning" | "danger";

const TINTS: Record<CardTint, string> = {
  neutral: "bg-surface border-border-default",
  brand: "bg-highlight border-brand-200 dark:border-brand-800/60",
  admin: "bg-admin-bg border-admin-border",
  success: "bg-success-100 dark:bg-success-900/40 border-success-300 dark:border-success-800/60",
  warning: "bg-warning-100 dark:bg-warning-900/40 border-warning-300 dark:border-warning-800/60",
  danger: "bg-danger-100 dark:bg-danger-900/40 border-danger-300 dark:border-danger-800/60",
};

// Frosted-glass variant (opt-in via the `glass` prop) - public/customer only,
// inspired by the glassmorphism mood board. Translucent instead of solid so
// the ambient blurred color blobs behind it (see PageBackdrop) show through.
// Admin never passes `glass`, so TINTS above still governs every admin card.
const GLASS_TINTS: Record<CardTint, string> = {
  neutral: "bg-white/55 dark:bg-white/[0.06] border-white/60 dark:border-white/10",
  brand: "bg-brand-100/55 dark:bg-brand-950/30 border-white/50 dark:border-brand-800/30",
  admin: "bg-info-100/55 dark:bg-info-950/30 border-white/50 dark:border-info-800/30",
  success: "bg-success-100/55 dark:bg-success-900/30 border-white/50 dark:border-success-800/30",
  warning: "bg-warning-100/55 dark:bg-warning-900/30 border-white/50 dark:border-warning-800/30",
  danger: "bg-danger-100/55 dark:bg-danger-900/30 border-white/50 dark:border-danger-800/30",
};

const PADDING = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  tint?: CardTint;
  padding?: keyof typeof PADDING;
  hover?: boolean;
  glass?: boolean;
}

// The one canonical card treatment for the whole app - resolves the
// shadow-card (admin dashboard/reports) vs border-card (settings/tables)
// split, and the ad hoc sage/green/orange/red-50 "callout box" pattern
// repeated across customer + admin pages, into a single component.
export default function Card({
  tint = "neutral",
  padding = "md",
  hover = false,
  glass = false,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border shadow-sm",
        hover && "transition-shadow duration-200 hover:shadow-md",
        glass ? cn(GLASS_TINTS[tint], "backdrop-blur-xl shadow-lg shadow-black/5") : TINTS[tint],
        PADDING[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
