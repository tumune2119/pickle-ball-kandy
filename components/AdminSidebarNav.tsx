"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Settings,
  LineChart,
  Printer,
  ArrowLeft,
  ShoppingCart,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useAdminRole } from "@/lib/useAdminRole";
import Tooltip from "@/components/ui/Tooltip";

const COLLAPSE_KEY = "admin-sidebar-collapsed";

// roles omitted = visible to both admin and staff.
const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarDays },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/schedule", label: "Weekly Schedule", icon: Printer },
  { href: "/pos", label: "Till", icon: ShoppingCart },
  { href: "/admin/products", label: "Products", icon: Package, roles: ["admin"] as const },
  { href: "/admin/settings", label: "Settings", icon: Settings, roles: ["admin"] as const },
  { href: "/admin/reports", label: "Reports", icon: LineChart, roles: ["admin"] as const },
];

export default function AdminSidebarNav() {
  const pathname = usePathname();
  const role = useAdminRole();
  // Lazy initializer reads synchronously on first render (client-only
  // component, so no SSR mismatch) - avoids a collapsed->expanded flash on
  // reload the way a useEffect-after-mount read would.
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return localStorage.getItem(COLLAPSE_KEY) === "1";
    } catch {
      return false;
    }
  });
  const visibleItems = navItems.filter((item) => !item.roles || (role && item.roles.includes(role as "admin")));

  const toggle = () => {
    setCollapsed((c) => {
      const next = !c;
      try {
        localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      } catch {
        // Private browsing / storage disabled - the toggle still works for
        // this session, it just won't be remembered next visit.
      }
      return next;
    });
  };

  const itemClass = (active: boolean) =>
    cn(
      "relative flex items-center rounded-lg font-bold text-base transition-colors",
      collapsed ? "justify-center px-0 py-3" : "gap-3 px-4 py-3",
      active ? "text-admin-text-on-action" : "text-admin-text-muted hover:bg-admin-bg"
    );

  return (
    <div
      className={cn(
        "bg-admin-surface rounded-xl border-2 border-ink shadow-[4px_4px_0_var(--color-ink)] dark:shadow-[4px_4px_0_var(--color-concrete-100)] p-4 space-y-1.5 shrink-0 transition-[width] duration-200",
        collapsed ? "w-[72px]" : "w-full md:w-64"
      )}
    >
      <button
        onClick={toggle}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className={cn(
          "flex items-center rounded-lg text-admin-text-muted hover:bg-admin-bg transition-colors w-full mb-2",
          collapsed ? "justify-center p-3" : "gap-2 px-4 py-2"
        )}
      >
        {collapsed ? (
          <PanelLeftOpen className="w-5 h-5 shrink-0" aria-hidden="true" />
        ) : (
          <>
            <PanelLeftClose className="w-5 h-5 shrink-0" aria-hidden="true" />
            <span className="text-sm">Collapse</span>
          </>
        )}
      </button>
      <div className="border-t-2 border-admin-border -mx-4 mb-1.5" />

      {visibleItems.map((item) => {
        const active = pathname === item.href;
        const link = (
          <Link key={item.href} href={item.href} className={itemClass(active)}>
            {active && (
              <motion.span
                // Scoped to collapsed/expanded so toggling collapse mounts a
                // fresh pill instead of morphing the old (wide) one into the
                // new (narrow) shape - that cross-shape FLIP animation was
                // what squished the icon on top of it mid-transition.
                layoutId={collapsed ? "admin-nav-active-collapsed" : "admin-nav-active-expanded"}
                className="absolute inset-0 rounded-lg bg-admin-action border-2 border-ink"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <item.icon className="w-5 h-5 relative shrink-0" aria-hidden="true" />
            {!collapsed && <span className="relative">{item.label}</span>}
          </Link>
        );
        return collapsed ? (
          <Tooltip key={item.href} label={item.label} side="right" className="w-full">
            {link}
          </Tooltip>
        ) : (
          link
        );
      })}
      <div className="my-3 border-t-2 border-admin-border" />
      {collapsed ? (
        <Tooltip label="Back to Site" side="right" className="w-full">
          <Link href="/" className={cn(itemClass(false))}>
            <ArrowLeft className="w-5 h-5 shrink-0" aria-hidden="true" />
          </Link>
        </Tooltip>
      ) : (
        <Link href="/" className={itemClass(false)}>
          <ArrowLeft className="w-5 h-5 shrink-0" aria-hidden="true" />
          <span className="relative">Back to Site</span>
        </Link>
      )}
    </div>
  );
}
