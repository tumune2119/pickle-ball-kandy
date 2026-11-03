"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, LogOut } from "lucide-react";
import { supabase } from "@/lib/auth";
import { useAdminRole } from "@/lib/useAdminRole";
import { COURT_NAME } from "@/lib/constants";
import OfflineQueueBadge from "./OfflineQueueBadge";

export default function PosHeader() {
  const router = useRouter();
  const role = useAdminRole();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  return (
    <header className="bg-admin-surface border-b-2 border-ink px-4 md:px-6 py-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <span className="font-display uppercase text-xl text-admin-text skew-display">{COURT_NAME} — Till</span>
        {role === "admin" && (
          <Link
            href="/admin/dashboard"
            className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-admin-text-muted hover:text-admin-action px-3 py-2 rounded-lg hover:bg-admin-bg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Dashboard
          </Link>
        )}
      </div>
      <div className="flex items-center gap-3">
        <OfflineQueueBadge />
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex items-center gap-1.5 text-sm font-bold text-admin-text-muted hover:text-admin-action px-3 py-2 rounded-lg hover:bg-admin-bg transition-colors"
        >
          <LogOut className="w-4 h-4" aria-hidden="true" />
          Logout
        </button>
      </div>
    </header>
  );
}
