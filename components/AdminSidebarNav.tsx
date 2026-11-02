"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutDashboard, CalendarDays, Users, Settings, LineChart, Printer, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/cn";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarDays },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/schedule", label: "Weekly Schedule", icon: Printer },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/admin/reports", label: "Reports", icon: LineChart },
];

export default function AdminSidebarNav() {
  const pathname = usePathname();

  return (
    <div className="bg-admin-surface rounded-xl border border-admin-border shadow-sm p-4 space-y-1">
      {navItems.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-colors",
              active
                ? "text-admin-action"
                : "text-admin-text-muted hover:bg-admin-bg"
            )}
          >
            {active && (
              <motion.span
                layoutId="admin-nav-active"
                className="absolute inset-0 rounded-lg bg-admin-bg"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <item.icon className="w-4 h-4 relative shrink-0" aria-hidden="true" />
            <span className="relative">{item.label}</span>
          </Link>
        );
      })}
      <div className="my-3 border-t border-admin-border" />
      <Link
        href="/"
        className="flex items-center gap-3 px-4 py-2 rounded-lg text-admin-text-muted hover:bg-admin-bg font-medium transition-colors"
      >
        <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden="true" />
        Back to Site
      </Link>
    </div>
  );
}
