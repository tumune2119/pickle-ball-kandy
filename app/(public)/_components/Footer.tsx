import Link from "next/link";
import { Phone, Mail, MessageCircle } from "lucide-react";
import { COURT_NAME } from "@/lib/constants";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    // Intentionally theme-agnostic: a fixed dark band anchors the page in
    // both themes, the same way the sage hero does at the top.
    <footer className="relative bg-gray-900 text-gray-300">
      <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-sage-500/60 to-transparent" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-linear-to-br from-sage-500 to-sage-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">🏓</span>
              </div>
              <h3 className="font-bold text-white text-lg">{COURT_NAME}</h3>
            </div>
            <p className="text-sm">Sri Lanka&apos;s first dedicated pickleball court</p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#home" className="hover:text-sage-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="#about" className="hover:text-sage-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="hover:text-sage-400 transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="#contact" className="hover:text-sage-400 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Information */}
          <div>
            <h4 className="font-semibold text-white mb-4">Information</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/faq" className="hover:text-sage-400 transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-sage-400 transition-colors">
                  Booking Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-sage-400 transition-colors">
                  Cancellation Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-sage-400 transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 shrink-0" aria-hidden="true" />
                <a href="tel:+94712345678" className="hover:text-sage-400 transition-colors">
                  +94 71 234 5678
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 shrink-0" aria-hidden="true" />
                <a href="mailto:hello@kandypickleball.lk" className="hover:text-sage-400 transition-colors">
                  hello@kandypickleball.lk
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                <a
                  href="https://wa.me/94712345678"
                  className="hover:text-sage-400 transition-colors"
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
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 hover:bg-sage-600 hover:text-white transition-colors font-bold text-sm"
                >
                  f
                </a>
                <a
                  href="#"
                  aria-label="Instagram"
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 hover:bg-sage-600 hover:text-white transition-colors font-bold text-xs"
                >
                  IG
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 pt-8">
          <p className="text-center text-sm">
            © {currentYear} {COURT_NAME}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
