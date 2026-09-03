import { db } from "@/lib/db/db";
import { bookings } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// GET /api/bookings/[id] - Get specific booking
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
  try {
    const { id } = await params;
    const body = await request.json();
    const { bookingDate, startTime, endTime } = body;

    // Check if new slot is available
    if (bookingDate || startTime) {
      const booking = await db
        .select()
        .from(bookings)
        .where(eq(bookings.id, id))
        .limit(1);

      if (!booking.length) {
        return NextResponse.json(
          { error: "Booking not found" },
          { status: 404 }
        );
      }

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

    const updated = await db
      .update(bookings)
      .set({
        bookingDate: bookingDate,
        startTime: startTime,
        endTime: endTime,
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
  try {
    const { id } = await params;
    const cancelled = await db
      .update(bookings)
      .set({
        status: "cancelled",
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, id))
      .returning();

    if (!cancelled.length) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

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
