"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import PickleballBounce from "@/components/ui/PickleballBounce";

interface HeroStat {
  value: string;
  label: string;
}

interface HeroProps {
  id?: string;
  title: string;
  subtitle: string;
  cta?: {
    text: string;
    href: string;
  };
  backgroundImage?: string;
  stats?: HeroStat[];
  statsNote?: string;
}

const EASE = [0.16, 1, 0.3, 1] as const;

export default function HeroSection({
  id,
  title,
  subtitle,
  cta,
  backgroundImage,
  stats,
  statsNote,
}: HeroProps) {
  return (
    <section id={id} className="relative px-4 pt-24 pb-10 md:pt-28 md:pb-14 scroll-mt-16">
      {/* Full-bleed photo backdrop behind the inset glass panel - a flat
          gradient fallback when no photo is supplied. */}
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
        {backgroundImage ? (
          <Image
            src={backgroundImage}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-linear-to-br from-sage-600 via-sage-700 to-sage-900" />
        )}
        <div className="absolute inset-0 bg-linear-to-b from-black/55 via-black/45 to-sage-950/80" />
      </div>

      <motion.div
        className="relative max-w-5xl mx-auto rounded-3xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl shadow-black/30 px-6 py-12 md:px-16 md:py-20 text-center text-white"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3, ease: EASE }}
        >
          <PickleballBounce className="w-10 h-10 mb-3 mx-auto" />
        </motion.div>
        <motion.h1
          className="text-4xl md:text-7xl font-bold font-display mb-4 leading-tight tracking-tight uppercase"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
        >
          {title}
        </motion.h1>
        <motion.p
          className="text-lg md:text-2xl mb-8 text-white/90"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
        >
          {subtitle}
        </motion.p>
        {cta && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: EASE }}
          >
            <Button href={cta.href} size="lg">
              {cta.text}
            </Button>
          </motion.div>
        )}

        {stats && stats.length > 0 && (
          <motion.div
            className="mt-12 pt-10 border-t border-white/20"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: EASE }}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <div className="text-3xl md:text-4xl font-bold font-display text-brand-300">
                    {stat.value}
                  </div>
                  <p className="text-sm md:text-base text-white/75 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
            {statsNote && <p className="text-sm text-white/60 mt-6">{statsNote}</p>}
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}
