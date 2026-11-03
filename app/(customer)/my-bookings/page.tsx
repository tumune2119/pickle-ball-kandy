import { ClipboardList, Check } from "lucide-react";
import MyBookingsList from "@/components/MyBookingsList";
import Card from "@/components/ui/Card";
import { CANCELLATION_POLICY_HOURS } from "@/lib/constants";

export const metadata = {
  title: "My Bookings - Pickle Rush",
};

// Only states what the booking flow actually enforces (see the cancellation
// check in app/api/bookings/[id]/route.ts) - no no-show penalty, group
// discount, or membership tier exists anywhere in this app, so none of
// those are claimed here.
const policies = [
  `Free cancellation up to ${CANCELLATION_POLICY_HOURS} hours before your booking`,
  "Need to reschedule, or have a question about a booking? Contact us directly",
];

export default function MyBookingsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-display uppercase text-text-primary mb-2 skew-display">My Bookings</h2>
        <p className="text-text-muted">View, reschedule, or cancel your court bookings below</p>
      </div>

      <MyBookingsList />

      <Card tint="brand" padding="md" className="mt-8">
        <h3 className="font-display uppercase text-text-primary mb-4 flex items-center gap-2">
          <ClipboardList className="w-5 h-5" aria-hidden="true" />
          Booking Policy
        </h3>
        <ul className="space-y-2 text-text-muted">
          {policies.map((policy) => (
            <li key={policy} className="flex items-start gap-2">
              <Check className="w-4 h-4 mt-0.5 shrink-0 text-lime-700 dark:text-lime-400" aria-hidden="true" />
              {policy}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
