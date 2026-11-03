import { db, isUniqueViolation } from "@/lib/db/db";
import { bookings, users, settings } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/server-auth";
import { calculateBookingAmountForCourt } from "@/lib/pricing";
import { canCancelBooking } from "@/lib/utils";
import { CANCELLATION_POLICY_HOURS } from "@/lib/constants";

// A booking may be read/changed by the customer who made it, or by an
// admin/staff member. Returns null (allowed) or the 403 response to return.
async function checkOwnerOrAdmin(userId: string, bookingUserId: string | null) {
  if (userId === bookingUserId) return null;

  const rows = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  const role = rows[0]?.role;
  if (role === "admin" || role === "staff") return null;

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

// GET /api/bookings/[id] - Get specific booking
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request);
  if (auth.response) return auth.response;

  try {
    const { id } = await params;
    const booking = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, id))
      .limit(1);

    if (!booking.length) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const forbidden = await checkOwnerOrAdmin(auth.user.id, booking[0].userId);
    if (forbidden) return forbidden;

    return NextResponse.json({
      booking: {
        ...booking[0],
        amountLkr: booking[0].amountLkr
          ? parseFloat(booking[0].amountLkr as string)
          : 0,
      },
    });
  } catch (error) {
    console.error("Get booking error:", error);
    return NextResponse.json(
      { error: "Failed to fetch booking" },
      { status: 500 }
    );
  }
}

// PATCH /api/bookings/[id] - Update booking (reschedule)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request);
  if (auth.response) return auth.response;

  try {
    const { id } = await params;
    const body = await request.json();
    const { bookingDate, startTime, endTime } = body;

    const existing = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, id))
      .limit(1);

    if (!existing.length) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const forbidden = await checkOwnerOrAdmin(auth.user.id, existing[0].userId);
    if (forbidden) return forbidden;

    // Check if new slot is available
    if (bookingDate || startTime) {
      const booking = existing;

      const existingBooking = await db
        .select()
        .from(bookings)
        .where(
          and(
            eq(bookings.courtId, booking[0].courtId),
            eq(bookings.bookingDate, bookingDate || booking[0].bookingDate),
            eq(bookings.startTime, startTime || booking[0].startTime),
            eq(bookings.status, "confirmed")
          )
        );

      if (existingBooking.length > 0) {
        return NextResponse.json(
          { error: "New slot already booked" },
          { status: 409 }
        );
      }
    }

    // Recompute the price whenever the slot moves - otherwise a booking
    // rescheduled from off-peak to peak hours (or back) would keep its old
    // amount.
    const newAmount =
      startTime || endTime
        ? await calculateBookingAmountForCourt(
            existing[0].courtId,
            startTime || existing[0].startTime,
            endTime || existing[0].endTime
          )
        : null;

    const updated = await db
      .update(bookings)
      .set({
        bookingDate: bookingDate,
        startTime: startTime,
        endTime: endTime,
        ...(newAmount !== null ? { amountLkr: newAmount.toString() } : {}),
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, id))
      .returning();

    return NextResponse.json({
      message: "Booking updated successfully",
      booking: {
        ...updated[0],
        amountLkr: updated[0].amountLkr
          ? parseFloat(updated[0].amountLkr as string)
          : 0,
      },
    });
  } catch (error) {
    // Same race as booking creation (see app/api/bookings/route.ts) - the
    // pre-check above closes the common case, the unique index is the real
    // guard, this just gives a losing reschedule the friendly message.
    if (isUniqueViolation(error)) {
      return NextResponse.json(
        { error: "New slot already booked" },
        { status: 409 }
      );
    }
    console.error("Update booking error:", error);
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 }
    );
  }
}

// DELETE /api/bookings/[id] - Cancel booking
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request);
  if (auth.response) return auth.response;

  try {
    const { id } = await params;

    const existing = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, id))
      .limit(1);

    if (!existing.length) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const forbidden = await checkOwnerOrAdmin(auth.user.id, existing[0].userId);
    if (forbidden) return forbidden;

    // Free cancellation window applies to the customer cancelling their own
    // booking - staff/admin can still cancel any time (e.g. goodwill, or a
    // phoned-in request). Uses the court's configured hours if set, else the
    // same default the UI has always advertised.
    if (auth.user.id === existing[0].userId) {
      const policyRow = await db
        .select()
        .from(settings)
        .where(and(eq(settings.courtId, existing[0].courtId), eq(settings.key, "cancellation_policy_hours")))
        .limit(1);
      const cancellationHours = policyRow[0] ? Number(policyRow[0].value) : CANCELLATION_POLICY_HOURS;
      const bookingDateTime = new Date(`${existing[0].bookingDate}T${existing[0].startTime}`);
      if (!canCancelBooking(bookingDateTime, cancellationHours)) {
        return NextResponse.json(
          { error: `Free cancellation requires at least ${cancellationHours} hours' notice` },
          { status: 400 }
        );
      }
    }

    const cancelled = await db
      .update(bookings)
      .set({
        status: "cancelled",
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, id))
      .returning();

    return NextResponse.json({
      message: "Booking cancelled successfully",
      booking: {
        ...cancelled[0],
        amountLkr: cancelled[0].amountLkr
          ? parseFloat(cancelled[0].amountLkr as string)
          : 0,
      },
    });
  } catch (error) {
    console.error("Cancel booking error:", error);
    return NextResponse.json(
      { error: "Failed to cancel booking" },
      { status: 500 }
    );
  }
}
