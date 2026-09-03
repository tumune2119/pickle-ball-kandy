import AdminBookingsTable from "@/components/AdminBookingsTable";

export const metadata = {
  title: "Manage Bookings - Kandy 1st Court Admin",
};

export default function AdminBookingsPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Manage Bookings</h2>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition">
          + Create Booking
        </button>
      </div>

      <AdminBookingsTable />
    </div>
  );
}
