export const metadata = {
  title: "Customer Dashboard - Kandy 1st Court",
};

export default function CustomerDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome Back! 👋</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Here&apos;s your pickleball booking dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quick Stats */}
        <div className="bg-purple-50 dark:bg-purple-950/40 rounded-lg border border-purple-200 dark:border-purple-800/60 p-6">
          <p className="text-purple-700 dark:text-purple-300 font-semibold text-sm">Upcoming Bookings</p>
          <p className="text-4xl font-bold text-purple-600 dark:text-purple-400 mt-2">2</p>
          <p className="text-purple-700 dark:text-purple-300 text-xs mt-2">Next: Today at 5 PM</p>
        </div>

        <div className="bg-green-50 dark:bg-green-950/40 rounded-lg border border-green-200 dark:border-green-800/60 p-6">
          <p className="text-green-700 dark:text-green-300 font-semibold text-sm">Total Bookings</p>
          <p className="text-4xl font-bold text-green-600 dark:text-green-400 mt-2">18</p>
          <p className="text-green-700 dark:text-green-300 text-xs mt-2">All-time</p>
        </div>

        <div className="bg-purple-50 dark:bg-purple-950/40 rounded-lg border border-purple-200 dark:border-purple-800/60 p-6">
          <p className="text-purple-700 dark:text-purple-300 font-semibold text-sm">Total Spent</p>
          <p className="text-4xl font-bold text-purple-600 dark:text-purple-400 mt-2">LKR 36K</p>
          <p className="text-purple-700 dark:text-purple-300 text-xs mt-2">On court bookings</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="/book"
            className="block bg-purple-600 hover:bg-purple-700 text-white px-6 py-4 rounded-lg font-bold text-center transition"
          >
            📅 Book a Court
          </a>
          <a
            href="/my-bookings"
            className="block bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-white px-6 py-4 rounded-lg font-bold text-center transition"
          >
            📋 My Bookings
          </a>
        </div>
      </div>

      {/* Recent Bookings */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent Bookings</h3>
        <div className="space-y-3">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-gray-900 dark:text-white">Today - 5:00 PM</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">1 hour • 2 players</p>
              </div>
              <span className="bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 px-3 py-1 rounded-full text-xs font-bold">
                ✓ Confirmed
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-gray-900 dark:text-white">Tomorrow - 9:00 AM</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">1 hour • 3 players</p>
              </div>
              <span className="bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300 px-3 py-1 rounded-full text-xs font-bold">
                ⏳ Pending Payment
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Membership Info */}
      <div className="bg-yellow-50 dark:bg-yellow-950/40 border border-yellow-200 dark:border-yellow-800/60 rounded-lg p-6">
        <h3 className="font-bold text-gray-900 dark:text-white mb-3">💳 Membership Status</h3>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          You&apos;re not a member yet. Join to get discounts on every booking!
        </p>
        <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg font-bold transition">
          Explore Memberships →
        </button>
      </div>
    </div>
  );
}
