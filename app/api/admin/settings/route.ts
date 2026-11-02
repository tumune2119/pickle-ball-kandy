import { db } from "@/lib/db/db";
import { settings, courts, pricing } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server-auth";
import { getCourtRates } from "@/lib/pricing";

// GET /api/admin/settings - Get a court's operating hours, pricing, and
// free-form settings (e.g. cancellation_policy_hours) in one call, so the
// admin Settings page can show real values instead of hardcoded defaults.
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.response) return auth.response;

  try {
    const courtId = request.headers.get("X-Court-ID") || "";

    const allSettings = await db
      .select()
      .from(settings)
      .where(eq(settings.courtId, courtId));

    const court = await db
      .select()
      .from(courts)
      .where(eq(courts.id, courtId))
      .limit(1);

    const settingsMap: Record<string, string> = {};
    allSettings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    // Reuse the exact same rate lookup the booking flow charges from, so
    // what the admin edits here is guaranteed to be what customers see and
    // pay - not a second, possibly-divergent copy of "pricing."
    const rates = courtId ? await getCourtRates(courtId) : [];
    const offPeak = rates.find((r) => !r.peak);
    const peak = rates.find((r) => r.peak);

    return NextResponse.json({
      courtId,
      courtInfo: court[0] || null,
      settings: settingsMap,
      allSettings,
      pricing: {
        offPeakRate: offPeak?.ratePerHour ?? null,
        peakRate: peak?.ratePerHour ?? null,
      },
    });
  } catch (error) {
    console.error("Get settings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/settings - Update a court's operating hours, pricing,
// and/or free-form settings. Each section is optional so a caller can
// update just one. courtHours/pricing write to the courts/pricing tables
// directly (they're real columns, not key-value settings); `settings`
// stays the generic key-value store for things like
// cancellation_policy_hours that don't have a dedicated column anywhere.
export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.response) return auth.response;

  try {
    const body = await request.json();
    const { courtId, settings: newSettings, courtHours, pricing: newPricing } = body;

    if (!courtId) {
      return NextResponse.json({ error: "Missing courtId" }, { status: 400 });
    }

    if (newSettings) {
      for (const key of Object.keys(newSettings)) {
        const existing = await db
          .select()
          .from(settings)
          .where(and(eq(settings.key, key), eq(settings.courtId, courtId)));

        if (existing.length > 0) {
          await db
            .update(settings)
            .set({ value: String(newSettings[key]), updatedAt: new Date() })
            .where(and(eq(settings.key, key), eq(settings.courtId, courtId)));
        } else {
          await db.insert(settings).values({
            courtId,
            key,
            value: String(newSettings[key]),
            updatedAt: new Date(),
          });
        }
      }
    }

    if (courtHours) {
      const { openingTime, closingTime, slotDuration } = courtHours;
      await db
        .update(courts)
        .set({
          ...(openingTime ? { openingTime } : {}),
          ...(closingTime ? { closingTime } : {}),
          ...(slotDuration ? { slotDuration } : {}),
          updatedAt: new Date(),
        })
        .where(eq(courts.id, courtId));
    }

    // Pricing is the fixed two-tier shape (off-peak/peak) the rest of the
    // app already assumes (lib/pricing.ts, the booking form's slot grid) -
    // replace this court's two rows outright rather than trying to patch
    // individual columns, since there are only ever the two.
    if (newPricing) {
      const { offPeakRate, peakRate } = newPricing;
      await db.delete(pricing).where(eq(pricing.courtId, courtId));
      await db.insert(pricing).values([
        {
          courtId,
          startTime: "06:00",
          endTime: "17:00",
          ratePerHour: String(offPeakRate),
          peak: false,
        },
        {
          courtId,
          startTime: "17:00",
          endTime: "22:00",
          ratePerHour: String(peakRate),
          peak: true,
        },
      ]);
    }

    return NextResponse.json({ message: "Settings updated successfully" });
  } catch (error) {
    console.error("Update settings error:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
