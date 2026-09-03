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
    <div className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-lg transition text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}
