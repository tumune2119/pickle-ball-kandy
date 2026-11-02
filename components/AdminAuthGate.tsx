"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/auth";
import Spinner from "@/components/ui/Spinner";

// This app has no cookie/middleware-based session (see DEVELOPER_GUIDE.md's
// authentication model) - the Supabase session only exists in the browser's
// own storage. That means this gate can only run client-side; there is no
// server-rendered admin page that could enforce this before first paint.
// The actual enforcement customers can't bypass lives in the API routes
// (requireAdmin, in lib/server-auth.ts) - this gate is about not flashing
// the admin UI at someone who isn't allowed to use it, not about being the
// security boundary itself.
export default function AdminAuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const session = await getSession();
      if (!session) {
        router.replace("/admin/login");
        return;
      }

      const res = await fetch("/api/users/me", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (cancelled) return;

      if (!res.ok) {
        router.replace("/admin/login");
        return;
      }

      const data = await res.json();
      if (data.user?.role !== "admin" && data.user?.role !== "staff") {
        router.replace("/admin/login");
        return;
      }

      setAllowed(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!allowed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-page text-blue-600 dark:text-blue-400">
        <Spinner size="lg" />
        <p className="text-gray-600 dark:text-gray-400">Checking access…</p>
      </div>
    );
  }

  return <>{children}</>;
}
