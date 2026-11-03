import { db } from "@/lib/db/db";
import { users, bookings } from "@/lib/db/schema";
import { and, eq, or, ilike, inArray } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server-auth";

// GET /api/admin/customers - Get all customers
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.response) return auth.response;

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

    // Enrich with booking count - one query for every matched customer's
    // bookings instead of one query per customer.
    const customerIds = allCustomers.map((c) => c.id);
    const allCustomerBookings = customerIds.length
      ? await db.select().from(bookings).where(inArray(bookings.userId, customerIds))
      : [];
    const bookingsByCustomer = new Map<string, typeof allCustomerBookings>();
    for (const b of allCustomerBookings) {
      if (!b.userId) continue;
      const list = bookingsByCustomer.get(b.userId);
      if (list) list.push(b);
      else bookingsByCustomer.set(b.userId, [b]);
    }

    const customersWithStats = allCustomers.map((customer) => {
      const userBookings = bookingsByCustomer.get(customer.id) ?? [];
      // bookingDate is a yyyy-mm-dd string, so a plain max compares
      // correctly - SQL row order isn't guaranteed without ORDER BY, so the
      // previous "last element returned" wasn't necessarily the latest date.
      const lastBooking = userBookings.reduce<string | null>(
        (latest, b) => (!latest || b.bookingDate > latest ? b.bookingDate : latest),
        null
      );

      return {
        ...customer,
        totalBookings: userBookings.length,
        lastBooking,
      };
    });

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
