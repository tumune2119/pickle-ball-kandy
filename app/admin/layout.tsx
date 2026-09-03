import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-400 mt-1">Court Management System</p>
        </div>
      </header>

      {/* Admin Sidebar + Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <nav className="md:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 space-y-4">
              <Link
                href="/admin/dashboard"
                className="block px-4 py-2 rounded hover:bg-blue-50 text-gray-900 font-medium"
              >
                📊 Dashboard
              </Link>
              <Link
                href="/admin/bookings"
                className="block px-4 py-2 rounded hover:bg-blue-50 text-gray-900 font-medium"
              >
                📅 Bookings
              </Link>
              <Link
                href="/admin/customers"
                className="block px-4 py-2 rounded hover:bg-blue-50 text-gray-900 font-medium"
              >
                👥 Customers
              </Link>
              <Link
                href="/admin/settings"
                className="block px-4 py-2 rounded hover:bg-blue-50 text-gray-900 font-medium"
              >
                ⚙️ Settings
              </Link>
              <Link
                href="/admin/reports"
                className="block px-4 py-2 rounded hover:bg-blue-50 text-gray-900 font-medium"
              >
                📈 Reports
              </Link>
              <hr className="my-4" />
              <Link
                href="/"
                className="block px-4 py-2 rounded hover:bg-gray-100 text-gray-700 font-medium"
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
