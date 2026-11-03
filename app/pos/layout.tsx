import AdminAuthGate from "@/components/AdminAuthGate";
import PosHeader from "@/components/pos/PosHeader";

// Deliberately no sidebar, no admin chrome - a true kiosk screen for the
// counter PC. Gated the same way as /admin/(dashboard) (staff or admin).
export default function PosLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthGate>
      <div className="min-h-screen bg-admin-bg text-admin-text flex flex-col">
        <PosHeader />
        <main className="flex-grow p-4 md:p-6">{children}</main>
      </div>
    </AdminAuthGate>
  );
}
