import HeroSection from "../_components/HeroSection";
import AmenityCard from "../_components/AmenityCard";

export const metadata = {
  title: "About Us - Kandy 1st Court",
  description: "Learn about Kandy 1st Court, Sri Lanka's premier pickleball destination.",
};

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <HeroSection
        title="About Us"
        subtitle="Bringing Pickleball to Kandy"
      />

      {/* Story */}
      <section className="max-w-4xl mx-auto px-4 py-12 md:py-16">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="bg-linear-to-br from-blue-300 to-blue-400 h-96 rounded-lg flex items-center justify-center">
            <span className="text-8xl opacity-30">🏸</span>
          </div>
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Our Story</h2>
            <p className="text-gray-700 leading-relaxed">
              Kandy 1st Court was founded with a mission to bring the world&apos;s
              fastest-growing racquet sport to Sri Lanka. As pickleball gains
              popularity worldwide, we recognized the need for a dedicated,
              professional facility where players of all skill levels can enjoy
              the game.
            </p>
            <p className="text-gray-700 leading-relaxed">
              We&apos;re committed to creating a welcoming community where locals and
              visitors can experience the joy, fitness, and social aspects of
              pickleball. Whether you&apos;re a beginner or an experienced player,
              we provide the perfect environment to play, learn, and compete.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Our court meets international standards and is managed by
              experienced professionals dedicated to ensuring the best possible
              experience for every player.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="bg-gray-50 py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-lg border-l-4 border-blue-600">
              <h3 className="text-2xl font-bold mb-4">🎯 Our Mission</h3>
              <p className="text-gray-700">
                To provide a world-class pickleball facility that promotes
                health, community, and the growth of pickleball in Sri Lanka
                while ensuring an enjoyable experience for all players.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg border-l-4 border-green-600">
              <h3 className="text-2xl font-bold mb-4">👁️ Our Vision</h3>
              <p className="text-gray-700">
                To become the leading pickleball destination in South Asia,
                fostering a vibrant community of players and contributing to
                the global growth of this amazing sport.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Our Values
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200 text-center hover:shadow-lg transition">
            <div className="text-5xl mb-4">❤️</div>
            <h3 className="font-bold text-lg mb-2">Community</h3>
            <p className="text-gray-600 text-sm">
              Building a welcoming community of players from all backgrounds
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200 text-center hover:shadow-lg transition">
            <div className="text-5xl mb-4">⭐</div>
            <h3 className="font-bold text-lg mb-2">Excellence</h3>
            <p className="text-gray-600 text-sm">
              Maintaining highest standards in facilities and service
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200 text-center hover:shadow-lg transition">
            <div className="text-5xl mb-4">🤝</div>
            <h3 className="font-bold text-lg mb-2">Inclusivity</h3>
            <p className="text-gray-600 text-sm">
              Welcoming players of all ages, skill levels, and backgrounds
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200 text-center hover:shadow-lg transition">
            <div className="text-5xl mb-4">🏆</div>
            <h3 className="font-bold text-lg mb-2">Growth</h3>
            <p className="text-gray-600 text-sm">
              Fostering the development and advancement of pickleball
            </p>
          </div>
        </div>
      </section>

      {/* Amenities */}
      <section className="bg-gray-50 py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Facilities & Amenities
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AmenityCard
              icon="🏸"
              title="Professional Court"
              description="Regulation-size, professionally maintained court with international standards"
            />
            <AmenityCard
              icon="💡"
              title="LED Lighting"
              description="High-quality LED lighting for comfortable play during evening and night hours"
            />
            <AmenityCard
              icon="🎾"
              title="Equipment Rental"
              description="Professional-grade paddles and balls available for rent at affordable rates"
            />
            <AmenityCard
              icon="🚿"
              title="Locker Rooms"
              description="Clean, secure locker rooms with shower facilities and changing areas"
            />
            <AmenityCard
              icon="🅿️"
              title="Free Parking"
              description="Convenient and secure parking space for all court users"
            />
            <AmenityCard
              icon="☕"
              title="Refreshment Area"
              description="Snacks, beverages, and refreshments available between matches"
            />
            <AmenityCard
              icon="👥"
              title="Seating Area"
              description="Comfortable spectator seating for family and friends to watch"
            />
            <AmenityCard
              icon="📱"
              title="WiFi"
              description="Free high-speed WiFi throughout the facility"
            />
            <AmenityCard
              icon="🎯"
              title="Coaching Available"
              description="Professional instructors for lessons and skill development"
            />
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Our Team
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              role: "Court Manager",
              name: "Roshan Silva",
              bio: "Experienced sports facility manager with passion for pickleball",
            },
            {
              role: "Head Coach",
              name: "Anita Perera",
              bio: "Professional pickleball instructor certified internationally",
            },
            {
              role: "Community Coordinator",
              name: "Chathura Jayawardena",
              bio: "Dedicated to building and nurturing our pickleball community",
            },
          ].map((member, idx) => (
            <div
              key={idx}
              className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition"
            >
              <div className="bg-linear-to-br from-blue-300 to-blue-400 h-48 flex items-center justify-center">
                <span className="text-6xl opacity-30">👤</span>
              </div>
              <div className="p-6">
                <h3 className="font-bold text-lg">{member.name}</h3>
                <p className="text-blue-600 font-semibold text-sm mb-3">
                  {member.role}
                </p>
                <p className="text-gray-600 text-sm">{member.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="bg-blue-600 text-white py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">2024</div>
              <p className="text-blue-100">Year Founded</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">1</div>
              <p className="text-blue-100">Professional Court</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <p className="text-blue-100">Active Members</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <p className="text-blue-100">Booking Support</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
