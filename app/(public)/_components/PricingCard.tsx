import { formatCurrency } from "@/lib/utils";

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
    <div
      className={`rounded-lg border-2 p-6 sm:p-8 transition ${
        highlighted
          ? "border-purple-600 bg-purple-50 dark:bg-purple-950/40 shadow-lg transform scale-105"
          : "border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 hover:shadow-lg"
      }`}
    >
      {highlighted && (
        <div className="mb-4 inline-block bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
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
            <span className="text-green-500 dark:text-green-400 mr-3">✓</span>
            <span className="text-gray-700 dark:text-gray-300 text-sm">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        className={`w-full py-3 rounded-lg font-semibold transition ${
          highlighted
            ? "bg-purple-600 text-white hover:bg-purple-700"
            : "bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-white/10"
        }`}
      >
        Book Now
      </button>
    </div>
  );
}
