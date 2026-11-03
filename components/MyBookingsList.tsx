"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Calendar, Users, RectangleHorizontal, Pencil, X, Receipt, RotateCcw, CreditCard } from "lucide-react";
import { formatCurrency, formatDate, venueDateTime } from "@/lib/utils";
import { getSession } from "@/lib/auth";
import { redirectToPayHereCheckout } from "@/lib/payhere-client";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import Badge, { bookingStatusTone, paymentStatusTone } from "@/components/ui/Badge";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";

interface Booking {
  id: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  numPlayers: number;
  status: string;
  paymentStatus: string;
  amountLkr: number;
  createdAt: string;
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

export default function MyBookingsList() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<"upcoming" | "past">("upcoming");
  const [loading, setLoading] = useState(true);
  const [signedOut, setSignedOut] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const session = await getSession();
      if (!session) {
        if (!cancelled) {
          setSignedOut(true);
          setLoading(false);
        }
        return;
      }
      const res = await fetch("/api/bookings", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await res.json();
      if (!cancelled) {
        setBookings(res.ok ? data.bookings ?? [] : []);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleCancel = async (bookingId: string) => {
    const session = await getSession();
    if (!session) return;
    setError("");
    setCancellingId(bookingId);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setBookings((prev) => prev.map((b) => (b.id === bookingId ? data.booking : b)));
      } else {
        setError(data.error || "Failed to cancel booking");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setCancellingId(null);
    }
  };

  const handleRetryPayment = async (bookingId: string) => {
    const session = await getSession();
    if (!session) return;
    setError("");
    setRetryingId(bookingId);
    try {
      const res = await fetch("/api/payments/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ bookingId }),
      });
      const data = await res.json();
      if (res.ok) {
        redirectToPayHereCheckout(data.checkoutUrl, data.fields);
        return;
      }
      setError(data.error || "Failed to start payment");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setRetryingId(null);
    }
  };

  const now = new Date();
  const filteredBookings = bookings.filter((booking) => {
    const bookingDateTime = venueDateTime(booking.bookingDate, booking.startTime);
    return filter === "upcoming" ? bookingDateTime > now : bookingDateTime < now;
  });

  const upcomingCount = bookings.filter((b) => venueDateTime(b.bookingDate, b.startTime) > now).length;
  const pastCount = bookings.filter((b) => venueDateTime(b.bookingDate, b.startTime) < now).length;

