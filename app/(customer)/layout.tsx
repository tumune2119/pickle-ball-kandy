import ThemeToggle from "@/components/ThemeToggle";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="py-6 border-b border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Account</h1>
          <ThemeToggle />
        </header>

        {/* Main Content */}
        <main className="py-8">{children}</main>
      </div>
    </div>
  );
}
