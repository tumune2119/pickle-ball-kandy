"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import Spinner from "./Spinner";

export type ButtonVariant = "primary" | "secondary" | "soft" | "ghost" | "destructive";
// "brand" = marigold/sage (public/customer surfaces), "admin" = blue (admin surfaces).
export type ButtonTone = "brand" | "admin";
export type ButtonSize = "sm" | "md" | "lg";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-focus-ring focus-visible:ring-offset-page " +
  "disabled:opacity-50 disabled:pointer-events-none";

const SIZES: Record<ButtonSize, string> = {
  sm: "px-4 py-1.5 text-sm",
  md: "px-6 py-2 text-base",
  lg: "px-8 py-3 text-lg",
};

function variantClasses(variant: ButtonVariant, tone: ButtonTone): string {
  switch (variant) {
    case "primary":
      return tone === "admin"
        ? "bg-admin-action hover:bg-admin-action-hover text-admin-text-on-action shadow-sm shadow-info-900/20"
        : "bg-action-primary hover:bg-action-primary-hover text-text-on-action shadow-sm shadow-brand-900/20";
    case "secondary":
      return tone === "admin"
        ? "bg-admin-surface hover:bg-info-200 text-admin-text border border-admin-border"
        : "bg-action-secondary hover:bg-action-secondary-hover text-text-primary";
    case "soft":
      return tone === "admin"
        ? "bg-admin-bg hover:bg-info-200 text-admin-action"
        : "bg-highlight hover:bg-brand-200 dark:hover:bg-brand-900/50 text-brand-700 dark:text-brand-300";
    case "ghost":
      return tone === "admin"
        ? "bg-transparent hover:bg-admin-bg text-admin-text-muted"
        : "bg-transparent hover:bg-surface-sunken text-text-muted";
    case "destructive":
      return "bg-danger-100 hover:bg-danger-300/60 text-danger-800 dark:text-danger-300";
  }
}

interface SharedProps {
  variant?: ButtonVariant;
  tone?: ButtonTone;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
  children?: React.ReactNode;
}

// framer-motion's gesture props (onDrag, onAnimationStart, ...) collide
// with the same-named native DOM event handler types - omit the native
// ones since this component doesn't need to expose them.
type MotionConflictingProps =
  | "onDrag"
  | "onDragStart"
  | "onDragEnd"
  | "onAnimationStart"
  | "onAnimationEnd"
  | "onAnimationIteration";

type ButtonAsButton = SharedProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children" | MotionConflictingProps> & {
    href?: undefined;
  };

type ButtonAsLink = SharedProps &
  Omit<React.ComponentProps<typeof Link>, "className" | "children" | MotionConflictingProps> & {
    href: string;
  };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

const MotionLink = motion.create(Link);

export default function Button({
  variant = "primary",
  tone = "brand",
  size = "md",
  loading = false,
  fullWidth = false,
  className,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(
    BASE,
    SIZES[size],
    variantClasses(variant, tone),
    fullWidth && "w-full",
    className
  );

  if ("href" in props && props.href !== undefined) {
    const { href, ...linkProps } = props;
    return (
      <MotionLink
        href={href}
        className={classes}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.15 }}
        {...linkProps}
      >
        {children}
      </MotionLink>
    );
  }

  const buttonProps = props as Omit<ButtonAsButton, keyof SharedProps | "href">;

  return (
    <motion.button
      className={classes}
      disabled={loading || buttonProps.disabled}
      whileHover={{ scale: loading ? 1 : 1.02 }}
      whileTap={{ scale: loading ? 1 : 0.97 }}
      transition={{ duration: 0.15 }}
      {...buttonProps}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </motion.button>
  );
}