  const tabs = [
    { key: "upcoming" as const, label: "Upcoming", count: upcomingCount },
    { key: "past" as const, label: "Past", count: pastCount },
  ];

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (signedOut) {
    return (
      <div className="text-center py-12 bg-surface-sunken rounded-xl border-2 border-border-subtle">
        <p className="text-text-muted mb-4">Log in to see your bookings.</p>
        <Button href="/login">Log In</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex items-start gap-2 bg-danger-100 dark:bg-danger-900/40 border border-danger-300 dark:border-danger-800/60 text-danger-800 dark:text-danger-300 px-4 py-3 rounded-lg">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{error}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Tabs */}
      <div className="flex gap-4 border-b-2 border-border-subtle">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`relative px-4 py-2 font-bold transition-colors ${
              filter === tab.key
                ? "text-text-primary"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            {tab.label} ({tab.count})
            {filter === tab.key && (
              <motion.span
                layoutId="bookings-tab-underline"
                className="absolute left-0 right-0 -bottom-0.5 h-1 bg-action-lime"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      <AnimatePresence mode="wait">
        <motion.div
          key={filter}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {filteredBookings.length === 0 ? (
            <div className="text-center py-12 bg-surface-sunken rounded-xl border-2 border-border-subtle">
              <p className="text-text-muted mb-4">
                {filter === "upcoming" ? "No upcoming bookings" : "No past bookings"}
              </p>
              {filter === "upcoming" && <Button href="/book">Book Now →</Button>}
            </div>
          ) : (
            <RevealGroup className="space-y-4">
              {filteredBookings.map((booking) => (
                <RevealItem key={booking.id}>
                  <Card hover poster padding="lg">
                    <div className="grid md:grid-cols-2 gap-6 mb-4">
                      {/* Left: Date & Time */}
                      <div>
                        <p className="text-sm text-text-muted mb-1 flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" aria-hidden="true" />
                          Date & Time
                        </p>
                        <p className="text-lg font-bold text-text-primary">{formatDate(booking.bookingDate)}</p>
                        <p className="text-lime-700 dark:text-lime-400 font-bold font-mono">
                          {booking.startTime} - {booking.endTime}
                        </p>
                      </div>

                      {/* Right: Details */}
                      <div>
                        <p className="text-sm text-text-muted mb-1">Booking Details</p>
                        <p className="text-text-primary flex items-center gap-1.5">
                          <Users className="w-4 h-4" aria-hidden="true" />
                          {booking.numPlayers} player{booking.numPlayers > 1 ? "s" : ""}
                        </p>
                        <p className="text-text-primary flex items-center gap-1.5">
                          <RectangleHorizontal className="w-4 h-4" aria-hidden="true" />1 hour court reservation
                        </p>
                      </div>
                    </div>

                    {/* Status & Amount */}
                    <div className="grid md:grid-cols-3 gap-4 mb-4 pb-4 border-b-2 border-border-subtle">
                      <div>
                        <p className="text-xs text-text-muted mb-1">Status</p>
                        <Badge tone={bookingStatusTone(booking.status)}>
                          {statusLabel[booking.status] ?? booking.status}
                        </Badge>
                      </div>

                      <div>
                        <p className="text-xs text-text-muted mb-1">Payment</p>
                        <Badge tone={paymentStatusTone(booking.paymentStatus)}>
                          {paymentLabel[booking.paymentStatus] ?? booking.paymentStatus}
                        </Badge>
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-text-muted mb-1">Amount</p>
                        <p className="font-mono text-2xl font-bold text-lime-700 dark:text-lime-400">
                          {formatCurrency(booking.amountLkr)}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    {filter === "upcoming" && booking.status === "pending_payment" && (
                      <div className="flex gap-2">
                        <Button
                          variant="primary"
                          className="flex-1"
                          size="sm"
                          loading={retryingId === booking.id}
                          onClick={() => handleRetryPayment(booking.id)}
                        >
                          <CreditCard className="w-4 h-4" aria-hidden="true" />
                          Retry Payment
                        </Button>
                        <Button
                          variant="destructive"
                          className="flex-1"
                          size="sm"
                          loading={cancellingId === booking.id}
                          onClick={() => handleCancel(booking.id)}
                        >
                          <X className="w-4 h-4" aria-hidden="true" />
                          Cancel
                        </Button>
                      </div>
                    )}

                    {filter === "upcoming" && booking.status === "confirmed" && (
                      <div className="flex gap-2">
                        <Button variant="soft" className="flex-1" size="sm" disabled title="Coming soon">
                          <Pencil className="w-4 h-4" aria-hidden="true" />
                          Reschedule
                        </Button>
                        <Button
                          variant="destructive"
                          className="flex-1"
                          size="sm"
                          loading={cancellingId === booking.id}
                          onClick={() => handleCancel(booking.id)}
                        >
                          <X className="w-4 h-4" aria-hidden="true" />
                          Cancel
                        </Button>
                      </div>
                    )}

                    {filter === "past" && (
                      <div className="flex gap-2">
                        <Button
                          variant="soft"
                          className="flex-1 bg-success-100! dark:bg-success-900/40! hover:bg-success-200! dark:hover:bg-success-800/40! text-success-700! dark:text-success-300!"
                          size="sm"
                          disabled
                          title="Coming soon"
                        >
                          <Receipt className="w-4 h-4" aria-hidden="true" />
                          Receipt
                        </Button>
                        <Button href="/book" variant="soft" className="flex-1" size="sm">
                          <RotateCcw className="w-4 h-4" aria-hidden="true" />
                          Book Again
                        </Button>
                      </div>
                    )}
                  </Card>
                </RevealItem>
              ))}
            </RevealGroup>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
