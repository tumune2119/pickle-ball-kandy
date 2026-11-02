"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Wallet, Target, Users, ClipboardEdit, Clock, FileDown } from "lucide-react";
import { getSession } from "@/lib/auth";
import { formatCurrency, formatDate } from "@/lib/utils";
import Card, { type CardTint } from "@/components/ui/Card";
import Badge, { bookingStatusTone } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import AdminResetPanel from "@/components/AdminResetPanel";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";

interface ReportData {
  revenue: { total: number };
  bookings: { total: number; pending: number; cancelled: number };
}

interface UpcomingBooking {
  id: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  status: string;
  customerName: string;
  isGuest: boolean;
}

const quickActions = [
  { label: "Create Manual Booking", href: "/admin/bookings", icon: ClipboardEdit },
  { label: "Update Court Hours", href: "/admin/settings", icon: Clock },
  { label: "Export Daily Report", href: "/admin/reports", icon: FileDown },
];

interface DashboardData {
  report: ReportData | null;
  memberCount: number;
  upcoming: UpcomingBooking[];
}

// Pure fetch, no setState - called from both the mount effect and the
// manual refresh-after-reset path below, each of which handles its own
// setState calls inline (setState reachable through a named helper, rather
// than directly in the caller, trips the react-hooks/set-state-in-effect
// rule for the effect call site).
async function fetchDashboardData(accessToken: string): Promise<DashboardData> {
  const authHeaders = { Authorization: `Bearer ${accessToken}` };
  const today = new Date().toISOString().split("T")[0];

  const [reportRes, customersRes, bookingsRes] = await Promise.all([
    fetch(`/api/admin/reports?startDate=${today}&endDate=${today}`, { headers: authHeaders }),
    fetch("/api/admin/customers", { headers: authHeaders }),
    fetch("/api/admin/bookings", { headers: authHeaders }),
  ]);

  const result: DashboardData = { report: null, memberCount: 0, upcoming: [] };

  if (reportRes.ok) result.report = await reportRes.json();
  if (customersRes.ok) {
    const data = await customersRes.json();
    result.memberCount = data.customers?.length ?? 0;
  }
  if (bookingsRes.ok) {
    const data = await bookingsRes.json();
    const now = new Date();
    result.upcoming = (data.bookings ?? [])
      .filter((b: UpcomingBooking) => b.status !== "cancelled" && new Date(`${b.bookingDate}T${b.startTime}`) > now)
      .sort(
        (a: UpcomingBooking, b: UpcomingBooking) =>
          new Date(`${a.bookingDate}T${a.startTime}`).getTime() - new Date(`${b.bookingDate}T${b.startTime}`).getTime()
      )
      .slice(0, 5);
  }
  return result;
}

export default function AdminDashboardContent() {
  const [report, setReport] = useState<ReportData | null>(null);
  const [memberCount, setMemberCount] = useState<number | null>(null);
  const [upcoming, setUpcoming] = useState<UpcomingBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const session = await getSession();
      if (!session) {
        if (!cancelled) setLoading(false);
        return;
      }
      const data = await fetchDashboardData(session.access_token);
      if (!cancelled) {
        setReport(data.report);
        setMemberCount(data.memberCount);
        setUpcoming(data.upcoming);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const refresh = async () => {
    setLoading(true);
    const session = await getSession();
    if (!session) {
      setLoading(false);
      return;
    }
    const data = await fetchDashboardData(session.access_token);
    setReport(data.report);
    setMemberCount(data.memberCount);
    setUpcoming(data.upcoming);
    setLoading(false);
  };

  const occupancyRate =
    report && report.bookings.total > 0
      ? Math.round(((report.bookings.total - report.bookings.cancelled) / report.bookings.total) * 100)
      : 0;

  const stats: { label: string; value: string; footnote: string; icon: typeof CalendarDays; tint: CardTint; accent: string }[] = [
    {
      label: "Today's Bookings",
      value: String(report?.bookings.total ?? 0),
      footnote: "Booked slots today",
      icon: CalendarDays,
      tint: "admin",
      accent: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "Revenue (Today)",
      value: formatCurrency(report?.revenue.total ?? 0),
      footnote: "From confirmed bookings",
      icon: Wallet,
      tint: "success",
      accent: "text-green-600 dark:text-green-400",
    },
    {
      label: "Occupancy Rate",
      value: `${occupancyRate}%`,
      footnote: "Court utilization today",
      icon: Target,
      tint: "warning",
      accent: "text-orange-600 dark:text-orange-400",
    },
    {
      label: "Active Members",
      value: String(memberCount ?? 0),
      footnote: "Registered players",
      icon: Users,
      tint: "admin",
      accent: "text-blue-600 dark:text-blue-400",
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-8 text-text-primary">Dashboard</h2>

      <AdminResetPanel onReset={refresh} />

      {/* Stats Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : (
        <RevealGroup className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <RevealItem key={stat.label}>
              <Card padding="md" className="h-full">
                <div className="flex items-start justify-between">
                  <div className="text-gray-600 dark:text-gray-400 text-sm font-medium">{stat.label}</div>
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center bg-blue-50 dark:bg-blue-950/40 ${stat.accent}`}>
                    <stat.icon className="w-4 h-4" aria-hidden="true" />
                  </div>
                </div>
                <div className={`text-4xl font-bold mt-2 ${stat.accent}`}>{stat.value}</div>
                <p className="text-gray-600 dark:text-gray-400 text-xs mt-2">{stat.footnote}</p>
              </Card>
            </RevealItem>
          ))}
        </RevealGroup>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card padding="md">
          <h3 className="font-bold text-lg mb-4 text-text-primary">Quick Actions</h3>
          <div className="space-y-2">
            {quickActions.map((action) => (
              <Button
                key={action.label}
                href={action.href}
                variant="soft"
                tone="admin"
                fullWidth
                className="justify-start"
              >
                <action.icon className="w-4 h-4" aria-hidden="true" />
                {action.label}
              </Button>
            ))}
          </div>
        </Card>

        <Card padding="md">
          <h3 className="font-bold text-lg mb-4 text-text-primary">Today&apos;s Activity</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Bookings Made:</span>
              <span className="font-bold text-text-primary">{report?.bookings.total ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Cancellations:</span>
              <span className="font-bold text-text-primary">{report?.bookings.cancelled ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Total Revenue:</span>
              <span className="font-bold text-green-600 dark:text-green-400">{formatCurrency(report?.revenue.total ?? 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Pending Payments:</span>
              <span className="font-bold text-orange-600 dark:text-orange-400">{report?.bookings.pending ?? 0}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Upcoming Bookings Preview */}
      <Card padding="md">
        <h3 className="font-bold text-lg mb-4 text-text-primary">Upcoming Bookings</h3>
        {loading ? (
          <Skeleton className="h-24 w-full" />
        ) : upcoming.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400 text-sm">No upcoming bookings yet.</p>
        ) : (
          <div className="space-y-2">
            {upcoming.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg bg-surface-sunken"
              >
                <div>
                  <p className="font-semibold text-text-primary text-sm">
                    {formatDate(b.bookingDate)} · {b.startTime} - {b.endTime}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {b.customerName}
                    {b.isGuest && " (Guest)"}
                  </p>
                </div>
                <Badge tone={bookingStatusTone(b.status)}>{b.status === "confirmed" ? "Confirmed" : "Pending"}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
