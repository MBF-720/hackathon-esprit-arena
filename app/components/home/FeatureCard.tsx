"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface FeatureCardProps {
  number: string;
  title: string;
  description: string;
  features: readonly string[];
  href?: string;
  cta?: string;
  icon?: React.ReactNode;
  index?: number;
}

export default function FeatureCard({
  number,
  title,
  description,
  features,
  href = "#",
  cta = "Explorer →",
  icon,
  index = 0,
}: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center py-12 md:py-20 border-b border-white/10 last:border-0"
    >
      <div>
        <span className="text-xs font-mono text-[var(--text-secondary)]">
          {number}
        </span>
        <h3 className="mt-2 text-2xl md:text-3xl lg:text-4xl font-bold text-white">
          {title}
        </h3>
        <p className="mt-4 text-[var(--text-secondary)] text-base md:text-lg leading-relaxed">
          {description}
        </p>
        <ul className="mt-6 space-y-2">
          {features.map((f, i) => (
            <li
              key={i}
              className="text-xs md:text-sm uppercase tracking-wider text-[var(--accent)]/90"
            >
              • {f}
            </li>
          ))}
        </ul>
        <Link
          href={href}
          className="inline-flex items-center gap-2 mt-6 text-[var(--accent)] font-medium hover:gap-3 transition-all group"
        >
          {cta.replace(/→\s*$/, "")}
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </Link>
      </div>
      <div className="flex justify-center lg:justify-end">
        {icon ? (
          icon
        ) : (
          <div
            className="w-32 h-32 md:w-40 md:h-40 rounded-2xl border border-[var(--accent)]/30 bg-[var(--accent)]/5 flex items-center justify-center"
            style={{ boxShadow: "0 0 30px rgba(0, 212, 255, 0.15)" }}
          >
            <span className="text-4xl font-mono text-[var(--accent)]">&gt;_</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
