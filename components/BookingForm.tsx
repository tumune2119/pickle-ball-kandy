"use client";

import { useState } from "react";
import Link from "next/link";
import { getTimeSlots, formatCurrency } from "@/lib/utils";

interface BookingFormProps {
  userId: string;
  courtId: string;
  onBooked?: (bookingId: string) => void;
}

export default function BookingForm({ userId, courtId, onBooked }: BookingFormProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [numPlayers, setNumPlayers] = useState(2);
  const [paymentMode, setPaymentMode] = useState("pay_at_venue");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [bookingId, setBookingId] = useState("");

  // Sample availability data (in real app, this comes from API)
  const availableSlots = getTimeSlots("06:00", "22:00", 60);
  const bookedSlots = ["09:00", "10:00", "17:00", "18:00"]; // Demo data

  // Booking window: today through 30 days out. Computed once per mount
  // rather than inline in JSX, since JSX must render the same output for
  // the same props/state.
  const [minDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [maxDate] = useState(() =>
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );

  // Pricing calculation
  const isOffPeak = (time: string): boolean => {
    const [hour] = time.split(":").map(Number);
    return hour < 17;
  };

  const calculatePrice = (): number => {
    let total = 0;
    selectedSlots.forEach((slot) => {
      const price = isOffPeak(slot) ? 1500 : 2500;
      total += price;
    });
    return total;
  };

  const handleSlotToggle = (slot: string) => {
    if (selectedSlots.includes(slot)) {
      setSelectedSlots(selectedSlots.filter((s) => s !== slot));
    } else {
      setSelectedSlots([...selectedSlots, slot]);
    }
  };

  // Builds and submits a hidden form to redirect the browser to PayHere's
  // hosted checkout - required because PayHere expects a full page POST.
  const redirectToPayHere = (checkoutUrl: string, fields: Record<string, string>) => {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = checkoutUrl;
    Object.entries(fields).forEach(([name, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = value;
      form.appendChild(input);
    });
    document.body.appendChild(form);
    form.submit();
  };

  const handleNext = async () => {
    if (step === 1 && !selectedDate) {
      alert("Please select a date");
      return;
    }
    if (step === 2 && selectedSlots.length === 0) {
      alert("Please select at least one time slot");
      return;
    }
    if (step === 3) {
      setError("");
      setLoading(true);
      try {
        const startTime = selectedSlots[0];
        const lastSlotHour = parseInt(selectedSlots[selectedSlots.length - 1].split(":")[0], 10);
        const endTime = `${String(lastSlotHour + 1).padStart(2, "0")}:00`;

        const bookingRes = await fetch("/api/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            courtId,
            bookingDate: selectedDate,
            startTime,
            endTime,
            numPlayers,
            amountLkr: calculatePrice(),
            paymentMode,
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
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ bookingId }),
          });
          const paymentData = await paymentRes.json();

          if (!paymentRes.ok) {
            setError(paymentData.error || "Failed to start payment");
            setLoading(false);
            return;
          }

          redirectToPayHere(paymentData.checkoutUrl, paymentData.fields);
          return; // browser is navigating away
        }

        if (onBooked) onBooked(newBookingId);
        setStep(4);
      } catch (err) {
        console.error("Booking submission error:", err);
        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
      return;
    }
    setStep((s) => (s + 1) as 1 | 2 | 3 | 4);
  };

  const handlePrev = () => {
    setStep((s) => (s - 1) as 1 | 2 | 3 | 4);
  };

  // Step 1: Date Selection
  if (step === 1) {
    return (
      <div className="space-y-6">
        <h3 className="text-2xl font-bold">Step 1: Select Date</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Pick a date to play
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={minDate}
            max={maxDate}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-lg"
          />
        </div>

        {selectedDate && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-900">
              📅 Selected: <strong>{new Date(selectedDate).toLocaleDateString("en-LK", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</strong>
            </p>
          </div>
        )}

        <div className="flex justify-between">
          <button
            disabled
            className="px-6 py-2 rounded-lg font-semibold text-gray-400 bg-gray-100"
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            disabled={!selectedDate || loading}
            className="px-6 py-2 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 transition"
          >
            Next →
          </button>
        </div>
      </div>
    );
  }

  // Step 2: Time Slot Selection
  if (step === 2) {
    return (
      <div className="space-y-6">
        <h3 className="text-2xl font-bold">Step 2: Select Time Slots</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Choose one or more consecutive slots (1 hour each)
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {availableSlots.map((slot) => {
              const isBooked = bookedSlots.includes(slot);
              const isSelected = selectedSlots.includes(slot);
              const isOffPeakSlot = isOffPeak(slot);

              return (
                <button
                  key={slot}
                  onClick={() => handleSlotToggle(slot)}
                  disabled={isBooked}
                  className={`p-3 rounded-lg font-semibold text-center transition ${
                    isBooked
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : isSelected
                      ? "bg-blue-600 text-white ring-2 ring-blue-300"
                      : isOffPeakSlot
                      ? "bg-green-50 text-green-700 hover:bg-green-100 border border-green-300"
                      : "bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-300"
                  }`}
                >
                  <div className="text-sm">{slot}</div>
                  <div className="text-xs">
                    {isOffPeakSlot ? "LKR 1,500" : "LKR 2,500"}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">
              🟢 Off-peak (6 AM - 5 PM): LKR 1,500/hour | 🟠 Peak (5 PM - 10 PM):
              LKR 2,500/hour
            </p>
          </div>
        </div>

        {selectedSlots.length > 0 && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-blue-900 font-semibold mb-2">
              Selected {selectedSlots.length} slot(s):
            </p>
            <p className="text-blue-800">
              {selectedSlots.join(", ")} | Total: {formatCurrency(calculatePrice())}
            </p>
          </div>
        )}

        <div className="flex justify-between">
          <button
            onClick={handlePrev}
            className="px-6 py-2 rounded-lg font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 transition"
          >
            ← Previous
          </button>
          <button
            onClick={handleNext}
            disabled={selectedSlots.length === 0 || loading}
            className="px-6 py-2 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 transition"
          >
            Next →
          </button>
        </div>
      </div>
    );
  }

  // Step 3: Player Count & Payment
  if (step === 3) {
    return (
      <div className="space-y-6">
        <h3 className="text-2xl font-bold">Step 3: Players & Payment</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Number of Players (max 4)
          </label>
          <select
            value={numPlayers}
            onChange={(e) => setNumPlayers(parseInt(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>
                {n} player{n > 1 ? "s" : ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Payment Method
          </label>
          <div className="space-y-2">
            <label className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-blue-50 cursor-pointer">
              <input
                type="radio"
                name="payment"
                value="pay_at_venue"
                checked={paymentMode === "pay_at_venue"}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="w-4 h-4"
              />
              <span className="ml-3">
                <span className="font-semibold">Pay at Venue</span>
                <p className="text-sm text-gray-600">
                  Pay when you arrive. Booking confirmed immediately.
                </p>
              </span>
            </label>

            <label className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-blue-50 cursor-pointer">
              <input
                type="radio"
                name="payment"
                value="payhere"
                checked={paymentMode === "payhere"}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="w-4 h-4"
              />
              <span className="ml-3">
                <span className="font-semibold">Online Payment (PayHere)</span>
                <p className="text-sm text-gray-600">
                  Pay securely by card via PayHere. Redirects to checkout.
                </p>
              </span>
            </label>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
            {error}
          </div>
        )}

        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Booking Summary:</p>
          <div className="space-y-1 text-gray-900">
            <div className="flex justify-between">
              <span>Date:</span>
              <strong>
                {new Date(selectedDate).toLocaleDateString("en-LK", {
                  month: "short",
                  day: "numeric",
                })}
              </strong>
            </div>
            <div className="flex justify-between">
              <span>Time:</span>
              <strong>
                {selectedSlots[0]} - {selectedSlots[selectedSlots.length - 1]}
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
            <hr className="my-2" />
            <div className="flex justify-between text-lg font-bold text-blue-600">
              <span>Total:</span>
              <span>{formatCurrency(calculatePrice())}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={handlePrev}
            disabled={loading}
            className="px-6 py-2 rounded-lg font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 transition"
          >
            ← Previous
          </button>
          <button
            onClick={handleNext}
            disabled={loading}
            className="px-6 py-2 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 transition"
          >
            {loading ? "Processing…" : "Confirm Booking →"}
          </button>
        </div>
      </div>
    );
  }

  // Step 4: Confirmation
  return (
    <div className="text-center space-y-6">
      <div className="text-6xl">✓</div>
      <h3 className="text-2xl font-bold text-green-600">Booking Confirmed!</h3>

      <div className="bg-green-50 p-6 rounded-lg border border-green-200">
        <p className="text-green-900 mb-4">
          Your court booking has been confirmed. A confirmation email has been
          sent to your registered email address.
        </p>

        <div className="space-y-3 text-left">
          <div>
            <p className="text-sm text-gray-600">Booking Reference</p>
            <p className="font-bold text-lg text-gray-900">
              BK#{bookingId.slice(0, 8).toUpperCase()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Date & Time</p>
            <p className="font-bold text-gray-900">
              {new Date(selectedDate).toLocaleDateString("en-LK")} |{" "}
              {selectedSlots[0]} - {selectedSlots[selectedSlots.length - 1]}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Amount</p>
            <p className="font-bold text-lg text-gray-900">
              {formatCurrency(calculatePrice())}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Link
          href="/my-bookings"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition"
        >
          View My Bookings
        </Link>
        <br />
        <Link
          href="/"
          className="inline-block text-blue-600 hover:text-blue-700 font-semibold"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
