import AdminCustomersTable from "@/components/AdminCustomersTable";

export const metadata = {
  title: "Manage Customers - Kandy 1st Court Admin",
};

export default function AdminCustomersPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-8 text-gray-900 dark:text-white">Manage Customers</h2>
      <AdminCustomersTable />
    </div>
  );
}
