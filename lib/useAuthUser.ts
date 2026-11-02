"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/auth";

// Reactive auth state for client components (Navigation, the customer
// layout, ...) - unlike a one-off getSession()/getCurrentUser() call, this
// also subscribes to Supabase's onAuthStateChange so the UI flips to the
// logged-in/out state immediately after login or logout, without needing a
// full page reload.
//
// Returns `undefined` while the initial check is in flight, `null` when
// signed out, or the Supabase User when signed in.
export function useAuthUser(): User | null | undefined {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    let active = true;

    supabase.auth.getUser().then(({ data }) => {
      if (active) setUser(data.user ?? null);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setUser(session?.user ?? null);
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  return user;
}
