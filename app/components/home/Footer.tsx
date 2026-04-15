"use client";

import Link from "next/link";

interface FooterProps {
  siteNamePart1: string;
  siteNamePart2: string;
  footer: {
    tagline: string;
    product: { arena: string; solutions: string; pricing: string; api: string };
    resources: { docs: string; blog: string; support: string; status: string };
    company: { about: string; careers: string; contact: string; partners: string };
    legal: { privacy: string; terms: string; cookies: string };
    newsletter: { title: string; placeholder: string; cta: string };
    copyright: string;
  };
}

export default function Footer({
  siteNamePart1,
  siteNamePart2,
  footer,
}: FooterProps) {
  const { tagline, product, resources, company, legal, newsletter, copyright } = footer;
  return (
    <footer className="relative z-10 border-t border-white/10 mt-20">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
          {/* Brand + Newsletter */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <div
                className="w-10 h-10 rounded-lg border border-[var(--accent)]/40 flex items-center justify-center font-mono font-bold text-[var(--accent)]"
                style={{ background: "rgba(0, 212, 255, 0.1)" }}
              >
                &gt;_
              </div>
              <span className="text-xl font-bold text-[var(--text-primary)]">
                {siteNamePart1} <span className="text-[var(--accent)]">{siteNamePart2}</span>
              </span>
            </Link>
            <p className="mt-4 text-[var(--text-secondary)] text-sm max-w-sm leading-relaxed">
              {tagline}
            </p>
            <div className="mt-6">
              <p className="text-sm font-medium text-[var(--text-primary)] mb-2">{newsletter.title}</p>
              <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
                <input
                  type="email"
                  placeholder={newsletter.placeholder}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 text-sm focus:outline-none focus:border-[var(--accent)]"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-lg bg-[var(--accent)] text-black font-semibold text-sm hover:shadow-[0_0_20px_rgba(0,212,255,0.4)] transition-shadow"
                >
                  {newsletter.cta}
                </button>
              </form>
            </div>
          </div>

          {/* Produit */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-primary)] mb-4">
              Produit
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/hackathon" className="text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors text-sm">
                  {product.arena}
                </Link>
              </li>
              <li>
                <Link href="/#solutions" className="text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors text-sm">
                  {product.solutions}
                </Link>
              </li>
              <li>
                <Link href="/#pricing" className="text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors text-sm">
                  {product.pricing}
                </Link>
              </li>
              <li>
                <Link href="/api" className="text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors text-sm">
                  {product.api}
                </Link>
              </li>
            </ul>
          </div>

          {/* Ressources */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-primary)] mb-4">
              Ressources
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/docs" className="text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors text-sm">
                  {resources.docs}
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors text-sm">
                  {resources.blog}
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors text-sm">
                  {resources.support}
                </Link>
              </li>
              <li>
                <Link href="/status" className="text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors text-sm">
                  {resources.status}
                </Link>
              </li>
            </ul>
          </div>

          {/* Entreprise */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-primary)] mb-4">
              Entreprise
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors text-sm">
                  {company.about}
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors text-sm">
                  {company.careers}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors text-sm">
                  {company.contact}
                </Link>
              </li>
              <li>
                <Link href="/partners" className="text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors text-sm">
                  {company.partners}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom: Legal + Social */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex flex-wrap gap-6 text-sm">
            <Link href="/privacy" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              {legal.privacy}
            </Link>
            <Link href="/terms" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              {legal.terms}
            </Link>
            <Link href="/cookies" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              {legal.cookies}
            </Link>
          </div>
          <div className="flex gap-4">
            {["twitter", "github", "linkedin", "discord"].map((social) => (
              <a
                key={social}
                href="#"
                className="w-10 h-10 rounded-lg border border-white/10 flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--accent)] hover:border-[var(--accent)]/50 hover:shadow-[0_0_15px_rgba(0,212,255,0.2)] transition-all"
                aria-label={social}
              >
                <span className="text-lg font-mono">◇</span>
              </a>
            ))}
          </div>
        </div>
        <p className="mt-6 text-[var(--text-secondary)] text-sm">{copyright}</p>
      </div>
    </footer>
  );
}
