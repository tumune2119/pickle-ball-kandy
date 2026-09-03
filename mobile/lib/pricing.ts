import { OFFPEAK_RATE_LKR, PEAK_HOUR_START, PEAK_RATE_LKR } from "./constants";

export function isOffPeak(time: string): boolean {
  const hour = parseInt(time.split(":")[0], 10);
  return hour < PEAK_HOUR_START;
}

export function slotPriceLkr(time: string): number {
  return isOffPeak(time) ? OFFPEAK_RATE_LKR : PEAK_RATE_LKR;
}

export function calcTotalLkr(slots: string[]): number {
  return slots.reduce((sum, slot) => sum + slotPriceLkr(slot), 0);
}

// Given a consecutive run of 1-hour slot start times (e.g. ["09:00","10:00"]),
// return the end time of the last slot (e.g. "11:00").
export function endTimeForSlots(slots: string[]): string {
  const last = slots[slots.length - 1];
  const [hour] = last.split(":").map(Number);
  return `${String(hour + 1).padStart(2, "0")}:00`;
}
