"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import LogoCube from "./LogoCube";
import GlowButton from "../ui/GlowButton";

interface HeroSectionProps {
  user?: any;
  aiTag: string;
  kicker: string;
  title: string;
  titleHighlight1: string;
  titleMid: string;
  titleHighlight2: string;
  description: string;
  getStarted: string;
  seeDemo: string;
}

export default function HeroSection({
  user,
  aiTag,
  kicker,
  title,
  titleHighlight1,
  titleMid,
  titleHighlight2,
  description,
  getStarted,
  seeDemo,
}: HeroSectionProps) {
  return (
    <main className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-16 md:pt-24 pb-20">
      <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
        {/* Left: Text content */}
        <div className="flex-1 order-2 lg:order-1">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/40 bg-transparent px-4 py-1.5 mb-6"
          >
            <span
              className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse"
              aria-hidden
            />
            <span className="text-sm font-medium text-[var(--accent)] tracking-wide">
              {aiTag}
            </span>
          </motion.div>

          {/* Small intro */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-sm tracking-wide text-[var(--text-secondary)] uppercase mb-4"
          >
            {kicker}
          </motion.p>

          {/* Title - massive with gradient on keywords */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight max-w-4xl text-[var(--text-primary)]"
          >
            {title}
            <span
              className="bg-gradient-to-r from-[var(--accent)] via-[var(--accent-2)] to-[var(--accent-violet)] bg-clip-text text-transparent"
            >
              {titleHighlight1}
            </span>
            {titleMid}
            <span
              className="bg-gradient-to-r from-[var(--accent)] via-[var(--accent-2)] to-[var(--accent-violet)] bg-clip-text text-transparent"
            >
              {titleHighlight2}
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-6 text-[var(--text-secondary)] max-w-2xl text-base md:text-lg leading-relaxed"
          >
            {description}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8 flex flex-wrap gap-4"
          >
            <GlowButton 
              href={user ? (user.role === 'ADMIN' ? '/dashboard' : user.role === 'COMPANY' ? '/company-dashboard' : '/hackathon') : '/signup'} 
              variant="primary" 
              size="lg"
            >
              {user ? (user.role === 'ADMIN' ? 'Accéder au Dashboard' : user.role === 'COMPANY' ? 'Gérer mes Hackathons' : 'Entrer dans l\'Arène') : getStarted} →
            </GlowButton>
            <GlowButton href="/#demo" variant="secondary" size="lg">
              {seeDemo}
            </GlowButton>
          </motion.div>
        </div>

        {/* Right: Logo Cube with glow */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="order-1 lg:order-2 flex items-center justify-center"
        >
          <LogoCube />
        </motion.div>
      </div>
    </main>
  );
}
