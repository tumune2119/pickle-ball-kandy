import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kandy 1st Court - Pickleball Booking Platform",
  description: "Sri Lanka's first dedicated pickleball court. Book your slot now!",
};

// Applies the saved/system theme before first paint so there's no
// light-mode flash on a dark-mode visit. Runs before hydration, so it can't
// use React state - a plain inline script is the standard fix for this.
const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem("theme");
    var dark = stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", dark);
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
        {children}
      </body>
    </html>
  );
}
