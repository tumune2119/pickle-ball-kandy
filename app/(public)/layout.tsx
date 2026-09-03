import Navigation from "./_components/Navigation";
import Footer from "./_components/Footer";

export const metadata = {
  title: "Kandy 1st Court - Pickleball Booking",
  description:
    "Sri Lanka's first dedicated pickleball court in Kandy. Book your slot now and experience the fastest growing racquet sport!",
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navigation />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}
