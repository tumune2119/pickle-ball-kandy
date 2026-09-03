export const metadata = {
  title: "My Profile - Kandy 1st Court",
};

export default function ProfilePage() {
  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold mb-8 text-gray-900">My Profile</h2>

      <div className="space-y-6">
        {/* Profile Info */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">👤 Personal Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900">
                Sohan Wijesooriya
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900">
                sohan@example.com
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900">
                +94 71 234 5678
              </p>
            </div>
            <button className="text-blue-600 hover:text-blue-700 font-semibold">
              ✎ Edit Profile
            </button>
          </div>
        </div>

        {/* Booking Statistics */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">📊 Booking Statistics</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-blue-700 font-semibold text-sm">Total Bookings</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">18</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-green-700 font-semibold text-sm">Completed</p>
              <p className="text-2xl font-bold text-green-600 mt-1">16</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <p className="text-orange-700 font-semibold text-sm">Upcoming</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">2</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-red-700 font-semibold text-sm">Cancelled</p>
              <p className="text-2xl font-bold text-red-600 mt-1">0</p>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">⚙️ Preferences</h3>
          <div className="space-y-4">
            <label className="flex items-center">
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
              <span className="ml-3 text-gray-700">
                Receive booking reminders via email
              </span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
              <span className="ml-3 text-gray-700">
                Receive SMS reminders 24 hours before
              </span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="w-4 h-4 rounded" />
              <span className="ml-3 text-gray-700">
                Subscribe to special offers and promotions
              </span>
            </label>
            <button className="mt-4 text-blue-600 hover:text-blue-700 font-semibold">
              ✓ Save Preferences
            </button>
          </div>
        </div>

        {/* Account Actions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">🔒 Account</h3>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-blue-600 font-semibold transition">
              🔑 Change Password
            </button>
            <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-blue-600 font-semibold transition">
              🔓 Logout from All Devices
            </button>
            <button className="w-full text-left px-4 py-3 bg-red-50 hover:bg-red-100 rounded-lg text-red-600 font-semibold transition">
              ✕ Delete Account (Permanent)
            </button>
          </div>
        </div>

        {/* Support */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-bold text-gray-900 mb-2">💬 Need Help?</h3>
          <p className="text-gray-700 mb-4">
            Have questions about your bookings or account? Our support team is here to help.
          </p>
          <a
            href="/contact"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold transition"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}
