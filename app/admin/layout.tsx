import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Admin Header */}
      <header className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-400 mt-1">Court Management System</p>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Admin Sidebar + Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <nav className="md:col-span-1">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 space-y-4">
              <Link
                href="/admin/dashboard"
                className="block px-4 py-2 rounded hover:bg-blue-50 dark:hover:bg-blue-950/40 text-gray-900 dark:text-white font-medium"
              >
                📊 Dashboard
              </Link>
              <Link
                href="/admin/bookings"
                className="block px-4 py-2 rounded hover:bg-blue-50 dark:hover:bg-blue-950/40 text-gray-900 dark:text-white font-medium"
              >
                📅 Bookings
              </Link>
              <Link
                href="/admin/customers"
                className="block px-4 py-2 rounded hover:bg-blue-50 dark:hover:bg-blue-950/40 text-gray-900 dark:text-white font-medium"
              >
                👥 Customers
              </Link>
              <Link
                href="/admin/settings"
                className="block px-4 py-2 rounded hover:bg-blue-50 dark:hover:bg-blue-950/40 text-gray-900 dark:text-white font-medium"
              >
                ⚙️ Settings
              </Link>
              <Link
                href="/admin/reports"
                className="block px-4 py-2 rounded hover:bg-blue-50 dark:hover:bg-blue-950/40 text-gray-900 dark:text-white font-medium"
              >
                📈 Reports
              </Link>
              <hr className="my-4" />
              <Link
                href="/"
                className="block px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 font-medium"
              >
                ← Back to Site
              </Link>
            </div>
          </nav>

          {/* Main Content */}
          <main className="md:col-span-3">{children}</main>
        </div>
      </div>
    </div>
  );
}
