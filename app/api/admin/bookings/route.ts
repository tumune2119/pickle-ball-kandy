import { db } from "@/lib/db/db";
import { bookings, users, courts } from "@/lib/db/schema";
import { eq, and, gte, lte, inArray } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server-auth";

// GET /api/admin/bookings - Get all bookings for admin. Supports a single
// `date`, a `startDate`/`endDate` range (used by the weekly schedule), and
// an optional `courtId` filter now that the venue has multiple courts.
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.response) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const date = searchParams.get("date");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const courtId = searchParams.get("courtId");
    const limit = parseInt(searchParams.get("limit") || "50");

    const conditions = [];
    if (status) conditions.push(eq(bookings.status, status));
    if (date) conditions.push(eq(bookings.bookingDate, date));
    if (courtId) conditions.push(eq(bookings.courtId, courtId));
    if (startDate && endDate) {
      conditions.push(gte(bookings.bookingDate, startDate), lte(bookings.bookingDate, endDate));
    }

    const allBookings = await db
      .select()
      .from(bookings)
      .where(conditions.length ? and(...conditions) : undefined)
      .limit(limit);

    // Enrich with the customer's name - a registered user's fullName, or the
    // guest's own name for bookings made without an account - and the
    // court's name.
    const userIds = [...new Set(allBookings.map((b) => b.userId).filter((id): id is string => !!id))];
    const customerRows = userIds.length
      ? await db.select().from(users).where(inArray(users.id, userIds))
      : [];
    const customerById = new Map(customerRows.map((u) => [u.id, u]));

    const courtRows = await db.select().from(courts);
    const courtById = new Map(courtRows.map((c) => [c.id, c]));

    return NextResponse.json({
      bookings: allBookings.map((b) => ({
        ...b,
        amountLkr: b.amountLkr ? parseFloat(b.amountLkr as string) : 0,
        customerName: b.userId ? customerById.get(b.userId)?.fullName ?? "Unknown" : b.guestName,
        isGuest: !b.userId,
        courtName: courtById.get(b.courtId)?.name ?? "Unknown Court",
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
  const auth = await requireAdmin(request);
  if (auth.response) return auth.response;

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
