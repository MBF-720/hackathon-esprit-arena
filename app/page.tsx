"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAccessibility } from "./contexts/AccessibilityContext";
import { translations } from "./lib/translations";
import HomeNavbar from "./components/home/HomeNavbar";
import HeroSection from "./components/home/HeroSection";
import FeatureCard from "./components/home/FeatureCard";
import RoomCard from "./components/home/RoomCard";
import PricingCard from "./components/home/PricingCard";
import Footer from "./components/home/Footer";
import GlowButton from "./components/ui/GlowButton";
import SectionTitle from "./components/ui/SectionTitle";
import { motion } from "framer-motion";
import { getToken, getProfile } from "./lib/api";

export default function Home() {
  const { lang, zoomIn, zoomOut } = useAccessibility();
  const t = translations[lang];
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (getToken()) {
      getProfile().then(setUser).catch(() => setUser(null));
    }
  }, []);

  return (
    <div className="min-h-screen text-[var(--text-primary)] font-sans relative overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(0,212,255,0.12),transparent)]" />
        <div className="absolute top-[20vh] left-[10%] h-[min(60vw,420px)] w-[min(60vw,420px)] rounded-full bg-[var(--accent)]/[0.06] blur-3xl" />
        <div className="absolute bottom-[10%] right-[5%] h-[min(50vw,360px)] w-[min(50vw,360px)] rounded-full bg-[var(--accent-violet)]/[0.07] blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(148,163,184,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.4) 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      {/* Contrôles Zoom */}
      <div
        className="fixed bottom-6 right-6 z-50 flex items-stretch rounded-lg overflow-hidden glass border border-white/10 shadow-lg"
        role="group"
        aria-label={t.a11y.zoom}
      >
        <button
          type="button"
          onClick={zoomOut}
          className="flex items-center justify-center w-12 h-10 text-white/70 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-inset"
          title={t.a11y.zoomOut}
          aria-label={t.a11y.zoomOut}
        >
          <span className="text-lg font-light leading-none">−</span>
        </button>
        <div className="w-px bg-white/20 shrink-0" aria-hidden />
        <button
          type="button"
          onClick={zoomIn}
          className="flex items-center justify-center w-12 h-10 text-white/70 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-inset"
          title={t.a11y.zoomIn}
          aria-label={t.a11y.zoomIn}
        >
          <span className="text-lg font-light leading-none">+</span>
        </button>
      </div>

      <HomeNavbar user={user} />
      <HeroSection
        user={user}
        aiTag={t.hero.aiTag}
        kicker={t.hero.kicker}
        title={t.hero.title}
        titleHighlight1={t.hero.titleHighlight1}
        titleMid={t.hero.titleMid}
        titleHighlight2={t.hero.titleHighlight2}
        description={t.hero.description}
        getStarted={t.hero.getStarted}
        seeDemo={t.hero.seeDemo}
      />

      {/* Stats */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { value: "15,000+", label: t.stats.devs, icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
            { value: "450+", label: t.stats.hackathons, icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
            { value: "98%", label: t.stats.accuracy, icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl border border-white/10 glass p-6 flex flex-col gap-3 hover:border-[var(--accent)]/35 transition-colors shadow-sm"
            >
              <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/20 flex items-center justify-center text-[var(--accent)]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} /></svg>
              </div>
              <span className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">{stat.value}</span>
              <span className="text-[var(--text-secondary)]">{stat.label}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Solutions */}
      <section id="solutions" className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-20 border-t border-white/10">
        <SectionTitle number="01" title={t.solutions.title} subtitle={t.solutions.subtitle} />
        <div className="mt-12">
          <FeatureCard number="01" title={t.solutions.solution1.title} description={t.solutions.solution1.desc} features={t.solutions.solution1.features} index={0} />
          <FeatureCard number="02" title={t.solutions.solution2.title} description={t.solutions.solution2.desc} features={t.solutions.solution2.features} index={1} />
          <FeatureCard number="03" title={t.solutions.solution3.title} description={t.solutions.solution3.desc} features={t.solutions.solution3.features} index={2} />
          <FeatureCard number="04" title={t.solutions.solution4.title} description={t.solutions.solution4.desc} features={t.solutions.solution4.features} index={3} />
        </div>
      </section>

      {/* Comment ça marche */}
      <section id="how" className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-20 border-t border-white/10">
        <SectionTitle number="02" title={t.howItWorks.title} subtitle={t.howItWorks.subtitle} align="center" />
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-10 xl:gap-6">
          {[
            { title: t.howItWorks.step1.title, desc: t.howItWorks.step1.desc, num: "1" },
            { title: t.howItWorks.step2.title, desc: t.howItWorks.step2.desc, num: "2" },
            { title: t.howItWorks.step3.title, desc: t.howItWorks.step3.desc, num: "3" },
            { title: t.howItWorks.step4.title, desc: t.howItWorks.step4.desc, num: "4" },
            { title: t.howItWorks.step5.title, desc: t.howItWorks.step5.desc, num: "5" },
          ].map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-xl border border-[var(--accent)]/40 bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] font-bold text-lg mb-4">
                  {step.num}
                </div>
                <h4 className="text-lg font-bold text-[var(--text-primary)]">{step.title}</h4>
                <p className="mt-2 text-sm text-[var(--text-secondary)] leading-relaxed">{step.desc}</p>
              </div>
              {i < 4 && (
                <div className="hidden xl:block absolute top-7 left-[calc(50%+1.75rem)] w-[calc(100%-3.5rem)] max-w-[120px] h-px bg-gradient-to-r from-[var(--accent)]/50 to-transparent" />
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Rooms & Spécialités */}
      <section id="rooms" className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-20 border-t border-white/10">
        <SectionTitle number="03" title={t.rooms.title} subtitle={t.rooms.subtitle} />
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: t.rooms.web, participants: 3240, icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg> },
            { title: t.rooms.mobile, participants: 1890, icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg> },
            { title: t.rooms.backend, participants: 2567, icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg> },
            { title: t.rooms.data, participants: 1423, icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> },
            { title: t.rooms.security, participants: 987, icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg> },
            { title: t.rooms.design, participants: 756, icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg> },
          ].map((room, i) => (
            <RoomCard key={i} {...room} index={i} />
          ))}
        </div>
      </section>

      {/* Trust Badges */}
      <section id="trust" className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-20 border-t border-white/10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center text-2xl font-bold text-[var(--text-secondary)] mb-12"
        >
          {t.trust.title}
        </motion.h2>
        <div className="flex flex-wrap justify-center gap-4 sm:gap-8 items-center">
          {t.trust.badges.map((badge, i) => (
            <motion.span
              key={badge}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="px-5 py-2.5 rounded-full border border-[var(--glass-border)] bg-[var(--card)]/50 text-sm font-mono text-[var(--text-secondary)] hover:border-[var(--accent)]/40 hover:text-[var(--accent)] transition-colors"
            >
              {badge}
            </motion.span>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-20 border-t border-white/10">
        <SectionTitle number="04" title={t.pricing.title} subtitle={t.pricing.subtitle} align="center" />
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <PricingCard name={t.pricing.free.name} price={t.pricing.free.price} description={t.pricing.free.desc} features={t.pricing.free.features} cta={t.pricing.free.cta} href="/signup" index={0} />
          <PricingCard name={t.pricing.pro.name} price={t.pricing.pro.price} description={t.pricing.pro.desc} features={t.pricing.pro.features} cta={t.pricing.pro.cta} href="/signup" recommended index={1} />
          <PricingCard name={t.pricing.enterprise.name} price={t.pricing.enterprise.price} description={t.pricing.enterprise.desc} features={t.pricing.enterprise.features} cta={t.pricing.enterprise.cta} href="#contact" index={2} />
        </div>
      </section>

      {/* CTA Finale */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-24 border-t border-white/10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center rounded-3xl border border-[var(--accent)]/30 bg-gradient-to-b from-[var(--accent)]/10 to-transparent p-12 md:p-16 shadow-[0_0_60px_-12px_rgba(0,212,255,0.15)]"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--text-primary)]">
            {t.cta.title}
          </h2>
          <p className="mt-4 text-[var(--text-secondary)] text-lg">
            {t.cta.subtitle}
          </p>
          <div className="mt-8">
            <GlowButton href="/signup" variant="primary" size="lg">
              {t.cta.button}
            </GlowButton>
          </div>
        </motion.div>
      </section>

      {/* Évaluation (démo) */}
      <section id="demo" className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-20 border-t border-white/10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">{t.evaluation.title}</h2>
            <p className="mt-4 text-[var(--text-secondary)] leading-relaxed">{t.evaluation.description}</p>
            <ul className="mt-6 space-y-3">
              {[t.evaluation.item1, t.evaluation.item2, t.evaluation.item3].map((label, i) => (
                <li key={i} className="flex items-center gap-3 text-[var(--text-primary)]">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--accent)]/20 flex items-center justify-center text-[var(--accent)]">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </span>
                  {label}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative">
            <div className="aspect-video rounded-2xl border border-white/10 glass flex items-center justify-center overflow-hidden">
              <button type="button" className="w-20 h-20 rounded-full bg-[var(--accent)]/20 hover:bg-[var(--accent)]/30 flex items-center justify-center text-[var(--accent)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent)]" aria-label={t.evaluation.playVideo}>
                <svg className="w-10 h-10 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer
        siteNamePart1={t.siteNamePart1}
        siteNamePart2={t.siteNamePart2}
        footer={t.footer}
      />
    </div>
  );
}
