import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kandy 1st Court - Pickleball Booking Platform",
  description: "Sri Lanka's first dedicated pickleball court. Book your slot now!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900">{children}</body>
    </html>
  );
}
