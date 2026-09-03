import { db } from "@/lib/db/db";
import { users, bookings } from "@/lib/db/schema";
import { and, eq, or, ilike } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// GET /api/admin/customers - Get all customers
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "50");

    const conditions = [eq(users.role, "customer")];
    if (search) {
      conditions.push(
        or(
          ilike(users.fullName, `%${search}%`),
          ilike(users.email, `%${search}%`),
          ilike(users.phoneNumber, `%${search}%`)
        )!
      );
    }

    const allCustomers = await db
      .select()
      .from(users)
      .where(and(...conditions))
      .limit(limit);

    // Enrich with booking count
    const customersWithStats = await Promise.all(
      allCustomers.map(async (customer) => {
        const userBookings = await db
          .select()
          .from(bookings)
          .where(eq(bookings.userId, customer.id));

        return {
          ...customer,
          totalBookings: userBookings.length,
          lastBooking: userBookings[userBookings.length - 1]?.bookingDate || null,
        };
      })
    );

    return NextResponse.json({
      customers: customersWithStats,
      total: customersWithStats.length,
    });
  } catch (error) {
    console.error("Get customers error:", error);
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}
