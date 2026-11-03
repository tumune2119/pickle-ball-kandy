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
// Re-verifies the phone number on every call instead of trusting a prior
// lookup response - same reasoning as requiring a password on every
// privileged action rather than caching "they proved it once."
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { phone } = await request.json();
    if (!phone) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    const rateLimit = checkRateLimit(`booking-cancel:${clientIp(request)}`, MAX_ATTEMPTS, WINDOW_MS);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
      );
    }

    const existing = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
    const booking = existing[0];

    // Same 404 whether the booking doesn't exist, isn't a guest booking, or
    // the phone doesn't match - don't reveal which, so a wrong guess can't
    // be used to probe for a valid booking id.
    if (!booking || booking.userId || !booking.guestPhone || formatPhoneNumber(booking.guestPhone) !== formatPhoneNumber(phone)) {
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
