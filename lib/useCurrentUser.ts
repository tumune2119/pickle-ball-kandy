"use client";

import { useEffect, useState } from "react";
import { getSession } from "@/lib/auth";

export interface CurrentUser {
  fullName: string;
  email: string;
  role: "customer" | "staff" | "admin";
}

// The signed-in user's own profile (name/email/role) for UI that needs more
// than useAuthUser's bare Supabase identity - e.g. initials for an avatar.
// Returns undefined while loading, null when signed out or on error.
export function useCurrentUser(): CurrentUser | null | undefined {
  const [user, setUser] = useState<CurrentUser | null | undefined>(undefined);

  useEffect(() => {
    let active = true;

    (async () => {
      const session = await getSession();
      if (!session) {
        if (active) setUser(null);
        return;
      }

      const res = await fetch("/api/users/me", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!active) return;

      if (!res.ok) {
        setUser(null);
        return;
      }

      const data = await res.json();
      setUser(
        data.user ? { fullName: data.user.fullName, email: data.user.email, role: data.user.role } : null
      );
    })();

    return () => {
      active = false;
    };
  }, []);

  return user;
}

// "Tharindu Munasinghe" -> "TM". Falls back to the first one or two letters
// of a single-word name, and "?" if there's nothing to work with.
export function getInitials(fullName: string | undefined | null): string {
  if (!fullName) return "?";
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
