import { ClipboardList, Check } from "lucide-react";
import MyBookingsList from "@/components/MyBookingsList";
import Card from "@/components/ui/Card";

export const metadata = {
  title: "My Bookings - Pickle Rush",
};

const policies = [
  "Free cancellation up to 4 hours before your booking",
  "Reschedule to any available date/time for free",
  "No-show forfeits the full amount (non-refundable)",
  "Group discount available for 3+ consecutive bookings",
  "Membership discounts applied automatically at checkout",
];

export default function MyBookingsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold font-display text-text-primary mb-2">My Bookings</h2>
        <p className="text-text-muted">View, reschedule, or cancel your court bookings below</p>
      </div>

      <MyBookingsList />

      <Card tint="brand" glass padding="md" className="mt-8">
        <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2">
          <ClipboardList className="w-5 h-5" aria-hidden="true" />
          Booking Policy
        </h3>
        <ul className="space-y-2 text-gray-700 dark:text-gray-300">
          {policies.map((policy) => (
            <li key={policy} className="flex items-start gap-2">
              <Check className="w-4 h-4 mt-0.5 shrink-0 text-sage-600 dark:text-sage-400" aria-hidden="true" />
              {policy}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
