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
    // Warm cream background for the editorial rebrand (admin keeps the
    // shared neutral bg-page token - this is a local override).
    <div className="min-h-screen bg-cream-100 dark:bg-gray-950">
      <PageBackdrop />
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-white/10 bg-cream-50/70 dark:bg-surface/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <Home className="w-4 h-4" aria-hidden="true" />
              Home
            </Link>
            <h1 className="text-3xl font-bold text-text-primary">My Account</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-colors"
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
