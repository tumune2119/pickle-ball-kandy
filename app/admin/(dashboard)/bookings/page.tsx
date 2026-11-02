import { Plus } from "lucide-react";
import AdminBookingsTable from "@/components/AdminBookingsTable";
import Button from "@/components/ui/Button";

export const metadata = {
  title: "Manage Bookings - Pickle Rush Admin",
};

export default function AdminBookingsPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-text-primary">Manage Bookings</h2>
        <Button tone="admin">
          <Plus className="w-4 h-4" aria-hidden="true" />
          Create Booking
        </Button>
      </div>

      <AdminBookingsTable />
    </div>
  );
}
