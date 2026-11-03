import { forwardRef } from "react";
import { cn } from "@/lib/cn";

const FIELD_BASE =
  "w-full px-4 py-2 rounded-lg border-2 border-border-default bg-surface-sunken text-text-primary " +
  "placeholder:text-text-faint " +
  "focus:outline-none focus:ring-2 focus:ring-focus-ring focus:border-ink dark:focus:border-concrete-100 focus:bg-surface " +
  "transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

interface FieldWrapperProps {
  label?: string;
  hint?: string;
  error?: string;
  id?: string;
  className?: string;
  children: React.ReactNode;
}

function FieldWrapper({ label, hint, error, id, className, children }: FieldWrapperProps) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="block text-sm font-semibold text-text-primary mb-2">
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-xs text-danger-800 dark:text-danger-300 mt-1">{error}</p>
      ) : hint ? (
        <p className="text-xs text-text-muted mt-1">{hint}</p>
      ) : null}
    </div>
  );
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  wrapperClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, wrapperClassName, className, id, ...props },
  ref
) {
  return (
    <FieldWrapper label={label} hint={hint} error={error} id={id} className={wrapperClassName}>
      <input
        ref={ref}
        id={id}
        className={cn(
          FIELD_BASE,
          error && "border-danger-800 dark:border-danger-700 focus:ring-danger-800",
          className
        )}
        {...props}
      />
    </FieldWrapper>
  );
});

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
  wrapperClassName?: string;
  children: React.ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, hint, error, wrapperClassName, className, id, children, ...props },
  ref
) {
  return (
    <FieldWrapper label={label} hint={hint} error={error} id={id} className={wrapperClassName}>
      <div className="relative">
        <select
          ref={ref}
          id={id}
          className={cn(FIELD_BASE, "appearance-none pr-10", className)}
          {...props}
        >
          {children}
        </select>
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-faint"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </div>
    </FieldWrapper>
  );
});

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
  wrapperClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hint, error, wrapperClassName, className, id, ...props },
  ref
) {
  return (
    <FieldWrapper label={label} hint={hint} error={error} id={id} className={wrapperClassName}>
      <textarea
        ref={ref}
        id={id}
        className={cn(FIELD_BASE, error && "border-danger-800 dark:border-danger-700 focus:ring-danger-800", className)}
        {...props}
      />
    </FieldWrapper>
  );
});

// Native checkbox/radio, kept native for full a11y/behavior, just given a
// brand-colored checked state via accent-color instead of the unstyled
// browser default gray.
export function Checkbox({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="checkbox"
      className={cn("w-4 h-4 rounded accent-lime-500 cursor-pointer", className)}
      {...props}
    />
  );
}

export function Radio({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="radio"
      className={cn("w-4 h-4 accent-lime-500 cursor-pointer", className)}
      {...props}
    />
  );
}
