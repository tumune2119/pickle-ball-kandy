import { db } from "@/lib/db/db";
import { bookings } from "@/lib/db/schema";
import { isNull } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { formatPhoneNumber } from "@/lib/utils";
import { checkCancellationWindow } from "@/lib/cancellation";

const MAX_LOOKUP_ATTEMPTS = 10;
const LOOKUP_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

// POST /api/bookings/manage - Guest booking lookup. A guest has no account,
// so "something only they have" stands in for a session: the short
// confirmation code shown right after booking (first 8 chars of the id, see
// BookingForm.tsx) plus the phone number given at booking time. Read-only -
// cancellation re-verifies this same pair itself rather than trusting this
// response (see app/api/bookings/manage/[id]/route.ts).
export async function POST(request: NextRequest) {
  try {
    const { code, phone } = await request.json();
    if (!code || !phone) {
      return NextResponse.json(
        { error: "Enter your booking reference and phone number" },
        { status: 400 }
      );
    }

    const rateLimit = checkRateLimit(`booking-lookup:${clientIp(request)}`, MAX_LOOKUP_ATTEMPTS, LOOKUP_WINDOW_MS);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
      );
    }

    const normalizedCode = String(code).replace(/^BK#?/i, "").trim().toLowerCase();
    const normalizedPhone = formatPhoneNumber(String(phone));

    const guestBookings = await db.select().from(bookings).where(isNull(bookings.userId));
    const match = guestBookings.find(
      (b) =>
        b.id.toLowerCase().startsWith(normalizedCode) &&
        b.guestPhone &&
        formatPhoneNumber(b.guestPhone) === normalizedPhone
    );

    if (!match) {
      return NextResponse.json(
        { error: "No booking found with that reference and phone number" },
        { status: 404 }
      );
    }

    const { allowed, cancellationHours } = await checkCancellationWindow(
      match.courtId,
      match.bookingDate,
      match.startTime
    );

    return NextResponse.json({
      booking: {
        id: match.id,
        bookingDate: match.bookingDate,
        startTime: match.startTime,
        endTime: match.endTime,
        numPlayers: match.numPlayers,
        status: match.status,
        paymentStatus: match.paymentStatus,
        amountLkr: match.amountLkr ? parseFloat(match.amountLkr as string) : 0,
      },
      canCancel: match.status !== "cancelled" && allowed,
      cancellationHours,
    });
  } catch (error) {
    console.error("Booking lookup error:", error);
    return NextResponse.json({ error: "Failed to look up booking" }, { status: 500 });
  }
}
