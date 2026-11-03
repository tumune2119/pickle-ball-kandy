"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Calendar, Search, X, CreditCard } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { redirectToPayHereCheckout } from "@/lib/payhere-client";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Badge, { bookingStatusTone, paymentStatusTone } from "@/components/ui/Badge";

interface GuestBooking {
  id: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  numPlayers: number;
  status: string;
  paymentStatus: string;
  amountLkr: number;
}

const statusLabel: Record<string, string> = {
  confirmed: "Confirmed",
  pending_payment: "Pending Payment",
  cancelled: "Cancelled",
};

const paymentLabel: Record<string, string> = {
  paid: "Paid",
  unpaid: "Unpaid",
  refunded: "Refunded",
};

export default function ManageBookingForm() {
  const [code, setCode] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [booking, setBooking] = useState<GuestBooking | null>(null);
  const [canCancel, setCanCancel] = useState(false);
  const [cancellationHours, setCancellationHours] = useState(4);
  const [cancelling, setCancelling] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [confirmingCancel, setConfirmingCancel] = useState(false);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBooking(null);
    setLoading(true);
    try {
      const res = await fetch("/api/bookings/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Booking not found");
        return;
      }
      setBooking(data.booking);
      setCanCancel(data.canCancel);
      setCancellationHours(data.cancellationHours);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!booking) return;
    setError("");
    setCancelling(true);
    try {
      const res = await fetch(`/api/bookings/manage/${booking.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to cancel booking");
        return;
      }
      setBooking(data.booking);
      setCanCancel(false);
      setConfirmingCancel(false);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setCancelling(false);
    }
  };

  const handleRetryPayment = async () => {
    if (!booking) return;
    setError("");
    setRetrying(true);
    try {
      const res = await fetch("/api/payments/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: booking.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to start payment");
        setRetrying(false);
        return;
      }
      redirectToPayHereCheckout(data.checkoutUrl, data.fields);
    } catch {
      setError("Something went wrong. Please try again.");
      setRetrying(false);
    }
  };

  return (
    <section className="max-w-xl mx-auto px-4 py-16 md:py-20">
      <h1 className="text-3xl md:text-4xl font-display uppercase mb-2 skew-display">Manage Your Booking</h1>
      <p className="text-text-muted mb-8">
        Booked as a guest? Look up your booking with your confirmation reference and the phone
        number you gave at booking.
      </p>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex items-start gap-2 bg-danger-100 dark:bg-danger-900/40 border border-danger-300 dark:border-danger-800/60 text-danger-800 dark:text-danger-300 px-4 py-3 rounded-lg mb-6">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{error}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleLookup} className="space-y-4 mb-10">
        <Input
          label="Booking Reference"
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="BK#A1B2C3D4"
          required
        />
        <Input
          label="Phone Number"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+94 71 234 5678"
          required
        />
        <Button type="submit" loading={loading} fullWidth size="lg">
          <Search className="w-4 h-4" aria-hidden="true" />
          Find My Booking
        </Button>
      </form>

      {booking && (
        <Card poster padding="lg">
          <div className="grid md:grid-cols-2 gap-6 mb-4">
            <div>
              <p className="text-sm text-text-muted mb-1 flex items-center gap-1.5">
                <Calendar className="w-4 h-4" aria-hidden="true" />
                Date & Time
              </p>
              <p className="text-lg font-bold text-text-primary">{formatDate(booking.bookingDate)}</p>
              <p className="text-rush-blue-700 dark:text-rush-blue-400 font-bold font-mono">
                {booking.startTime} - {booking.endTime}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-text-muted mb-1">Amount</p>
              <p className="font-mono text-2xl font-bold text-rush-blue-700 dark:text-rush-blue-400">
                {formatCurrency(booking.amountLkr)}
              </p>
            </div>
          </div>

          <div className="flex gap-3 mb-6">
            <Badge tone={bookingStatusTone(booking.status)}>
              {statusLabel[booking.status] ?? booking.status}
            </Badge>
            <Badge tone={paymentStatusTone(booking.paymentStatus)}>
              {paymentLabel[booking.paymentStatus] ?? booking.paymentStatus}
            </Badge>
          </div>

          {booking.status === "pending_payment" && (
            <Button
              variant="primary"
              fullWidth
              size="sm"
              loading={retrying}
              onClick={handleRetryPayment}
              className="mb-3"
            >
              <CreditCard className="w-4 h-4" aria-hidden="true" />
              Retry Payment
            </Button>
          )}

          {booking.status === "cancelled" ? (
            <p className="text-sm text-text-muted">This booking has been cancelled.</p>
          ) : canCancel ? (
            confirmingCancel ? (
              <div className="space-y-2">
                <p className="text-sm text-text-muted">Cancel this booking? This can&apos;t be undone.</p>
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    className="flex-1"
                    size="sm"
                    loading={cancelling}
                    onClick={handleCancel}
                  >
                    <X className="w-4 h-4" aria-hidden="true" />
                    Yes, Cancel
                  </Button>
                  <Button variant="soft" className="flex-1" size="sm" onClick={() => setConfirmingCancel(false)}>
                    Keep Booking
                  </Button>
                </div>
              </div>
            ) : (
              <Button variant="destructive" fullWidth size="sm" onClick={() => setConfirmingCancel(true)}>
                <X className="w-4 h-4" aria-hidden="true" />
                Cancel Booking
              </Button>
            )
          ) : (
            <p className="text-sm text-text-muted">
              Free cancellation requires at least {cancellationHours} hours&apos; notice - this booking is too
              close to its start time to cancel online. Contact us if you need help.
            </p>
          )}
        </Card>
      )}
    </section>
  );
}
