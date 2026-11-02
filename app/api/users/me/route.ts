import { db } from "@/lib/db/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/server-auth";

// GET /api/users/me - The authenticated user's own row (id, email, fullName,
// phoneNumber, role). Supabase Auth's session only carries { id, email } -
// this is the "get my profile" endpoint DEVELOPER_GUIDE.md flags as missing.
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth.response) return auth.response;

  try {
    const rows = await db.select().from(users).where(eq(users.id, auth.user.id)).limit(1);

    if (!rows.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user: rows[0] });
  } catch (error) {
    console.error("Get current user error:", error);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}
