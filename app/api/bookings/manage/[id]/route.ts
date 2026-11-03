import { db } from "@/lib/db/db";
import { bookings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { formatPhoneNumber } from "@/lib/utils";
import { checkCancellationWindow } from "@/lib/cancellation";

const MAX_ATTEMPTS = 10;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

// DELETE /api/bookings/manage/[id] - Guest self-service cancellation.
// Re-verifies BOTH the code and the phone number on every call instead of
// trusting a prior lookup response (which already proved the pair once) -
// same reasoning as requiring a password on every privileged action rather
// than caching "they proved it once." The booking id in the URL is only
// ever learned by passing the lookup's own code+phone check, but this
// endpoint doesn't trust that indirectly - it checks both again itself.
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { phone, code } = await request.json();
    if (!phone || !code) {
      return NextResponse.json({ error: "Booking reference and phone number are required" }, { status: 400 });
    }

    const rateLimit = checkRateLimit(`booking-cancel:${clientIp(request)}`, MAX_ATTEMPTS, WINDOW_MS);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
      );
    }

    const normalizedCode = String(code).replace(/^BK#?/i, "").trim().toLowerCase();
    if (!/^[0-9a-f]{8}$/.test(normalizedCode)) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const existing = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
    const booking = existing[0];

    // Same 404 whether the booking doesn't exist, isn't a guest booking, the
    // code doesn't match, or the phone doesn't match - don't reveal which,
    // so a wrong guess can't be used to probe for a valid booking id.
    if (
      !booking ||
      booking.userId ||
      !booking.id.toLowerCase().startsWith(normalizedCode) ||
      !booking.guestPhone ||
      formatPhoneNumber(booking.guestPhone) !== formatPhoneNumber(phone)
    ) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.status === "cancelled") {
      return NextResponse.json({ error: "Booking is already cancelled" }, { status: 400 });
    }

    const { allowed, cancellationHours } = await checkCancellationWindow(
      booking.courtId,
      booking.bookingDate,
      booking.startTime
    );
    if (!allowed) {
      return NextResponse.json(
        { error: `Free cancellation requires at least ${cancellationHours} hours' notice` },
        { status: 400 }
      );
    }

    const cancelled = await db
      .update(bookings)
      .set({ status: "cancelled", updatedAt: new Date() })
      .where(eq(bookings.id, id))
      .returning();

    return NextResponse.json({
      message: "Booking cancelled successfully",
      booking: {
        ...cancelled[0],
        amountLkr: cancelled[0].amountLkr ? parseFloat(cancelled[0].amountLkr as string) : 0,
      },
    });
  } catch (error) {
    console.error("Guest cancel booking error:", error);
    return NextResponse.json({ error: "Failed to cancel booking" }, { status: 500 });
  }
}
