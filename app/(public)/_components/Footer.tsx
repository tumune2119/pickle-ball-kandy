import Link from "next/link";
import { COURT_NAME } from "@/lib/constants";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">🏸</span>
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
                <Link href="/" className="hover:text-blue-400 transition">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-blue-400 transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-blue-400 transition">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-blue-400 transition">
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
                <a href="/faq" className="hover:text-blue-400 transition">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition">
                  Booking Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition">
                  Cancellation Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>
                📞{" "}
                <a href="tel:+94712345678" className="hover:text-blue-400 transition">
                  +94 71 234 5678
                </a>
              </li>
              <li>
                ✉️{" "}
                <a
                  href="mailto:hello@kandypickleball.lk"
                  className="hover:text-blue-400 transition"
                >
                  hello@kandypickleball.lk
                </a>
              </li>
              <li>
                💬{" "}
                <a
                  href="https://wa.me/94712345678"
                  className="hover:text-blue-400 transition"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp
                </a>
              </li>
              <li className="pt-4 flex space-x-4">
                <a href="#" className="hover:text-blue-400 transition">
                  Facebook
                </a>
                <a href="#" className="hover:text-blue-400 transition">
                  Instagram
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
