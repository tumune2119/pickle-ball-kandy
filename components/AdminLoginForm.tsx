"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/auth";
import { Input } from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login failed");
        return;
      }

      // Establish the browser session first (same as the customer login) -
      // requireAdmin/AdminAuthGate both need a real Supabase session on the
      // client, not just the API route's own service-role check.
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      });
      if (sessionError) {
        setError(sessionError.message);
        return;
      }

      // This login is staff-only - verify the role before letting them into
      // /admin, and sign back out if a customer account lands here.
      const meRes = await fetch("/api/users/me", {
        headers: { Authorization: `Bearer ${data.session.access_token}` },
      });
      const me = await meRes.json();

      if (!meRes.ok || (me.user?.role !== "admin" && me.user?.role !== "staff")) {
        await supabase.auth.signOut();
        setError("This login is for staff accounts only. Use the regular login instead.");
        return;
      }

      window.location.href = "/admin/dashboard";
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="flex items-center gap-2 mb-2">
        <ShieldCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" aria-hidden="true" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Staff Login</h1>
      </div>
      <p className="text-gray-600 dark:text-gray-400 mb-8">Sign in to manage bookings, customers, and settings</p>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex items-start gap-2 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-red-800 dark:text-red-300 px-4 py-3 rounded-lg mb-6">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{error}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          className="focus:ring-blue-600 dark:focus:ring-blue-500"
        />

        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          className="focus:ring-blue-600 dark:focus:ring-blue-500"
        />

        <Button type="submit" tone="admin" loading={loading} fullWidth size="lg">
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <p className="text-gray-600 dark:text-gray-400 text-center mt-6">
        Not staff?{" "}
        <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-bold">
          Customer login
        </Link>
      </p>
    </div>
  );
}
