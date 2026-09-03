export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="py-6 border-b border-gray-200 bg-white">
          <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
        </header>

        {/* Main Content */}
        <main className="py-8">{children}</main>
      </div>
    </div>
  );
}
