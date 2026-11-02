import Navigation from "./_components/Navigation";
import Footer from "./_components/Footer";
import PageBackdrop from "@/components/ui/PageBackdrop";

export const metadata = {
  title: "Pickle Rush - Pickleball Booking",
  description:
    "Sri Lanka's first dedicated pickleball court in Kandy. Book your slot now and experience the fastest growing racquet sport!",
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Warm cream background for the editorial rebrand (admin keeps the
    // shared neutral bg-page token - this is a local override, not a
    // change to that token).
    <div className="min-h-screen flex flex-col bg-cream-100 dark:bg-gray-950">
      <PageBackdrop />
      <Navigation />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}
