"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { supabase } from "@/lib/auth";
import { Input } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import GoogleButton from "@/components/ui/GoogleButton";

export default function LoginForm() {
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

      // The API route validates credentials server-side with the service
      // role client, but that doesn't touch the browser's Supabase client -
      // without this, the client-side session never gets established and
      // every page that checks getCurrentUser() would think we're logged out.
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      });
      if (sessionError) {
        setError(sessionError.message);
        return;
      }

      window.location.href = "/dashboard";
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <h1 className="text-3xl font-bold font-display text-text-primary mb-2">Welcome Back</h1>
      <p className="text-text-muted mb-8">Login to your account to access bookings</p>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex items-start gap-2 bg-danger-100 dark:bg-danger-900/40 border border-danger-300 dark:border-danger-800/60 text-danger-800 dark:text-danger-300 px-4 py-3 rounded-lg mb-6">
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
        />

        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />

        <Button type="submit" loading={loading} fullWidth size="lg">
          {loading ? "Logging in..." : "Login"}
        </Button>
      </form>

      <div className="flex items-center gap-3 my-6">
        <div className="h-px flex-1 bg-border-subtle" />
        <span className="text-xs text-text-faint">OR</span>
        <div className="h-px flex-1 bg-border-subtle" />
      </div>

      <GoogleButton label="Continue with Google" />

      <p className="text-text-muted text-center mt-6">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="text-sage-600 dark:text-sage-400 hover:text-sage-700 dark:hover:text-sage-300 font-bold"
        >
          Sign up here
        </Link>
      </p>
      <p className="text-text-faint text-center text-sm mt-2">
        <Link href="/admin/login" className="hover:text-text-muted">
          Staff login →
        </Link>
      </p>
    </div>
  );
}
