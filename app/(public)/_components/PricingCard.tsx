import { Check } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

interface PricingTierProps {
  title: string;
  description: string;
  price: number;
  timeRange: string;
  features: string[];
  highlighted?: boolean;
}

export default function PricingCard({
  title,
  description,
  price,
  timeRange,
  features,
  highlighted = false,
}: PricingTierProps) {
  return (
    <Card
      poster
      hover
      padding="lg"
      tint={highlighted ? "brand" : "neutral"}
      className={highlighted ? "md:scale-105 relative" : "relative"}
    >
      {highlighted && (
        <div className="absolute -top-3 -right-3 bg-action-lime text-text-on-lime border-2 border-ink rounded-full px-3 py-1 text-xs font-bold uppercase -rotate-6 shadow-[2px_2px_0_var(--color-ink)]">
          Most Popular
        </div>
      )}

      <h3 className="text-2xl font-display uppercase mb-2">{title}</h3>
      <p className="text-text-muted mb-6 text-sm">{description}</p>

      <div className="mb-6">
        <span className="font-mono text-4xl font-bold tabular-nums">{formatCurrency(price)}</span>
        <span className="text-text-muted ml-2">/ hour</span>
      </div>

      <p className="text-sm text-text-primary mb-6 font-bold">{timeRange}</p>

      <ul className="space-y-3 mb-8">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-start">
            <Check className="w-5 h-5 text-lime-600 dark:text-lime-400 mr-3 shrink-0" aria-hidden="true" />
            <span className="text-text-muted text-sm">{feature}</span>
          </li>
        ))}
      </ul>

      <Button variant={highlighted ? "lime" : "secondary"} fullWidth size="md">
        Book Now
      </Button>
    </Card>
  );
}
