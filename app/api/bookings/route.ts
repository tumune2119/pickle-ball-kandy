import { db } from "@/lib/db/db";
import { bookings } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// GET /api/bookings - Get user's bookings
export async function GET(request: NextRequest) {
  try {
    // In a real app, get userId from Supabase auth session
    // For now, we'll return demo data
    const userId = request.headers.get("X-User-ID") || "demo-user";

    const userBookings = await db
      .select()
      .from(bookings)
      .where(eq(bookings.userId, userId));

    return NextResponse.json({
      bookings: userBookings.map((b) => ({
        ...b,
        amountLkr: b.amountLkr ? parseFloat(b.amountLkr as string) : 0,
      })),
    });
  } catch (error) {
    console.error("Get bookings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

// POST /api/bookings - Create a new booking
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
      paymentMode,
    } = body;

    // Validate required fields
    if (
      !userId ||
      !courtId ||
      !bookingDate ||
      !startTime ||
      !endTime ||
      !numPlayers
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if slot is already booked (prevent double-booking)
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

    // Create booking
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
        status: paymentMode === "payhere" ? "pending_payment" : "confirmed",
        paymentStatus: "unpaid",
        notes: `Booked via online system - ${paymentMode}`,
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
    console.error("Create booking error:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
