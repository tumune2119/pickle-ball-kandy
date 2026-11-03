"use client";

import { useEffect, useState } from "react";
import { Printer } from "lucide-react";
import { getSession } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";
import { attemptOrQueue } from "@/lib/pos-queue";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { Input, Select } from "@/components/ui/Input";
import DatePicker from "@/components/ui/DatePicker";
import BookingTicket, { type TicketBooking } from "@/components/pos/BookingTicket";

interface Court {
  id: string;
  name: string;
}

interface Slot {
  time: string;
  rate: number;
}

function todayYMD() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function TillBookingForm() {
  const [courts, setCourts] = useState<Court[]>([]);
  const [courtId, setCourtId] = useState("");
  const [date, setDate] = useState(todayYMD());
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [numPlayers, setNumPlayers] = useState(2);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card">("cash");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ booking: TicketBooking; queued: boolean } | null>(null);

  useEffect(() => {
    fetch("/api/courts")
      .then((r) => r.json())
      .then((data) => {
        setCourts(data.courts ?? []);
        setCourtId((prev) => prev || data.courts?.[0]?.id || "");
      });
  }, []);

  useEffect(() => {
    if (!courtId || !date) return;
    let cancelled = false;
    fetch(`/api/bookings/availability?date=${date}&courtId=${courtId}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const rates: { startTime: string; ratePerHour: number }[] = data.rates ?? [];
        const rateByTime = new Map(rates.map((r) => [r.startTime, r.ratePerHour]));
        setSelectedSlot("");
        setSlots((data.availableSlots ?? []).map((t: string) => ({ time: t, rate: rateByTime.get(t) ?? 0 })));
      });
    return () => {
      cancelled = true;
    };
  }, [courtId, date]);

  const selectedCourt = courts.find((c) => c.id === courtId);
  const selectedRate = slots.find((s) => s.time === selectedSlot)?.rate ?? 0;

  const checkout = async () => {
    if (!courtId || !selectedSlot || !customerName) return;
    setSubmitting(true);
    setError("");

    const session = await getSession();
    if (!session) {
      setError("Session expired - please log in again.");
      setSubmitting(false);
      return;
    }

    const [h] = selectedSlot.split(":").map(Number);
    const endTime = `${String(h + 1).padStart(2, "0")}:00`;
    const bookingId = crypto.randomUUID();

    const payload = {
      id: bookingId,
      courtId,
      bookingDate: date,
      startTime: selectedSlot,
      endTime,
      numPlayers,
      paymentMethod,
      customerName,
      customerPhone,
    };

    const res = await attemptOrQueue({
      id: bookingId,
      kind: "booking",
      endpoint: "/api/pos/bookings",
      authHeader: `Bearer ${session.access_token}`,
      payload,
    });

    setSubmitting(false);

    if (res.status === "error") {
      setError(res.message);
      return;
    }

    setResult({
      queued: res.status === "queued",
      booking: {
        id: bookingId,
        courtName: selectedCourt?.name ?? "",
        bookingDate: date,
        startTime: selectedSlot,
        endTime,
        customerName,
        customerPhone,
        numPlayers,
        amountLkr: selectedRate,
        paymentStatus: "paid",
      },
    });
  };

  if (result) {
    return (
      <div>
        {result.queued && (
          <p className="text-center text-sm text-warning-800 dark:text-warning-300 mb-3 print:hidden">
            No connection right now - this booking is queued and will sync automatically.
          </p>
        )}
        <BookingTicket booking={result.booking} />
        <div className="flex justify-center gap-3 mt-4 print:hidden">
          <Button tone="admin" variant="secondary" onClick={() => window.print()}>
            <Printer className="w-4 h-4" aria-hidden="true" />
            Print
          </Button>
          <Button
            tone="admin"
            onClick={() => {
              setResult(null);
              setCustomerName("");
              setCustomerPhone("");
              setSelectedSlot("");
            }}
          >
            New Booking
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <Select label="Court" value={courtId} onChange={(e) => setCourtId(e.target.value)}>
          {courts.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <DatePicker label="Date" value={date} onChange={setDate} min={todayYMD()} />
      </div>

      <div>
        <p className="text-sm font-medium text-admin-text mb-2">Time slot</p>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {slots.map((s) => (
            <button
              key={s.time}
              onClick={() => setSelectedSlot(s.time)}
              className={`p-2 rounded-lg border text-sm font-mono ${
                selectedSlot === s.time
                  ? "bg-admin-action text-admin-text-on-action border-admin-action"
                  : "border-admin-border text-admin-text"
              }`}
            >
              {s.time}
            </button>
          ))}
          {slots.length === 0 && <p className="col-span-full text-sm text-admin-text-muted">No open slots for this date.</p>}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Input label="Customer name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
        <Input label="Phone (optional)" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
      </div>

      <Select label="Number of players" value={numPlayers} onChange={(e) => setNumPlayers(Number(e.target.value))}>
        {[1, 2, 3, 4].map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </Select>

      <div className="flex gap-2">
        {(["cash", "card"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setPaymentMethod(m)}
            className={`flex-1 py-2 rounded-lg border text-sm font-medium capitalize ${
              paymentMethod === m
                ? "bg-admin-action text-admin-text-on-action border-admin-action"
                : "border-admin-border text-admin-text-muted"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      <Card padding="md" className="flex items-center justify-between">
        <span className="text-admin-text-muted">Total</span>
        <span className="font-mono font-bold text-lg text-admin-text">{formatCurrency(selectedRate)}</span>
      </Card>

      {error && <p className="text-sm text-danger-700 dark:text-danger-300">{error}</p>}

      <Button
        tone="admin"
        fullWidth
        size="lg"
        onClick={checkout}
        loading={submitting}
        disabled={!courtId || !selectedSlot || !customerName}
      >
        Confirm & Take Payment
      </Button>
    </div>
  );
}
