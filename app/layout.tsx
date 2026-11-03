import type { Metadata } from "next";
import { Anton, Space_Grotesk, Orbitron } from "next/font/google";
import MotionProvider from "@/components/MotionProvider";
import "./globals.css";

// Graffiti x Y2K x pickleball redesign - three registers, not one: Anton for
// heavy condensed display headlines (paired with a CSS skew for the
// "forward-leaning" wordmark energy, since Anton has no italic face), Space
// Grotesk for everything else - UI/forms/admin and body copy (legible,
// subtly geometric - "same brand, toned down"), Orbitron used narrowly for
// scoreboard-style price/time figures (the one deliberately Y2K-digital face).
const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["500", "700"],
});

export const metadata: Metadata = {
  title: "Pickle Rush - Pickleball Booking Platform",
  description: "Sri Lanka's first dedicated pickleball court. Book your slot now!",
};

// Applies the saved/system theme before first paint so there's no
// light-mode flash on a dark-mode visit. Runs before hydration, so it can't
// use React state - a plain inline script is the standard fix for this.
// The double rAF adds "theme-ready" a couple frames after that first paint,
// which is what lets globals.css enable the background/color transition -
// without it, the very first paint would visibly animate from the light
// palette instead of just appearing in the resolved theme.
const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem("theme");
    // Light is the default look for a first-time visitor - only an explicit
    // earlier toggle to dark (stored) overrides it; OS preference no
    // longer decides this on its own.
    var dark = stored === "dark";
    document.documentElement.classList.toggle("dark", dark);
  } catch (e) {}
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      document.documentElement.classList.add("theme-ready");
    });
  });
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth motion-reduce:scroll-auto">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className={`${anton.variable} ${spaceGrotesk.variable} ${orbitron.variable} antialiased`}>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}