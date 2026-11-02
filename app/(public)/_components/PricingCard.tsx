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
      hover={!highlighted}
      glass
      padding="lg"
      tint={highlighted ? "brand" : "neutral"}
      className={
        highlighted
          ? "border-2 border-sage-600 shadow-lg shadow-sage-600/10 md:scale-105 relative"
          : "border-2"
      }
    >
      {highlighted && (
        <div className="mb-4 inline-block bg-sage-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
          Most Popular
        </div>
      )}

      <h3 className="text-2xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">{description}</p>

      <div className="mb-6">
        <span className="text-4xl font-bold">{formatCurrency(price)}</span>
        <span className="text-gray-600 dark:text-gray-400 ml-2">/ hour</span>
      </div>

      <p className="text-sm text-gray-700 dark:text-gray-300 mb-6 font-semibold">{timeRange}</p>

      <ul className="space-y-3 mb-8">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-start">
            <Check className="w-5 h-5 text-green-500 dark:text-green-400 mr-3 shrink-0" aria-hidden="true" />
            <span className="text-gray-700 dark:text-gray-300 text-sm">{feature}</span>
          </li>
        ))}
      </ul>

      <Button variant={highlighted ? "primary" : "secondary"} fullWidth size="md">
        Book Now
      </Button>
    </Card>
  );
}
