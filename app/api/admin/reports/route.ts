import { db } from "@/lib/db/db";
import { bookings } from "@/lib/db/schema";
import { and, gte, lte } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// GET /api/admin/reports - Get analytics data
export async function GET(request: NextRequest) {
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

    // Calculate statistics
    const totalRevenue = allBookings.reduce((sum, b) => {
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
        peakPaymentDay: "Saturday", // TODO: Calculate from data
        paymentMethods: {
          atVenue: confirmedBookings.filter((b) => !b.notes?.includes("online"))
            .length,
          online: confirmedBookings.filter((b) => b.notes?.includes("online"))
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
