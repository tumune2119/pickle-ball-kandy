import AdminCustomersTable from "@/components/AdminCustomersTable";

export const metadata = {
  title: "Manage Customers - Pickle Rush Admin",
};

export default function AdminCustomersPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-8 text-text-primary">Manage Customers</h2>
      <AdminCustomersTable />
    </div>
  );
}
