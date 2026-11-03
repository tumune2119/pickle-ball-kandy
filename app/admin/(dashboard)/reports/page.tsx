"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, Wallet, Percent, Users, CreditCard, Download } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getSession } from "@/lib/auth";
import { useAdminRole } from "@/lib/useAdminRole";
import Card, { type CardTint } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import { Input } from "@/components/ui/Input";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import PosSalesReport from "@/components/PosSalesReport";

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

const EMPTY_REPORT: ReportData = {
  revenue: { total: 0, paid: 0, pending: 0 },
  bookings: { total: 0, confirmed: 0, pending: 0, cancelled: 0 },
  customers: { totalPlayers: 0, averagePerBooking: "0" },
  occupancy: { rate: 0, peakHours: 0, offPeakHours: 0 },
  payments: {
    averageValue: "0",
    peakPaymentDay: "-",
    paymentMethods: { atVenue: 0, online: 0 },
  },
};

// Pure fetch, no setState - shared by the mount effect and the button's
// manual re-fetch, each of which applies the result via its own setState
// calls (see the AdminDashboardContent equivalent for why).
async function fetchReport(accessToken: string, startDate: string, endDate: string): Promise<ReportData | null> {
  const res = await fetch(`/api/admin/reports?startDate=${startDate}&endDate=${endDate}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return null;
  return res.json();
}

export default function AdminReportsPage() {
  const router = useRouter();
  const role = useAdminRole();
  // Client-side UX only (same documented role as AdminAuthGate) - the real
  // boundary is requireAdminOnly on /api/admin/reports itself.
  useEffect(() => {
    if (role === "staff") router.replace("/admin/dashboard");
  }, [role, router]);

  const [reportData, setReportData] = useState<ReportData>(EMPTY_REPORT);
  const [loading, setLoading] = useState(true);

  const [startDate, setStartDate] = useState(() =>
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split("T")[0]);

  const handleGenerateReport = async () => {
    setLoading(true);
    const session = await getSession();
    if (!session) {
      setLoading(false);
      return;
    }
    const data = await fetchReport(session.access_token, startDate, endDate);
    if (data) setReportData((prev) => ({ ...prev, ...data }));
    setLoading(false);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const session = await getSession();
      if (!session) {
        if (!cancelled) setLoading(false);
        return;
      }
      const data = await fetchReport(session.access_token, startDate, endDate);
      if (!cancelled) {
        if (data) setReportData((prev) => ({ ...prev, ...data }));
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // Only on mount - re-runs are triggered explicitly via the button.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const revenueMetrics: { label: string; value: string; footnote: string; tint: CardTint; accent: string }[] = [
    {
      label: "Total Revenue",
      value: formatCurrency(reportData.revenue.total),
      footnote: "For selected period",
      tint: "success",
      accent: "text-success-700 dark:text-success-400",
    },
    {
      label: "Bookings Count",
      value: String(reportData.bookings.total),
      footnote: "Total bookings completed",
      tint: "admin",
      accent: "text-admin-action",
    },
    {
      label: "Avg per Booking",
      value: formatCurrency(parseInt(reportData.payments.averageValue)),
      footnote: "Average booking value",
      tint: "success",
      accent: "text-success-700 dark:text-success-400",
    },
  ];

  const occupancyMetrics: { label: string; value: string; footnote: string; tint: CardTint; accent: string }[] = [
    {
      label: "Occupancy Rate",
      value: `${reportData.occupancy.rate}%`,
      footnote: "Court utilization",
      tint: "warning",
      accent: "text-warning-700 dark:text-warning-400",
    },
    {
      label: "Peak Hours %",
      value: `${
        reportData.occupancy.peakHours + reportData.occupancy.offPeakHours > 0
          ? Math.round(
              (reportData.occupancy.peakHours / (reportData.occupancy.peakHours + reportData.occupancy.offPeakHours)) * 100
            )
          : 0
      }%`,
      footnote: "Peak vs off-peak ratio",
      tint: "warning",
      accent: "text-warning-700 dark:text-warning-400",
    },
    {
      label: "Cancellation Rate",
      value: `${
        reportData.bookings.total > 0
          ? Math.round((reportData.bookings.cancelled / reportData.bookings.total) * 100)
          : 0
      }%`,
      footnote: "Cancelled bookings",
      tint: "danger",
      accent: "text-danger-700 dark:text-danger-400",
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-8 text-text-primary">Reports & Analytics</h2>

      <div className="space-y-6">
        {/* Date Range Filter */}
        <Card padding="md">
          <h3 className="font-bold text-lg mb-4 text-text-primary flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-admin-action" aria-hidden="true" />
            Report Filter
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="focus:ring-admin-action"
            />
            <Input
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="focus:ring-admin-action"
            />
            <div className="flex items-end">
              <Button tone="admin" fullWidth onClick={handleGenerateReport} loading={loading}>
                {loading ? "Loading…" : "Generate Report"}
              </Button>
            </div>
            <div className="flex items-end">
              <Button className="bg-success-700! hover:bg-success-800! shadow-success-900/20!" fullWidth>
                <Download className="w-4 h-4" aria-hidden="true" />
                Export CSV
              </Button>
            </div>
          </div>
        </Card>

        {/* Revenue Report */}
        <Card padding="md">
          <h3 className="font-bold text-lg mb-4 text-text-primary flex items-center gap-2">
            <Wallet className="w-5 h-5 text-admin-action" aria-hidden="true" />
            Revenue Summary
          </h3>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          ) : (
            <RevealGroup className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {revenueMetrics.map((metric) => (
                <RevealItem key={metric.label}>
                  <Card tint={metric.tint} padding="md">
                    <p className={`font-semibold text-sm ${metric.accent}`}>{metric.label}</p>
                    <p className={`text-3xl font-bold mt-2 ${metric.accent}`}>{metric.value}</p>
                    <p className={`text-xs mt-2 ${metric.accent}`}>{metric.footnote}</p>
                  </Card>
                </RevealItem>
              ))}
            </RevealGroup>
          )}
        </Card>

        {/* Occupancy Report */}
        <Card padding="md">
          <h3 className="font-bold text-lg mb-4 text-text-primary flex items-center gap-2">
            <Percent className="w-5 h-5 text-admin-action" aria-hidden="true" />
            Occupancy Analysis
          </h3>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          ) : (
            <RevealGroup className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {occupancyMetrics.map((metric) => (
                <RevealItem key={metric.label}>
                  <Card tint={metric.tint} padding="md">
                    <p className={`font-semibold text-sm ${metric.accent}`}>{metric.label}</p>
                    <p className={`text-3xl font-bold mt-2 ${metric.accent}`}>{metric.value}</p>
                    <p className={`text-xs mt-2 ${metric.accent}`}>{metric.footnote}</p>
                  </Card>
                </RevealItem>
              ))}
            </RevealGroup>
          )}
        </Card>

        {/* Customer Insights */}
        <Card padding="md">
          <h3 className="font-bold text-lg mb-4 text-text-primary flex items-center gap-2">
            <Users className="w-5 h-5 text-admin-action" aria-hidden="true" />
            Customer Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-admin-text-muted font-semibold mb-3">Total Players</p>
              <p className="text-2xl font-bold text-text-primary">{reportData.customers.totalPlayers}</p>
              <p className="text-admin-text-muted text-sm">Across all bookings</p>
            </div>
            <div>
              <p className="text-admin-text-muted font-semibold mb-3">Avg Players/Booking</p>
              <p className="text-2xl font-bold text-text-primary">{reportData.customers.averagePerBooking}</p>
              <p className="text-admin-text-muted text-sm">Average per booking</p>
            </div>
          </div>
        </Card>

        {/* Payment Status */}
        <Card padding="md">
          <h3 className="font-bold text-lg mb-4 text-text-primary flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-admin-action" aria-hidden="true" />
            Payment Status
          </h3>
          <RevealGroup className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <RevealItem>
              <Card padding="md">
                <p className="text-admin-text font-semibold mb-2">Paid</p>
                <p className="text-2xl font-bold text-success-700 dark:text-success-400">
                  {reportData.payments.paymentMethods.atVenue + reportData.payments.paymentMethods.online}
                </p>
                <p className="text-admin-text-muted text-sm">{formatCurrency(reportData.revenue.paid)}</p>
              </Card>
            </RevealItem>
            <RevealItem>
              <Card padding="md">
                <p className="text-admin-text font-semibold mb-2">Pending</p>
                <p className="text-2xl font-bold text-warning-700 dark:text-warning-400">
                  {reportData.bookings.pending}
                </p>
                <p className="text-admin-text-muted text-sm">
                  {formatCurrency(reportData.revenue.pending)}
                </p>
              </Card>
            </RevealItem>
            <RevealItem>
              <Card padding="md">
                <p className="text-admin-text font-semibold mb-2">At Venue</p>
                <p className="text-2xl font-bold text-admin-action">
                  {reportData.payments.paymentMethods.atVenue}
                </p>
                <p className="text-admin-text-muted text-sm">
                  {reportData.payments.paymentMethods.atVenue + reportData.payments.paymentMethods.online > 0
                    ? Math.round(
                        (reportData.payments.paymentMethods.atVenue /
                          (reportData.payments.paymentMethods.atVenue + reportData.payments.paymentMethods.online)) *
                          100
                      )
                    : 0}
                  % of payments
                </p>
              </Card>
            </RevealItem>
          </RevealGroup>
        </Card>

        <PosSalesReport startDate={startDate} endDate={endDate} />
      </div>
    </div>
  );
}
