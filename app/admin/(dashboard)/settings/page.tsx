"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Clock, Target, Wallet, XCircle, Save, CheckCircle2 } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";

export default function AdminSettingsPage() {
  const [formData, setFormData] = useState({
    openingTime: "06:00",
    closingTime: "22:00",
    slotDuration: 60,
    maxPlayers: 4,
    offPeakRate: 1500,
    peakRate: 2500,
    cancellationHours: 4,
    refundPercentage: 100,
  });

  const [saved, setSaved] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: isNaN(Number(value)) ? value : Number(value),
    }));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    // Call API to save settings
  };

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-bold mb-8 text-text-primary">Court Settings</h2>

      <div className="space-y-6">
        {/* Operating Hours */}
        <Card padding="md">
          <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
            Operating Hours
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Opening Time"
              type="time"
              name="openingTime"
              value={formData.openingTime}
              onChange={handleChange}
              className="focus:ring-blue-600 dark:focus:ring-blue-500"
            />
            <Input
              label="Closing Time"
              type="time"
              name="closingTime"
              value={formData.closingTime}
              onChange={handleChange}
              className="focus:ring-blue-600 dark:focus:ring-blue-500"
            />
          </div>
        </Card>

        {/* Slot Configuration */}
        <Card padding="md">
          <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
            Slot Configuration
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Slot Duration (minutes)"
              name="slotDuration"
              value={formData.slotDuration}
              onChange={handleChange}
              className="focus:ring-blue-600 dark:focus:ring-blue-500"
            >
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
              <option value={90}>1.5 hours</option>
              <option value={120}>2 hours</option>
            </Select>
            <Select
              label="Max Players per Slot"
              name="maxPlayers"
              value={formData.maxPlayers}
              onChange={handleChange}
              className="focus:ring-blue-600 dark:focus:ring-blue-500"
            >
              <option value={2}>2 players</option>
              <option value={3}>3 players</option>
              <option value={4}>4 players</option>
              <option value={6}>6 players</option>
              <option value={8}>8 players</option>
            </Select>
          </div>
        </Card>

        {/* Pricing */}
        <Card padding="md">
          <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
            Pricing
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Off-Peak Rate (6 AM - 5 PM) LKR/hour"
              type="number"
              name="offPeakRate"
              value={formData.offPeakRate}
              onChange={handleChange}
              className="focus:ring-blue-600 dark:focus:ring-blue-500"
            />
            <Input
              label="Peak Rate (5 PM - 10 PM) LKR/hour"
              type="number"
              name="peakRate"
              value={formData.peakRate}
              onChange={handleChange}
              className="focus:ring-blue-600 dark:focus:ring-blue-500"
            />
          </div>
        </Card>

        {/* Cancellation Policy */}
        <Card padding="md">
          <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
            <XCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
            Cancellation Policy
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Free Cancellation Window (hours before)"
              type="number"
              name="cancellationHours"
              value={formData.cancellationHours}
              onChange={handleChange}
              hint="Customers can cancel free if they cancel this many hours before booking"
              className="focus:ring-blue-600 dark:focus:ring-blue-500"
            />
            <Select
              label="Refund Percentage (%)"
              name="refundPercentage"
              value={formData.refundPercentage}
              onChange={handleChange}
              className="focus:ring-blue-600 dark:focus:ring-blue-500"
            >
              <option value={0}>No refund</option>
              <option value={50}>50%</option>
              <option value={75}>75%</option>
              <option value={100}>100% (Full refund)</option>
            </Select>
          </div>
        </Card>

        {/* Save Button & Status */}
        <div className="flex items-center gap-4">
          <Button tone="admin" size="lg" onClick={handleSave}>
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
                className="flex items-center gap-2 text-green-600 dark:text-green-400 font-semibold"
              >
                <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
                Settings saved successfully!
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
