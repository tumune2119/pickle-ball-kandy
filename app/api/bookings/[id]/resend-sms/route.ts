import { db } from "@/lib/db/db";
import { bookings, courts, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server-auth";
import { sendBookingSms } from "@/lib/sms";

// POST /api/bookings/[id]/resend-sms - Manual "Resend ticket SMS" button on
// the booking ticket view. Staff/admin only.
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request);
  if (auth.response) return auth.response;

  try {
    const { id } = await params;

    const booking = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
    if (!booking.length) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    const b = booking[0];

    const phone = b.userId
      ? (await db.select({ phoneNumber: users.phoneNumber }).from(users).where(eq(users.id, b.userId)).limit(1))[0]?.phoneNumber
      : b.guestPhone;

    if (!phone) {
      return NextResponse.json({ error: "No phone number on file for this booking" }, { status: 400 });
    }

    const court = await db.select({ name: courts.name }).from(courts).where(eq(courts.id, b.courtId)).limit(1);
    await sendBookingSms(phone, {
      courtName: court[0]?.name ?? "the court",
      bookingDate: b.bookingDate,
      startTime: b.startTime,
      bookingRef: b.id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Resend SMS error:", error);
    return NextResponse.json({ error: "Failed to resend SMS" }, { status: 500 });
  }
}
