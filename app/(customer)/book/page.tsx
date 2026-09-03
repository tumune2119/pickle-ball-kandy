"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BookingForm from "@/components/BookingForm";
import { getCurrentUser } from "@/lib/auth";

export default function BookPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [courtId, setCourtId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [user, courtsRes] = await Promise.all([
        getCurrentUser(),
        fetch("/api/courts").then((r) => r.json()),
      ]);

      setUserId(user?.id ?? null);
      setCourtId(courtsRes.courts?.[0]?.id ?? null);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-2 text-gray-900">Book Your Court</h2>
      <p className="text-gray-600 mb-8">
        Follow the steps below to reserve your pickleball court slot
      </p>

      <div className="bg-white rounded-lg p-8 border border-gray-200">
        {loading ? (
          <p className="text-gray-600">Loading...</p>
        ) : !userId ? (
          <div className="text-center py-8">
            <p className="text-gray-700 mb-4">Please sign in to book a court.</p>
            <Link
              href="/login"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition"
            >
              Log In
            </Link>
          </div>
        ) : !courtId ? (
          <p className="text-red-600">
            No court is configured yet. Please contact the venue.
          </p>
        ) : (
          <BookingForm userId={userId} courtId={courtId} />
        )}
      </div>

      <div className="mt-8 grid md:grid-cols-3 gap-6">
        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
          <div className="text-3xl mb-2">📅</div>
          <h3 className="font-bold text-gray-900 mb-2">Easy Booking</h3>
          <p className="text-sm text-gray-700">
            Simple 3-step process to book your preferred date and time
          </p>
        </div>

        <div className="bg-green-50 rounded-lg p-6 border border-green-200">
          <div className="text-3xl mb-2">💰</div>
          <h3 className="font-bold text-gray-900 mb-2">Flexible Payment</h3>
          <p className="text-sm text-gray-700">
            Pay at venue or online. Instant confirmation either way.
          </p>
        </div>

        <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
          <div className="text-3xl mb-2">⏰</div>
          <h3 className="font-bold text-gray-900 mb-2">Free Cancellation</h3>
          <p className="text-sm text-gray-700">
            Cancel free up to 4 hours before your booking
          </p>
        </div>
      </div>
    </div>
  );
}
