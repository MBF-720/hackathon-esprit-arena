"use client";

import { motion } from "framer-motion";

interface SectionTitleProps {
  number?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
}

export default function SectionTitle({
  number,
  title,
  subtitle,
  align = "left",
  className = "",
}: SectionTitleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
      className={`${align === "center" ? "text-center" : ""} ${className}`}
    >
      {number && (
        <span className="text-xs font-mono text-[var(--text-secondary)] tracking-wider">
          {number}
        </span>
      )}
      <h2
        className={`font-bold text-3xl md:text-4xl lg:text-5xl text-white mt-2 ${
          align === "center" ? "mx-auto" : ""
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-[var(--text-secondary)] text-base md:text-lg max-w-2xl">
          {subtitle}
        </p>
      )}
      {align === "left" && (
        <div
          className="mt-4 h-1 w-16 rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)]"
          aria-hidden
        />
      )}
    </motion.div>
  );
}
