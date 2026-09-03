// Mirrors the constants the web app defines in lib/constants.ts, kept in
// sync manually since the two apps don't share a package.

export const COURT_NAME = "Kandy 1st Court";
export const COURT_LOCATION = "Kandy, Sri Lanka";

export const CURRENCY = "LKR";

export const DEFAULT_OPENING_TIME = "06:00";
export const DEFAULT_CLOSING_TIME = "22:00";
export const DEFAULT_SLOT_DURATION_MIN = 60;

export const BOOKING_WINDOW_DAYS = 30;

// Sample hourly pricing (LKR) - mirrors lib/constants.ts SAMPLE_PRICING on
// the web app. Off-peak: 6 AM - 5 PM, Peak: 5 PM - 10 PM.
export const OFFPEAK_RATE_LKR = 1500;
export const PEAK_RATE_LKR = 2500;
export const PEAK_HOUR_START = 17;

export const CANCELLATION_POLICY_HOURS = 4;

export const MAX_PLAYERS = 4;

export const BOOKING_STATUS = {
  CONFIRMED: "confirmed",
  PENDING_PAYMENT: "pending_payment",
  PAID: "paid",
  CANCELLED: "cancelled",
} as const;

export const PAYMENT_STATUS = {
  UNPAID: "unpaid",
  PAID: "paid",
  REFUNDED: "refunded",
  FAILED: "failed",
} as const;
