import { db } from "@/lib/db/db";
import { bookings } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// GET /api/admin/bookings - Get all bookings for admin
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const date = searchParams.get("date");
    const limit = parseInt(searchParams.get("limit") || "50");

    const conditions = [];
    if (status) conditions.push(eq(bookings.status, status));
    if (date) conditions.push(eq(bookings.bookingDate, date));

    const allBookings = await db
      .select()
      .from(bookings)
      .where(conditions.length ? and(...conditions) : undefined)
      .limit(limit);

    return NextResponse.json({
      bookings: allBookings.map((b) => ({
        ...b,
        amountLkr: b.amountLkr ? parseFloat(b.amountLkr as string) : 0,
      })),
      total: allBookings.length,
    });
  } catch (error) {
    console.error("Get admin bookings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

// POST /api/admin/bookings - Create manual booking for walk-in
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      courtId,
      bookingDate,
      startTime,
      endTime,
      numPlayers,
      amountLkr,
    } = body;

    // Check if slot is available
    const existingBooking = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.courtId, courtId),
          eq(bookings.bookingDate, bookingDate),
          eq(bookings.startTime, startTime),
          eq(bookings.status, "confirmed")
        )
      )
      .limit(1);

    if (existingBooking.length > 0) {
      return NextResponse.json(
        { error: "Slot already booked" },
        { status: 409 }
      );
    }

    const newBooking = await db
      .insert(bookings)
      .values({
        userId,
        courtId,
        bookingDate,
        startTime,
        endTime,
        numPlayers,
        amountLkr: amountLkr.toString(),
        status: "confirmed",
        paymentStatus: "paid",
        notes: "Walk-in booking created by admin",
      })
      .returning();

    return NextResponse.json(
      {
        message: "Booking created successfully",
        booking: {
          ...newBooking[0],
          amountLkr: newBooking[0].amountLkr
            ? parseFloat(newBooking[0].amountLkr as string)
            : 0,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create admin booking error:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
