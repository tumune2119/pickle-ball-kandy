import { db } from "@/lib/db/db";
import { settings } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { CANCELLATION_POLICY_HOURS } from "@/lib/constants";
import { canCancelBooking, venueDateTime } from "@/lib/utils";

// Shared by every self-service cancellation path (account-holder and guest)
// so the cancellation window can never drift between them.
export async function checkCancellationWindow(
  courtId: string,
  bookingDate: string,
  startTime: string
): Promise<{ allowed: boolean; cancellationHours: number }> {
  const policyRow = await db
    .select()
    .from(settings)
    .where(and(eq(settings.courtId, courtId), eq(settings.key, "cancellation_policy_hours")))
    .limit(1);
  const parsedHours = policyRow[0] ? Number(policyRow[0].value) : NaN;
  // Fall back to the default on a missing OR malformed setting, rather than
  // letting a corrupted value silently become NaN and block every
  // cancellation (hoursDiff >= NaN is always false).
  const cancellationHours = Number.isFinite(parsedHours) ? parsedHours : CANCELLATION_POLICY_HOURS;
  // bookingDate/startTime are wall-clock values in the venue's timezone -
  // venueDateTime (not a bare `new Date(...)`) is required so this is
  // correct regardless of what timezone the server process itself runs in.
  const bookingDateTime = venueDateTime(bookingDate, startTime);
  return { allowed: canCancelBooking(bookingDateTime, cancellationHours), cancellationHours };
}
