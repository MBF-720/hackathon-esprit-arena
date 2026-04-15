"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface FeatureCardProps {
  title: string;
  description: string;
  href: string;
  icon: string;
}

export default function FeatureCard({
  title,
  description,
  href,
  icon,
}: FeatureCardProps) {
  return (
    <Link href={href}>
      <motion.div className="rounded-lg bg-slate-700/30 border border-slate-600 p-6 h-full hover:bg-slate-700/50 hover:border-blue-500/50 transition-all duration-200 cursor-pointer">
        <div className="mb-4">
          <span className="text-4xl">{icon}</span>
        </div>
        
        <h3 className="text-lg font-semibold text-white mb-2">
          {title}
        </h3>

        <p className="text-sm text-slate-400 mb-4">
          {description}
        </p>

        <div className="flex items-center gap-2 text-blue-400 text-sm font-medium">
          <span>Learn more</span>
          <span>→</span>
        </div>
      </motion.div>
    </Link>
  );
}
