"use client";

import { useEffect, useState } from "react";
import { getSession } from "@/lib/auth";

// The DB role ("admin" | "staff") for the signed-in admin-area user, used to
// show/hide admin-only UI (Settings/Reports nav items, the pages themselves).
// This is a UX convenience only, same as AdminAuthGate's own role check - the
// real boundary is requireAdminOnly on the API routes themselves.
//
// Returns undefined while loading, null if it couldn't be determined.
export function useAdminRole(): "admin" | "staff" | null | undefined {
  const [role, setRole] = useState<"admin" | "staff" | null | undefined>(undefined);

  useEffect(() => {
    let active = true;

    (async () => {
      const session = await getSession();
      if (!session) {
        if (active) setRole(null);
        return;
      }

      const res = await fetch("/api/users/me", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!active) return;

      if (!res.ok) {
        setRole(null);
        return;
      }

      const data = await res.json();
      setRole(data.user?.role === "admin" || data.user?.role === "staff" ? data.user.role : null);
    })();

    return () => {
      active = false;
    };
  }, []);

  return role;
}
