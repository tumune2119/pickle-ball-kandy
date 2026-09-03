"use client";

import { useState } from "react";
import { formatDate } from "@/lib/utils";

interface AdminCustomer {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  totalBookings: number;
  lastBooking: string | null;
  createdAt: string;
}

// TODO: replace with a fetch from /api/admin/customers once wired to real auth.
function buildDemoCustomers(): AdminCustomer[] {
  return [
      {
        id: "user-1",
        fullName: "Sohan Wijesooriya",
        email: "sohan@example.com",
        phoneNumber: "+94 71 234 5678",
        totalBookings: 5,
        lastBooking: new Date().toISOString().split("T")[0],
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
      },
      {
        id: "user-2",
        fullName: "John Doe",
        email: "john@example.com",
        phoneNumber: "+94 77 987 6543",
        totalBookings: 3,
        lastBooking: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
      },
      {
        id: "user-3",
        fullName: "Jane Smith",
        email: "jane@example.com",
        phoneNumber: "+94 76 555 4444",
        totalBookings: 8,
        lastBooking: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
      },
      {
        id: "user-4",
        fullName: "Mike Johnson",
        email: "mike@example.com",
        phoneNumber: "+94 75 222 3333",
        totalBookings: 2,
        lastBooking: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
      },
  ];
}

export default function AdminCustomersTable() {
  const [customers] = useState<AdminCustomer[]>(buildDemoCustomers);
  const [search, setSearch] = useState("");

  const filteredCustomers = customers.filter(
    (c) =>
      c.fullName.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phoneNumber.includes(search)
  );

  return (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                Phone
              </th>
              <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase">
                Bookings
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                Last Booking
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                Member Since
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-600">
                  No customers found
                </td>
              </tr>
            ) : (
              filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-semibold text-gray-900">
                    {customer.fullName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {customer.email}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 font-mono">
                    {customer.phoneNumber}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-bold text-sm">
                      {customer.totalBookings}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {customer.lastBooking
                      ? formatDate(customer.lastBooking)
                      : "Never"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {formatDate(customer.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="text-blue-600 hover:text-blue-800 font-semibold text-sm">
                        👁️ View
                      </button>
                      <button className="text-green-600 hover:text-green-800 font-semibold text-sm">
                        📞 Contact
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700">
        Showing {filteredCustomers.length} of {customers.length} customers
      </div>
    </div>
  );
}
