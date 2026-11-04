"use client";

import { useEffect, useState } from "react";
import { UserCheck, CheckCircle2, X, Phone, List, Table2 } from "lucide-react";
import { getSession } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/cn";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Tooltip from "@/components/ui/Tooltip";
import { Input } from "@/components/ui/Input";
import DatePicker from "@/components/ui/DatePicker";
import Skeleton from "@/components/ui/Skeleton";

interface BookingRow {
  id: string;
  courtName: string;
  startTime: string;
  endTime: string;
  customerName: string;
  customerPhone: string | null;
  numPlayers: number;
  amountLkr: number;
  status: string;
  checkedInAt: string | null;
}

function todayYMD() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// "HH:MM:00", zero-padded the same way startTime is, so a plain string
// compare tells us whether a slot's start has already passed.
function nowHM() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:00`;
}

const STATUS_FILTERS = ["all", "checked_in", "waiting", "cancelled"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];
const statusFilterLabel: Record<StatusFilter, string> = {
  all: "All",
  checked_in: "Checked In",
  waiting: "Waiting",
  cancelled: "Cancelled",
};

export default function TillCheckInLookup() {
  const [date, setDate] = useState(todayYMD());
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [view, setView] = useState<"list" | "table">("list");
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingInId, setCheckingInId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const session = await getSession();
      if (!session) return;
      // No status filter here - the schedule should show cancellations too,
      // not just confirmed bookings; filtering by status happens client-side
      // below so "All" can show the full picture for the day.
      const res = await fetch(`/api/admin/bookings?date=${date}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (cancelled) return;
      if (res.ok) {
        const data = await res.json();
        const sorted = [...(data.bookings ?? [])].sort((a, b) => a.startTime.localeCompare(b.startTime));
        setBookings(sorted);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [date]);

  const checkIn = async (id: string) => {
    setCheckingInId(id);
    const session = await getSession();
    if (!session) return;
    const res = await fetch(`/api/bookings/${id}/check-in`, {
      method: "POST",
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    if (res.ok) {
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, checkedInAt: new Date().toISOString() } : b)));
    }
    setCheckingInId(null);
  };

  const cancelBooking = async (id: string) => {
    setCancellingId(id);
    const session = await getSession();
    if (!session) {
      setCancellingId(null);
      return;
    }
    const res = await fetch(`/api/bookings/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, ...data.booking } : b)));
    }
    setCancellingId(null);
  };

  const isToday = date === todayYMD();
  const isLate = (b: BookingRow) =>
    isToday && b.status !== "cancelled" && !b.checkedInAt && b.startTime <= nowHM();

  const filtered = bookings
    .filter((b) => {
      if (statusFilter === "checked_in") return !!b.checkedInAt;
      if (statusFilter === "waiting") return b.status !== "cancelled" && !b.checkedInAt;
      if (statusFilter === "cancelled") return b.status === "cancelled";
      return true;
    })
    .filter((b) => {
      if (!query) return true;
      const q = query.toLowerCase();
      return b.customerName?.toLowerCase().includes(q) || b.customerPhone?.includes(q) || b.id.startsWith(q);
    });

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <DatePicker label="Date" value={date} onChange={setDate} />
        <Input
          label="Search by name, phone, or reference"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. John, +9471..., or a1b2c3d4"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-bold border-2 border-ink transition-[background-color,color]",
                statusFilter === f
                  ? "bg-admin-action text-admin-text-on-action"
                  : "bg-admin-surface text-admin-text-muted hover:bg-admin-bg"
              )}
            >
              {statusFilterLabel[f]}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5">
          <Tooltip label="List view">
            <button
              onClick={() => setView("list")}
              aria-label="List view"
              className={cn(
                "p-2 rounded-lg border-2 border-ink",
                view === "list" ? "bg-admin-action text-admin-text-on-action" : "bg-admin-surface text-admin-text-muted"
              )}
            >
              <List className="w-4 h-4" aria-hidden="true" />
            </button>
          </Tooltip>
          <Tooltip label="Table view (schedule)">
            <button
              onClick={() => setView("table")}
              aria-label="Table view"
              className={cn(
                "p-2 rounded-lg border-2 border-ink",
                view === "table" ? "bg-admin-action text-admin-text-on-action" : "bg-admin-surface text-admin-text-muted"
              )}
            >
              <Table2 className="w-4 h-4" aria-hidden="true" />
            </button>
          </Tooltip>
        </div>
      </div>

      {loading ? (
        <Skeleton className="h-48 w-full" />
      ) : filtered.length === 0 ? (
        <p className="text-admin-text-muted text-center py-8">No bookings match.</p>
      ) : view === "table" ? (
        <div className="bg-admin-surface rounded-xl border border-admin-border overflow-hidden">
          <table className="w-full table-fixed">
            <thead className="bg-admin-bg border-b border-admin-border">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-bold text-admin-text-muted uppercase w-[14%]">Time</th>
                <th className="px-3 py-2 text-left text-xs font-bold text-admin-text-muted uppercase w-[26%]">Customer</th>
                <th className="px-3 py-2 text-left text-xs font-bold text-admin-text-muted uppercase w-[20%]">Phone</th>
                <th className="px-3 py-2 text-left text-xs font-bold text-admin-text-muted uppercase w-[20%]">Status</th>
                <th className="px-3 py-2 text-left text-xs font-bold text-admin-text-muted uppercase w-[20%]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {filtered.map((b) => (
                <tr key={b.id} className={isLate(b) ? "bg-danger-100 dark:bg-danger-900/40" : undefined}>
                  <td className="px-3 py-3 text-sm text-admin-text whitespace-nowrap">{b.startTime.slice(0, 5)}</td>
                  <td className="px-3 py-3 text-sm text-admin-text truncate">
                    {b.customerName}
                    <div className="text-xs text-admin-text-muted truncate">{b.courtName}</div>
                  </td>
                  <td className="px-3 py-3 text-sm">
                    {b.customerPhone ? (
                      <a href={`tel:${b.customerPhone}`} className="flex items-center gap-1 text-admin-action hover:text-admin-action-hover font-medium">
                        <Phone className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                        <span className="truncate">{b.customerPhone}</span>
                      </a>
                    ) : (
                      <span className="text-admin-text-muted">—</span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-sm">
                    {b.status === "cancelled" ? (
                      <span className="text-danger-700 dark:text-danger-300 font-semibold">Cancelled</span>
                    ) : b.checkedInAt ? (
                      <span className="flex items-center gap-1 text-success-700 dark:text-success-400 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                        Checked in
                      </span>
                    ) : isLate(b) ? (
                      <span className="text-danger-700 dark:text-danger-300 font-semibold">Late</span>
                    ) : (
                      <span className="text-admin-text-muted">Waiting</span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    {b.status !== "cancelled" && (
                      <div className="flex items-center gap-1.5">
                        {!b.checkedInAt && (
                          <Tooltip label={checkingInId === b.id ? "Checking in…" : "Check in"}>
                            <button
                              onClick={() => checkIn(b.id)}
                              disabled={checkingInId === b.id}
                              className="p-1.5 text-admin-action hover:text-admin-action-hover transition-colors disabled:opacity-50"
                              aria-label="Check in"
                            >
                              <UserCheck className="w-4 h-4" aria-hidden="true" />
                            </button>
                          </Tooltip>
                        )}
                        <Tooltip label={cancellingId === b.id ? "Cancelling…" : "Cancel booking"}>
                          <button
                            onClick={() => cancelBooking(b.id)}
                            disabled={cancellingId === b.id}
                            className="p-1.5 text-danger-700 dark:text-danger-300 hover:text-danger-900 dark:hover:text-danger-100 transition-colors disabled:opacity-50"
                            aria-label="Cancel booking"
                          >
                            <X className="w-4 h-4" aria-hidden="true" />
                          </button>
                        </Tooltip>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((b) => (
            <Card
              key={b.id}
              poster
              padding="md"
              className={cn("flex items-center justify-between gap-4", isLate(b) && "bg-danger-100 dark:bg-danger-900/40")}
            >
              <div className="min-w-0">
                <div className="font-bold text-admin-text">{b.customerName}</div>
                <div className="text-sm text-admin-text-muted">
                  {b.courtName} · {b.startTime.slice(0, 5)}–{b.endTime.slice(0, 5)} · {b.numPlayers} players ·{" "}
                  {formatCurrency(b.amountLkr)}
                </div>
                {b.customerPhone && (
                  <a href={`tel:${b.customerPhone}`} className="flex items-center gap-1 text-xs text-admin-action hover:text-admin-action-hover">
                    <Phone className="w-3 h-3" aria-hidden="true" />
                    {b.customerPhone}
                  </a>
                )}
                {isLate(b) && <div className="text-xs font-semibold text-danger-700 dark:text-danger-300 mt-1">Late — not checked in yet</div>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {b.status === "cancelled" ? (
                  <span className="text-sm font-medium text-danger-700 dark:text-danger-300">Cancelled</span>
                ) : (
                  <>
                    {b.checkedInAt ? (
                      <span className="flex items-center gap-1.5 text-sm font-medium text-success-700 dark:text-success-400">
                        <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                        Checked in
                      </span>
                    ) : (
                      <Button tone="admin" variant="lime" onClick={() => checkIn(b.id)} loading={checkingInId === b.id}>
                        <UserCheck className="w-4 h-4" aria-hidden="true" />
                        Check In
                      </Button>
                    )}
                    <Tooltip label={cancellingId === b.id ? "Cancelling…" : "Cancel booking"}>
                      <button
                        onClick={() => cancelBooking(b.id)}
                        disabled={cancellingId === b.id}
                        className="p-2 text-danger-700 dark:text-danger-300 hover:text-danger-900 dark:hover:text-danger-100 transition-colors disabled:opacity-50"
                        aria-label="Cancel booking"
                      >
                        <X className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </Tooltip>
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
