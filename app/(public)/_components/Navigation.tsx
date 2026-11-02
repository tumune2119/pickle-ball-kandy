"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, LogOut, CircleUserRound } from "lucide-react";
import { COURT_NAME } from "@/lib/constants";
import { supabase } from "@/lib/auth";
import { useAuthUser } from "@/lib/useAuthUser";
import ThemeToggle from "@/components/ThemeToggle";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/cn";

const SECTIONS = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "pricing", label: "Pricing" },
  { id: "contact", label: "Contact" },
];

const SCROLL_THRESHOLD = 24;

function subscribeScroll(callback: () => void) {
  window.addEventListener("scroll", callback, { passive: true });
  return () => window.removeEventListener("scroll", callback);
}

// Tracks "has the page scrolled past the hero photo" so the header can ride
// transparent over the hero at the top (matching its photo background) and
// pick up the usual glass bar once the user scrolls into the plain page
// content below - a plain scroll listener that reads the current value on
// mount via useSyncExternalStore, rather than an effect that calls setState
// directly (see DatePicker.tsx's useMounted for the same pattern).
function useScrolled(): boolean {
  return useSyncExternalStore(
    subscribeScroll,
    () => window.scrollY > SCROLL_THRESHOLD,
    () => false
  );
}

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const user = useAuthUser();
  const router = useRouter();
  const scrolled = useScrolled();
  // Transparent while still at the very top (riding over the hero's photo
  // background), solid glass as soon as the user scrolls into the page
  // content below - same header, two looks.
  const transparent = !scrolled;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsOpen(false);
    router.push("/");
  };

  // Everything now lives on one page (see app/(public)/page.tsx) - highlight
  // whichever section is scrolled near the top of the viewport instead of
  // comparing the route, since every nav item points at the same route.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Two looks, one header: transparent/white-text while riding over the
  // hero's photo at the top of the page, solid glass once scrolled into the
  // plain content below (see useScrolled above) - fixed (not sticky) so it
  // has no layout footprint of its own and the hero photo can run full
  // height behind it (HeroSection compensates with extra top padding).
  const linkColor = transparent
    ? "text-white/90 hover:text-white"
    : "text-text-muted hover:text-brand-600 dark:hover:text-brand-400";

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-colors duration-300",
        transparent
          ? "bg-transparent border-transparent"
          : "bg-surface/80 backdrop-blur-md border-b border-border-default"
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <Link href="#home" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-linear-to-br from-sage-500 to-sage-700 rounded-lg flex items-center justify-center shadow-md shadow-sage-600/20 transition-transform group-hover:scale-105">
              <span className="text-white font-bold text-lg">🏓</span>
            </div>
            <span
              className={cn(
                "hidden sm:inline font-bold font-display text-lg transition-colors",
                transparent ? "text-white" : "text-text-primary"
              )}
            >
              {COURT_NAME}
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            {SECTIONS.map((item) => {
              const active = activeSection === item.id;
              return (
                <Link
                  key={item.id}
                  href={`#${item.id}`}
                  className={cn("relative px-3 py-2 font-medium transition-colors", linkColor)}
                >
                  {item.label}
                  {active && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute left-3 right-3 -bottom-0.5 h-0.5 rounded-full bg-brand-400"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-2">
            <ThemeToggle variant={transparent ? "on-color" : "neutral"} />
            {user === undefined ? (
              <div className="w-16 h-5" aria-hidden="true" />
            ) : user ? (
              <>
                <Link href="/dashboard" className={cn("flex items-center gap-1.5 font-medium transition-colors px-3", linkColor)}>
                  <CircleUserRound className="w-4 h-4" aria-hidden="true" />
                  My Account
                </Link>
                <button onClick={handleLogout} className={cn("flex items-center gap-1.5 font-medium transition-colors px-3", linkColor)}>
                  <LogOut className="w-4 h-4" aria-hidden="true" />
                  Logout
                </button>
              </>
            ) : (
              <Link href="/login" className={cn("font-medium transition-colors px-3", linkColor)}>
                Login
              </Link>
            )}
            <Button href="/book" size="md">
              Book Now
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-1 md:hidden">
            <ThemeToggle variant={transparent ? "on-color" : "neutral"} />
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}
              className={cn("p-2 transition-colors", linkColor)}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={isOpen ? "close" : "open"}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="block"
                >
                  {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* Mobile Menu - its own solid glass card regardless of header
            transparency, so its contents stay legible even when opened
            right at the top of the page, over the photo. */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="md:hidden overflow-hidden"
            >
              <div className="mb-4 p-2 space-y-1 rounded-2xl bg-surface/95 backdrop-blur-xl border border-border-default shadow-xl">
                {SECTIONS.map((item) => (
                  <Link
                    key={item.id}
                    href={`#${item.id}`}
                    className="block px-4 py-2 text-text-muted hover:bg-highlight hover:text-brand-700 dark:hover:text-brand-400 rounded-lg transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="pt-2 space-y-1 border-t border-border-default">
                  {user ? (
                    <>
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2 px-4 py-2 text-text-muted hover:bg-highlight hover:text-brand-700 dark:hover:text-brand-400 rounded-lg transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        <CircleUserRound className="w-4 h-4" aria-hidden="true" />
                        My Account
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-text-muted hover:bg-highlight hover:text-brand-700 dark:hover:text-brand-400 rounded-lg transition-colors"
                      >
                        <LogOut className="w-4 h-4" aria-hidden="true" />
                        Logout
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/login"
                      className="block px-4 py-2 text-text-muted hover:bg-highlight hover:text-brand-700 dark:hover:text-brand-400 rounded-lg transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      Login
                    </Link>
                  )}
                  <div className="px-2 pt-1">
                    <Button href="/book" fullWidth onClick={() => setIsOpen(false)}>
                      Book Now
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
