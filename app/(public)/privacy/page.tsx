import Card from "@/components/ui/Card";
import { COURT_NAME } from "@/lib/constants";

export const metadata = {
  title: "Privacy Policy - Pickle Rush",
};

export default function PrivacyPage() {
  return (
    <section className="max-w-3xl mx-auto px-4 py-16 md:py-20">
      <h1 className="text-3xl md:text-4xl font-display uppercase mb-4 skew-display">Privacy Policy</h1>
      <Card poster padding="md" tint="warning" className="mb-8">
        <p className="text-sm text-text-primary">
          This is a placeholder draft, not a finished legal document. It needs review by a
          qualified lawyer before {COURT_NAME} relies on it.
        </p>
      </Card>
      <div className="space-y-6 font-editorial text-text-muted leading-relaxed">
        <p>
          When you create an account or make a booking with {COURT_NAME}, we collect your name,
          email, phone number, and booking details so we can confirm and manage your court
          time.
        </p>
        <p>
          Payment is processed through our payment gateway; we do not store your card details
          ourselves.
        </p>
        <p>
          We do not sell your personal information. We use it to run bookings, contact you
          about your reservations, and improve the service.
        </p>
        <p>
          To ask about, correct, or delete the information we hold about you, contact us using
          the details on our Contact page.
        </p>
      </div>
    </section>
  );
}
