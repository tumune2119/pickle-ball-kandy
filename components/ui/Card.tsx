import { cn } from "@/lib/cn";

export type CardTint = "neutral" | "brand" | "admin" | "success" | "warning" | "danger";

const TINTS: Record<CardTint, string> = {
  neutral: "bg-surface border-border-default",
  brand: "bg-highlight border-lime-300 dark:border-lime-800/60",
  admin: "bg-admin-surface border-admin-border",
  success: "bg-success-100 dark:bg-success-900/40 border-success-300 dark:border-success-800/60",
  warning: "bg-warning-100 dark:bg-warning-900/40 border-warning-300 dark:border-warning-800/60",
  danger: "bg-danger-100 dark:bg-danger-900/40 border-danger-300 dark:border-danger-800/60",
};

const POSTER_SHADOW: Record<CardTint, string> = {
  neutral: "shadow-[4px_4px_0_var(--color-ink)] dark:shadow-[4px_4px_0_var(--color-concrete-100)]",
  brand: "shadow-[4px_4px_0_var(--color-ink)] dark:shadow-[4px_4px_0_var(--color-lime-400)]",
  admin: "shadow-[4px_4px_0_var(--color-ink)] dark:shadow-[4px_4px_0_var(--color-concrete-100)]",
  success: "shadow-[4px_4px_0_var(--color-ink)]",
  warning: "shadow-[4px_4px_0_var(--color-ink)]",
  danger: "shadow-[4px_4px_0_var(--color-ink)]",
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
  /** Wheatpaste-poster sticker treatment: thick ink border + hard offset
   * shadow, slight rotate on hover. Admin/POS use this too now - they
   * follow the same site theme, not a separate toned-down look. */
  poster?: boolean;
}

export default function Card({
  tint = "neutral",
  padding = "md",
  hover = false,
  poster = false,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border-2",
        poster
          ? cn(TINTS[tint], POSTER_SHADOW[tint], "transition-transform duration-200", hover && "hover:-rotate-1 hover:-translate-y-0.5")
          : cn(TINTS[tint], "shadow-sm", hover && "transition-shadow duration-200 hover:shadow-md"),
        PADDING[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
