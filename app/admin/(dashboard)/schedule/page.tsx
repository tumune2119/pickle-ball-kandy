"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Printer } from "lucide-react";
import { getSession } from "@/lib/auth";
import { getTimeSlots } from "@/lib/utils";
import { cn } from "@/lib/cn";
import { COURT_NAME } from "@/lib/constants";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";

interface ScheduleBooking {
  bookingDate: string;
  startTime: string;
  status: string;
  numPlayers: number;
  customerName: string;
  isGuest: boolean;
}

interface CourtInfo {
  id: string;
  name: string;
  openingTime: string;
  closingTime: string;
  slotDuration: number;
}

const DAY_LABELS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday
  const diff = day === 0 ? -6 : 1 - day; // shift to Monday
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Local calendar-date components, not UTC (toISOString() would shift the
// date by a day for any timezone ahead of UTC, since these Date objects
// are set to local midnight).
function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function WeeklySchedulePage() {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [allCourts, setAllCourts] = useState<CourtInfo[]>([]);
  const [selectedCourtId, setSelectedCourtId] = useState<string | null>(null);
  const [bookings, setBookings] = useState<ScheduleBooking[]>([]);
  const [loading, setLoading] = useState(true);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });
  const weekEnd = weekDays[6];
  const court = allCourts.find((c) => c.id === selectedCourtId) ?? null;

  // Fetch the court list once.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/courts")
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setAllCourts(data.courts ?? []);
        setSelectedCourtId((prev) => prev ?? data.courts?.[0]?.id ?? null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Refetch this court's bookings whenever the court or week changes.
  useEffect(() => {
    if (!selectedCourtId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const session = await getSession();
      if (!session) {
        if (!cancelled) setLoading(false);
        return;
      }
      const res = await fetch(
        `/api/admin/bookings?startDate=${toDateKey(weekStart)}&endDate=${toDateKey(weekEnd)}&courtId=${selectedCourtId}&limit=500`,
        { headers: { Authorization: `Bearer ${session.access_token}` } }
      );
      if (cancelled) return;
      if (res.ok) {
        const data = await res.json();
        setBookings((data.bookings ?? []).filter((b: ScheduleBooking) => b.status !== "cancelled"));
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekStart, selectedCourtId]);

  const slots = court ? getTimeSlots(court.openingTime, court.closingTime, court.slotDuration) : [];

  const bookingFor = (dateKey: string, slot: string) =>
    bookings.find((b) => b.bookingDate === dateKey && b.startTime.slice(0, 5) === slot);

  const weekRangeLabel = `${weekStart.toLocaleDateString("en-LK", { month: "short", day: "numeric" })} - ${weekEnd.toLocaleDateString("en-LK", { month: "short", day: "numeric", year: "numeric" })}`;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 print:hidden">
        <h2 className="text-2xl font-bold text-text-primary">Weekly Schedule</h2>
        <Button onClick={() => window.print()} tone="admin">
          <Printer className="w-4 h-4" aria-hidden="true" />
          Print
        </Button>
      </div>

      {allCourts.length > 1 && (
        <div className="flex gap-2 flex-wrap mb-6 print:hidden">
          {allCourts.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCourtId(c.id)}
              className={cn(
                "px-4 py-2 rounded-lg font-semibold text-sm transition-colors",
                selectedCourtId === c.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-white/10 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-700"
              )}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      <Card padding="md" className="mb-6 print:hidden">
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => setWeekStart((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() - 7))}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300"
            aria-label="Previous week"
          >
            <ChevronLeft className="w-5 h-5" aria-hidden="true" />
          </button>
          <p className="font-semibold text-text-primary">{weekRangeLabel}</p>
          <button
            onClick={() => setWeekStart((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + 7))}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300"
            aria-label="Next week"
          >
            <ChevronRight className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
      </Card>

      {/* Printable area */}
      <div className="print:bg-white print:text-black">
        <div className="hidden print:block mb-4">
          <h1 className="text-xl font-bold">
            {COURT_NAME}{court ? ` - ${court.name}` : ""} - Weekly Schedule
          </h1>
          <p className="text-sm">{weekRangeLabel}</p>
          <p className="text-xs text-gray-500">Printed {new Date().toLocaleString("en-LK")}</p>
        </div>

        {loading ? (
          <Skeleton className="h-96 w-full" />
        ) : (
          <div className="bg-surface print:bg-white rounded-xl border border-gray-200 dark:border-white/10 print:border-gray-400 overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-surface-sunken print:bg-white">
                  <th className="px-3 py-2 text-left font-bold text-gray-700 dark:text-gray-300 print:text-black border-b border-gray-200 dark:border-white/10 print:border-gray-400">
                    Time
                  </th>
                  {weekDays.map((d, i) => (
                    <th
                      key={i}
                      className="px-3 py-2 text-left font-bold text-gray-700 dark:text-gray-300 print:text-black border-b border-gray-200 dark:border-white/10 print:border-gray-400"
                    >
                      {DAY_LABELS[i]}
                      <div className="font-normal text-xs text-gray-500">{d.toLocaleDateString("en-LK", { month: "short", day: "numeric" })}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-white/10 print:divide-gray-300">
                {slots.map((slot) => (
                  <tr key={slot}>
                    <td className="px-3 py-2 font-mono text-text-primary print:text-black whitespace-nowrap">{slot}</td>
                    {weekDays.map((d, i) => {
                      const booking = bookingFor(toDateKey(d), slot);
                      return (
                        <td
                          key={i}
                          className={
                            booking
                              ? "px-3 py-2 bg-blue-50 dark:bg-blue-950/40 print:bg-gray-100 text-blue-900 dark:text-blue-200 print:text-black"
                              : "px-3 py-2 text-gray-300 dark:text-gray-700 print:text-gray-300"
                          }
                        >
                          {booking ? (
                            <span>
                              {booking.customerName}
                              {booking.isGuest && " (Guest)"}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
