export const metadata = {
  title: "Admin Dashboard - Kandy 1st Court",
};

export default function AdminDashboard() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-8 text-gray-900">Dashboard</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-600 text-sm font-medium">Today&apos;s Bookings</div>
          <div className="text-4xl font-bold text-blue-600 mt-2">3</div>
          <p className="text-gray-600 text-xs mt-2">📅 Booked slots today</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-600 text-sm font-medium">Revenue (Today)</div>
          <div className="text-4xl font-bold text-green-600 mt-2">LKR 6,500</div>
          <p className="text-gray-600 text-xs mt-2">💰 From confirmed bookings</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-600 text-sm font-medium">Occupancy Rate</div>
          <div className="text-4xl font-bold text-purple-600 mt-2">75%</div>
          <p className="text-gray-600 text-xs mt-2">🎯 Court utilization</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-600 text-sm font-medium">Active Members</div>
          <div className="text-4xl font-bold text-orange-600 mt-2">42</div>
          <p className="text-gray-600 text-xs mt-2">👥 Registered players</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-lg mb-4 text-gray-900">📝 Quick Actions</h3>
          <div className="space-y-2">
            <a
              href="/admin/bookings"
              className="block px-4 py-2 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium transition"
            >
              Create Manual Booking
            </a>
            <a
              href="/admin/settings"
              className="block px-4 py-2 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium transition"
            >
              Update Court Hours
            </a>
            <a
              href="/admin/reports"
              className="block px-4 py-2 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium transition"
            >
              Export Daily Report
            </a>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-lg mb-4 text-gray-900">📊 Today&apos;s Activity</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Bookings Made:</span>
              <span className="font-bold text-gray-900">5</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Cancellations:</span>
              <span className="font-bold text-gray-900">1</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Revenue:</span>
              <span className="font-bold text-green-600">LKR 11,000</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Pending Payments:</span>
              <span className="font-bold text-orange-600">2</span>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Bookings Preview */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-bold text-lg mb-4 text-gray-900">📅 Upcoming Bookings</h3>
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 text-center">
          <p className="text-blue-900 font-semibold mb-2">🔧 Booking List Coming Soon</p>
          <p className="text-blue-800 text-sm">
            Real-time list of all upcoming bookings with customer info, times, and payment status
          </p>
        </div>
      </div>
    </div>
  );
}
