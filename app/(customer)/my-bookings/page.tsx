import MyBookingsList from "@/components/MyBookingsList";

export const metadata = {
  title: "My Bookings - Kandy 1st Court",
};

export default function MyBookingsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">My Bookings</h2>
        <p className="text-gray-600 dark:text-gray-400">
          View, reschedule, or cancel your court bookings below
        </p>
      </div>

      <MyBookingsList />

      <div className="mt-8 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 rounded-lg p-6">
        <h3 className="font-bold text-gray-900 dark:text-white mb-4">📋 Booking Policy</h3>
        <ul className="space-y-2 text-gray-700 dark:text-gray-300">
          <li>
            ✓ Free cancellation up to 4 hours before your booking
          </li>
          <li>
            ✓ Reschedule to any available date/time for free
          </li>
          <li>
            ✓ No-show forfeits the full amount (non-refundable)
          </li>
          <li>
            ✓ Group discount available for 3+ consecutive bookings
          </li>
          <li>
            ✓ Membership discounts applied automatically at checkout
          </li>
        </ul>
      </div>
    </div>
  );
}
