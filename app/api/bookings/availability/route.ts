import { db } from "@/lib/db/db";
import { bookings, courts } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// GET /api/bookings/availability - Get available slots for a date
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const courtId = searchParams.get("courtId") || process.env.NEXT_PUBLIC_COURT_ID;

    if (!date) {
      return NextResponse.json(
        { error: "Date parameter required" },
        { status: 400 }
      );
    }

    // Get court details
    const court = await db
      .select()
      .from(courts)
      .where(eq(courts.id, courtId || ""))
      .limit(1);

    if (!court.length) {
      return NextResponse.json({ error: "Court not found" }, { status: 404 });
    }

    const courtData = court[0];

    // Get all bookings for this date
    const dayBookings = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.courtId, courtData.id),
          eq(bookings.bookingDate, date),
          eq(bookings.status, "confirmed")
        )
      );

    // Parse booked slots
    const bookedSlots: string[] = [];
    dayBookings.forEach((booking) => {
      bookedSlots.push(booking.startTime);
    });

    // Generate all possible slots
    const allSlots: string[] = [];
    const [openHour, openMin] = courtData.openingTime.split(":").map(Number);
    const [closeHour, closeMin] = courtData.closingTime
      .split(":")
      .map(Number);

    let currentMinutes = openHour * 60 + openMin;
    const closeMinutes = closeHour * 60 + closeMin;

    while (currentMinutes < closeMinutes) {
      const hours = Math.floor(currentMinutes / 60);
      const minutes = currentMinutes % 60;
      const timeStr = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
      allSlots.push(timeStr);
      currentMinutes += courtData.slotDuration;
    }

    return NextResponse.json({
      date,
      court: {
        id: courtData.id,
        name: courtData.name,
        openingTime: courtData.openingTime,
        closingTime: courtData.closingTime,
        slotDuration: courtData.slotDuration,
      },
      availableSlots: allSlots.filter((slot) => !bookedSlots.includes(slot)),
      bookedSlots,
      totalSlots: allSlots,
    });
  } catch (error) {
    console.error("Availability error:", error);
    return NextResponse.json(
      { error: "Failed to fetch availability" },
      { status: 500 }
    );
  }
}
