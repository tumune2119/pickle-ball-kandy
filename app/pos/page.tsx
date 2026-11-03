"use client";

import { useState } from "react";
import { ShoppingCart, CalendarPlus, UserCheck } from "lucide-react";
import { cn } from "@/lib/cn";
import TillSaleCart from "@/components/pos/TillSaleCart";
import TillBookingForm from "@/components/pos/TillBookingForm";
import TillCheckInLookup from "@/components/pos/TillCheckInLookup";

const TABS = [
  { id: "sale", label: "Retail Sale", icon: ShoppingCart },
  { id: "booking", label: "Walk-in Booking", icon: CalendarPlus },
  { id: "checkin", label: "Check In", icon: UserCheck },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function PosTillPage() {
  const [tab, setTab] = useState<TabId>("sale");

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-6 print:hidden">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex items-center gap-2 px-6 py-3.5 rounded-lg font-bold text-base border-2 border-ink transition-[transform,box-shadow,background-color,color]",
              tab === t.id
                ? "bg-admin-action text-admin-text-on-action shadow-[3px_3px_0_var(--color-ink)] dark:shadow-[3px_3px_0_var(--color-concrete-100)]"
                : "bg-admin-surface text-admin-text-muted hover:bg-admin-bg"
            )}
          >
            <t.icon className="w-5 h-5" aria-hidden="true" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "sale" && <TillSaleCart />}
      {tab === "booking" && <TillBookingForm />}
      {tab === "checkin" && <TillCheckInLookup />}
    </div>
  );
}
