// App-wide constants for Kandy 1st Court

export const TIMEZONE = "Asia/Colombo";
export const CURRENCY = "LKR";
export const CURRENCY_SYMBOL = "LKR";

// Court details
export const COURT_NAME = "Kandy 1st Court";
export const COURT_LOCATION = "Kandy, Sri Lanka";
export const COURT_GOOGLE_MAPS_URL =
  "https://maps.google.com/?q=Kandy+1st+Court+Kandy+Sri+Lanka";

// Default operating hours
export const DEFAULT_OPENING_TIME = "06:00"; // 6 AM
export const DEFAULT_CLOSING_TIME = "22:00"; // 10 PM

// Slot configuration (in minutes)
export const DEFAULT_SLOT_DURATION = 60; // 1 hour

// Sample pricing (in LKR per hour)
export const SAMPLE_PRICING = {
  offPeakRate: 1500, // 6 AM - 5 PM on weekdays
  peakRate: 2500, // 5 PM - 10 PM on weekdays
  weekendRate: 2500, // All day on weekends
};

// Cancellation policy
export const CANCELLATION_POLICY_HOURS = 4; // Free cancellation up to 4 hours before

// User roles
export const ROLES = {
  CUSTOMER: "customer",
  ADMIN: "admin",
  STAFF: "staff",
};

// Booking status
export const BOOKING_STATUS = {
  CONFIRMED: "confirmed",
  PENDING_PAYMENT: "pending_payment",
  PAID: "paid",
  CANCELLED: "cancelled",
};

// Payment status
export const PAYMENT_STATUS = {
  UNPAID: "unpaid",
  PAID: "paid",
  REFUNDED: "refunded",
  FAILED: "failed",
};

// Payment gateway
export const PAYMENT_GATEWAY = {
  MANUAL: "manual",
  PAYHERE: "payhere",
};

// Date format
export const DATE_FORMAT = "YYYY-MM-DD";
export const TIME_FORMAT = "HH:mm";
