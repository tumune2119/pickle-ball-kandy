"use client";

import { useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";

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

// TODO: replace with a fetch from /api/bookings once wired to real auth.
function buildDemoBookings(): Booking[] {
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
        createdAt: new Date().toISOString(),
      },
      {
        id: "bk-002",
        bookingDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        startTime: "18:00",
        endTime: "19:00",
        numPlayers: 4,
        status: "confirmed",
        paymentStatus: "unpaid",
        amountLkr: 2500,
        createdAt: new Date().toISOString(),
      },
      {
        id: "bk-003",
        bookingDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        startTime: "10:00",
        endTime: "11:00",
        numPlayers: 3,
        status: "confirmed",
        paymentStatus: "paid",
        amountLkr: 1500,
        createdAt: new Date().toISOString(),
      },
  ];
}

export default function MyBookingsList() {
  const [bookings] = useState<Booking[]>(buildDemoBookings);
  const [filter, setFilter] = useState<"upcoming" | "past">("upcoming");

  const now = new Date();
  const filteredBookings = bookings.filter((booking) => {
    const bookingDateTime = new Date(
      `${booking.bookingDate}T${booking.startTime}`
    );
    if (filter === "upcoming") {
      return bookingDateTime > now;
    } else {
      return bookingDateTime < now;
    }
  });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      confirmed:
        "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 border border-green-300 dark:border-green-700/60",
      pending_payment:
        "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-700/60",
      cancelled: "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-700/60",
    };
    return styles[status] || styles.confirmed;
  };

  const getPaymentBadge = (status: string) => {
    const styles: Record<string, string> = {
      paid: "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300",
      unpaid: "bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300",
      refunded: "bg-gray-100 dark:bg-white/5 text-gray-800 dark:text-gray-100",
    };
    return styles[status] || styles.unpaid;
  };

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex gap-4 border-b border-gray-200 dark:border-white/10">
        <button
          onClick={() => setFilter("upcoming")}
          className={`px-4 py-2 font-semibold border-b-2 transition ${
            filter === "upcoming"
              ? "border-purple-600 text-purple-600 dark:text-purple-400"
              : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          📅 Upcoming ({bookings.filter((b) => new Date(`${b.bookingDate}T${b.startTime}`) > now).length})
        </button>
        <button
          onClick={() => setFilter("past")}
          className={`px-4 py-2 font-semibold border-b-2 transition ${
            filter === "past"
              ? "border-purple-600 text-purple-600 dark:text-purple-400"
              : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          ✓ Past ({bookings.filter((b) => new Date(`${b.bookingDate}T${b.startTime}`) < now).length})
        </button>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-950 rounded-lg">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {filter === "upcoming"
              ? "No upcoming bookings"
              : "No past bookings"}
          </p>
          {filter === "upcoming" && (
            <Link
              href="/book"
              className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition"
            >
              Book Now →
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-white/10 p-6 hover:shadow-lg transition"
            >
              <div className="grid md:grid-cols-2 gap-6 mb-4">
                {/* Left: Date & Time */}
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">📅 Date & Time</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {formatDate(booking.bookingDate)}
                  </p>
                  <p className="text-purple-600 dark:text-purple-400 font-semibold">
                    {booking.startTime} - {booking.endTime}
                  </p>
                </div>

                {/* Right: Details */}
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Booking Details</p>
                  <p className="text-gray-900 dark:text-white">
                    👥 {booking.numPlayers} player{booking.numPlayers > 1 ? "s" : ""}
                  </p>
                  <p className="text-gray-900 dark:text-white">
                    🏸 1 hour court reservation
                  </p>
                </div>
              </div>

              {/* Status & Amount */}
              <div className="grid md:grid-cols-3 gap-4 mb-4 pb-4 border-b border-gray-200 dark:border-white/10">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Status</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(booking.status)}`}
                  >
                    {booking.status === "confirmed" && "✓ Confirmed"}
                    {booking.status === "pending_payment" && "⏳ Pending Payment"}
                    {booking.status === "cancelled" && "✗ Cancelled"}
                  </span>
                </div>

                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Payment</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getPaymentBadge(booking.paymentStatus)}`}
                  >
                    {booking.paymentStatus === "paid" && "✓ Paid"}
                    {booking.paymentStatus === "unpaid" && "⏳ Unpaid"}
                    {booking.paymentStatus === "refunded" && "↩️ Refunded"}
                  </span>
                </div>

                <div className="text-right">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Amount</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {formatCurrency(booking.amountLkr)}
                  </p>
                </div>
              </div>

              {/* Actions */}
              {filter === "upcoming" && booking.status !== "cancelled" && (
                <div className="flex gap-2">
                  <button className="flex-1 px-4 py-2 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-purple-600 dark:text-purple-400 font-semibold rounded-lg transition">
                    ✎ Reschedule
                  </button>
                  <button className="flex-1 px-4 py-2 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 font-semibold rounded-lg transition">
                    ✕ Cancel
                  </button>
                </div>
              )}

              {filter === "past" && (
                <div className="flex gap-2">
                  <button className="flex-1 px-4 py-2 bg-green-50 dark:bg-green-950/40 hover:bg-green-100 dark:hover:bg-green-900/40 text-green-600 dark:text-green-400 font-semibold rounded-lg transition">
                    📋 Receipt
                  </button>
                  <button className="flex-1 px-4 py-2 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-purple-600 dark:text-purple-400 font-semibold rounded-lg transition">
                    🔄 Book Again
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
