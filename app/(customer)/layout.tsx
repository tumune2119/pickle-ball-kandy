"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, Home } from "lucide-react";
import { supabase } from "@/lib/auth";
import { useAuthUser } from "@/lib/useAuthUser";
import ThemeToggle from "@/components/ThemeToggle";
import PageBackdrop from "@/components/ui/PageBackdrop";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useAuthUser();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-page">
      <PageBackdrop />
      {/* Header */}
      <header className="border-b-2 border-border-default bg-surface/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold text-text-muted hover:bg-surface-sunken hover:text-text-primary transition-colors"
            >
              <Home className="w-4 h-4" aria-hidden="true" />
              Home
            </Link>
            <h1 className="text-2xl md:text-3xl font-display uppercase text-text-primary skew-display">My Account</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold text-text-muted hover:bg-surface-sunken hover:text-text-primary transition-colors"
              >
                <LogOut className="w-4 h-4" aria-hidden="true" />
                Logout
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <main className="py-8">{children}</main>
      </div>
    </div>
  );
}
