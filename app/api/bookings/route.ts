import { db, isUniqueViolation } from "@/lib/db/db";
import { bookings, courts, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, getOptionalAuth } from "@/lib/server-auth";
import { calculateBookingAmountForCourt } from "@/lib/pricing";
import { sendBookingSms } from "@/lib/sms";

// GET /api/bookings - Get the authenticated user's bookings
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth.response) return auth.response;

  try {
    const userBookings = await db
      .select()
      .from(bookings)
      .where(eq(bookings.userId, auth.user.id));

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

// POST /api/bookings - Create a new booking. Works signed-in or as a guest:
// a valid Authorization header attaches the booking to that account,
// otherwise guestName/guestPhone/guestEmail are required instead.
export async function POST(request: NextRequest) {
  const user = await getOptionalAuth(request);

  try {
    const body = await request.json();
    const {
      courtId,
      bookingDate,
      startTime,
      endTime,
      numPlayers,
      paymentMode,
      guestName,
      guestPhone,
      guestEmail,
    } = body;
    // The authenticated session decides whose booking this is - a client-
    // supplied userId would let anyone create bookings as anyone else.
    const userId = user?.id ?? null;

    // Validate required fields
    if (
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

    // The server computes the price itself from startTime/endTime and this
    // court's real rates - a client-supplied amount would let anyone book at
    // whatever price they send, including through the online PayHere flow.
    const amountLkr = await calculateBookingAmountForCourt(courtId, startTime, endTime);

    if (!userId && (!guestName || !guestPhone || !guestEmail)) {
      return NextResponse.json(
        { error: "Guest bookings require guestName, guestPhone, and guestEmail" },
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
        guestName: userId ? null : guestName,
        guestPhone: userId ? null : guestPhone,
        guestEmail: userId ? null : guestEmail,
        amountLkr: amountLkr.toString(),
        status: paymentMode === "payhere" ? "pending_payment" : "confirmed",
        paymentStatus: "unpaid",
        notes: `Booked via online system - ${paymentMode}`,
      })
      .returning();

    // Fire the confirmation SMS to whichever phone this booking has - the
    // guest's own number, or a lookup of the signed-in user's. Never lets an
    // SMS failure affect the booking response (see lib/sms.ts).
    const recipientPhone = userId
      ? (await db.select({ phoneNumber: users.phoneNumber }).from(users).where(eq(users.id, userId)).limit(1))[0]?.phoneNumber
      : guestPhone;
    if (recipientPhone) {
      const court = await db.select({ name: courts.name }).from(courts).where(eq(courts.id, courtId)).limit(1);
      await sendBookingSms(recipientPhone, {
        courtName: court[0]?.name ?? "the court",
        bookingDate,
        startTime,
        bookingRef: newBooking[0].id,
      });
    }

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
    // The pre-check SELECT above closes the common case, but two requests
    // for the same slot can still race each other between that SELECT and
    // this INSERT - the unique index (schema.ts) stops the actual double
    // booking either way, this just gives the loser the same friendly
    // message as the pre-check instead of a generic 500.
    if (isUniqueViolation(error)) {
      return NextResponse.json(
        { error: "Slot already booked" },
        { status: 409 }
      );
    }
    console.error("Create booking error:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
