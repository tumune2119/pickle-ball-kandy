import { CURRENCY } from "./constants";

export function formatCurrency(amount: number | string): string {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: CURRENCY,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);
}

export function formatDate(
  isoDate: string,
  options: Intl.DateTimeFormatOptions = {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "2-digit",
  }
): string {
  // Append a neutral time so this parses as local, not UTC-midnight.
  const d = new Date(`${isoDate}T00:00:00`);
  return new Intl.DateTimeFormat("en-LK", options).format(d);
}

export function todayIso(): string {
  return new Date().toISOString().split("T")[0];
}
