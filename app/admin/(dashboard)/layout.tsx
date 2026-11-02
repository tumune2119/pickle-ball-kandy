import ThemeToggle from "@/components/ThemeToggle";
import AdminAuthGate from "@/components/AdminAuthGate";
import AdminSidebarNav from "@/components/AdminSidebarNav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthGate>
      <div className="min-h-screen bg-admin-bg print:bg-white">
        {/* Admin Header */}
        <header className="bg-admin-action text-admin-text-on-action print:hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-info-200 mt-1 text-sm sm:text-base">Court Management System</p>
            </div>
            <ThemeToggle />
          </div>
        </header>

        {/* Admin Sidebar + Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print:p-0 print:max-w-none">
          <div className="grid md:grid-cols-4 gap-6 print:block">
            {/* Sidebar */}
            <nav className="md:col-span-1 print:hidden">
              <AdminSidebarNav />
            </nav>

            {/* Main Content */}
            <main className="md:col-span-3 print:col-span-4">{children}</main>
          </div>
        </div>
      </div>
    </AdminAuthGate>
  );
}
