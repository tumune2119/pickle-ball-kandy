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
    <div className="min-h-screen flex flex-col">
      <PageBackdrop />
      <Navigation />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}
