"use client";

import { useEffect, useState } from "react";
import { CalendarCheck, Wallet, Clock3 } from "lucide-react";
import BookingForm from "@/components/BookingForm";
import { getCurrentUser } from "@/lib/auth";
import { cn } from "@/lib/cn";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";

const perks = [
  {
    icon: CalendarCheck,
    iconClass: "text-lime-600 dark:text-lime-400",
    title: "Easy Booking",
    description: "One simple form to book your preferred date and time",
  },
  {
    icon: Wallet,
    iconClass: "text-rush-blue-600 dark:text-rush-blue-400",
    title: "Flexible Payment",
    description: "Pay at venue or online. Instant confirmation either way.",
  },
  {
    icon: Clock3,
    iconClass: "text-lime-600 dark:text-lime-400",
    title: "Free Cancellation",
    description: "Cancel free up to 4 hours before your booking",
  },
];

interface Court {
  id: string;
  name: string;
}

export default function BookPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [courts, setCourts] = useState<Court[]>([]);
  const [selectedCourtId, setSelectedCourtId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [user, courtsRes] = await Promise.all([
        getCurrentUser(),
        fetch("/api/courts").then((r) => r.json()),
      ]);

      setUserId(user?.id ?? null);
      setCourts(courtsRes.courts ?? []);
      setSelectedCourtId(courtsRes.courts?.[0]?.id ?? null);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold font-display mb-2 text-text-primary">Book Your Court</h2>
      <p className="text-text-muted mb-8">Fill in the details below to reserve your pickleball court slot</p>

      {!loading && !userId && (
        <div className="mb-6 p-4 rounded-lg border-2 border-rush-blue-200 dark:border-rush-blue-800/60 bg-rush-blue-50 dark:bg-rush-blue-950/40 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-rush-blue-900 dark:text-rush-blue-200">
            Booking as a guest. Have an account? Log in to keep a history of your bookings.
          </p>
          <Button href="/login" variant="soft" size="sm">
            Log In
          </Button>
        </div>
      )}

      <Card padding="lg">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-1/2" />
          </div>
        ) : !selectedCourtId ? (
          <p className="text-danger-700 dark:text-danger-400">
            No court is configured yet. Please contact the venue.
          </p>
        ) : (
          <div className="space-y-8">
            {/* Court - section 1, same numbered style as the rest of the
                form below it, so the order (court -> date -> time -> ...)
                reads as one continuous flow. */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold font-display uppercase">1. Pick a court</h3>
              {courts.length > 1 ? (
                <div className="flex gap-2 flex-wrap">
                  {courts.map((court) => (
                    <button
                      key={court.id}
                      type="button"
                      onClick={() => setSelectedCourtId(court.id)}
                      className={cn(
                        "px-4 py-2 rounded-lg font-bold text-sm transition-colors border-2",
                        selectedCourtId === court.id
                          ? "bg-action-primary border-ink text-text-on-action"
                          : "bg-surface-sunken border-border-default text-text-muted hover:border-lime-400"
                      )}
                    >
                      {court.name}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-text-primary font-semibold">{courts[0]?.name}</p>
              )}
            </div>

            {/* Remount on court change - date/slot selections are
                court-specific and shouldn't carry over when switching. */}
            <BookingForm key={selectedCourtId} courtId={selectedCourtId} userId={userId} />
          </div>
        )}
      </Card>

      <RevealGroup className="mt-8 grid md:grid-cols-3 gap-6">
        {perks.map((perk) => (
          <RevealItem key={perk.title}>
            <Card padding="md" className="h-full">
              <perk.icon className={`w-8 h-8 mb-2 ${perk.iconClass}`} aria-hidden="true" />
              <h3 className="font-display uppercase text-text-primary mb-2">{perk.title}</h3>
              <p className="text-sm text-text-muted">{perk.description}</p>
            </Card>
          </RevealItem>
        ))}
      </RevealGroup>
    </div>
  );
}
