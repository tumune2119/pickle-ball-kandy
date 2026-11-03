"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Printer, MessageSquare } from "lucide-react";
import { getSession } from "@/lib/auth";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import BookingTicket, { type TicketBooking } from "@/components/pos/BookingTicket";

export default function ReprintBookingTicketPage() {
  const params = useParams<{ id: string }>();
  const [booking, setBooking] = useState<TicketBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sendingSms, setSendingSms] = useState(false);
  const [smsSent, setSmsSent] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const session = await getSession();
      if (!session) return;
      const res = await fetch(`/api/admin/bookings?id=${params.id}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (cancelled) return;
      if (!res.ok) {
        setError("Could not load this booking.");
        setLoading(false);
        return;
      }
      const data = await res.json();
      const b = data.bookings?.[0];
      if (!b) {
        setError("Booking not found.");
        setLoading(false);
        return;
      }
      setBooking({
        id: b.id,
        courtName: b.courtName,
        bookingDate: b.bookingDate,
        startTime: b.startTime,
        endTime: b.endTime,
        customerName: b.customerName,
        customerPhone: b.customerPhone,
        numPlayers: b.numPlayers,
        amountLkr: b.amountLkr,
        paymentStatus: b.paymentStatus,
      });
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  if (loading) {
    return (
      <div className="max-w-sm mx-auto">
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !booking) {
    return <p className="text-center text-danger-700 dark:text-danger-300">{error}</p>;
  }

  const resendSms = async () => {
    setSendingSms(true);
    const session = await getSession();
    if (session) {
      await fetch(`/api/bookings/${params.id}/resend-sms`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      setSmsSent(true);
      setTimeout(() => setSmsSent(false), 3000);
    }
    setSendingSms(false);
  };

  return (
    <div>
      <div className="flex justify-center gap-3 mb-4 print:hidden">
        <Button onClick={() => window.print()} tone="admin">
          <Printer className="w-4 h-4" aria-hidden="true" />
          Print
        </Button>
        <Button onClick={resendSms} tone="admin" variant="secondary" loading={sendingSms}>
          <MessageSquare className="w-4 h-4" aria-hidden="true" />
          {smsSent ? "Sent!" : "Resend SMS"}
        </Button>
      </div>
      <BookingTicket booking={booking} />
    </div>
  );
}
