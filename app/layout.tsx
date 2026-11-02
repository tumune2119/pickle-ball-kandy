import type { Metadata } from "next";
import { Karla, DM_Mono, Fraunces } from "next/font/google";
import MotionProvider from "@/components/MotionProvider";
import "./globals.css";

// pickle-rush design system v1 (UI-CONFIG.md): Karla for body/UI text,
// Fraunces for display headings, DM Mono for the rare code/numeric moment.
// Used across the whole app, including admin - admin only differs in color.
const karla = Karla({
  variable: "--font-karla",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
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
      <body className={`${karla.variable} ${dmMono.variable} ${fraunces.variable} antialiased`}>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}