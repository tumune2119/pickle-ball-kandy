import AdminCustomersTable from "@/components/AdminCustomersTable";

export const metadata = {
  title: "Manage Customers - Pickle Rush Admin",
};

export default function AdminCustomersPage() {
  return (
    <div>
      <h2 className="text-2xl font-display uppercase mb-8 text-text-primary skew-display">Manage Customers</h2>
      <AdminCustomersTable />
    </div>
  );
}
