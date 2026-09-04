"use client";

import { useState } from "react";
import Link from "next/link";

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
      <div className="w-full max-w-md text-center">
        <div className="text-6xl mb-4">✓</div>
        <h1 className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
          Account Created!
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Welcome to Kandy 1st Court! You can now login with your credentials.
        </p>
        <Link
          href="/login"
          className="inline-block bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold transition"
        >
          Go to Login →
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create Account</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">Join us and book your first court session</p>

      {error && (
        <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-red-800 dark:text-red-300 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Full Name
          </label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="John Doe"
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-white/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 dark:focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-white/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 dark:focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+94 71 234 5678"
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-white/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 dark:focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-white/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 dark:focus:ring-purple-500"
          />
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Minimum 8 characters, include uppercase, lowercase, and numbers
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Confirm Password
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="••••••••"
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-white/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 dark:focus:ring-purple-500"
          />
        </div>

        <label className="flex items-center">
          <input type="checkbox" required className="w-4 h-4 rounded" />
          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
            I agree to the{" "}
            <a href="#" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-bold">
              Terms of Service
            </a>
          </span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white px-4 py-3 rounded-lg font-bold transition"
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <p className="text-gray-600 dark:text-gray-400 text-center mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-bold">
          Login here
        </Link>
      </p>
    </div>
  );
}
