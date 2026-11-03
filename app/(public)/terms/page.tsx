import Card from "@/components/ui/Card";
import { COURT_NAME } from "@/lib/constants";

export const metadata = {
  title: "Terms of Service - Pickle Rush",
};

export default function TermsPage() {
  return (
    <section className="max-w-3xl mx-auto px-4 py-16 md:py-20">
      <h1 className="text-3xl md:text-4xl font-display uppercase mb-4 skew-display">Terms of Service</h1>
      <Card poster padding="md" tint="warning" className="mb-8">
        <p className="text-sm text-text-primary">
          This is a placeholder draft, not a finished legal document. It needs review by a
          qualified lawyer before {COURT_NAME} relies on it.
        </p>
      </Card>
      <div className="space-y-6 text-text-muted leading-relaxed">
        <p>
          By creating an account or booking a court with {COURT_NAME}, you agree to follow the
          booking, cancellation, and conduct rules shown to you at the time of booking and on
          this site.
        </p>
        <p>
          Bookings are held for the player who made them. Court access, cancellation windows,
          and pricing are those shown in your booking confirmation and in your account&apos;s
          booking history.
        </p>
        <p>
          We may update these terms as the business grows. Material changes will be reflected
          here before they take effect.
        </p>
      </div>
    </section>
  );
}
