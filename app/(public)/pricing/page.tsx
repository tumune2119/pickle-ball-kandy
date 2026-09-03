import HeroSection from "../_components/HeroSection";
import PricingCard from "../_components/PricingCard";
import Link from "next/link";

export const metadata = {
  title: "Pricing - Kandy 1st Court",
  description: "Check our hourly rates, packages, and special offers.",
};

export default function PricingPage() {
  return (
    <>
      {/* Hero */}
      <HeroSection
        title="Pricing"
        subtitle="Affordable Rates for All Players"
      />

      {/* Hourly Rates */}
      <section className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Hourly Rates
        </h2>
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <PricingCard
            title="Off-Peak Hours"
            description="Perfect for morning and afternoon play"
            price={1500}
            timeRange="6:00 AM - 5:00 PM"
            features={[
              "1 hour court access",
              "Up to 4 players",
              "Professional ball included",
              "Free parking",
              "WiFi access",
            ]}
          />
          <PricingCard
            title="Peak Hours"
            description="Premium evening slots with premium lighting"
            price={2500}
            timeRange="5:00 PM - 10:00 PM"
            features={[
              "1 hour court access",
              "Up to 4 players",
              "Professional ball included",
              "LED lighting included",
              "Priority booking",
            ]}
            highlighted
          />
        </div>

        {/* Additional Info */}
        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
          <p className="text-gray-700 text-center">
            💡 <strong>Tip:</strong> Off-peak hours offer great value and are
            perfect for beginners and casual players. Peak hours provide the
            best lighting conditions and are ideal for competitive matches.
          </p>
        </div>
      </section>

      {/* Packages */}
      <section className="bg-gray-50 py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Membership Packages
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Save more with our flexible membership plans. Perfect for regular
            players looking for better rates and priority booking.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Casual Card */}
            <div className="bg-white rounded-lg border-2 border-gray-200 p-8 hover:shadow-lg transition">
              <h3 className="text-2xl font-bold mb-2">Casual Player</h3>
              <p className="text-gray-600 mb-6">Pay per slot</p>

              <div className="mb-6">
                <p className="text-sm text-gray-600">Perfect for:</p>
                <ul className="mt-2 space-y-2 text-sm">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Occasional players</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Flexible schedule</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>No commitment</span>
                  </li>
                </ul>
              </div>

              <div className="mb-6 p-4 bg-gray-50 rounded">
                <p className="font-bold">Per Session:</p>
                <p className="text-2xl font-bold text-blue-600">
                  LKR 1,500 - 2,500
                </p>
              </div>

              <Link
                href="/book"
                className="w-full block text-center bg-gray-100 hover:bg-gray-200 text-gray-900 py-3 rounded-lg font-semibold transition"
              >
                Book Now
              </Link>
            </div>

            {/* Regular Card */}
            <div className="bg-white rounded-lg border-2 border-blue-600 p-8 shadow-lg transform scale-105">
              <div className="mb-4 inline-block bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                Popular
              </div>
              <h3 className="text-2xl font-bold mb-2">Regular Player</h3>
              <p className="text-gray-600 mb-6">10 slots per month</p>

              <div className="mb-6">
                <p className="text-sm text-gray-600">Perfect for:</p>
                <ul className="mt-2 space-y-2 text-sm">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Weekly regular players</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Save 15% vs pay-per-session</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Carry over unused slots</span>
                  </li>
                </ul>
              </div>

              <div className="mb-6 p-4 bg-blue-50 rounded">
                <p className="font-bold">Per Month:</p>
                <p className="text-2xl font-bold text-blue-600">LKR 14,250</p>
                <p className="text-xs text-gray-600 mt-2">
                  ~LKR 1,425 per session
                </p>
              </div>

              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition">
                Subscribe Now
              </button>
            </div>

            {/* VIP Card */}
            <div className="bg-white rounded-lg border-2 border-gray-200 p-8 hover:shadow-lg transition">
              <h3 className="text-2xl font-bold mb-2">VIP Member</h3>
              <p className="text-gray-600 mb-6">25 slots per month</p>

              <div className="mb-6">
                <p className="text-sm text-gray-600">Perfect for:</p>
                <ul className="mt-2 space-y-2 text-sm">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Serious competitors</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Save 25% vs pay-per-session</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Priority booking access</span>
                  </li>
                </ul>
              </div>

              <div className="mb-6 p-4 bg-gray-50 rounded">
                <p className="font-bold">Per Month:</p>
                <p className="text-2xl font-bold text-blue-600">LKR 28,125</p>
                <p className="text-xs text-gray-600 mt-2">
                  ~LKR 1,125 per session
                </p>
              </div>

              <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 py-3 rounded-lg font-semibold transition">
                Subscribe Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Special Offers */}
      <section className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Special Offers
        </h2>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-8">
            <div className="text-4xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold mb-3">Group Bookings</h3>
            <p className="text-gray-700 mb-4">
              Bring your friends and enjoy special group rates!
            </p>
            <ul className="space-y-2 text-sm text-gray-700 mb-6">
              <li>✓ 4-6 people: 10% discount</li>
              <li>✓ 7-10 people: 15% discount</li>
              <li>✓ 10+ people: Contact for custom rates</li>
            </ul>
            <button className="text-blue-600 font-semibold hover:text-blue-700">
              Inquire Now →
            </button>
          </div>

          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-8">
            <div className="text-4xl mb-4">🏫</div>
            <h3 className="text-2xl font-bold mb-3">Beginner Lessons</h3>
            <p className="text-gray-700 mb-4">
              Learn from certified coaches in small groups or private sessions
            </p>
            <ul className="space-y-2 text-sm text-gray-700 mb-6">
              <li>✓ Group lesson: LKR 2,000/person</li>
              <li>✓ Private lesson: LKR 3,500/hour</li>
              <li>✓ 5-lesson package: 20% discount</li>
            </ul>
            <button className="text-blue-600 font-semibold hover:text-blue-700">
              Book Lesson →
            </button>
          </div>
        </div>
      </section>

      {/* Equipment Rental */}
      <section className="bg-gray-50 py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Equipment Rental
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="text-5xl mb-4">🎾</div>
              <h3 className="font-bold text-lg mb-2">Pickleball Paddles</h3>
              <p className="text-gray-600 text-sm mb-4">
                Professional-grade paddles for all skill levels
              </p>
              <p className="text-2xl font-bold text-blue-600">LKR 300/hour</p>
              <p className="text-xs text-gray-600 mt-2">or LKR 1,000/day</p>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="text-5xl mb-4">🏸</div>
              <h3 className="font-bold text-lg mb-2">Pickleballs</h3>
              <p className="text-gray-600 text-sm mb-4">
                Quality balls included with court booking
              </p>
              <p className="text-2xl font-bold text-blue-600">Included</p>
              <p className="text-xs text-gray-600 mt-2">with all bookings</p>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="text-5xl mb-4">👟</div>
              <h3 className="font-bold text-lg mb-2">Court Shoes</h3>
              <p className="text-gray-600 text-sm mb-4">
                Non-marking shoes to protect the court
              </p>
              <p className="text-2xl font-bold text-blue-600">LKR 200/day</p>
              <p className="text-xs text-gray-600 mt-2">Available at counter</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-4xl mx-auto px-4 py-12 md:py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Pricing FAQ
        </h2>

        <div className="space-y-6">
          {[
            {
              q: "What's included in the booking?",
              a: "Each booking includes 1 hour of court access, professional pickleballs, and free parking. Equipment rental is available separately.",
            },
            {
              q: "Can I cancel or reschedule my booking?",
              a: "Yes, you can cancel free of charge up to 4 hours before your booking. Reschedules are also free if made 4+ hours in advance.",
            },
            {
              q: "Do memberships expire?",
              a: "Memberships are valid for 30 days from purchase. Unused slots carry over to the next month.",
            },
            {
              q: "Are there discounts for large groups?",
              a: "Yes! Groups of 4+ get 10-15% discounts. Contact us for custom rates for groups of 10+.",
            },
            {
              q: "Can I book multiple slots at once?",
              a: "Yes, you can book consecutive slots (e.g., 2 hours) when available. Use the booking form or call us for assistance.",
            },
          ].map((item, idx) => (
            <div key={idx} className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="font-bold text-lg mb-2 text-gray-900">
                {item.q}
              </h3>
              <p className="text-gray-700">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 text-white py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Book?
          </h2>
          <p className="text-lg mb-8 text-blue-100">
            Choose your preferred time and book your court slot now
          </p>
          <Link
            href="/book"
            className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition"
          >
            Start Booking
          </Link>
        </div>
      </section>
    </>
  );
}
