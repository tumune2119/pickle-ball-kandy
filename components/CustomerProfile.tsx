"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, BarChart3, Settings, Lock, KeyRound, LogOut, Trash2, MessageCircle, Pencil, Check } from "lucide-react";
import { getSession, supabase } from "@/lib/auth";
import Card, { type CardTint } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import { Checkbox } from "@/components/ui/Input";

interface Me {
  fullName: string;
  email: string;
  phoneNumber: string;
}

interface Booking {
  status: string;
  bookingDate: string;
  startTime: string;
}

export default function CustomerProfile() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [signedOut, setSignedOut] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // scope: "local" signs out just this browser, "global" invalidates every
  // session for this account - what the "Logout from All Devices" button
  // actually needs, not just a label.
  const handleLogout = async (scope: "local" | "global") => {
    setLoggingOut(true);
    await supabase.auth.signOut({ scope });
    router.push("/");
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const session = await getSession();
      if (!session) {
        if (!cancelled) {
          setSignedOut(true);
          setLoading(false);
        }
        return;
      }
      const authHeaders = { Authorization: `Bearer ${session.access_token}` };
      const [meRes, bookingsRes] = await Promise.all([
        fetch("/api/users/me", { headers: authHeaders }),
        fetch("/api/bookings", { headers: authHeaders }),
      ]);
      const meData = await meRes.json();
      const bookingsData = await bookingsRes.json();
      if (!cancelled) {
        if (meRes.ok) setMe(meData.user);
        if (bookingsRes.ok) setBookings(bookingsData.bookings ?? []);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (signedOut) {
    return (
      <Card glass padding="md" className="text-center">
        <p className="text-gray-600 dark:text-gray-400 mb-4">Log in to see your profile.</p>
        <Button href="/login">Log In</Button>
      </Card>
    );
  }

  const now = new Date();
  const completed = bookings.filter(
    (b) => b.status !== "cancelled" && new Date(`${b.bookingDate}T${b.startTime}`) < now
  ).length;
  const upcoming = bookings.filter(
    (b) => b.status !== "cancelled" && new Date(`${b.bookingDate}T${b.startTime}`) >= now
  ).length;
  const cancelled = bookings.filter((b) => b.status === "cancelled").length;

  const stats: { tint: CardTint; label: string; value: number }[] = [
    { tint: "brand", label: "Total Bookings", value: bookings.length },
    { tint: "success", label: "Completed", value: completed },
    { tint: "warning", label: "Upcoming", value: upcoming },
    { tint: "danger", label: "Cancelled", value: cancelled },
  ];

  return (
    <div className="space-y-6">
      {/* Profile Info */}
      <Card glass padding="md">
        <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
          <User className="w-5 h-5" aria-hidden="true" />
          Personal Information
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
            {loading ? (
              <Skeleton className="h-9 w-full" />
            ) : (
              <p className="px-4 py-2 bg-surface-sunken rounded-lg text-text-primary">{me?.fullName}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
            {loading ? (
              <Skeleton className="h-9 w-full" />
            ) : (
              <p className="px-4 py-2 bg-surface-sunken rounded-lg text-text-primary">{me?.email}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
            {loading ? (
              <Skeleton className="h-9 w-full" />
            ) : (
              <p className="px-4 py-2 bg-surface-sunken rounded-lg text-text-primary">{me?.phoneNumber}</p>
            )}
          </div>
          <Button variant="ghost" size="sm" className="px-0 justify-start text-sage-600 dark:text-sage-400 hover:bg-transparent hover:text-sage-700 dark:hover:text-sage-300">
            <Pencil className="w-4 h-4" aria-hidden="true" />
            Edit Profile
          </Button>
        </div>
      </Card>

      {/* Booking Statistics */}
      <Card glass padding="md">
        <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" aria-hidden="true" />
          Booking Statistics
        </h3>
        {loading ? (
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat) => (
              <Card key={stat.label} tint={stat.tint} glass padding="sm">
                <p className="text-sage-700 dark:text-sage-300 font-semibold text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-sage-600 dark:text-sage-400 mt-1">{stat.value}</p>
              </Card>
            ))}
          </div>
        )}
      </Card>

      {/* Preferences */}
      <Card glass padding="md">
        <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5" aria-hidden="true" />
          Preferences
        </h3>
        <div className="space-y-4">
          <label className="flex items-center">
            <Checkbox defaultChecked />
            <span className="ml-3 text-gray-700 dark:text-gray-300">Receive booking reminders via email</span>
          </label>
          <label className="flex items-center">
            <Checkbox defaultChecked />
            <span className="ml-3 text-gray-700 dark:text-gray-300">Receive SMS reminders 24 hours before</span>
          </label>
          <label className="flex items-center">
            <Checkbox />
            <span className="ml-3 text-gray-700 dark:text-gray-300">Subscribe to special offers and promotions</span>
          </label>
          <Button variant="ghost" size="sm" className="px-0 justify-start mt-4 text-sage-600 dark:text-sage-400 hover:bg-transparent hover:text-sage-700 dark:hover:text-sage-300">
            <Check className="w-4 h-4" aria-hidden="true" />
            Save Preferences
          </Button>
        </div>
      </Card>

      {/* Account Actions */}
      <Card glass padding="md">
        <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5" aria-hidden="true" />
          Account
        </h3>
        <div className="space-y-3">
          <button className="w-full flex items-center gap-3 text-left px-4 py-3 bg-surface-sunken hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg text-sage-600 dark:text-sage-400 font-semibold transition-colors">
            <KeyRound className="w-4 h-4" aria-hidden="true" />
            Change Password
          </button>
          <button
            onClick={() => handleLogout("global")}
            disabled={loggingOut}
            className="w-full flex items-center gap-3 text-left px-4 py-3 bg-surface-sunken hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg text-sage-600 dark:text-sage-400 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
            {loggingOut ? "Logging out..." : "Logout from All Devices"}
          </button>
          <button className="w-full flex items-center gap-3 text-left px-4 py-3 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg text-red-600 dark:text-red-400 font-semibold transition-colors">
            <Trash2 className="w-4 h-4" aria-hidden="true" />
            Delete Account (Permanent)
          </button>
        </div>
      </Card>

      {/* Support */}
      <Card tint="brand" glass padding="md">
        <h3 className="font-bold text-text-primary mb-2 flex items-center gap-2">
          <MessageCircle className="w-5 h-5" aria-hidden="true" />
          Need Help?
        </h3>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Have questions about your bookings or account? Our support team is here to help.
        </p>
        <Button href="/contact">Contact Support</Button>
      </Card>
    </div>
  );
}
