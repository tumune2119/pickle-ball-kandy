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
          ? "border-blue-600 bg-blue-50 shadow-lg transform scale-105"
          : "border-gray-200 bg-white hover:shadow-lg"
      }`}
    >
      {highlighted && (
        <div className="mb-4 inline-block bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
          Most Popular
        </div>
      )}

      <h3 className="text-2xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 text-sm">{description}</p>

      <div className="mb-6">
        <span className="text-4xl font-bold">{formatCurrency(price)}</span>
        <span className="text-gray-600 ml-2">/ hour</span>
      </div>

      <p className="text-sm text-gray-700 mb-6 font-semibold">{timeRange}</p>

      <ul className="space-y-3 mb-8">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-start">
            <span className="text-green-500 mr-3">✓</span>
            <span className="text-gray-700 text-sm">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        className={`w-full py-3 rounded-lg font-semibold transition ${
          highlighted
            ? "bg-blue-600 text-white hover:bg-blue-700"
            : "bg-gray-100 text-gray-900 hover:bg-gray-200"
        }`}
      >
        Book Now
      </button>
    </div>
  );
}
