import Link from "next/link";
import HeroSection from "./_components/HeroSection";
import ImageGallery from "./_components/ImageGallery";
import PricingCard from "./_components/PricingCard";
import AmenityCard from "./_components/AmenityCard";
import { COURT_NAME, COURT_LOCATION } from "@/lib/constants";

export default function Home() {
  const galleryImages = [
    { id: "1", src: "/images/court-1.jpg", alt: "Professional court setup", caption: "Professional Court Setup" },
    { id: "2", src: "/images/court-2.jpg", alt: "Players in an evening match", caption: "Evening Matches" },
    { id: "3", src: "/images/court-3.jpg", alt: "Tournament-ready court", caption: "Tournament Ready" },
    { id: "4", src: "/images/court-4.jpg", alt: "Social games in progress", caption: "Social Games" },
    { id: "5", src: "/images/court-5.jpg", alt: "Equipment and rental gear", caption: "Equipment & Rentals" },
    { id: "6", src: "/images/court-6.jpg", alt: "Spectator seating area", caption: "Spectator Area" },
  ];

  return (
    <>
      {/* Hero Section */}
      <HeroSection
        title={COURT_NAME}
        subtitle="Sri Lanka's First Dedicated Pickleball Court 🏸"
        cta={{ text: "Book Your Slot Now", href: "/book" }}
      />

      {/* What is Pickleball? */}
      <section className="bg-purple-50 dark:bg-purple-950/40 py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">
            What is Pickleball?
          </h2>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="bg-linear-to-br from-gray-300 to-gray-400 h-80 rounded-lg flex items-center justify-center">
              <span className="text-8xl opacity-30">🏸</span>
            </div>
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Pickleball is a paddle sport that combines elements of tennis,
                badminton, and table tennis. It&apos;s played on a court about 1/3 the
                size of a tennis court with a lower net, using solid paddles and a
                perforated plastic ball.
              </p>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Why Pickleball?</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-purple-600 dark:text-purple-400 mr-3 font-bold">✓</span>
                  <span className="text-gray-700 dark:text-gray-300">
                    Easy to learn, fun to play - perfect for all ages
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 dark:text-purple-400 mr-3 font-bold">✓</span>
                  <span className="text-gray-700 dark:text-gray-300">
                    Low-impact sport that&apos;s easier on joints than tennis
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 dark:text-purple-400 mr-3 font-bold">✓</span>
                  <span className="text-gray-700 dark:text-gray-300">
                    Great social community and fitness benefits
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 dark:text-purple-400 mr-3 font-bold">✓</span>
                  <span className="text-gray-700 dark:text-gray-300">
                    Fastest growing racquet sport in the world
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        <ImageGallery images={galleryImages} />
      </section>

      {/* Quick Info */}
      <section className="bg-white dark:bg-gray-900 py-12 md:py-16 border-t border-b border-gray-200 dark:border-white/10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">1</div>
              <p className="text-gray-600 dark:text-gray-400">Dedicated Court</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">6am-10pm</div>
              <p className="text-gray-600 dark:text-gray-400">Operating Hours</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">4</div>
              <p className="text-gray-600 dark:text-gray-400">Players Per Session</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">30+</div>
              <p className="text-gray-600 dark:text-gray-400">Active Members</p>
            </div>
          </div>
        </div>
      </section>

      {/* Amenities */}
      <section className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Court Amenities
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AmenityCard
            icon="🅿️"
            title="Free Parking"
            description="Ample parking space available for all our players"
          />
          <AmenityCard
            icon="🎾"
            title="Equipment Rental"
            description="High-quality paddles and balls available for rent"
          />
          <AmenityCard
            icon="💡"
            title="Professional Lighting"
            description="LED lighting for evening and night play sessions"
          />
          <AmenityCard
            icon="🚿"
            title="Washroom Facilities"
            description="Clean and well-maintained locker rooms & showers"
          />
          <AmenityCard
            icon="🛋️"
            title="Spectator Seating"
            description="Comfortable seating area to watch matches"
          />
          <AmenityCard
            icon="☕"
            title="Refreshments"
            description="Snacks and beverages available at the court"
          />
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="bg-gray-50 dark:bg-gray-950 py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Pricing
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <PricingCard
              title="Off-Peak"
              description="Morning to evening play"
              price={1500}
              timeRange="6 AM - 5 PM"
              features={[
                "Court access for 1 hour",
                "Up to 4 players",
                "Includes ball",
                "No booking fee",
              ]}
            />
            <PricingCard
              title="Peak Hours"
              description="Premium evening slots"
              price={2500}
              timeRange="5 PM - 10 PM"
              features={[
                "Court access for 1 hour",
                "Up to 4 players",
                "Professional lighting",
                "Priority scheduling",
              ]}
              highlighted
            />
          </div>
          <div className="text-center mt-8">
            <Link
              href="/pricing"
              className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold"
            >
              View full pricing & packages →
            </Link>
          </div>
        </div>
      </section>

      {/* Location Map */}
      <section className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Find Us
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Map Embed */}
            <div className="bg-gray-200 dark:bg-white/10 rounded-lg overflow-hidden h-96">
              <iframe
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3958.5698652050446!2d80.63270322346892!3d6.927079520049246!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae38ce9c5d5d5d5%3A0x5d5d5d5d5d5d5d5d!2sKandy%2C%20Sri%20Lanka!5e0!3m2!1sen!2slk!4v1234567890"
              ></iframe>
            </div>

            {/* Info */}
            <div className="flex flex-col justify-center space-y-6">
              <div>
                <h3 className="text-xl font-bold mb-2">📍 Location</h3>
                <p className="text-gray-700 dark:text-gray-300">{COURT_NAME}</p>
                <p className="text-gray-600 dark:text-gray-400">{COURT_LOCATION}</p>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-2">🕐 Hours of Operation</h3>
                <ul className="text-gray-700 dark:text-gray-300 space-y-1">
                  <li>Monday - Friday: 6:00 AM - 10:00 PM</li>
                  <li>Saturday: 7:00 AM - 10:00 PM</li>
                  <li>Sunday: 7:00 AM - 9:00 PM</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-2">📞 Contact</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  <a
                    href="tel:+94712345678"
                    className="text-purple-600 dark:text-purple-400 hover:underline"
                  >
                    +94 71 234 5678
                  </a>
                </p>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  <a
                    href="mailto:hello@kandypickleball.lk"
                    className="text-purple-600 dark:text-purple-400 hover:underline"
                  >
                    hello@kandypickleball.lk
                  </a>
                </p>
                <a
                  href="https://wa.me/94712345678"
                  className="inline-block bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-semibold transition"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  💬 Chat on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-purple-600 text-white py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Play?
          </h2>
          <p className="text-lg mb-8 text-purple-100">
            Join Kandy&apos;s fastest-growing pickleball community
          </p>
          <Link
            href="/book"
            className="inline-block bg-white dark:bg-gray-900 text-purple-600 dark:text-purple-400 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 dark:hover:bg-white/5 transition"
          >
            Book Your Court Now
          </Link>
        </div>
      </section>
    </>
  );
}
