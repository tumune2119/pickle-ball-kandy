"use client";

import { motion } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1] as const;

// RevealGroup/RevealItem sometimes wrap table rows (tbody/tr), which must
// stay real table elements for the browser's table layout to work - a
// motion.div in place of a <tr> would break the grid.
const GROUP_TAGS = { div: motion.div, tbody: motion.tbody, ul: motion.ul } as const;
const ITEM_TAGS = { div: motion.div, tr: motion.tr, li: motion.li } as const;

type GroupTag = keyof typeof GROUP_TAGS;
type ItemTag = keyof typeof ITEM_TAGS;

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  y?: number;
}

// Scroll-triggered fade+slide reveal for marketing/public sections. Fires
// once (viewport.once) so re-scrolling past a section doesn't replay it.
export default function Reveal({ children, delay = 0, className, y = 24 }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

// Use together: RevealGroup on the grid/list container, RevealItem on each
// child, for a staggered entrance (cards, stat tiles, table rows, etc.).
export function RevealGroup({
  children,
  className,
  stagger = 0.08,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  as?: GroupTag;
}) {
  const Component = GROUP_TAGS[as];
  return (
    <Component
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger } } }}
    >
      {children}
    </Component>
  );
}

export function RevealItem({
  children,
  className,
  y = 24,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  y?: number;
  as?: ItemTag;
}) {
  const Component = ITEM_TAGS[as];
  return (
    <Component
      className={className}
      variants={{
        hidden: { opacity: 0, y },
        show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
      }}
    >
      {children}
    </Component>
  );
}
