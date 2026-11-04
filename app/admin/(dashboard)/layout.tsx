import ThemeToggle from "@/components/ThemeToggle";
import AdminAuthGate from "@/components/AdminAuthGate";
import AdminSidebarNav from "@/components/AdminSidebarNav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthGate>
      <div className="min-h-screen bg-admin-bg print:bg-white">
        {/* Admin Header - same bordered/display-font signature as the main
            site nav, not a full-bleed color fill (keeps lime as an accent,
            not a background, per the brand's "less color used to fill
            backgrounds" rule). */}
        <header className="bg-admin-surface border-b-2 border-ink print:hidden">
          <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-display uppercase text-admin-text skew-display">Admin Dashboard</h1>
              <p className="text-admin-text-muted mt-1 text-sm sm:text-base">Court Management System</p>
            </div>
            <ThemeToggle />
          </div>
        </header>

        {/* Admin Sidebar + Content - flex rather than a fixed grid fraction
            so the sidebar's own collapsed/expanded width (see
            AdminSidebarNav) determines the split, and content (tables
            especially) gets the rest instead of a fixed 3/4 share. */}
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8 print:p-0 print:max-w-none">
          <div className="flex flex-col md:flex-row gap-6 print:block">
            {/* Sidebar */}
            <nav className="print:hidden">
              <AdminSidebarNav />
            </nav>

            {/* Main Content */}
            <main className="flex-1 min-w-0 print:col-span-4">{children}</main>
          </div>
        </div>
      </div>
    </AdminAuthGate>
  );
}
