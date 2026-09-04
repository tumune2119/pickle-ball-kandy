"use client";

import { useEffect, useState } from "react";

// Keep this key in sync with the blocking script in app/layout.tsx.
const STORAGE_KEY = "theme";

function applyTheme(theme: "light" | "dark") {
  document.documentElement.classList.toggle("dark", theme === "dark");
  window.localStorage.setItem(STORAGE_KEY, theme);
}

interface ThemeToggleProps {
  className?: string;
  // "neutral" (default) reads gray-on-light / light-gray-on-dark - use on
  // white/gray surfaces. "on-color" is always-light text - use when the
  // toggle sits directly on a saturated color or gradient background
  // (e.g. the auth layout's purple gradient), where "neutral"'s gray text
  // would be low-contrast regardless of theme.
  variant?: "neutral" | "on-color";
}

export default function ThemeToggle({ className = "", variant = "neutral" }: ThemeToggleProps) {
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);

  useEffect(() => {
    // Must read the DOM after mount, not during the lazy-init/render pass:
    // the server has no "document", so the client's first render has to
    // match that (null/placeholder below) for hydration to succeed, and
    // only switch to the real button once mounted. Deferred to a microtask
    // so the state update happens after this effect returns rather than
    // synchronously within it.
    Promise.resolve().then(() => {
      setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
    });
  }, []);

  if (theme === null) {
    // Avoid a hydration mismatch: render nothing until we know the theme
    // the blocking script already applied.
    return <div className={`w-9 h-9 ${className}`} aria-hidden="true" />;
  }

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    applyTheme(next);
    setTheme(next);
  };

  const colorClasses =
    variant === "on-color"
      ? "text-white hover:bg-white/15"
      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className={`w-9 h-9 flex items-center justify-center rounded-full transition ${colorClasses} ${className}`}
    >
      {theme === "dark" ? (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1.5m0 15V21m9-9h-1.5m-15 0H3m15.364 6.364-1.06-1.06M6.697 6.697l-1.06-1.06m12.727 0-1.06 1.06M6.697 17.303l-1.06 1.06M16.5 12a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
        </svg>
      )}
    </button>
  );
}
