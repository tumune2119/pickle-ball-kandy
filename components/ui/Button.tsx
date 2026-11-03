"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import Spinner from "./Spinner";

export type ButtonVariant = "primary" | "lime" | "secondary" | "soft" | "ghost" | "destructive";
// "brand" and "admin" both use the same sticker-button system now (admin/POS
// follow the main site theme per explicit request) - "admin" only exists as
// a separate tone because it still points at the admin-* token aliases
// (globals.css), not because it looks different anymore.
export type ButtonTone = "brand" | "admin";
export type ButtonSize = "sm" | "md" | "lg";

const BASE =
  "inline-flex items-center justify-center gap-2 font-bold transition-[transform,box-shadow,background-color,color] " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-focus-ring focus-visible:ring-offset-page " +
  "disabled:opacity-50 disabled:pointer-events-none";

const SIZES: Record<ButtonSize, string> = {
  sm: "px-4 py-1.5 text-sm",
  md: "px-6 py-2.5 text-base",
  lg: "px-8 py-3.5 text-lg",
};

// Sticker/comic "pressed button" treatment: a thick ink border + a hard
// (non-blurred) offset shadow that shrinks and the button translates toward
// it on press - a deliberate graffiti/Y2K signature, not a soft drop shadow.
// Admin never gets this (see variantClasses below) - "same brand, toned down".
const STICKER =
  "rounded-md border-2 border-ink shadow-[3px_3px_0_var(--color-ink)] " +
  "hover:-translate-y-0.5 hover:shadow-[4px_4px_0_var(--color-ink)] " +
  "active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_var(--color-ink)]";

function variantClasses(variant: ButtonVariant, tone: ButtonTone): string {
  if (tone === "admin") {
    switch (variant) {
      case "primary":
      case "lime":
        return cn(STICKER, "bg-admin-action hover:bg-admin-action-hover text-admin-text-on-action");
      case "secondary":
        return cn(STICKER, "bg-admin-surface text-admin-text");
      case "soft":
        return "rounded-md bg-admin-bg hover:bg-admin-border/40 text-admin-action border-2 border-transparent";
      case "ghost":
        return "rounded-md bg-transparent hover:bg-admin-bg text-admin-text-muted border-2 border-transparent";
      case "destructive":
        return cn(STICKER, "bg-danger-100 hover:bg-danger-300/60 text-danger-800 dark:text-danger-300");
    }
  }
  switch (variant) {
    case "primary":
      return cn(STICKER, "bg-action-primary hover:bg-action-primary-hover text-text-on-action");
    case "lime":
      return cn(STICKER, "bg-action-lime hover:bg-action-lime-hover text-text-on-lime");
    case "secondary":
      return cn(STICKER, "bg-surface text-text-primary");
    case "soft":
      return "rounded-md bg-highlight hover:bg-lime-200 dark:hover:bg-lime-900/50 text-lime-800 dark:text-lime-300 border-2 border-transparent";
    case "ghost":
      return "rounded-md bg-transparent hover:bg-surface-sunken text-text-muted border-2 border-transparent";
    case "destructive":
      return cn(STICKER, "bg-danger-100 hover:bg-danger-300/60 text-danger-800 dark:text-danger-300");
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
  // The sticker press effect is driven by CSS active:/hover: (see STICKER)
  // so it works identically on <button> and <Link>; framer-motion only adds
  // a small scale on top. soft/ghost skip both (no border/shadow to animate).
  const scaleAmount = variant === "soft" || variant === "ghost" ? 1 : 1.015;
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
        whileHover={{ scale: scaleAmount }}
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
      whileHover={{ scale: loading ? 1 : scaleAmount }}
      transition={{ duration: 0.15 }}
      {...buttonProps}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </motion.button>
  );
}
