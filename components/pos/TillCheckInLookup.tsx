"use client";

import { useEffect, useState } from "react";
import { Search, CheckCircle2 } from "lucide-react";
import { getSession } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
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

export default function TillCheckInLookup() {
  const [date, setDate] = useState(todayYMD());
  const [query, setQuery] = useState("");
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingInId, setCheckingInId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const session = await getSession();
      if (!session) return;
      const res = await fetch(`/api/admin/bookings?date=${date}&status=confirmed`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (cancelled) return;
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings ?? []);
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

  const filtered = bookings.filter((b) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return b.customerName?.toLowerCase().includes(q) || b.customerPhone?.includes(q) || b.id.startsWith(q);
  });

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <DatePicker label="Date" value={date} onChange={setDate} />
        <Input
          label="Search by name, phone, or reference"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. John, +9471..., or a1b2c3d4"
        />
      </div>

      {loading ? (
        <Skeleton className="h-48 w-full" />
      ) : filtered.length === 0 ? (
        <p className="text-admin-text-muted text-center py-8">No bookings match.</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((b) => (
            <Card key={b.id} padding="md" className="flex items-center justify-between gap-4">
              <div>
                <div className="font-bold text-admin-text">{b.customerName}</div>
                <div className="text-sm text-admin-text-muted">
                  {b.courtName} · {b.startTime.slice(0, 5)}–{b.endTime.slice(0, 5)} · {b.numPlayers} players ·{" "}
                  {formatCurrency(b.amountLkr)}
                </div>
                {b.customerPhone && <div className="text-xs text-admin-text-muted">{b.customerPhone}</div>}
              </div>
              {b.checkedInAt ? (
                <span className="flex items-center gap-1.5 text-sm font-medium text-success-700 dark:text-success-400">
                  <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                  Checked in
                </span>
              ) : (
                <Button
                  tone="admin"
                  size="sm"
                  onClick={() => checkIn(b.id)}
                  loading={checkingInId === b.id}
                >
                  <Search className="w-4 h-4" aria-hidden="true" />
                  Check In
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
