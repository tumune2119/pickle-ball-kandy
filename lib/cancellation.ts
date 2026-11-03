import { db } from "@/lib/db/db";
import { settings } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { CANCELLATION_POLICY_HOURS } from "@/lib/constants";
import { canCancelBooking } from "@/lib/utils";

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
  const cancellationHours = policyRow[0] ? Number(policyRow[0].value) : CANCELLATION_POLICY_HOURS;
  const bookingDateTime = new Date(`${bookingDate}T${startTime}`);
  return { allowed: canCancelBooking(bookingDateTime, cancellationHours), cancellationHours };
}
