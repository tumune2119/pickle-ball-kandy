interface AmenityProps {
  icon: string;
  title: string;
  description: string;
}

export default function AmenityCard({
  icon,
  title,
  description,
}: AmenityProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-white/10 hover:shadow-lg transition text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm">{description}</p>
    </div>
  );
}
