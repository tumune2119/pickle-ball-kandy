import { db } from "@/lib/db/db";
import { bookings, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/server-auth";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

// POST /api/admin/reset - TEMPORARY dev tool: wipes every customer account,
// their Supabase Auth login, and all bookings/payments (cascades), so the
// site can be tested from a clean slate. Admin/staff accounts and court
// settings/pricing are left untouched. Remove this route (and the button in
// components/AdminResetPanel.tsx) before launch.
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.response) return auth.response;

  try {
    const customers = await db.select().from(users).where(eq(users.role, "customer"));

    for (const customer of customers) {
      // Best-effort - if the Auth user was already gone this just no-ops.
      await supabaseAdmin.auth.admin.deleteUser(customer.id).catch(() => {});
    }

    const deletedBookings = await db.delete(bookings).returning({ id: bookings.id });
    const deletedCustomers = await db
      .delete(users)
      .where(eq(users.role, "customer"))
      .returning({ id: users.id });

    return NextResponse.json({
      message: "Test data cleared",
      deleted: {
        bookings: deletedBookings.length,
        customers: deletedCustomers.length,
      },
    });
  } catch (error) {
    console.error("Admin reset error:", error);
    return NextResponse.json({ error: "Failed to reset data" }, { status: 500 });
  }
}
