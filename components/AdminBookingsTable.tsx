"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, Printer, UserCheck, CheckCircle2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getSession } from "@/lib/auth";
import { cn } from "@/lib/cn";
import Badge, { bookingStatusTone, paymentStatusTone } from "@/components/ui/Badge";
import Skeleton from "@/components/ui/Skeleton";
import Tooltip from "@/components/ui/Tooltip";
import { Select } from "@/components/ui/Input";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";

interface AdminBooking {
  id: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  numPlayers: number;
  status: string;
  paymentStatus: string;
  amountLkr: number;
  userId: string | null;
  courtId: string;
  courtName: string;
  customerName: string;
  isGuest: boolean;
  checkedInAt: string | null;
}

interface Court {
  id: string;
  name: string;
}

const statusLabel: Record<string, string> = {
  confirmed: "Confirmed",
  pending_payment: "Pending",
  cancelled: "Cancelled",
};

const paymentLabel: Record<string, string> = {
  paid: "Paid",
  unpaid: "Unpaid",
};

const filters = ["all", "confirmed", "pending_payment", "cancelled"];
const filterLabel: Record<string, string> = {
  all: "All",
  confirmed: "Confirmed",
  pending_payment: "Pending Payment",
  cancelled: "Cancelled",
};

export default function AdminBookingsTable() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCourt, setFilterCourt] = useState<string>("all");
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [checkingInId, setCheckingInId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const session = await getSession();
      if (!session) {
        if (!cancelled) setLoading(false);
        return;
      }
      const [bookingsRes, courtsRes] = await Promise.all([
        fetch("/api/admin/bookings", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }),
        fetch("/api/courts"),
      ]);
      const data = await bookingsRes.json();
      const courtsData = await courtsRes.json();
      if (!cancelled) {
        setBookings(bookingsRes.ok ? data.bookings ?? [] : []);
        setCourts(courtsData.courts ?? []);
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
    setCancellingId(bookingId);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, ...data.booking } : b)));
      }
    } finally {
      setCancellingId(null);
    }
  };

  const handleCheckIn = async (bookingId: string) => {
    const session = await getSession();
    if (!session) return;
    setCheckingInId(bookingId);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/check-in`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, ...data.booking } : b)));
      }
    } finally {
      setCheckingInId(null);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (filterStatus !== "all" && b.status !== filterStatus) return false;
    if (filterCourt !== "all" && b.courtId !== filterCourt) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex gap-2 flex-wrap items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {filters.map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={cn(
                "px-5 py-2.5 rounded-lg font-bold border-2 border-ink transition-[transform,box-shadow,background-color,color]",
                filterStatus === status
                  ? "bg-admin-action text-admin-text-on-action shadow-[2px_2px_0_var(--color-ink)] dark:shadow-[2px_2px_0_var(--color-concrete-100)]"
                  : "bg-admin-surface text-admin-text-muted hover:bg-admin-bg"
              )}
            >
              {filterLabel[status]} ({bookings.filter((b) => status === "all" || b.status === status).length})
            </button>
          ))}
        </div>
        {courts.length > 1 && (
          <Select
            value={filterCourt}
            onChange={(e) => setFilterCourt(e.target.value)}
            wrapperClassName="w-44"
            className="focus:ring-admin-action"
          >
            <option value="all">All Courts</option>
            {courts.map((court) => (
              <option key={court.id} value={court.id}>
                {court.name}
              </option>
            ))}
          </Select>
        )}
      </div>

      {/* Table */}
      <div className="bg-admin-surface rounded-xl border border-admin-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <thead className="bg-admin-bg border-b border-admin-border">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-bold text-admin-text-muted uppercase w-[9%]">
                  ID
                </th>
                <th className="px-3 py-3 text-left text-xs font-bold text-admin-text-muted uppercase w-[16%]">
                  Customer
                </th>
                <th className="px-3 py-3 text-left text-xs font-bold text-admin-text-muted uppercase w-[9%]">
                  Court
                </th>
                <th className="px-3 py-3 text-left text-xs font-bold text-admin-text-muted uppercase w-[14%]">
                  Date & Time
                </th>
                <th className="px-3 py-3 text-left text-xs font-bold text-admin-text-muted uppercase w-[7%]">
                  Players
                </th>
                <th className="px-3 py-3 text-left text-xs font-bold text-admin-text-muted uppercase w-[11%]">
                  Status
                </th>
                <th className="px-3 py-3 text-left text-xs font-bold text-admin-text-muted uppercase w-[11%]">
                  Payment
                </th>
                <th className="px-3 py-3 text-right text-xs font-bold text-admin-text-muted uppercase w-[11%]">
                  Amount
                </th>
                <th className="px-3 py-3 text-left text-xs font-bold text-admin-text-muted uppercase w-[12%]">
                  Actions
                </th>
              </tr>
            </thead>
            {loading ? (
              <tbody>
                {[1, 2, 3].map((i) => (
                  <tr key={i}>
                    <td colSpan={9} className="px-6 py-4">
                      <Skeleton className="h-6 w-full" />
                    </td>
                  </tr>
                ))}
              </tbody>
            ) : filteredBookings.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-admin-text-muted">
                    No bookings found
                  </td>
                </tr>
              </tbody>
            ) : (
              <RevealGroup as="tbody" className="divide-y divide-admin-border" stagger={0.04}>
                {filteredBookings.map((booking) => (
                  <RevealItem key={booking.id} as="tr" y={8} className="hover:bg-admin-bg/60 transition-colors">
                    <td className="px-3 py-4 font-mono text-sm font-semibold text-admin-text truncate">
                      {booking.id.slice(0, 8)}
                    </td>
                    <td className="px-3 py-4 text-sm text-admin-text truncate">
                      {booking.customerName}
                      {booking.isGuest && (
                        <span className="ml-1.5 text-xs text-admin-text-muted">(Guest)</span>
                      )}
                    </td>
                    <td className="px-3 py-4 text-sm text-admin-text truncate">{booking.courtName}</td>
                    <td className="px-3 py-4 text-sm text-admin-text">
                      <div>{formatDate(booking.bookingDate)}</div>
                      <div className="text-admin-action font-semibold whitespace-nowrap">
                        {booking.startTime}-{booking.endTime}
                      </div>
                    </td>
                    <td className="px-3 py-4 text-sm text-admin-text font-semibold">{booking.numPlayers}</td>
                    <td className="px-3 py-4">
                      <Badge tone={bookingStatusTone(booking.status)}>
                        {statusLabel[booking.status] ?? booking.status}
                      </Badge>
                    </td>
                    <td className="px-3 py-4 text-sm">
                      <Badge tone={paymentStatusTone(booking.paymentStatus)}>
                        {paymentLabel[booking.paymentStatus] ?? booking.paymentStatus}
                      </Badge>
                    </td>
                    <td className="px-3 py-4 text-right font-bold text-admin-text">
                      {formatCurrency(booking.amountLkr)}
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex items-center gap-1.5">
                        <Tooltip label="Print ticket">
                          <Link
                            href={`/pos/receipt/booking/${booking.id}`}
                            target="_blank"
                            className="p-1.5 text-admin-action hover:text-admin-action-hover transition-colors"
                            aria-label="Print ticket"
                          >
                            <Printer className="w-4 h-4" aria-hidden="true" />
                          </Link>
                        </Tooltip>
                        {booking.status !== "cancelled" &&
                          (booking.checkedInAt ? (
                            <Tooltip label="Checked in">
                              <span className="p-1.5 text-success-700 dark:text-success-400">
                                <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                              </span>
                            </Tooltip>
                          ) : (
                            <Tooltip label={checkingInId === booking.id ? "Checking in…" : "Check in"}>
                              <button
                                onClick={() => handleCheckIn(booking.id)}
                                disabled={checkingInId === booking.id}
                                className="p-1.5 text-admin-text-muted hover:text-admin-action transition-colors disabled:opacity-50"
                                aria-label="Check in"
                              >
                                <UserCheck className="w-4 h-4" aria-hidden="true" />
                              </button>
                            </Tooltip>
                          ))}
                        {booking.status !== "cancelled" && (
                          <Tooltip label={cancellingId === booking.id ? "Cancelling…" : "Cancel booking"}>
                            <button
                              onClick={() => handleCancel(booking.id)}
                              disabled={cancellingId === booking.id}
                              className="p-1.5 text-danger-700 dark:text-danger-300 hover:text-danger-900 dark:hover:text-danger-100 transition-colors disabled:opacity-50"
                              aria-label="Cancel booking"
                            >
                              <X className="w-4 h-4" aria-hidden="true" />
                            </button>
                          </Tooltip>
                        )}
                      </div>
                    </td>
                  </RevealItem>
                ))}
              </RevealGroup>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
