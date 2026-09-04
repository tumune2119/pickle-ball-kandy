import ThemeToggle from "@/components/ThemeToggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-linear-to-br from-purple-600 to-purple-800 flex items-center justify-center px-4">
      <ThemeToggle variant="on-color" className="absolute top-4 right-4" />
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-lg shadow-xl p-8">
        {children}
      </div>
    </div>
  );
}
