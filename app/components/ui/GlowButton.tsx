"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface GlowButtonProps {
  children: React.ReactNode;
  href?: string;
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
  external?: boolean;
  icon?: React.ReactNode;
}

export default function GlowButton({
  children,
  href,
  variant = "primary",
  size = "md",
  className = "",
  onClick,
  external = false,
  icon,
}: GlowButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)]";
  const sizeStyles = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };
  const variantStyles = {
    primary:
      "bg-[var(--accent)] text-black hover:scale-105 hover:shadow-[0_0_30px_rgba(0,212,255,0.5)]",
    secondary:
      "border-2 border-[var(--accent)] text-[var(--accent)] bg-transparent hover:bg-[var(--accent)] hover:text-black hover:scale-105 hover:shadow-[0_0_30px_rgba(0,212,255,0.3)]",
  };

  const combinedClassName = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`;

  const content = (
    <>
      {icon}
      {children}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className={combinedClassName}
        onClick={onClick}
      >
        <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="inline-flex items-center gap-2">
          {content}
        </motion.span>
      </Link>
    );
  }

  return (
    <button type="button" className={combinedClassName} onClick={onClick}>
      <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="inline-flex items-center gap-2">
        {content}
      </motion.span>
    </button>
  );
}
