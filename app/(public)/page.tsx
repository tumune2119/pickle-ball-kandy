"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  MapPin,
  Clock,
  Phone,
  Mail,
  MessageCircle,
  ParkingCircle,
  Trophy,
  Lightbulb,
  ShowerHead,
  Coffee,
  Check,
  Target,
  Eye,
  Heart,
  Star,
  Handshake,
  Users,
  Wifi,
  GraduationCap,
  User,
  PartyPopper,
  School,
  Circle,
  Footprints,
  CheckCircle2,
} from "lucide-react";
import HeroSection from "./_components/HeroSection";
import ImageGallery from "./_components/ImageGallery";
import PricingCard from "./_components/PricingCard";
import AmenityCard from "./_components/AmenityCard";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";
import Reveal, { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { COURT_NAME, COURT_LOCATION } from "@/lib/constants";

const galleryImages = [
  { id: "1", src: "/images/court-1.jpg", alt: "Professional court setup", caption: "Professional Court Setup" },
  { id: "2", src: "/images/court-2.jpg", alt: "Players in an evening match", caption: "Evening Matches" },
  { id: "3", src: "/images/court-3.jpg", alt: "Tournament-ready court", caption: "Tournament Ready" },
  { id: "4", src: "/images/court-4.jpg", alt: "Social games in progress", caption: "Social Games" },
  { id: "5", src: "/images/court-5.jpg", alt: "Equipment and rental gear", caption: "Equipment & Rentals" },
  { id: "6", src: "/images/court-6.jpg", alt: "Spectator seating area", caption: "Spectator Area" },
];

const quickStats = [
  { value: "3", label: "Dedicated Courts" },
  { value: "6am-10pm", label: "Operating Hours" },
  { value: "4", label: "Players Per Session" },
  { value: "30+", label: "Active Members" },
];

const values = [
  { icon: Heart, title: "Community", description: "Building a welcoming community of players from all backgrounds" },
  { icon: Star, title: "Excellence", description: "Maintaining highest standards in facilities and service" },
  { icon: Handshake, title: "Inclusivity", description: "Welcoming players of all ages, skill levels, and backgrounds" },
  { icon: Trophy, title: "Growth", description: "Fostering the development and advancement of pickleball" },
];

const team = [
  { role: "Court Manager", name: "Roshan Silva", bio: "Experienced sports facility manager with passion for pickleball" },
  { role: "Head Coach", name: "Anita Perera", bio: "Professional pickleball instructor certified internationally" },
  { role: "Community Coordinator", name: "Chathura Jayawardena", bio: "Dedicated to building and nurturing our pickleball community" },
];

const amenities = [
  { icon: Trophy, title: "Professional Court", description: "Regulation-size, professionally maintained court with international standards" },
  { icon: Lightbulb, title: "LED Lighting", description: "High-quality LED lighting for comfortable play during evening and night hours" },
  { icon: Trophy, title: "Equipment Rental", description: "Professional-grade paddles and balls available for rent at affordable rates" },
  { icon: ShowerHead, title: "Locker Rooms", description: "Clean, secure locker rooms with shower facilities and changing areas" },
  { icon: ParkingCircle, title: "Free Parking", description: "Convenient and secure parking space for all court users" },
  { icon: Coffee, title: "Refreshment Area", description: "Snacks, beverages, and refreshments available between matches" },
  { icon: Users, title: "Seating Area", description: "Comfortable spectator seating for family and friends to watch" },
  { icon: Wifi, title: "WiFi", description: "Free high-speed WiFi throughout the facility" },
  { icon: GraduationCap, title: "Coaching Available", description: "Professional instructors for lessons and skill development" },
];

const membershipTiers = [
  {
    title: "Casual Player",
    tagline: "Pay per slot",
    perfectFor: ["Occasional players", "Flexible schedule", "No commitment"],
    priceLabel: "Per Session:",
    price: "LKR 1,500 - 2,500",
    footnote: null as string | null,
    cta: { label: "Book Now", href: "/book" as string | undefined },
    highlighted: false,
  },
  {
    title: "Regular Player",
    tagline: "10 slots per month",
    perfectFor: ["Weekly regular players", "Save 15% vs pay-per-session", "Carry over unused slots"],
    priceLabel: "Per Month:",
    price: "LKR 14,250",
    footnote: "~LKR 1,425 per session",
    cta: { label: "Subscribe Now", href: undefined },
    highlighted: true,
  },
  {
    title: "VIP Member",
    tagline: "25 slots per month",
    perfectFor: ["Serious competitors", "Save 25% vs pay-per-session", "Priority booking access"],
    priceLabel: "Per Month:",
    price: "LKR 28,125",
    footnote: "~LKR 1,125 per session",
    cta: { label: "Subscribe Now", href: undefined },
    highlighted: false,
  },
];

const specialOffers = [
  {
    icon: PartyPopper,
    tint: "warning" as const,
    title: "Group Bookings",
    description: "Bring your friends and enjoy special group rates!",
    items: ["4-6 people: 10% discount", "7-10 people: 15% discount", "10+ people: Contact for custom rates"],
    cta: "Inquire Now →",
  },
  {
    icon: School,
    tint: "success" as const,
    title: "Beginner Lessons",
    description: "Learn from certified coaches in small groups or private sessions",
    items: ["Group lesson: LKR 2,000/person", "Private lesson: LKR 3,500/hour", "5-lesson package: 20% discount"],
    cta: "Book Lesson →",
  },
];

const equipment = [
  {
    icon: Trophy,
    title: "Pickleball Paddles",
    description: "Professional-grade paddles for all skill levels",
    price: "LKR 300/hour",
    footnote: "or LKR 1,000/day",
  },
  {
    icon: Circle,
    title: "Pickleballs",
    description: "Quality balls included with court booking",
    price: "Included",
    footnote: "with all bookings",
  },
  {
    icon: Footprints,
    title: "Court Shoes",
    description: "Non-marking shoes to protect the court",
    price: "LKR 200/day",
    footnote: "Available at counter",
  },
];

const pricingFaqs = [
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
];

const contactMethods = [
  {
    icon: Phone,
    title: "Call Us",
    description: "Reach us by phone during business hours",
    href: "tel:+94712345678",
    label: "+94 71 234 5678",
    footnote: "Mon-Sun: 6:00 AM - 10:00 PM",
  },
  {
    icon: Mail,
    title: "Email Us",
    description: "Send us a message anytime",
    href: "mailto:hello@kandypickleball.lk",
    label: "hello@kandypickleball.lk",
    footnote: "Response within 24 hours",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp",
    description: "Chat with us on WhatsApp for quick replies",
    href: "https://wa.me/94712345678",
    label: "Chat on WhatsApp",
    footnote: "Usually reply within minutes",
    external: true,
  },
];

const contactFaqs = [
  {
    q: "How do I book a court slot?",
    a: "Scroll up to the pricing section, or head straight to the booking page, select your preferred date and time, and complete the booking. You'll receive a confirmation via email and SMS.",
  },
  {
    q: "Do you offer lessons for beginners?",
    a: "Yes! We offer group and private lessons with certified coaches - see the Beginner Lessons offer above.",
  },
  {
    q: "Can I host a tournament at your facility?",
    a: "Absolutely! We can accommodate tournaments and special events. Contact us to discuss your requirements.",
  },
];

export default function Home() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you'd send this to an API
    console.log("Form submitted:", formData);
    setSubmitted(true);
    setTimeout(() => {
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      setSubmitted(false);
    }, 3000);
  };

  return (
    <>
      {/* Hero */}
      <HeroSection
        id="home"
        title={COURT_NAME}
        subtitle="Sri Lanka's First Dedicated Pickleball Court 🏓"
        cta={{ text: "Book Your Slot Now", href: "/book" }}
        backgroundImage="/images/hero-court-bg.png"
        stats={quickStats}
        statsNote="Founded in 2024 · Book anytime with 24/7 online booking"
      />

      {/* What is Pickleball? */}
      <section className="bg-sage-50 dark:bg-sage-950/40 py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4">
          <Reveal>
            <h2 className="text-3xl md:text-4xl font-bold font-display mb-6 text-center">What is Pickleball?</h2>
          </Reveal>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <Reveal>
              <div className="bg-linear-to-br from-sage-300 to-sage-500 dark:from-sage-800 dark:to-sage-950 h-80 rounded-xl flex items-center justify-center">
                <span className="text-8xl opacity-30">🏓</span>
              </div>
            </Reveal>
            <Reveal delay={0.1} className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Pickleball is a paddle sport that combines elements of tennis,
                badminton, and table tennis. It&apos;s played on a court about 1/3 the
                size of a tennis court with a lower net, using solid paddles and a
                perforated plastic ball.
              </p>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Why Pickleball?</h3>
              <ul className="space-y-2">
                {[
                  "Easy to learn, fun to play - perfect for all ages",
                  "Low-impact sport that's easier on joints than tennis",
                  "Great social community and fitness benefits",
                  "Fastest growing racquet sport in the world",
                ].map((text) => (
                  <li key={text} className="flex items-start">
                    <Check className="w-5 h-5 text-sage-600 dark:text-sage-400 mr-3 shrink-0 mt-0.5" aria-hidden="true" />
                    <span className="text-gray-700 dark:text-gray-300">{text}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ===== About ===== */}
      <section id="about" className="scroll-mt-16 max-w-4xl mx-auto px-4 py-12 md:py-16">
        <Reveal>
          <h2 className="text-3xl md:text-4xl font-bold font-display mb-12 text-center">About Us</h2>
        </Reveal>
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <Reveal className="bg-linear-to-br from-sage-300 to-sage-500 dark:from-sage-800 dark:to-sage-950 h-96 rounded-xl flex items-center justify-center">
            <span className="text-8xl opacity-30">🏓</span>
          </Reveal>
          <Reveal delay={0.1} className="space-y-6">
            <h3 className="text-3xl font-bold font-display">Our Story</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Founded in 2024, Pickle Rush was built with a mission to bring the
              world&apos;s fastest-growing racquet sport to Sri Lanka. As pickleball gains
              popularity worldwide, we recognized the need for a dedicated,
              professional facility where players of all skill levels can enjoy
              the game.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We&apos;re committed to creating a welcoming community where locals and
              visitors can experience the joy, fitness, and social aspects of
              pickleball. Whether you&apos;re a beginner or an experienced player,
              we provide the perfect environment to play, learn, and compete.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Our court meets international standards and is managed by
              experienced professionals dedicated to ensuring the best possible
              experience for every player.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="bg-gray-50 dark:bg-gray-950 py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4">
          <RevealGroup className="grid md:grid-cols-2 gap-8">
            <RevealItem>
              <Card glass padding="lg" className="border-l-4 border-sage-600 h-full">
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                  <Target className="w-7 h-7 text-sage-600 dark:text-sage-400" aria-hidden="true" />
                  Our Mission
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  To provide a world-class pickleball facility that promotes
                  health, community, and the growth of pickleball in Sri Lanka
                  while ensuring an enjoyable experience for all players.
                </p>
              </Card>
            </RevealItem>
            <RevealItem>
              <Card glass padding="lg" className="border-l-4 border-green-600 h-full">
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                  <Eye className="w-7 h-7 text-green-600 dark:text-green-400" aria-hidden="true" />
                  Our Vision
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  To become the leading pickleball destination in South Asia,
                  fostering a vibrant community of players and contributing to
                  the global growth of this amazing sport.
                </p>
              </Card>
            </RevealItem>
          </RevealGroup>
        </div>
      </section>

      {/* Values */}
      <section className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        <Reveal>
          <h2 className="text-3xl md:text-4xl font-bold font-display text-center mb-12">Our Values</h2>
        </Reveal>
        <RevealGroup className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {values.map((value) => (
            <RevealItem key={value.title}>
              <Card hover glass padding="md" className="text-center h-full">
                <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-sage-50 dark:bg-sage-950/40 flex items-center justify-center">
                  <value.icon className="w-7 h-7 text-sage-600 dark:text-sage-400" aria-hidden="true" />
                </div>
                <h3 className="font-bold text-lg mb-2">{value.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{value.description}</p>
              </Card>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {/* Team */}
      <section className="bg-gray-50 dark:bg-gray-950 py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4">
          <Reveal>
            <h2 className="text-3xl md:text-4xl font-bold font-display text-center mb-12">Our Team</h2>
          </Reveal>
          <RevealGroup className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member) => (
              <RevealItem key={member.name}>
                <Card hover glass padding="none" className="overflow-hidden h-full">
                  <div className="bg-linear-to-br from-sage-300 to-sage-500 dark:from-sage-800 dark:to-sage-950 h-48 flex items-center justify-center">
                    <User className="w-16 h-16 text-white/50" aria-hidden="true" />
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-lg">{member.name}</h3>
                    <p className="text-sage-600 dark:text-sage-400 font-semibold text-sm mb-3">{member.role}</p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{member.bio}</p>
                  </div>
                </Card>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* Amenities */}
      <section className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        <Reveal>
          <h2 className="text-3xl md:text-4xl font-bold font-display text-center mb-12">Facilities & Amenities</h2>
        </Reveal>
        <RevealGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {amenities.map((amenity) => (
            <RevealItem key={amenity.title}>
              <AmenityCard {...amenity} />
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {/* Gallery */}
      <section className="bg-gray-50 dark:bg-gray-950 px-4 py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
          <ImageGallery images={galleryImages} />
        </div>
      </section>

      {/* ===== Pricing ===== */}
      <section id="pricing" className="scroll-mt-16 max-w-6xl mx-auto px-4 py-12 md:py-16">
        <Reveal>
          <h2 className="text-3xl md:text-4xl font-bold font-display text-center mb-12">Hourly Rates</h2>
        </Reveal>
        <RevealGroup className="grid md:grid-cols-2 gap-8 mb-8">
          <RevealItem>
            <PricingCard
              title="Off-Peak Hours"
              description="Perfect for morning and afternoon play"
              price={1500}
              timeRange="6:00 AM - 5:00 PM"
              features={["1 hour court access", "Up to 4 players", "Professional ball included", "Free parking", "WiFi access"]}
            />
          </RevealItem>
          <RevealItem>
            <PricingCard
              title="Peak Hours"
              description="Premium evening slots with premium lighting"
              price={2500}
              timeRange="5:00 PM - 10:00 PM"
              features={["1 hour court access", "Up to 4 players", "Professional ball included", "LED lighting included", "Priority booking"]}
              highlighted
            />
          </RevealItem>
        </RevealGroup>

        <Reveal>
          <Card tint="brand" glass padding="md">
            <p className="text-gray-700 dark:text-gray-300 text-center flex items-center justify-center gap-2 flex-wrap">
              <Lightbulb className="w-5 h-5 text-sage-600 dark:text-sage-400 shrink-0" aria-hidden="true" />
              <span>
                <strong>Tip:</strong> Off-peak hours offer great value and are perfect for beginners and casual
                players. Peak hours provide the best lighting conditions and are ideal for competitive matches.
              </span>
            </p>
          </Card>
        </Reveal>
      </section>

      {/* Membership Packages */}
      <section className="bg-gray-50 dark:bg-gray-950 py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4">
          <Reveal>
            <h2 className="text-3xl md:text-4xl font-bold font-display text-center mb-12">Membership Packages</h2>
          </Reveal>
          <Reveal>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
              Save more with our flexible membership plans. Perfect for regular players looking for better rates and
              priority booking.
            </p>
          </Reveal>

          <RevealGroup className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {membershipTiers.map((tier) => (
              <RevealItem key={tier.title}>
                <Card
                  glass
                  hover={!tier.highlighted}
                  padding="lg"
                  tint={tier.highlighted ? "brand" : "neutral"}
                  className={
                    tier.highlighted
                      ? "border-2 border-sage-600 shadow-lg shadow-sage-600/10 md:scale-105 h-full flex flex-col"
                      : "border-2 h-full flex flex-col"
                  }
                >
                  {tier.highlighted && (
                    <div className="mb-4 inline-block bg-sage-600 text-white px-3 py-1 rounded-full text-sm font-semibold w-fit">
                      Popular
                    </div>
                  )}
                  <h3 className="text-2xl font-bold mb-2">{tier.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">{tier.tagline}</p>

                  <div className="mb-6">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Perfect for:</p>
                    <ul className="mt-2 space-y-2 text-sm">
                      {tier.perfectFor.map((item) => (
                        <li key={item} className="flex items-start">
                          <Check className="w-4 h-4 text-green-500 dark:text-green-400 mr-2 mt-0.5 shrink-0" aria-hidden="true" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div
                    className={`mb-6 p-4 rounded-lg ${
                      tier.highlighted ? "bg-sage-100/60 dark:bg-sage-900/30" : "bg-gray-50 dark:bg-gray-950"
                    }`}
                  >
                    <p className="font-bold">{tier.priceLabel}</p>
                    <p className="text-2xl font-bold text-sage-600 dark:text-sage-400">{tier.price}</p>
                    {tier.footnote && <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">{tier.footnote}</p>}
                  </div>

                  <div className="mt-auto">
                    {tier.cta.href ? (
                      <Button href={tier.cta.href} variant={tier.highlighted ? "primary" : "secondary"} fullWidth>
                        {tier.cta.label}
                      </Button>
                    ) : (
                      <Button variant={tier.highlighted ? "primary" : "secondary"} fullWidth>
                        {tier.cta.label}
                      </Button>
                    )}
                  </div>
                </Card>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* Special Offers */}
      <section className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        <Reveal>
          <h2 className="text-3xl md:text-4xl font-bold font-display text-center mb-12">Special Offers</h2>
        </Reveal>

        <RevealGroup className="grid md:grid-cols-2 gap-8">
          {specialOffers.map((offer) => (
            <RevealItem key={offer.title}>
              <Card tint={offer.tint} glass padding="lg" className="border-2 h-full">
                <offer.icon className="w-10 h-10 mb-4 text-gray-700 dark:text-gray-300" aria-hidden="true" />
                <h3 className="text-2xl font-bold mb-3">{offer.title}</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">{offer.description}</p>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300 mb-6">
                  {offer.items.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <Check className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
                <button className="text-sage-600 dark:text-sage-400 font-semibold hover:text-sage-700 dark:hover:text-sage-300 transition-colors">
                  {offer.cta}
                </button>
              </Card>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {/* Equipment Rental */}
      <section className="bg-gray-50 dark:bg-gray-950 py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4">
          <Reveal>
            <h2 className="text-3xl md:text-4xl font-bold font-display text-center mb-12">Equipment Rental</h2>
          </Reveal>

          <RevealGroup className="grid md:grid-cols-3 gap-8">
            {equipment.map((item) => (
              <RevealItem key={item.title}>
                <Card glass padding="md" className="h-full">
                  <div className="w-12 h-12 mb-4 rounded-lg bg-sage-50 dark:bg-sage-950/40 flex items-center justify-center">
                    <item.icon className="w-6 h-6 text-sage-600 dark:text-sage-400" aria-hidden="true" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{item.description}</p>
                  <p className="text-2xl font-bold text-sage-600 dark:text-sage-400">{item.price}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">{item.footnote}</p>
                </Card>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* Pricing FAQ */}
      <section className="max-w-4xl mx-auto px-4 py-12 md:py-16">
        <Reveal>
          <h2 className="text-3xl md:text-4xl font-bold font-display text-center mb-12">Pricing FAQ</h2>
        </Reveal>

        <RevealGroup className="space-y-6">
          {pricingFaqs.map((item) => (
            <RevealItem key={item.q}>
              <Card glass padding="md">
                <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">{item.q}</h3>
                <p className="text-gray-700 dark:text-gray-300">{item.a}</p>
              </Card>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {/* ===== Contact ===== */}
      <section id="contact" className="scroll-mt-16 bg-gray-50 dark:bg-gray-950 px-4 py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <h2 className="text-3xl md:text-4xl font-bold font-display text-center mb-12">Contact Us</h2>
          </Reveal>

          <RevealGroup className="grid md:grid-cols-3 gap-8 mb-16">
            {contactMethods.map((method) => (
              <RevealItem key={method.title}>
                <Card hover glass padding="lg" className="text-center h-full">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-sage-50 dark:bg-sage-950/40 flex items-center justify-center">
                    <method.icon className="w-7 h-7 text-sage-600 dark:text-sage-400" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{method.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">{method.description}</p>
                  <a
                    href={method.href}
                    target={method.external ? "_blank" : undefined}
                    rel={method.external ? "noopener noreferrer" : undefined}
                    className="text-sage-600 dark:text-sage-400 hover:text-sage-700 dark:hover:text-sage-300 font-bold text-lg break-all"
                  >
                    {method.label}
                  </a>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-3">{method.footnote}</p>
                </Card>
              </RevealItem>
            ))}
          </RevealGroup>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Reveal>
              <h3 className="text-3xl font-bold font-display mb-8">Send us a Message</h3>

              <AnimatePresence>
                {submitted && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/40 border border-green-400 dark:border-green-600/60 text-green-700 dark:text-green-300 rounded-lg flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 shrink-0" aria-hidden="true" />
                      Thank you for your message! We&apos;ll get back to you shortly.
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  label="Name *"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Your name"
                />

                <div className="grid md:grid-cols-2 gap-6">
                  <Input
                    label="Email *"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="your@email.com"
                  />
                  <Input
                    label="Phone *"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="+94 71 234 5678"
                  />
                </div>

                <Select
                  label="Subject *"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a subject</option>
                  <option value="booking">Booking Inquiry</option>
                  <option value="lesson">Lessons & Coaching</option>
                  <option value="event">Event/Tournament</option>
                  <option value="general">General Question</option>
                  <option value="feedback">Feedback</option>
                </Select>

                <Textarea
                  label="Message *"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  placeholder="Tell us what you'd like to know..."
                />

                <Button type="submit" fullWidth size="lg">
                  Send Message
                </Button>
              </form>
            </Reveal>

            {/* Info & Location */}
            <Reveal delay={0.1}>
              <h3 className="text-3xl font-bold font-display mb-8">Location & Hours</h3>

              <div className="bg-gray-200 dark:bg-white/10 rounded-xl overflow-hidden mb-8 h-96">
                <iframe
                  title="Map showing the court's location in Kandy, Sri Lanka"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3958.5698652050446!2d80.63270322346892!3d6.927079520049246!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae38ce9c5d5d5d5%3A0x5d5d5d5d5d5d5d5d!2sKandy%2C%20Sri%20Lanka!5e0!3m2!1sen!2slk!4v1234567890"
                ></iframe>
              </div>

              <Card glass padding="md" className="mb-6">
                <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-sage-600 dark:text-sage-400" aria-hidden="true" />
                  Address
                </h4>
                <p className="text-gray-700 dark:text-gray-300">
                  {COURT_NAME} <br />
                  {COURT_LOCATION}
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
                  (Exact address provided upon booking confirmation)
                </p>
              </Card>

              <Card glass padding="md" className="mb-6">
                <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-sage-600 dark:text-sage-400" aria-hidden="true" />
                  Hours
                </h4>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li>
                    <strong>Monday - Friday:</strong> 6:00 AM - 10:00 PM
                  </li>
                  <li>
                    <strong>Saturday:</strong> 7:00 AM - 10:00 PM
                  </li>
                  <li>
                    <strong>Sunday:</strong> 7:00 AM - 9:00 PM
                  </li>
                  <li className="text-yellow-600 dark:text-yellow-400 font-semibold mt-3 flex items-center gap-2">
                    <Trophy className="w-4 h-4 shrink-0" aria-hidden="true" />
                    Closed on public holidays
                  </li>
                </ul>
              </Card>

              <Card glass padding="md">
                <h4 className="font-bold text-lg mb-4">Follow Us</h4>
                <div className="flex space-x-4">
                  <a
                    href="#"
                    className="w-12 h-12 bg-sage-600 hover:bg-sage-700 text-white rounded-lg flex items-center justify-center transition-colors font-bold"
                    aria-label="Facebook"
                    title="Facebook"
                  >
                    f
                  </a>
                  <a
                    href="#"
                    className="w-12 h-12 bg-pink-600 hover:bg-pink-700 text-white rounded-lg flex items-center justify-center transition-colors text-xs font-bold"
                    aria-label="Instagram"
                    title="Instagram"
                  >
                    IG
                  </a>
                  <a
                    href="#"
                    className="w-12 h-12 bg-sky-400 hover:bg-sky-500 text-white rounded-lg flex items-center justify-center transition-colors font-bold"
                    aria-label="Twitter"
                    title="Twitter"
                  >
                    𝕏
                  </a>
                </div>
              </Card>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Contact FAQ */}
      <section className="max-w-4xl mx-auto px-4 py-12 md:py-16">
        <Reveal>
          <h2 className="text-3xl md:text-4xl font-bold font-display text-center mb-12">Frequently Asked Questions</h2>
        </Reveal>

        <RevealGroup className="space-y-6">
          {contactFaqs.map((item) => (
            <RevealItem key={item.q}>
              <Card glass padding="md">
                <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">{item.q}</h3>
                <p className="text-gray-700 dark:text-gray-300">{item.a}</p>
              </Card>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {/* Final CTA */}
      <section className="bg-linear-to-br from-sage-600 to-sage-800 dark:from-sage-800 dark:to-gray-950 text-white py-12 md:py-16">
        <Reveal className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">Ready to Play?</h2>
          <p className="text-lg mb-8 text-sage-100">Join Kandy&apos;s fastest-growing pickleball community</p>
          <Button href="/book" size="lg" className="bg-white! text-sage-700! hover:bg-sage-50!">
            Book Your Court Now
          </Button>
        </Reveal>
      </section>
    </>
  );
}
