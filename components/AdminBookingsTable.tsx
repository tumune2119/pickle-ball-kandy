"use client";

import { useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface AdminBooking {
  id: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  numPlayers: number;
  status: string;
  paymentStatus: string;
  amountLkr: number;
  userId: string;
}

// TODO: replace with a fetch from /api/admin/bookings once wired to real auth.
function buildDemoBookings(): AdminBooking[] {
  return [
      {
        id: "bk-001",
        bookingDate: new Date().toISOString().split("T")[0],
        startTime: "09:00",
        endTime: "10:00",
        numPlayers: 2,
        status: "confirmed",
        paymentStatus: "unpaid",
        amountLkr: 1500,
        userId: "user-1",
      },
      {
        id: "bk-002",
        bookingDate: new Date().toISOString().split("T")[0],
        startTime: "10:00",
        endTime: "11:00",
        numPlayers: 4,
        status: "confirmed",
        paymentStatus: "paid",
        amountLkr: 1500,
        userId: "user-2",
      },
      {
        id: "bk-003",
        bookingDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        startTime: "17:00",
        endTime: "18:00",
        numPlayers: 3,
        status: "confirmed",
        paymentStatus: "unpaid",
        amountLkr: 2500,
        userId: "user-3",
      },
      {
        id: "bk-004",
        bookingDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        startTime: "18:00",
        endTime: "19:00",
        numPlayers: 2,
        status: "pending_payment",
        paymentStatus: "unpaid",
        amountLkr: 2500,
        userId: "user-4",
      },
  ];
}

export default function AdminBookingsTable() {
  const [bookings] = useState<AdminBooking[]>(buildDemoBookings);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filteredBookings = bookings.filter((b) => {
    if (filterStatus === "all") return true;
    return b.status === filterStatus;
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      confirmed: "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300",
      pending_payment: "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300",
      cancelled: "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300",
    };
    return colors[status] || "bg-gray-100 dark:bg-white/5 text-gray-800 dark:text-gray-100";
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {["all", "confirmed", "pending_payment", "cancelled"].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              filterStatus === status
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-white/10 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            {status === "all" && "All"}
            {status === "confirmed" && "✓ Confirmed"}
            {status === "pending_payment" && "⏳ Pending Payment"}
            {status === "cancelled" && "✗ Cancelled"}
            {" "}
            ({bookings.filter((b) => status === "all" || b.status === status).length})
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-white/10 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-white/10">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                Booking ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                Date & Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                Players
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                Payment
              </th>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-white/10">
            {filteredBookings.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-600 dark:text-gray-400">
                  No bookings found
                </td>
              </tr>
            ) : (
              filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-gray-950 transition">
                  <td className="px-6 py-4 font-mono text-sm font-semibold text-gray-900 dark:text-white">
                    {booking.id}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    <div>{formatDate(booking.bookingDate)}</div>
                    <div className="text-blue-600 dark:text-blue-400 font-semibold">
                      {booking.startTime} - {booking.endTime}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-semibold">
                    {booking.numPlayers}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(booking.status)}`}
                    >
                      {booking.status === "confirmed" && "✓ Confirmed"}
                      {booking.status === "pending_payment" && "⏳ Pending"}
                      {booking.status === "cancelled" && "✗ Cancelled"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                        booking.paymentStatus === "paid"
                          ? "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300"
                          : "bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300"
                      }`}
                    >
                      {booking.paymentStatus === "paid" ? "✓ Paid" : "⏳ Unpaid"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-gray-900 dark:text-white">
                    {formatCurrency(booking.amountLkr)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold text-sm">
                        ✎ Edit
                      </button>
                      <button className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-semibold text-sm">
                        ✕ Cancel
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
