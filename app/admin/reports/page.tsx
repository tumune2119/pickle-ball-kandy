"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils";

interface ReportData {
  revenue: {
    total: number;
    paid: number;
    pending: number;
  };
  bookings: {
    total: number;
    confirmed: number;
    pending: number;
    cancelled: number;
  };
  customers: {
    totalPlayers: number;
    averagePerBooking: string;
  };
  occupancy: {
    rate: string | number;
    peakHours: number;
    offPeakHours: number;
  };
  payments: {
    averageValue: string;
    peakPaymentDay: string;
    paymentMethods: {
      atVenue: number;
      online: number;
    };
  };
}

export default function AdminReportsPage() {
  const [reportData, setReportData] = useState<ReportData>({
    revenue: { total: 128500, paid: 125000, pending: 3500 },
    bookings: { total: 47, confirmed: 42, pending: 4, cancelled: 1 },
    customers: { totalPlayers: 145, averagePerBooking: "3.1" },
    occupancy: { rate: 72, peakHours: 24, offPeakHours: 18 },
    payments: {
      averageValue: "2736",
      peakPaymentDay: "Saturday",
      paymentMethods: { atVenue: 38, online: 4 },
    },
  });

  const [startDate, setStartDate] = useState(() =>
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(() =>
    new Date().toISOString().split("T")[0]
  );

  const handleGenerateReport = async () => {
    const res = await fetch(
      `/api/admin/reports?startDate=${startDate}&endDate=${endDate}`
    );
    if (res.ok) {
      const data = await res.json();
      setReportData((prev) => ({ ...prev, ...data }));
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-8 text-gray-900">Reports & Analytics</h2>

      <div className="space-y-6">
        {/* Date Range Filter */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-lg mb-4 text-gray-900">📊 Report Filter</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleGenerateReport}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition"
              >
                Generate Report
              </button>
            </div>
            <div className="flex items-end">
              <button className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition">
                📥 Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Revenue Report */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-lg mb-4 text-gray-900">💰 Revenue Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <p className="text-green-700 font-semibold text-sm">Total Revenue</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {formatCurrency(reportData.revenue.total)}
              </p>
              <p className="text-green-700 text-xs mt-2">For selected period</p>
            </div>
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <p className="text-blue-700 font-semibold text-sm">Bookings Count</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {reportData.bookings.total}
              </p>
              <p className="text-blue-700 text-xs mt-2">Total bookings completed</p>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
              <p className="text-purple-700 font-semibold text-sm">Avg per Booking</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">
                {formatCurrency(parseInt(reportData.payments.averageValue))}
              </p>
              <p className="text-purple-700 text-xs mt-2">Average booking value</p>
            </div>
          </div>
        </div>

        {/* Occupancy Report */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-lg mb-4 text-gray-900">📈 Occupancy Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
              <p className="text-orange-700 font-semibold text-sm">Occupancy Rate</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">
                {reportData.occupancy.rate}%
              </p>
              <p className="text-orange-700 text-xs mt-2">Court utilization</p>
            </div>
            <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-200">
              <p className="text-indigo-700 font-semibold text-sm">Peak Hours %</p>
              <p className="text-3xl font-bold text-indigo-600 mt-2">
                {Math.round(
                  (reportData.occupancy.peakHours /
                    (reportData.occupancy.peakHours + reportData.occupancy.offPeakHours)) *
                    100
                )}
                %
              </p>
              <p className="text-indigo-700 text-xs mt-2">Peak vs off-peak ratio</p>
            </div>
            <div className="bg-pink-50 p-6 rounded-lg border border-pink-200">
              <p className="text-pink-700 font-semibold text-sm">Cancellation Rate</p>
              <p className="text-3xl font-bold text-pink-600 mt-2">
                {Math.round(
                  (reportData.bookings.cancelled / reportData.bookings.total) * 100
                )}
                %
              </p>
              <p className="text-pink-700 text-xs mt-2">Cancelled bookings</p>
            </div>
          </div>
        </div>

        {/* Customer Insights */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-lg mb-4 text-gray-900">👥 Customer Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-600 font-semibold mb-3">Total Players</p>
              <p className="text-2xl font-bold text-gray-900">
                {reportData.customers.totalPlayers}
              </p>
              <p className="text-gray-600 text-sm">Across all bookings</p>
            </div>
            <div>
              <p className="text-gray-600 font-semibold mb-3">Avg Players/Booking</p>
              <p className="text-2xl font-bold text-gray-900">
                {reportData.customers.averagePerBooking}
              </p>
              <p className="text-gray-600 text-sm">Average per booking</p>
            </div>
          </div>
        </div>

        {/* Payment Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-lg mb-4 text-gray-900">💳 Payment Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <p className="text-gray-700 font-semibold mb-2">Paid</p>
              <p className="text-2xl font-bold text-green-600">
                {reportData.payments.paymentMethods.atVenue +
                  reportData.payments.paymentMethods.online}
              </p>
              <p className="text-gray-600 text-sm">
                {formatCurrency(reportData.revenue.paid)}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <p className="text-gray-700 font-semibold mb-2">Pending</p>
              <p className="text-2xl font-bold text-orange-600">
                {reportData.bookings.pending}
              </p>
              <p className="text-gray-600 text-sm">
                {formatCurrency(reportData.revenue.pending)}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <p className="text-gray-700 font-semibold mb-2">At Venue</p>
              <p className="text-2xl font-bold text-blue-600">
                {reportData.payments.paymentMethods.atVenue}
              </p>
              <p className="text-gray-600 text-sm">
                {Math.round(
                  (reportData.payments.paymentMethods.atVenue /
                    (reportData.payments.paymentMethods.atVenue +
                      reportData.payments.paymentMethods.online)) *
                    100
                )}
                % of payments
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
