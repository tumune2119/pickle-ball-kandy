"use client";

import { useState } from "react";
import HeroSection from "../_components/HeroSection";

export default function ContactPage() {
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
        title="Contact Us"
        subtitle="Get in touch with Kandy 1st Court"
      />

      {/* Content */}
      <section className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {/* Phone */}
          <div className="bg-white dark:bg-gray-900 rounded-lg p-8 border border-gray-200 dark:border-white/10 text-center hover:shadow-lg transition">
            <div className="text-5xl mb-4">📞</div>
            <h3 className="text-xl font-bold mb-2">Call Us</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Reach us by phone during business hours
            </p>
            <a
              href="tel:+94712345678"
              className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-bold text-lg"
            >
              +94 71 234 5678
            </a>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-3">
              Mon-Sun: 6:00 AM - 10:00 PM
            </p>
          </div>

          {/* Email */}
          <div className="bg-white dark:bg-gray-900 rounded-lg p-8 border border-gray-200 dark:border-white/10 text-center hover:shadow-lg transition">
            <div className="text-5xl mb-4">✉️</div>
            <h3 className="text-xl font-bold mb-2">Email Us</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Send us a message anytime</p>
            <a
              href="mailto:hello@kandypickleball.lk"
              className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-bold break-all"
            >
              hello@kandypickleball.lk
            </a>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-3">
              Response within 24 hours
            </p>
          </div>

          {/* WhatsApp */}
          <div className="bg-white dark:bg-gray-900 rounded-lg p-8 border border-gray-200 dark:border-white/10 text-center hover:shadow-lg transition">
            <div className="text-5xl mb-4">💬</div>
            <h3 className="text-xl font-bold mb-2">WhatsApp</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Chat with us on WhatsApp for quick replies
            </p>
            <a
              href="https://wa.me/94712345678"
              className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-bold text-lg"
              target="_blank"
              rel="noopener noreferrer"
            >
              💬 Chat on WhatsApp
            </a>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-3">
              Usually reply within minutes
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <h2 className="text-3xl font-bold mb-8">Send us a Message</h2>

            {submitted && (
              <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/40 border border-green-400 dark:border-green-600/60 text-green-700 dark:text-green-300 rounded-lg">
                ✓ Thank you for your message! We&apos;ll get back to you shortly.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-white/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 dark:focus:ring-purple-500"
                  placeholder="Your name"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-white/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 dark:focus:ring-purple-500"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-white/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 dark:focus:ring-purple-500"
                    placeholder="+94 71 234 5678"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">
                  Subject *
                </label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-white/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 dark:focus:ring-purple-500"
                >
                  <option value="">Select a subject</option>
                  <option value="booking">Booking Inquiry</option>
                  <option value="lesson">Lessons & Coaching</option>
                  <option value="event">Event/Tournament</option>
                  <option value="general">General Question</option>
                  <option value="feedback">Feedback</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">
                  Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-white/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 dark:focus:ring-purple-500"
                  placeholder="Tell us what you'd like to know..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition"
              >
                Send Message
              </button>
            </form>
          </div>

          {/* Info & Location */}
          <div>
            <h2 className="text-3xl font-bold mb-8">Location & Hours</h2>

            {/* Map */}
            <div className="bg-gray-200 dark:bg-white/10 rounded-lg overflow-hidden mb-8 h-96">
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

            {/* Address */}
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-white/10 mb-6">
              <h3 className="font-bold text-lg mb-3">📍 Address</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Kandy 1st Court <br />
                Kandy, Sri Lanka
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
                (Exact address provided upon booking confirmation)
              </p>
            </div>

            {/* Hours */}
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-white/10 mb-6">
              <h3 className="font-bold text-lg mb-3">🕐 Hours</h3>
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
                <li className="text-yellow-600 dark:text-yellow-400 font-semibold mt-3">
                  🏆 Closed on public holidays
                </li>
              </ul>
            </div>

            {/* Social Media */}
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-white/10">
              <h3 className="font-bold text-lg mb-4">Follow Us</h3>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="w-12 h-12 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center justify-center transition"
                  title="Facebook"
                >
                  f
                </a>
                <a
                  href="#"
                  className="w-12 h-12 bg-pink-600 hover:bg-pink-700 text-white rounded-lg flex items-center justify-center transition"
                  title="Instagram"
                >
                  📷
                </a>
                <a
                  href="#"
                  className="w-12 h-12 bg-sky-400 hover:bg-sky-500 text-white rounded-lg flex items-center justify-center transition"
                  title="Twitter"
                >
                  𝕏
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-gray-50 dark:bg-gray-950 py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            {[
              {
                q: "How do I book a court slot?",
                a: "Visit the booking page, select your preferred date and time, and complete the booking. You'll receive a confirmation via email and SMS.",
              },
              {
                q: "What's your cancellation policy?",
                a: "Free cancellation up to 4 hours before your booking. Cancellations within 4 hours will be charged at full rate.",
              },
              {
                q: "Do you offer lessons for beginners?",
                a: "Yes! We offer group and private lessons with certified coaches. Contact us or check the pricing page for details.",
              },
              {
                q: "Can I host a tournament at your facility?",
                a: "Absolutely! We can accommodate tournaments and special events. Contact us to discuss your requirements.",
              },
              {
                q: "Is equipment rental available?",
                a: "Yes, we rent professional paddles, shoes, and provide quality pickleballs with all bookings.",
              },
            ].map((item, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-white/10">
                <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">
                  {item.q}
                </h3>
                <p className="text-gray-700 dark:text-gray-300">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
