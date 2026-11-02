import type { LucideIcon } from "lucide-react";
import Card from "@/components/ui/Card";

interface AmenityProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export default function AmenityCard({ icon: Icon, title, description }: AmenityProps) {
  return (
    <Card hover glass padding="lg" className="text-center h-full">
      <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-sage-50 dark:bg-sage-950/40 flex items-center justify-center">
        <Icon className="w-7 h-7 text-sage-600 dark:text-sage-400" aria-hidden="true" />
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm">{description}</p>
    </Card>
  );
}
