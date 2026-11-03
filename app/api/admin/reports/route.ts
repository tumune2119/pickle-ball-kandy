import { db } from "@/lib/db/db";
import { bookings } from "@/lib/db/schema";
import { and, gte, lte } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server-auth";
import { TIMEZONE } from "@/lib/constants";

// Self-service bookings record their payment mode as a suffix on `notes`
// (see app/api/bookings/route.ts) - there's no dedicated payment-method
// column. Matching on the exact "- payhere" suffix (not just a substring
// like "online") avoids misreading a "pay_at_venue" booking's notes, which
// also contain the word "online" since both share the same notes template.
function isOnlinePayment(notes: string | null): boolean {
  return !!notes && /- payhere$/.test(notes);
}

// The day of week (in the venue's timezone) with the most confirmed
// bookings in range - null rather than a fake default when there's nothing
// to compute it from.
function computePeakPaymentDay(confirmedBookings: (typeof bookings.$inferSelect)[]): string | null {
  const counts = new Map<string, number>();
  for (const b of confirmedBookings) {
    const day = new Intl.DateTimeFormat("en-US", { weekday: "long", timeZone: TIMEZONE }).format(
      new Date(`${b.bookingDate}T00:00:00`)
    );
    counts.set(day, (counts.get(day) ?? 0) + 1);
  }
  let peakDay: string | null = null;
  let peakCount = 0;
  for (const [day, count] of counts) {
    if (count > peakCount) {
      peakCount = count;
      peakDay = day;
    }
  }
  return peakDay;
}

// GET /api/admin/reports - Get analytics data
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.response) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Get all bookings in date range
    const allBookings = await db
      .select()
      .from(bookings)
      .where(
        startDate && endDate
          ? and(
              gte(bookings.bookingDate, startDate),
              lte(bookings.bookingDate, endDate)
            )
          : undefined
      );

    // Calculate statistics - cancelled bookings never happened, so they
    // don't count as revenue regardless of what amountLkr was set to.
    const nonCancelledBookings = allBookings.filter((b) => b.status !== "cancelled");
    const totalRevenue = nonCancelledBookings.reduce((sum, b) => {
      return sum + (b.amountLkr ? parseFloat(b.amountLkr as string) : 0);
    }, 0);

    const confirmedBookings = allBookings.filter(
      (b) => b.status === "confirmed"
    );
    const paidBookings = allBookings.filter(
      (b) => b.paymentStatus === "paid"
    );
    const cancelledBookings = allBookings.filter(
      (b) => b.status === "cancelled"
    );

    const totalPlayers = allBookings.reduce((sum, b) => sum + b.numPlayers, 0);
    const averageBookingValue =
      confirmedBookings.length > 0
        ? totalRevenue / confirmedBookings.length
        : 0;

    // Occupancy calculation
    const occupancyRate =
      allBookings.length > 0
        ? ((confirmedBookings.length / allBookings.length) * 100).toFixed(1)
        : 0;

    return NextResponse.json({
      period: { startDate, endDate },
      revenue: {
        total: totalRevenue,
        paid: paidBookings.reduce((sum, b) => {
          return sum + (b.amountLkr ? parseFloat(b.amountLkr as string) : 0);
        }, 0),
        pending: confirmedBookings
          .filter((b) => b.paymentStatus === "unpaid")
          .reduce((sum, b) => {
            return sum + (b.amountLkr ? parseFloat(b.amountLkr as string) : 0);
          }, 0),
      },
      bookings: {
        total: allBookings.length,
        confirmed: confirmedBookings.length,
        pending: allBookings.filter((b) => b.status === "pending_payment")
          .length,
        cancelled: cancelledBookings.length,
      },
      customers: {
        totalPlayers,
        averagePerBooking:
          confirmedBookings.length > 0
            ? (totalPlayers / confirmedBookings.length).toFixed(1)
            : 0,
      },
      occupancy: {
        rate: occupancyRate,
        peakHours: confirmedBookings.filter((b) => {
          const hour = parseInt(b.startTime.split(":")[0]);
          return hour >= 17;
        }).length,
        offPeakHours: confirmedBookings.filter((b) => {
          const hour = parseInt(b.startTime.split(":")[0]);
          return hour < 17;
        }).length,
      },
      payments: {
        averageValue: averageBookingValue.toFixed(0),
        peakPaymentDay: computePeakPaymentDay(confirmedBookings),
        paymentMethods: {
          atVenue: confirmedBookings.filter((b) => !isOnlinePayment(b.notes))
            .length,
          online: confirmedBookings.filter((b) => isOnlinePayment(b.notes))
            .length,
        },
      },
    });
  } catch (error) {
    console.error("Get reports error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}
