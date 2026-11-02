// Server-only pricing lookup (imports lib/db/db.ts, which pulls in `pg` -
// Next.js will fail the build if a client component ever imports this file,
// which is the intended guardrail). This is the one place that decides what
// an hour of court time costs - the booking-creation/reschedule routes and
// the availability route (for the per-slot price shown while picking a
// time) both read from here, so what a customer sees while booking always
// matches what they're actually charged.
import { db } from "@/lib/db/db";
import { pricing } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { SAMPLE_PRICING } from "@/lib/constants";
import { getTimeSlots } from "@/lib/utils";

export interface CourtRate {
  startHour: number;
  endHour: number;
  ratePerHour: number;
  peak: boolean;
}

// Used when a court has no pricing rows configured yet (e.g. a newly added
// court before an admin sets real rates) - keeps booking from breaking for
// an unconfigured court instead of throwing or charging nothing.
const DEFAULT_RATES: CourtRate[] = [
  { startHour: 6, endHour: 17, ratePerHour: SAMPLE_PRICING.offPeakRate, peak: false },
  { startHour: 17, endHour: 22, ratePerHour: SAMPLE_PRICING.peakRate, peak: true },
];

export async function getCourtRates(courtId: string): Promise<CourtRate[]> {
  const rows = await db.select().from(pricing).where(eq(pricing.courtId, courtId));
  if (rows.length === 0) return DEFAULT_RATES;
  return rows.map((r) => ({
    startHour: parseInt((r.startTime ?? "00:00:00").split(":")[0], 10),
    endHour: parseInt((r.endTime ?? "23:59:59").split(":")[0], 10),
    ratePerHour: parseFloat(r.ratePerHour as string),
    peak: r.peak,
  }));
}

function rateForHour(hour: number, rates: CourtRate[]): CourtRate {
  return rates.find((r) => hour >= r.startHour && hour < r.endHour) ?? rates[0];
}

// Authoritative price for a booking spanning startTime-endTime on a specific
// court, one hour at a time - the server's own source of truth for what a
// booking costs (a client-supplied amount is never trusted, see
// app/api/bookings/route.ts).
export async function calculateBookingAmountForCourt(
  courtId: string,
  startTime: string,
  endTime: string
): Promise<number> {
  const rates = await getCourtRates(courtId);
  return getTimeSlots(startTime, endTime, 60).reduce(
    (total, slot) => total + rateForHour(parseInt(slot.split(":")[0], 10), rates).ratePerHour,
    0
  );
}

// Rate (and peak flag) for each of `slots`' start hours in one query - used
// by the availability endpoint so the price shown per slot while picking a
// time comes from the same source as the final charge, without a separate
// DB round-trip per slot.
export async function getRatesForSlots(
  courtId: string,
  slots: string[]
): Promise<Record<string, { rate: number; peak: boolean }>> {
  const rates = await getCourtRates(courtId);
  const result: Record<string, { rate: number; peak: boolean }> = {};
  for (const slot of slots) {
    const match = rateForHour(parseInt(slot.split(":")[0], 10), rates);
    result[slot] = { rate: match.ratePerHour, peak: match.peak };
  }
  return result;
}
