"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, CheckCircle2 } from "lucide-react";
import { formatCurrency, ymdInVenueTimezone } from "@/lib/utils";
import { getSession } from "@/lib/auth";
import { redirectToPayHereCheckout } from "@/lib/payhere-client";
import { cn } from "@/lib/cn";
import Button from "@/components/ui/Button";
import { Input, Select, Radio } from "@/components/ui/Input";
import DatePicker from "@/components/ui/DatePicker";
import Skeleton from "@/components/ui/Skeleton";
import PickleballBounce from "@/components/ui/PickleballBounce";

interface BookingFormProps {
  courtId: string;
  // null = not signed in - the form collects guest contact details instead
  // and only offers "pay at venue" (see the API route for why online
  // payment stays account-only).
  userId: string | null;
  onBooked?: (bookingId: string) => void;
}

export default function BookingForm({ courtId, userId, onBooked }: BookingFormProps) {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [numPlayers, setNumPlayers] = useState(2);
  const [paymentMode, setPaymentMode] = useState("pay_at_venue");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [bookingId, setBookingId] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestEmail, setGuestEmail] = useState("");

  // Real availability for the selected date - which slots exist for this
  // court, which are already booked, and what each costs - fetched from
  // /api/bookings/availability, which reads the same pricing (lib/pricing.ts)
  // the server will actually charge, so what's shown here never diverges
  // from what POST /api/bookings bills.
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [rates, setRates] = useState<Record<string, { rate: number; peak: boolean }>>({});
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  useEffect(() => {
    if (!selectedDate) return;
    let cancelled = false;
    (async () => {
      setLoadingAvailability(true);
      try {
        const res = await fetch(`/api/bookings/availability?date=${selectedDate}&courtId=${courtId}`);
        const data = await res.json();
        if (cancelled) return;
        setAvailableSlots(data.totalSlots ?? []);
        setBookedSlots(data.bookedSlots ?? []);
        setRates(data.rates ?? {});
      } finally {
        if (!cancelled) setLoadingAvailability(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedDate, courtId]);

  // Booking window: today through 30 days out. Computed once per mount
  // rather than inline in JSX, since JSX must render the same output for
  // the same props/state.
  const [minDate] = useState(() => ymdInVenueTimezone());
  const [maxDate] = useState(() => ymdInVenueTimezone(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)));

  // Falls back to the same 6am-5pm/5pm-10pm split the server defaults to
  // (lib/pricing.ts) only for the brief window before `rates` has loaded -
  // once loaded, this always reflects the real, possibly admin-configured
  // rate for this court.
  const slotRate = (slot: string): { rate: number; peak: boolean } =>
    rates[slot] ?? {
      rate: parseInt(slot.split(":")[0], 10) < 17 ? 1500 : 2500,
      peak: parseInt(slot.split(":")[0], 10) >= 17,
    };

  const calculatePrice = (): number => selectedSlots.reduce((total, slot) => total + slotRate(slot).rate, 0);

  // Representative off-peak/peak rates for the legend below the slot grid -
  // picked from whatever slots actually loaded, so it reflects this court's
  // real configured rates rather than always showing the hardcoded default.
  const offPeakRate = availableSlots.map(slotRate).find((r) => !r.peak)?.rate ?? 1500;
  const peakRate = availableSlots.map(slotRate).find((r) => r.peak)?.rate ?? 2500;

  const handleSlotToggle = (slot: string) => {
    if (selectedSlots.includes(slot)) {
      setSelectedSlots(selectedSlots.filter((s) => s !== slot));
    } else {
      setSelectedSlots([...selectedSlots, slot]);
    }
  };

  const canSubmit =
    !!selectedDate &&
    selectedSlots.length > 0 &&
    (!!userId || (!!guestName && !!guestPhone && !!guestEmail));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) {
      setError("Please select a date.");
      return;
    }
    if (selectedSlots.length === 0) {
      setError("Please select at least one time slot.");
      return;
    }
    if (!userId && (!guestName || !guestPhone || !guestEmail)) {
      setError("Please fill in your name, phone, and email.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      let authHeaders: Record<string, string> = { "Content-Type": "application/json" };

      if (userId) {
        const session = await getSession();
        if (!session) {
          setError("Your session has expired. Please log in again.");
          setLoading(false);
          return;
        }
        authHeaders = { ...authHeaders, Authorization: `Bearer ${session.access_token}` };
      }

      const startTime = selectedSlots[0];
      const lastSlotHour = parseInt(selectedSlots[selectedSlots.length - 1].split(":")[0], 10);
      const endTime = `${String(lastSlotHour + 1).padStart(2, "0")}:00`;

      const bookingRes = await fetch("/api/bookings", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          courtId,
          bookingDate: selectedDate,
          startTime,
          endTime,
          numPlayers,
          amountLkr: calculatePrice(),
          paymentMode,
          ...(userId ? {} : { guestName, guestPhone, guestEmail }),
        }),
      });
      const bookingData = await bookingRes.json();

      if (!bookingRes.ok) {
        setError(bookingData.error || "Failed to create booking");
        setLoading(false);
        return;
      }

      const newBookingId = bookingData.booking.id;
      setBookingId(newBookingId);

      if (paymentMode === "payhere") {
        const paymentRes = await fetch("/api/payments/initiate", {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({ bookingId: newBookingId }),
        });
        const paymentData = await paymentRes.json();

        if (!paymentRes.ok) {
          setError(paymentData.error || "Failed to start payment");
          setLoading(false);
          return;
        }

        redirectToPayHereCheckout(paymentData.checkoutUrl, paymentData.fields);
        return; // browser is navigating away
      }

      if (onBooked) onBooked(newBookingId);
      setConfirmed(true);
    } catch (err) {
      console.error("Booking submission error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (confirmed) {
    return (
      <div className="text-center space-y-6">
        <PickleballBounce className="w-10 h-10 mx-auto" />
        <motion.div
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
          className="w-20 h-20 mx-auto rounded-full bg-success-100 dark:bg-success-900/40 flex items-center justify-center"
        >
          <CheckCircle2 className="w-12 h-12 text-success-700 dark:text-success-300" aria-hidden="true" />
        </motion.div>
        <h3 className="text-2xl font-display uppercase text-success-700 dark:text-success-300">Booking Confirmed!</h3>

        <div className="bg-success-50 dark:bg-success-900/30 p-6 rounded-lg border border-success-300 dark:border-success-700/60">
          <p className="text-success-900 dark:text-success-100 mb-4">
            Your court booking has been confirmed.
            {!userId && " Save your booking reference and phone number - you'll need both to manage this booking later."}
          </p>

          <div className="space-y-3 text-left">
            <div>
              <p className="text-sm text-text-muted">Booking Reference</p>
              <p className="font-mono font-bold text-lg text-text-primary">BK#{bookingId.slice(0, 8).toUpperCase()}</p>
            </div>
            <div>
              <p className="text-sm text-text-muted">Date & Time</p>
              <p className="font-bold text-text-primary">
                {new Date(selectedDate).toLocaleDateString("en-LK")} | {selectedSlots[0]} -{" "}
                {selectedSlots[selectedSlots.length - 1]}
              </p>
            </div>
            <div>
              <p className="text-sm text-text-muted">Amount</p>
              <p className="font-bold text-lg text-text-primary">{formatCurrency(calculatePrice())}</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Button href={userId ? "/my-bookings" : "/manage-booking"} variant="lime" size="lg">
            {userId ? "View My Bookings" : "Manage This Booking"}
          </Button>
          <div>
            <Button href="/" variant="ghost" size="sm" className="hover:bg-transparent">
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Date */}
      <div className="space-y-4">
        <h3 className="text-xl font-display uppercase">2. Pick a date</h3>
        <DatePicker label="" value={selectedDate} onChange={setSelectedDate} min={minDate} max={maxDate} />
        <AnimatePresence>
          {selectedDate && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="bg-rush-blue-50 dark:bg-rush-blue-950/40 p-4 rounded-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-rush-blue-700 dark:text-rush-blue-300 shrink-0" aria-hidden="true" />
                <p className="text-rush-blue-900 dark:text-rush-blue-200">
                  Selected:{" "}
                  <strong>
                    {new Date(selectedDate).toLocaleDateString("en-LK", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </strong>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Time slots */}
      <div className="space-y-4">
        <h3 className="text-xl font-display uppercase">3. Pick your time</h3>
        {!selectedDate ? (
          <p className="text-sm text-text-muted p-4 bg-surface-sunken rounded-lg">
            Pick a date above to see available times.
          </p>
        ) : (
          <>
            <p className="text-sm text-text-muted">
              Choose one or more consecutive slots (1 hour each)
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {loadingAvailability
                ? Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-14" />)
                : availableSlots.map((slot) => {
                    const isBooked = bookedSlots.includes(slot);
                    const isSelected = selectedSlots.includes(slot);
                    const { rate: slotPrice, peak: isPeakSlot } = slotRate(slot);
                    const isOffPeakSlot = !isPeakSlot;

                    return (
                      <motion.button
                        key={slot}
                        type="button"
                        onClick={() => handleSlotToggle(slot)}
                        disabled={isBooked}
                        aria-disabled={isBooked}
                        title={isBooked ? "Already booked" : undefined}
                        whileTap={isBooked ? undefined : { scale: 0.94 }}
                        whileHover={isBooked ? undefined : { scale: 1.03 }}
                        animate={isSelected ? { scale: [1, 1.06, 1] } : { scale: 1 }}
                        transition={{ duration: 0.2 }}
                        className={cn(
                          "p-3 rounded-lg font-bold text-center transition-colors border-2",
                          isBooked
                            ? "bg-surface-sunken text-text-faint border-transparent cursor-not-allowed line-through decoration-text-faint"
                            : isSelected
                            ? "bg-action-lime border-ink text-text-on-lime"
                            : isOffPeakSlot
                            ? "bg-success-50 dark:bg-success-900/30 text-success-700 dark:text-success-300 hover:bg-success-100 dark:hover:bg-success-900/50 border-success-300 dark:border-success-700/60"
                            : "bg-warning-100 dark:bg-warning-900/30 text-warning-700 dark:text-warning-300 hover:bg-warning-100/70 dark:hover:bg-warning-900/50 border-warning-300 dark:border-warning-700/60"
                        )}
                      >
                        <div className="text-sm font-mono">{slot}</div>
                        <div className="text-xs font-mono">{isBooked ? "Booked" : formatCurrency(slotPrice)}</div>
                      </motion.button>
                    );
                  })}
            </div>

            <div className="p-4 bg-surface-sunken rounded-lg">
              <p className="text-sm text-text-muted flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-success-500" aria-hidden="true" />
                  Off-peak (6 AM - 5 PM): {formatCurrency(offPeakRate)}/hour
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-warning-700" aria-hidden="true" />
                  Peak (5 PM - 10 PM): {formatCurrency(peakRate)}/hour
                </span>
              </p>
            </div>

            <AnimatePresence>
              {selectedSlots.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="bg-highlight p-4 rounded-lg border-2 border-ink">
                    <p className="text-text-primary font-bold mb-2">
                      Selected {selectedSlots.length} slot(s):
                    </p>
                    <p className="text-text-muted font-mono">
                      {selectedSlots.join(", ")} | Total: {formatCurrency(calculatePrice())}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>

      {/* Players & guest details */}
      <div className="space-y-4">
        <h3 className="text-xl font-display uppercase">4. Your details</h3>

        {!userId && (
          <div className="space-y-4 p-4 rounded-lg border border-border-subtle bg-surface-sunken">
            <p className="text-sm font-medium text-text-muted">
              Booking without an account - we just need a way to reach you
            </p>
            <Input
              label="Full Name"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Your name"
              required
            />
            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Phone Number"
                type="tel"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                placeholder="+94 71 234 5678"
                required
              />
              <Input
                label="Email"
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
          </div>
        )}

        <Select
          label="Number of Players (max 4)"
          value={numPlayers}
          onChange={(e) => setNumPlayers(parseInt(e.target.value))}
        >
          {[1, 2, 3, 4].map((n) => (
            <option key={n} value={n}>
              {n} player{n > 1 ? "s" : ""}
            </option>
          ))}
        </Select>
      </div>

      {/* Payment */}
      <div className="space-y-3">
        <h3 className="text-xl font-display uppercase">5. Payment method</h3>
        <div className="space-y-2">
          <label
            className={cn(
              "flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors",
              paymentMode === "pay_at_venue"
                ? "border-ink bg-highlight"
                : "border-border-default hover:border-rush-blue-300"
            )}
          >
            <Radio
              name="payment"
              value="pay_at_venue"
              checked={paymentMode === "pay_at_venue"}
              onChange={(e) => setPaymentMode(e.target.value)}
            />
            <span className="ml-3">
              <span className="font-semibold">Pay at Venue</span>
              <p className="text-sm text-text-muted">
                Pay when you arrive. Booking confirmed immediately.
              </p>
            </span>
          </label>

          <label
            className={cn(
              "flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors",
              paymentMode === "payhere"
                ? "border-ink bg-highlight"
                : "border-border-default hover:border-rush-blue-300"
            )}
          >
            <Radio
              name="payment"
              value="payhere"
              checked={paymentMode === "payhere"}
              onChange={(e) => setPaymentMode(e.target.value)}
            />
            <span className="ml-3">
              <span className="font-semibold">Online Payment (PayHere)</span>
              <p className="text-sm text-text-muted">
                Pay securely by card via PayHere. Redirects to checkout.
              </p>
            </span>
          </label>
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="bg-danger-100 dark:bg-danger-900/40 border border-danger-300 dark:border-danger-800/60 text-danger-700 dark:text-danger-300 rounded-lg p-3 text-sm">
              {error}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary + submit */}
      <div className="bg-surface-sunken p-6 rounded-lg border border-border-subtle space-y-4">
        <div>
          <p className="text-sm text-text-muted mb-2">Booking Summary:</p>
          <div className="space-y-1 text-text-primary">
            <div className="flex justify-between">
              <span>Date:</span>
              <strong>
                {selectedDate
                  ? new Date(selectedDate).toLocaleDateString("en-LK", { month: "short", day: "numeric" })
                  : "-"}
              </strong>
            </div>
            <div className="flex justify-between">
              <span>Time:</span>
              <strong>
                {selectedSlots.length > 0
                  ? `${selectedSlots[0]} - ${selectedSlots[selectedSlots.length - 1]}`
                  : "-"}
              </strong>
            </div>
            <div className="flex justify-between">
              <span>Duration:</span>
              <strong>{selectedSlots.length} hour(s)</strong>
            </div>
            <div className="flex justify-between">
              <span>Players:</span>
              <strong>{numPlayers}</strong>
            </div>
            <div className="my-2 border-t border-border-subtle" />
            <div className="flex justify-between text-lg font-bold text-rush-blue-700 dark:text-rush-blue-400">
              <span>Total:</span>
              <span className="font-mono">{formatCurrency(calculatePrice())}</span>
            </div>
          </div>
        </div>

        <Button type="submit" variant="lime" fullWidth size="lg" loading={loading} disabled={!canSubmit || loading}>
          {loading ? "Processing…" : "Confirm Booking →"}
        </Button>
      </div>
    </form>
  );
}
