"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import PlatformNavbar from "../../components/PlatformNavbar";

interface Plan {
  name: "BASIC" | "PRO";
  price: number;
  period: string;
  description: string;
  features: string[];
  color: string;
  highlighted?: boolean;
}

const plans: Plan[] = [
  {
    name: "BASIC",
    price: 0,
    period: "Free",
    description: "Perfect for getting started",
    color: "from-slate-600 to-slate-700",
    features: [
      "Browse top 10 developers",
      "View top 10 in-demand skills",
      "Limited profile information",
      "Search & filter developers",
      "Community support",
    ],
  },
  {
    name: "PRO",
    price: 99,
    period: "per month",
    description: "For serious recruitment",
    color: "from-purple-600 to-pink-600",
    highlighted: true,
    features: [
      "Access to 100+ developers",
      "Complete developer profiles with CVs",
      "Email addresses & contact info",
      "Top 30 skills + 12-month trends",
      "Advanced filtering & sorting",
      "Export developer lists",
      "Priority support",
      "Custom reports",
      "Integration with ATS",
    ],
  },
];

export default function UpgradePage() {
  const router = useRouter();
  const [currentPlan] = useState<"BASIC" | "PRO">("BASIC");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const handleUpgrade = (plan: "BASIC" | "PRO") => {
    if (plan === "BASIC") {
      // Downgrade to free
      localStorage.setItem("userPlan", "BASIC");
      router.push("/analytics");
    } else {
      // Redirect to payment
      console.log("Redirecting to payment for PRO plan...");
      // In production, this would redirect to Stripe/PayPal checkout
    }
  };

  return (
    <>
      <PlatformNavbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl font-bold text-white mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Choose the plan that fits your recruitment needs. Upgrade or downgrade anytime.
            </p>
          </motion.div>

          {/* Current Plan Badge */}
          {currentPlan && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center mb-12"
            >
              <span className="px-4 py-2 rounded-full bg-green-500/20 border border-green-500/50 text-green-300 text-sm font-semibold">
                Current Plan: {currentPlan}
              </span>
            </motion.div>
          )}

          {/* Plans */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16"
          >
            {plans.map((plan, idx) => (
              <motion.div key={idx} variants={itemVariants}>
                <div
                  className={`relative p-8 rounded-2xl border transition-all ${
                    plan.highlighted
                      ? `bg-gradient-to-br ${plan.color} border-pink-400 shadow-2xl shadow-pink-500/20 scale-105`
                      : "bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 hover:border-purple-500/50"
                  }`}
                >
                  {/* Badge */}
                  {plan.highlighted && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="px-4 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 text-slate-900 text-xs font-bold">
                        RECOMMENDED
                      </span>
                    </div>
                  )}

                  {/* Plan Name & Price */}
                  <div className="mb-6">
                    <h2 className={`text-3xl font-bold mb-2 ${plan.highlighted ? "text-white" : "text-white"}`}>
                      {plan.name}
                    </h2>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-5xl font-bold ${plan.highlighted ? "text-white" : "text-white"}`}>
                        ${plan.price}
                      </span>
                      <span className={`${plan.highlighted ? "text-white/80" : "text-slate-400"}`}>
                        {plan.period}
                      </span>
                    </div>
                    <p className={`text-sm mt-2 ${plan.highlighted ? "text-white/70" : "text-slate-400"}`}>
                      {plan.description}
                    </p>
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleUpgrade(plan.name)}
                    className={`w-full py-3 rounded-lg font-bold transition-all mb-8 ${
                      plan.highlighted
                        ? "bg-white text-purple-600 hover:bg-white/90 shadow-lg"
                        : currentPlan === plan.name
                        ? "bg-slate-600 text-white cursor-default"
                        : "bg-purple-500 text-white hover:bg-purple-600"
                    }`}
                    disabled={currentPlan === plan.name}
                  >
                    {currentPlan === plan.name
                      ? "Current Plan"
                      : plan.name === "BASIC"
                      ? "Downgrade"
                      : "Upgrade Now"}
                  </button>

                  {/* Features */}
                  <div className="space-y-4">
                    {plan.features.map((feature, fidx) => (
                      <motion.div
                        key={fidx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: fidx * 0.05 }}
                        className="flex items-start gap-3"
                      >
                        <span className={`mt-1 text-xl ${plan.highlighted ? "text-white" : "text-purple-400"}`}>
                          ✓
                        </span>
                        <span
                          className={`${
                            plan.highlighted ? "text-white/90" : "text-slate-300"
                          }`}
                        >
                          {feature}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* FAQ Section */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="max-w-3xl mx-auto mb-16"
          >
            <h3 className="text-2xl font-bold text-white mb-8 text-center">
              Frequently Asked Questions
            </h3>
            <div className="space-y-4">
              {[
                {
                  q: "Can I upgrade or downgrade my plan anytime?",
                  a: "Yes! You can change your plan at any time. Changes take effect immediately.",
                },
                {
                  q: "Do you offer refunds?",
                  a: "We offer a 30-day money-back guarantee if you're not satisfied with your plan.",
                },
                {
                  q: "Is there a contract lock-in?",
                  a: "No contracts. You can cancel your subscription at any time, no questions asked.",
                },
                {
                  q: "How do I contact support?",
                  a: "PRO members get priority support via email and chat. BASIC users have access to our community forum.",
                },
              ].map((faq, idx) => (
                <motion.div
                  key={idx}
                  className="p-4 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-purple-500/50 transition-all"
                >
                  <p className="font-semibold text-white mb-2">{faq.q}</p>
                  <p className="text-slate-400">{faq.a}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Exit Message */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="text-center"
          >
            <p className="text-slate-400 mb-4">
              Have questions? Contact us at support@arenaofcoders.com
            </p>
            <Link href="/analytics">
              <button className="px-6 py-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-semibold transition-all">
                Back to Analytics
              </button>
            </Link>
          </motion.div>
        </div>
      </div>
    </>
  );
}
