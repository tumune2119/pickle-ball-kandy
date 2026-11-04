"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, LogOut, CircleUserRound, LayoutDashboard } from "lucide-react";
import { COURT_NAME } from "@/lib/constants";
import { supabase } from "@/lib/auth";
import { useCurrentUser } from "@/lib/useCurrentUser";
import ThemeToggle from "@/components/ThemeToggle";
import Button from "@/components/ui/Button";
import UserMenu from "@/components/UserMenu";
import { cn } from "@/lib/cn";

const SECTIONS = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "pricing", label: "Pricing" },
  { id: "contact", label: "Contact" },
];

const linkColor = "text-text-muted hover:text-lime-600 dark:hover:text-lime-400";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const user = useCurrentUser();
  const isStaff = user?.role === "admin" || user?.role === "staff";
  const router = useRouter();
  const pathname = usePathname();
  const onHome = pathname === "/";
  // Every section lives on "/" (see app/(public)/page.tsx) - from any other
  // route, a bare "#id" has nothing to scroll to, so route home first.
  const sectionHref = (id: string) => (onHome ? `#${id}` : `/#${id}`);

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

  return (
    // Always the same solid, bordered bar - no more riding transparent over
    // the hero photo at the top of the page. That dual look (transparent at
    // y=0, solid once scrolled) was the one surface in the whole site that
    // never got the thick-ink-border treatment everywhere else now has;
    // fixed (not sticky) so it still has no layout footprint of its own.
    <header className="fixed top-0 inset-x-0 z-50 bg-surface border-b-2 border-ink">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <Link href={sectionHref("home")} className="flex items-center space-x-2 group">
            <div className="w-10 h-10 rounded-md border-2 border-ink overflow-hidden transition-transform group-hover:scale-105 shrink-0 bg-white p-1">
              <Image src="/brand/logo-icon-square.png" alt="" width={40} height={40} className="w-full h-full object-contain" priority />
            </div>
            <span className="hidden sm:inline font-display text-xl uppercase tracking-tight skew-display text-text-primary">
              {COURT_NAME}
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            {SECTIONS.map((item) => {
              const active = onHome && activeSection === item.id;
              return (
                <Link
                  key={item.id}
                  href={sectionHref(item.id)}
                  className={cn("relative px-3 py-2 font-bold transition-colors", linkColor)}
                >
                  {item.label}
                  {active && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute left-3 right-3 -bottom-0.5 h-0.5 rounded-full bg-action-lime"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Desktop CTA - the account avatar sits to the right of Book Now,
              not inline among plain text links. */}
          <div className="hidden md:flex items-center space-x-3">
            <ThemeToggle variant="neutral" />
            {user === undefined ? (
              <div className="w-16 h-5" aria-hidden="true" />
            ) : user === null ? (
              <Link href="/login" className={cn("font-bold transition-colors px-3", linkColor)}>
                Login
              </Link>
            ) : null}
            <Button href="/book" size="md">
              Book Now
            </Button>
            {user && <UserMenu user={user} onLogout={handleLogout} />}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-1 md:hidden">
            <ThemeToggle variant="neutral" />
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

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="md:hidden overflow-hidden"
            >
              <div className="mb-4 p-2 space-y-1 rounded-xl bg-surface border-2 border-ink shadow-[4px_4px_0_var(--color-ink)]">
                {SECTIONS.map((item) => (
                  <Link
                    key={item.id}
                    href={sectionHref(item.id)}
                    className="block px-4 py-3 font-bold text-text-muted hover:bg-highlight hover:text-lime-800 dark:hover:text-lime-300 rounded-lg transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="pt-2 space-y-1 border-t-2 border-border-default">
                  {user ? (
                    <>
                      {isStaff ? (
                        <Link
                          href="/admin/dashboard"
                          className="flex items-center gap-2 px-4 py-3 font-bold text-text-muted hover:bg-highlight hover:text-lime-800 dark:hover:text-lime-300 rounded-lg transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          <LayoutDashboard className="w-4 h-4" aria-hidden="true" />
                          Admin Dashboard
                        </Link>
                      ) : (
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-2 px-4 py-3 font-bold text-text-muted hover:bg-highlight hover:text-lime-800 dark:hover:text-lime-300 rounded-lg transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          <CircleUserRound className="w-4 h-4" aria-hidden="true" />
                          My Account
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-3 font-bold text-text-muted hover:bg-highlight hover:text-lime-800 dark:hover:text-lime-300 rounded-lg transition-colors"
                      >
                        <LogOut className="w-4 h-4" aria-hidden="true" />
                        Logout
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/login"
                      className="block px-4 py-3 font-bold text-text-muted hover:bg-highlight hover:text-lime-800 dark:hover:text-lime-300 rounded-lg transition-colors"
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
