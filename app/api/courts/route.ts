import { db } from "@/lib/db/db";
import { courts } from "@/lib/db/schema";
import { NextResponse } from "next/server";

// GET /api/courts - List courts (single-court MVP, but kept list-shaped for
// the multi-court future the schema already supports).
export async function GET() {
  try {
    const allCourts = await db.select().from(courts);
    return NextResponse.json({ courts: allCourts });
  } catch (error) {
    console.error("Get courts error:", error);
    return NextResponse.json(
      { error: "Failed to fetch courts" },
      { status: 500 }
    );
  }
}
