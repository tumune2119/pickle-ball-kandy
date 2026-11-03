"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";

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
    <section id={id} className="relative px-4 pt-28 pb-0 scroll-mt-16 min-h-[88vh] flex flex-col justify-end overflow-hidden">
      {/* Full-bleed photo, flat dark scrim for text legibility (a functional
          necessity over a photo, not a decorative gradient) - a flat ink
          fallback when no photo is supplied. */}
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
        {backgroundImage ? (
          <Image src={backgroundImage} alt="" fill priority sizes="100vw" className="object-cover" />
        ) : (
          <div className="absolute inset-0 bg-ink" />
        )}
        <div className="absolute inset-0 bg-ink/55" />
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-ink via-ink/70 to-transparent" />
      </div>

      <div className="relative max-w-5xl mx-auto w-full pb-14">
        <motion.div
          initial={{ opacity: 0, y: -8, rotate: -4 }}
          animate={{ opacity: 1, y: 0, rotate: -3 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="inline-flex items-center gap-2 bg-action-lime text-text-on-lime border-2 border-ink rounded-full px-4 py-1 text-xs font-bold uppercase tracking-wide shadow-[3px_3px_0_var(--color-ink)] mb-5"
        >
          Vol. 01 — Kandy
        </motion.div>

        <motion.h1
          className="font-display uppercase text-white mb-4 leading-[0.92] tracking-tight text-5xl sm:text-6xl md:text-8xl skew-display"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
        >
          {title}
        </motion.h1>

        <motion.p
          className="font-editorial italic text-lg md:text-2xl mb-8 text-white/90 max-w-2xl"
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
            <Button href={cta.href} variant="lime" size="lg">
              {cta.text}
            </Button>
          </motion.div>
        )}
      </div>

      {stats && stats.length > 0 && (
        <motion.div
          className="relative border-t-2 border-concrete-800 bg-ink"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: EASE }}
        >
          <div className="max-w-5xl mx-auto">
            <div className={`grid divide-x-2 divide-concrete-800 ${stats.length >= 4 ? "grid-cols-2 md:grid-cols-4" : "grid-cols-3"}`}>
              {stats.map((stat) => (
                <div key={stat.label} className="px-4 py-6 text-center">
                  <div className="font-mono text-2xl md:text-4xl font-bold text-action-lime tabular-nums">
                    {stat.value}
                  </div>
                  <p className="text-xs md:text-sm text-white/70 mt-1 uppercase tracking-wide">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
          {statsNote && <p className="text-xs text-white/50 text-center pb-4 px-4">{statsNote}</p>}
        </motion.div>
      )}
    </section>
  );
}
