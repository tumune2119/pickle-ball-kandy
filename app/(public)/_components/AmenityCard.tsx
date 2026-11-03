import type { LucideIcon } from "lucide-react";

interface AmenityProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

// An editorial list row, not an icon-topped card tile - nine identical
// bordered boxes in a grid reads as filler; a list with a small stamp-style
// icon mark reads as content.
export default function AmenityCard({ icon: Icon, title, description }: AmenityProps) {
  return (
    <div className="flex gap-4 py-5 border-b-2 border-border-subtle">
      <div className="w-11 h-11 shrink-0 rounded-md border-2 border-ink bg-highlight flex items-center justify-center">
        <Icon className="w-5 h-5 text-lime-800 dark:text-lime-300" aria-hidden="true" />
      </div>
      <div>
        <h3 className="font-display uppercase text-lg text-text-primary">{title}</h3>
        <p className="text-text-muted text-sm mt-0.5">{description}</p>
      </div>
    </div>
  );
}
