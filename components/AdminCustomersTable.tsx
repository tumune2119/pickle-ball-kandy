"use client";

import { useEffect, useState } from "react";
import { Mail } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { getSession } from "@/lib/auth";
import { Input } from "@/components/ui/Input";
import Skeleton from "@/components/ui/Skeleton";
import Tooltip from "@/components/ui/Tooltip";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";

interface AdminCustomer {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  totalBookings: number;
  lastBooking: string | null;
  createdAt: string;
}

export default function AdminCustomersTable() {
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const session = await getSession();
      if (!session) {
        if (!cancelled) setLoading(false);
        return;
      }
      const res = await fetch("/api/admin/customers", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await res.json();
      if (!cancelled) {
        setCustomers(res.ok ? data.customers ?? [] : []);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredCustomers = customers.filter(
    (c) =>
      c.fullName.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phoneNumber.includes(search)
  );

  return (
    <div className="space-y-6">
      {/* Search */}
      <Input
        type="text"
        placeholder="Search by name, email, or phone..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="focus:ring-admin-action"
      />

      {/* Table */}
      <div className="bg-admin-surface rounded-xl border border-admin-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-admin-bg border-b border-admin-border">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-admin-text-muted uppercase">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-admin-text-muted uppercase">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-admin-text-muted uppercase">
                  Phone
                </th>
                <th className="px-4 py-3 text-center text-xs font-bold text-admin-text-muted uppercase">
                  Bookings
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-admin-text-muted uppercase">
                  Last Booking
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-admin-text-muted uppercase">
                  Member Since
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-admin-text-muted uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            {loading ? (
              <tbody>
                {[1, 2, 3].map((i) => (
                  <tr key={i}>
                    <td colSpan={7} className="px-6 py-4">
                      <Skeleton className="h-6 w-full" />
                    </td>
                  </tr>
                ))}
              </tbody>
            ) : filteredCustomers.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-admin-text-muted">
                    No customers found
                  </td>
                </tr>
              </tbody>
            ) : (
              <RevealGroup as="tbody" className="divide-y divide-admin-border" stagger={0.04}>
                {filteredCustomers.map((customer) => (
                  <RevealItem key={customer.id} as="tr" y={8} className="hover:bg-admin-bg/60 transition-colors">
                    <td className="px-4 py-4 font-semibold text-admin-text whitespace-nowrap">{customer.fullName}</td>
                    <td className="px-4 py-4 text-sm text-admin-text-muted whitespace-nowrap">{customer.email}</td>
                    <td className="px-4 py-4 text-sm text-admin-text-muted font-mono whitespace-nowrap">
                      {customer.phoneNumber}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="inline-block bg-admin-bg text-admin-action px-3 py-1 rounded-full font-bold text-sm">
                        {customer.totalBookings}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-admin-text-muted whitespace-nowrap">
                      {customer.lastBooking ? formatDate(customer.lastBooking) : "Never"}
                    </td>
                    <td className="px-4 py-4 text-sm text-admin-text-muted whitespace-nowrap">
                      {formatDate(customer.createdAt)}
                    </td>
                    <td className="px-4 py-4">
                      <Tooltip label={`Email ${customer.fullName}`}>
                        <a
                          href={`mailto:${customer.email}`}
                          className="inline-flex p-1.5 text-admin-action hover:text-admin-action-hover transition-colors"
                          aria-label={`Email ${customer.fullName}`}
                        >
                          <Mail className="w-4 h-4" aria-hidden="true" />
                        </a>
                      </Tooltip>
                    </td>
                  </RevealItem>
                ))}
              </RevealGroup>
            )}
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-admin-bg rounded-lg p-4 text-sm text-admin-text-muted">
        Showing {filteredCustomers.length} of {customers.length} customers
      </div>
    </div>
  );
}
