import { db } from "@/lib/db/db";
import { bookings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server-auth";

// POST /api/bookings/[id]/check-in - Staff marks a customer as arrived at
// the counter. Separate from the booking's `status` (payment/cancellation
// lifecycle) - a booking can be confirmed and checked in, or confirmed and
// not yet checked in; this is its own, orthogonal field.
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request);
  if (auth.response) return auth.response;

  try {
    const { id } = await params;

    const updated = await db
      .update(bookings)
      .set({ checkedInAt: new Date() })
      .where(eq(bookings.id, id))
      .returning();

    if (!updated.length) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json({ booking: updated[0] });
  } catch (error) {
    console.error("Check-in error:", error);
    return NextResponse.json({ error: "Failed to check in" }, { status: 500 });
  }
}
