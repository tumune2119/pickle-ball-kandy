"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Clock, Target, Wallet, XCircle, Save, CheckCircle2, AlertCircle } from "lucide-react";
import { getSession } from "@/lib/auth";
import { cn } from "@/lib/cn";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import Skeleton from "@/components/ui/Skeleton";

interface Court {
  id: string;
  name: string;
}

interface SettingsFormData {
  openingTime: string;
  closingTime: string;
  slotDuration: number;
  offPeakRate: number;
  peakRate: number;
  cancellationHours: number;
}

const DEFAULT_FORM: SettingsFormData = {
  openingTime: "06:00",
  closingTime: "22:00",
  slotDuration: 60,
  offPeakRate: 1500,
  peakRate: 2500,
  cancellationHours: 4,
};

export default function AdminSettingsPage() {
  const [courts, setCourts] = useState<Court[]>([]);
  const [selectedCourtId, setSelectedCourtId] = useState<string | null>(null);
  const [formData, setFormData] = useState<SettingsFormData>(DEFAULT_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Court list, fetched once.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/courts")
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setCourts(data.courts ?? []);
        setSelectedCourtId((prev) => prev ?? data.courts?.[0]?.id ?? null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Real current settings for whichever court is selected - replaces the
  // old hardcoded useState defaults, which never reflected what was
  // actually saved (the Save button didn't call the API at all before this).
  useEffect(() => {
    if (!selectedCourtId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      const session = await getSession();
      if (!session) {
        if (!cancelled) setLoading(false);
        return;
      }
      const res = await fetch("/api/admin/settings", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "X-Court-ID": selectedCourtId,
        },
      });
      if (cancelled) return;
      if (res.ok) {
        const data = await res.json();
        setFormData({
          openingTime: data.courtInfo?.openingTime?.slice(0, 5) ?? DEFAULT_FORM.openingTime,
          closingTime: data.courtInfo?.closingTime?.slice(0, 5) ?? DEFAULT_FORM.closingTime,
          slotDuration: data.courtInfo?.slotDuration ?? DEFAULT_FORM.slotDuration,
          offPeakRate: data.pricing?.offPeakRate ?? DEFAULT_FORM.offPeakRate,
          peakRate: data.pricing?.peakRate ?? DEFAULT_FORM.peakRate,
          cancellationHours: Number(data.settings?.cancellation_policy_hours ?? DEFAULT_FORM.cancellationHours),
        });
      } else {
        setError("Failed to load settings for this court.");
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedCourtId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: isNaN(Number(value)) ? value : Number(value),
    }));
  };

  const handleSave = async () => {
    if (!selectedCourtId) return;
    setSaving(true);
    setError("");
    try {
      const session = await getSession();
      if (!session) {
        setError("Your session has expired. Please log in again.");
        return;
      }
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          courtId: selectedCourtId,
          courtHours: {
            openingTime: formData.openingTime,
            closingTime: formData.closingTime,
            slotDuration: formData.slotDuration,
          },
          pricing: {
            offPeakRate: formData.offPeakRate,
            peakRate: formData.peakRate,
          },
          settings: {
            cancellation_policy_hours: formData.cancellationHours,
          },
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to save settings");
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-bold mb-2 text-text-primary">Court Settings</h2>

      {courts.length > 1 && (
        <div className="flex gap-2 flex-wrap mb-6">
          {courts.map((court) => (
            <button
              key={court.id}
              type="button"
              onClick={() => setSelectedCourtId(court.id)}
              className={cn(
                "px-4 py-2 rounded-lg font-semibold text-sm transition-colors",
                selectedCourtId === court.id
                  ? "bg-admin-action text-admin-text-on-action"
                  : "bg-admin-surface text-admin-text-muted hover:bg-admin-bg border border-admin-border"
              )}
            >
              {court.name}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Operating Hours */}
          <Card padding="md">
            <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-admin-action" aria-hidden="true" />
              Operating Hours
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Opening Time"
                type="time"
                name="openingTime"
                value={formData.openingTime}
                onChange={handleChange}
                className="focus:ring-admin-action"
              />
              <Input
                label="Closing Time"
                type="time"
                name="closingTime"
                value={formData.closingTime}
                onChange={handleChange}
                className="focus:ring-admin-action"
              />
            </div>
          </Card>

          {/* Slot Configuration */}
          <Card padding="md">
            <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-admin-action" aria-hidden="true" />
              Slot Configuration
            </h3>
            <Select
              label="Slot Duration (minutes)"
              name="slotDuration"
              value={formData.slotDuration}
              onChange={handleChange}
              className="focus:ring-admin-action"
            >
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
              <option value={90}>1.5 hours</option>
              <option value={120}>2 hours</option>
            </Select>
          </Card>

          {/* Pricing */}
          <Card padding="md">
            <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-admin-action" aria-hidden="true" />
              Pricing
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Off-Peak Rate (6 AM - 5 PM) LKR/hour"
                type="number"
                name="offPeakRate"
                value={formData.offPeakRate}
                onChange={handleChange}
                className="focus:ring-admin-action"
              />
              <Input
                label="Peak Rate (5 PM - 10 PM) LKR/hour"
                type="number"
                name="peakRate"
                value={formData.peakRate}
                onChange={handleChange}
                className="focus:ring-admin-action"
              />
            </div>
          </Card>

          {/* Cancellation Policy */}
          <Card padding="md">
            <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-admin-action" aria-hidden="true" />
              Cancellation Policy
            </h3>
            <Input
              label="Free Cancellation Window (hours before)"
              type="number"
              name="cancellationHours"
              value={formData.cancellationHours}
              onChange={handleChange}
              hint="Customers can cancel free if they cancel this many hours before booking"
              className="focus:ring-admin-action"
            />
          </Card>

          {error && (
            <div className="flex items-center gap-2 text-danger-700 dark:text-danger-300 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
              {error}
            </div>
          )}

          {/* Save Button & Status */}
          <div className="flex items-center gap-4">
            <Button tone="admin" size="lg" onClick={handleSave} loading={saving} disabled={saving}>
              <Save className="w-4 h-4" aria-hidden="true" />
              Save Settings
            </Button>
            <AnimatePresence>
              {saved && (
                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-2 text-success-700 dark:text-success-400 font-semibold"
                >
                  <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
                  Settings saved successfully!
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
