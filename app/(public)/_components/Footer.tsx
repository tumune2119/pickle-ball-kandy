"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Phone, Mail, MessageCircle } from "lucide-react";
import { COURT_NAME } from "@/lib/constants";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const onHome = usePathname() === "/";
  // Every section lives on "/" (see Navigation.tsx's identical helper) - a
  // bare "#id" has nothing to scroll to from any other route.
  const sectionHref = (id: string) => (onHome ? `#${id}` : `/#${id}`);

  return (
    // Intentionally theme-agnostic: a fixed ink/deep-blue band anchors the
    // page in both themes, the same way the hero does at the top.
    <footer className="relative bg-ink text-concrete-300">
      <div className="absolute top-0 inset-x-0 h-1 bg-action-lime" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 rounded-md border-2 border-concrete-100 overflow-hidden shrink-0 bg-white p-1">
                <Image src="/brand/logo-icon-square.png" alt="" width={32} height={32} className="w-full h-full object-contain" />
              </div>
              <h3 className="font-display text-lg uppercase tracking-tight skew-display text-white">{COURT_NAME}</h3>
            </div>
            <p className="text-sm">Sri Lanka&apos;s first dedicated pickleball court</p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display uppercase text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={sectionHref("home")} className="hover:text-lime-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href={sectionHref("about")} className="hover:text-lime-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href={sectionHref("pricing")} className="hover:text-lime-400 transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href={sectionHref("contact")} className="hover:text-lime-400 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Information */}
          <div>
            <h4 className="font-display uppercase text-white mb-4">Information</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/manage-booking" className="hover:text-lime-400 transition-colors">
                  Manage Booking
                </Link>
              </li>
              <li>
                <a href="/faq" className="hover:text-lime-400 transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-lime-400 transition-colors">
                  Booking Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-lime-400 transition-colors">
                  Cancellation Policy
                </a>
              </li>
              <li>
                <Link href="/terms" className="hover:text-lime-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-lime-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display uppercase text-white mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 shrink-0" aria-hidden="true" />
                <a href="tel:+94712345678" className="hover:text-lime-400 transition-colors">
                  +94 71 234 5678
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 shrink-0" aria-hidden="true" />
                <a href="mailto:hello@kandypickleball.lk" className="hover:text-lime-400 transition-colors">
                  hello@kandypickleball.lk
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                <a
                  href="https://wa.me/94712345678"
                  className="hover:text-lime-400 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp
                </a>
              </li>
              <li className="pt-2 flex space-x-3">
                {/* lucide-react ships no brand marks (trademark reasons) -
                    a small monogram tile is the standard fallback. */}
                <a
                  href="#"
                  aria-label="Facebook"
                  className="w-9 h-9 flex items-center justify-center rounded-full border-2 border-concrete-700 hover:border-action-lime hover:bg-action-lime hover:text-ink transition-colors font-bold text-sm"
                >
                  f
                </a>
                <a
                  href="#"
                  aria-label="Instagram"
                  className="w-9 h-9 flex items-center justify-center rounded-full border-2 border-concrete-700 hover:border-action-lime hover:bg-action-lime hover:text-ink transition-colors font-bold text-xs"
                >
                  IG
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-concrete-800 pt-8">
          <p className="text-center text-sm">
            © {currentYear} {COURT_NAME}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
