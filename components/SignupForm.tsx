"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Input, Checkbox } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import GoogleButton from "@/components/ui/GoogleButton";

export default function SignupForm() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          phone: formData.phone,
          fullName: formData.fullName,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Signup failed");
        return;
      }

      setSuccess(true);
      // Redirect to login after 2 seconds
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md text-center"
      >
        <motion.div
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.4, delay: 0.1, type: "spring", stiffness: 200 }}
          className="w-20 h-20 mx-auto mb-4 rounded-full bg-success-100 dark:bg-success-900/40 flex items-center justify-center"
        >
          <CheckCircle2 className="w-12 h-12 text-success-700 dark:text-success-300" aria-hidden="true" />
        </motion.div>
        <h1 className="text-3xl font-display uppercase text-success-700 dark:text-success-300 mb-2 skew-display">Account Created!</h1>
        <p className="text-text-muted mb-6">
          Welcome to Pickle Rush! You can now login with your credentials.
        </p>
        <Button href="/login" variant="lime">
          Go to Login →
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <h1 className="text-3xl font-display uppercase text-text-primary mb-2 skew-display">Create Account</h1>
      <p className="text-text-muted mb-8">Join us and book your first court session</p>

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
          label="Full Name"
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          placeholder="John Doe"
          required
        />

        <Input
          label="Email Address"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="you@example.com"
          required
        />

        <Input
          label="Phone Number"
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="+94 71 234 5678"
          required
        />

        <Input
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
          required
          hint="Minimum 8 characters, include uppercase, lowercase, and numbers"
        />

        <Input
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="••••••••"
          required
        />

        <label className="flex items-center">
          <Checkbox required />
          <span className="ml-2 text-sm text-text-muted">
            I agree to the{" "}
            <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-lime-600 dark:text-lime-400 hover:text-lime-700 dark:hover:text-lime-300 font-bold">
              Terms of Service
            </a>
          </span>
        </label>

        <Button type="submit" variant="lime" loading={loading} fullWidth size="lg">
          {loading ? "Creating account..." : "Create Account"}
        </Button>
      </form>

      <div className="flex items-center gap-3 my-6">
        <div className="h-px flex-1 bg-border-subtle" />
        <span className="text-xs text-text-faint">OR</span>
        <div className="h-px flex-1 bg-border-subtle" />
      </div>

      <GoogleButton label="Sign up with Google" />

      <p className="text-text-muted text-center mt-6">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-lime-600 dark:text-lime-400 hover:text-lime-700 dark:hover:text-lime-300 font-bold"
        >
          Login here
        </Link>
      </p>
    </div>
  );
}
