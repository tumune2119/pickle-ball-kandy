"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutDashboard, CalendarDays, Users, Settings, LineChart, Printer, ArrowLeft, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/cn";
import { useAdminRole } from "@/lib/useAdminRole";

// roles omitted = visible to both admin and staff.
const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarDays },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/schedule", label: "Weekly Schedule", icon: Printer },
  { href: "/pos", label: "Till", icon: ShoppingCart },
  { href: "/admin/settings", label: "Settings", icon: Settings, roles: ["admin"] as const },
  { href: "/admin/reports", label: "Reports", icon: LineChart, roles: ["admin"] as const },
];

export default function AdminSidebarNav() {
  const pathname = usePathname();
  const role = useAdminRole();
  const visibleItems = navItems.filter((item) => !item.roles || (role && item.roles.includes(role as "admin")));

  return (
    <div className="bg-admin-surface rounded-xl border-2 border-ink shadow-[4px_4px_0_var(--color-ink)] dark:shadow-[4px_4px_0_var(--color-concrete-100)] p-4 space-y-1.5">
      {visibleItems.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-base transition-colors",
              active ? "text-admin-text-on-action" : "text-admin-text-muted hover:bg-admin-bg"
            )}
          >
            {active && (
              <motion.span
                layoutId="admin-nav-active"
                className="absolute inset-0 rounded-lg bg-admin-action border-2 border-ink"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <item.icon className="w-5 h-5 relative shrink-0" aria-hidden="true" />
            <span className="relative">{item.label}</span>
          </Link>
        );
      })}
      <div className="my-3 border-t-2 border-admin-border" />
      <Link
        href="/"
        className="flex items-center gap-3 px-4 py-3 rounded-lg text-admin-text-muted hover:bg-admin-bg font-bold text-base transition-colors"
      >
        <ArrowLeft className="w-5 h-5 shrink-0" aria-hidden="true" />
        Back to Site
      </Link>
    </div>
  );
}
