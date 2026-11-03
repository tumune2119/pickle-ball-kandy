"use client";

import { useEffect, useState } from "react";
import { Calendar, ClipboardList, CreditCard } from "lucide-react";
import { getSession } from "@/lib/auth";
import { formatCurrency, formatDate, venueDateTime } from "@/lib/utils";
import Card from "@/components/ui/Card";
import Badge, { bookingStatusTone } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";

interface Booking {
  id: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  numPlayers: number;
  status: string;
  amountLkr: number;
}

const statusLabel: Record<string, string> = {
  confirmed: "Confirmed",
  pending_payment: "Pending Payment",
  cancelled: "Cancelled",
};

export default function CustomerDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const session = await getSession();
      if (!session) {
        if (!cancelled) setLoading(false);
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

  const now = new Date();
  const upcoming = bookings
    .filter((b) => b.status !== "cancelled" && venueDateTime(b.bookingDate, b.startTime) > now)
    .sort(
      (a, b) =>
        venueDateTime(a.bookingDate, a.startTime).getTime() -
        venueDateTime(b.bookingDate, b.startTime).getTime()
    );
  const totalSpent = bookings.reduce((sum, b) => sum + (b.amountLkr || 0), 0);

  const stats = [
    {
      tint: "brand" as const,
      label: "Upcoming Bookings",
      value: String(upcoming.length),
      footnote: upcoming[0] ? `Next: ${formatDate(upcoming[0].bookingDate)} at ${upcoming[0].startTime}` : "None scheduled",
    },
    { tint: "success" as const, label: "Total Bookings", value: String(bookings.length), footnote: "All-time" },
    { tint: "brand" as const, label: "Total Spent", value: formatCurrency(totalSpent), footnote: "On court bookings" },
  ];

  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-display uppercase text-text-primary skew-display">Welcome Back!</h2>
        <p className="text-text-muted mt-2">Here&apos;s your pickleball booking dashboard</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : (
        <RevealGroup className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat) => (
            <RevealItem key={stat.label}>
              <Card tint={stat.tint} padding="md">
                <p className="text-text-muted font-bold text-sm">{stat.label}</p>
                <p className="font-mono text-4xl font-bold text-text-primary mt-2">{stat.value}</p>
                <p className="text-text-muted text-xs mt-2">{stat.footnote}</p>
              </Card>
            </RevealItem>
          ))}
        </RevealGroup>
      )}

      {/* Quick Actions */}
      <div>
        <h3 className="text-xl font-display uppercase text-text-primary mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button href="/book" size="lg" className="py-4 gap-2">
            <Calendar className="w-5 h-5" aria-hidden="true" />
            Book a Court
          </Button>
          <Button href="/my-bookings" variant="secondary" size="lg" className="py-4 gap-2">
            <ClipboardList className="w-5 h-5" aria-hidden="true" />
            My Bookings
          </Button>
        </div>
      </div>

      {/* Recent Bookings */}
      <div>
        <h3 className="text-xl font-display uppercase text-text-primary mb-4">Recent Bookings</h3>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        ) : recentBookings.length === 0 ? (
          <Card padding="md">
            <p className="text-text-muted text-sm">No bookings yet - your first one will show up here.</p>
          </Card>
        ) : (
          <RevealGroup className="space-y-3">
            {recentBookings.map((booking) => (
              <RevealItem key={booking.id}>
                <Card padding="md">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <p className="font-bold text-text-primary">
                        {formatDate(booking.bookingDate)} - {booking.startTime}
                      </p>
                      <p className="text-text-muted text-sm">
                        1 hour • {booking.numPlayers} player{booking.numPlayers > 1 ? "s" : ""}
                      </p>
                    </div>
                    <Badge tone={bookingStatusTone(booking.status)}>
                      {statusLabel[booking.status] ?? booking.status}
                    </Badge>
                  </div>
                </Card>
              </RevealItem>
            ))}
          </RevealGroup>
        )}
      </div>

      {/* Membership Info */}
      <Card tint="warning" padding="md">
        <h3 className="font-display uppercase text-text-primary mb-3 flex items-center gap-2">
          <CreditCard className="w-5 h-5" aria-hidden="true" />
          Membership Status
        </h3>
        <p className="text-text-muted mb-4">
          You&apos;re not a member yet. Join to get discounts on every booking!
        </p>
        <Button href="/#pricing" variant="lime">
          Explore Memberships →
        </Button>
      </Card>
    </div>
  );
}
