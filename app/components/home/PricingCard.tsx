"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface PricingCardProps {
  name: string;
  price: string;
  description: string;
  features: readonly string[];
  cta: string;
  href: string;
  recommended?: boolean;
  index?: number;
}

export default function PricingCard({
  name,
  price,
  description,
  features,
  cta,
  href,
  recommended = false,
  index = 0,
}: PricingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`relative rounded-2xl border p-8 ${
        recommended
          ? "border-[var(--accent)] bg-[var(--accent)]/5 shadow-[0_0_40px_rgba(0,212,255,0.2)]"
          : "border-white/10 bg-white/5 backdrop-blur-xl hover:border-white/20"
      }`}
    >
      {recommended && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[var(--accent)] text-black text-sm font-semibold">
          Recommandé
        </div>
      )}
      <h4 className="text-xl font-bold text-white">{name}</h4>
      <div className="mt-4">
        <span className="text-4xl font-bold text-white">{price}</span>
      </div>
      <p className="mt-2 text-[var(--text-secondary)]">{description}</p>
      <ul className="mt-6 space-y-3">
        {features.map((f, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-white/90">
            <svg
              className="w-5 h-5 text-[var(--accent)] shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            {f}
          </li>
        ))}
      </ul>
      <Link
        href={href}
        className={`mt-8 block w-full text-center py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
          recommended
            ? "bg-[var(--accent)] text-black hover:shadow-[0_0_30px_rgba(0,212,255,0.5)]"
            : "border border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-black"
        }`}
      >
        {cta}
      </Link>
    </motion.div>
  );
}
