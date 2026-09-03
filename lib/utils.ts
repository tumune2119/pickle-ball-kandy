import { TIMEZONE } from "./constants";

// Format currency (LKR)
export function formatCurrency(amount: number | string): string {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numAmount);
}

// Format date to local timezone
export function formatDate(
  date: Date | string,
  format: "short" | "long" = "short"
): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat("en-LK", {
    year: "numeric",
    month: format === "short" ? "2-digit" : "long",
    day: "2-digit",
    timeZone: TIMEZONE,
  }).format(d);
}

// Format time
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(":");
  return `${hours}:${minutes}`;
}

// Get available time slots
export function getTimeSlots(
  startTime: string,
  endTime: string,
  slotDuration: number
): string[] {
  const slots: string[] = [];
  const [startHour, startMin] = startTime.split(":").map(Number);
  const [endHour, endMin] = endTime.split(":").map(Number);

  let currentTime = startHour * 60 + startMin;
  const endTotalMin = endHour * 60 + endMin;

  while (currentTime < endTotalMin) {
    const hours = Math.floor(currentTime / 60);
    const minutes = currentTime % 60;
    slots.push(`${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`);
    currentTime += slotDuration;
  }

  return slots;
}

// Check if slot is within booking hours
export function isSlotAvailable(
  slotStart: string,
  slotEnd: string,
  openingTime: string,
  closingTime: string
): boolean {
  const [startHour, startMin] = slotStart.split(":").map(Number);
  const [endHour, endMin] = slotEnd.split(":").map(Number);
  const [openHour, openMin] = openingTime.split(":").map(Number);
  const [closeHour, closeMin] = closingTime.split(":").map(Number);

  const slotStartMin = startHour * 60 + startMin;
  const slotEndMin = endHour * 60 + endMin;
  const openTotalMin = openHour * 60 + openMin;
  const closeTotalMin = closeHour * 60 + closeMin;

  return slotStartMin >= openTotalMin && slotEndMin <= closeTotalMin;
}

// Calculate booking hours and duration
export function calculateBookingHours(
  startTime: string,
  endTime: string
): number {
  const [startHour, startMin] = startTime.split(":").map(Number);
  const [endHour, endMin] = endTime.split(":").map(Number);

  const startTotalMin = startHour * 60 + startMin;
  const endTotalMin = endHour * 60 + endMin;

  return (endTotalMin - startTotalMin) / 60;
}

// Format phone number (Sri Lankan)
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, "");

  // Handle different input formats
  if (cleaned.startsWith("94")) {
    return `+${cleaned}`;
  } else if (cleaned.startsWith("0")) {
    return `+94${cleaned.slice(1)}`;
  } else {
    return `+94${cleaned}`;
  }
}

// Validate Sri Lankan phone number
export function isValidPhoneNumber(phone: string): boolean {
  const pattern = /^(\+94|0)?[0-9]{9,10}$/;
  return pattern.test(phone.replace(/\s/g, ""));
}

// Get day of week name
export function getDayName(date: Date): string {
  return new Intl.DateTimeFormat("en-LK", {
    weekday: "long",
    timeZone: TIMEZONE,
  }).format(date);
}

// Check if date is today
export function isToday(date: Date | string): boolean {
  const d = new Date(date);
  const today = new Date();
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  );
}

// Check if booking can be cancelled
export function canCancelBooking(
  bookingDateTime: Date,
  cancellationHours: number
): boolean {
  const now = new Date();
  const timeDiff = bookingDateTime.getTime() - now.getTime();
  const hoursDiff = timeDiff / (1000 * 60 * 60);
  return hoursDiff >= cancellationHours;
}

// Generate booking reference
export function generateBookingReference(): string {
  return `BK${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}
