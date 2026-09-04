export const metadata = {
  title: "My Profile - Kandy 1st Court",
};

export default function ProfilePage() {
  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold mb-8 text-gray-900 dark:text-white">My Profile</h2>

      <div className="space-y-6">
        {/* Profile Info */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-white/10 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">👤 Personal Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name
              </label>
              <p className="px-4 py-2 bg-gray-50 dark:bg-gray-950 rounded-lg text-gray-900 dark:text-white">
                Sohan Wijesooriya
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <p className="px-4 py-2 bg-gray-50 dark:bg-gray-950 rounded-lg text-gray-900 dark:text-white">
                sohan@example.com
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone Number
              </label>
              <p className="px-4 py-2 bg-gray-50 dark:bg-gray-950 rounded-lg text-gray-900 dark:text-white">
                +94 71 234 5678
              </p>
            </div>
            <button className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold">
              ✎ Edit Profile
            </button>
          </div>
        </div>

        {/* Booking Statistics */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-white/10 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">📊 Booking Statistics</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-purple-50 dark:bg-purple-950/40 p-4 rounded-lg">
              <p className="text-purple-700 dark:text-purple-300 font-semibold text-sm">Total Bookings</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">18</p>
            </div>
            <div className="bg-green-50 dark:bg-green-950/40 p-4 rounded-lg">
              <p className="text-green-700 dark:text-green-300 font-semibold text-sm">Completed</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">16</p>
            </div>
            <div className="bg-orange-50 dark:bg-orange-950/40 p-4 rounded-lg">
              <p className="text-orange-700 dark:text-orange-300 font-semibold text-sm">Upcoming</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">2</p>
            </div>
            <div className="bg-red-50 dark:bg-red-950/40 p-4 rounded-lg">
              <p className="text-red-700 dark:text-red-300 font-semibold text-sm">Cancelled</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">0</p>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-white/10 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">⚙️ Preferences</h3>
          <div className="space-y-4">
            <label className="flex items-center">
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
              <span className="ml-3 text-gray-700 dark:text-gray-300">
                Receive booking reminders via email
              </span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
              <span className="ml-3 text-gray-700 dark:text-gray-300">
                Receive SMS reminders 24 hours before
              </span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="w-4 h-4 rounded" />
              <span className="ml-3 text-gray-700 dark:text-gray-300">
                Subscribe to special offers and promotions
              </span>
            </label>
            <button className="mt-4 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold">
              ✓ Save Preferences
            </button>
          </div>
        </div>

        {/* Account Actions */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-white/10 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">🔒 Account</h3>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-950 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg text-purple-600 dark:text-purple-400 font-semibold transition">
              🔑 Change Password
            </button>
            <button className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-950 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg text-purple-600 dark:text-purple-400 font-semibold transition">
              🔓 Logout from All Devices
            </button>
            <button className="w-full text-left px-4 py-3 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg text-red-600 dark:text-red-400 font-semibold transition">
              ✕ Delete Account (Permanent)
            </button>
          </div>
        </div>

        {/* Support */}
        <div className="bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 rounded-lg p-6">
          <h3 className="font-bold text-gray-900 dark:text-white mb-2">💬 Need Help?</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Have questions about your bookings or account? Our support team is here to help.
          </p>
          <a
            href="/contact"
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-bold transition"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}
