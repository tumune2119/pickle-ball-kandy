"use client";

import { useState } from "react";

export default function AdminSettingsPage() {
  const [formData, setFormData] = useState({
    openingTime: "06:00",
    closingTime: "22:00",
    slotDuration: 60,
    maxPlayers: 4,
    offPeakRate: 1500,
    peakRate: 2500,
    cancellationHours: 4,
    refundPercentage: 100,
  });

  const [saved, setSaved] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: isNaN(Number(value)) ? value : Number(value),
    }));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    // Call API to save settings
  };

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-bold mb-8 text-gray-900 dark:text-white">Court Settings</h2>

      <div className="space-y-6">
        {/* Operating Hours */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-white/10 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">⏰ Operating Hours</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Opening Time
              </label>
              <input
                type="time"
                name="openingTime"
                value={formData.openingTime}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-white/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Closing Time
              </label>
              <input
                type="time"
                name="closingTime"
                value={formData.closingTime}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-white/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Slot Configuration */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-white/10 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">🎯 Slot Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Slot Duration (minutes)
              </label>
              <select
                name="slotDuration"
                value={formData.slotDuration}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-white/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500"
              >
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
                <option value={90}>1.5 hours</option>
                <option value={120}>2 hours</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Max Players per Slot
              </label>
              <select
                name="maxPlayers"
                value={formData.maxPlayers}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-white/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500"
              >
                <option value={2}>2 players</option>
                <option value={3}>3 players</option>
                <option value={4}>4 players</option>
                <option value={6}>6 players</option>
                <option value={8}>8 players</option>
              </select>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-white/10 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">💰 Pricing</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Off-Peak Rate (6 AM - 5 PM) LKR/hour
              </label>
              <input
                type="number"
                name="offPeakRate"
                value={formData.offPeakRate}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-white/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Peak Rate (5 PM - 10 PM) LKR/hour
              </label>
              <input
                type="number"
                name="peakRate"
                value={formData.peakRate}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-white/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Cancellation Policy */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-white/10 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">❌ Cancellation Policy</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Free Cancellation Window (hours before)
              </label>
              <input
                type="number"
                name="cancellationHours"
                value={formData.cancellationHours}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-white/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500"
              />
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Customers can cancel free if they cancel this many hours before booking
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Refund Percentage (%)
              </label>
              <select
                name="refundPercentage"
                value={formData.refundPercentage}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-white/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500"
              >
                <option value={0}>No refund</option>
                <option value={50}>50%</option>
                <option value={75}>75%</option>
                <option value={100}>100% (Full refund)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Save Button & Status */}
        <div className="flex gap-4">
          <button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold transition"
          >
            💾 Save Settings
          </button>
          {saved && (
            <div className="flex items-center text-green-600 dark:text-green-400 font-semibold">
              ✓ Settings saved successfully!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
