import { db } from "@/lib/db/db";
import { settings, courts } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// GET /api/admin/settings - Get all settings
export async function GET(request: NextRequest) {
  try {
    const courtId = request.headers.get("X-Court-ID") || "";

    const allSettings = await db
      .select()
      .from(settings)
      .where(eq(settings.courtId, courtId));

    // Get court info too
    const court = await db
      .select()
      .from(courts)
      .where(eq(courts.id, courtId))
      .limit(1);

    const settingsMap: Record<string, string> = {};
    allSettings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    return NextResponse.json({
      courtId,
      courtInfo: court[0] || null,
      settings: settingsMap,
      allSettings,
    });
  } catch (error) {
    console.error("Get settings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/settings - Update settings
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { courtId, settings: newSettings } = body;

    if (!courtId || !newSettings) {
      return NextResponse.json(
        { error: "Missing courtId or settings" },
        { status: 400 }
      );
    }

    // Delete old settings and insert new ones
    const keys = Object.keys(newSettings);
    for (const key of keys) {
      const existing = await db
        .select()
        .from(settings)
        .where(and(eq(settings.key, key), eq(settings.courtId, courtId)));

      if (existing.length > 0) {
        await db
          .update(settings)
          .set({
            value: newSettings[key],
            updatedAt: new Date(),
          })
          .where(
            and(eq(settings.key, key), eq(settings.courtId, courtId))
          );
      } else {
        await db
          .insert(settings)
          .values({
            courtId,
            key,
            value: newSettings[key],
            updatedAt: new Date(),
          });
      }
    }

    return NextResponse.json({
      message: "Settings updated successfully",
      settings: newSettings,
    });
  } catch (error) {
    console.error("Update settings error:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
