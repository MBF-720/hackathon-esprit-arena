"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import PlatformNavbar from "../components/PlatformNavbar";
import StatCard from "../components/StatCard";
import FeatureCard from "../components/FeatureCard";

interface Stat {
  label: string;
  value: string | number;
  icon: string;
}

interface Skill {
  name: string;
  count: number;
  frequency: number;
  proficiency: number;
}

export default function AnalyticsPage() {
  const [tier, setTier] = useState<"BASIC" | "PRO">("PRO");
  const [stats, setStats] = useState<any>(null);
  const [topSkills, setTopSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userTier = localStorage.getItem("userPlan") || "PRO";
    setTier(userTier as "BASIC" | "PRO");

    const fetchData = async () => {
      try {
        const [overviewRes, skillsRes] = await Promise.all([
          fetch(`/api/analytics/overview?tier=${userTier}`),
          fetch(`/api/analytics/skills?tier=${userTier}`),
        ]);

        const overview = await overviewRes.json();
        const skills = await skillsRes.json();

        setStats(overview);
        setTopSkills(skills.skills.slice(0, 8));
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  if (loading) {
    return (
      <>
        <PlatformNavbar />
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </>
    );
  }

  return (
    <>
      <PlatformNavbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  Analytics Dashboard
                </h1>
                <p className="text-slate-400">Talent Pool & Platform Insights</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/20 border border-purple-500/50">
                <span className="text-sm text-slate-300">Plan:</span>
                <span className="font-semibold text-purple-300">{tier}</span>
              </div>
            </div>
          </motion.div>

          {/* Top Stats */}
          {stats && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
            >
              <motion.div variants={itemVariants}>
                <StatCard
                  label="Total Developers"
                  value={stats.stats?.totalDevelopers || 1250}
                  icon="👥"
                  trend={{ value: 12, isPositive: true }}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <StatCard
                  label="Platform Score"
                  value={`${(stats.stats?.avgPlatformScore || 7.8).toFixed(1)}/10`}
                  icon="⭐"
                  trend={{ value: 8, isPositive: true }}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <StatCard
                  label="Submissions Completed"
                  value={stats.stats?.totalCompleted || 8920}
                  icon="✅"
                  trend={{ value: 24, isPositive: true }}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <StatCard
                  label="Active This Month"
                  value={stats.stats?.activeLast30Days || 420}
                  icon="🔥"
                  trend={{ value: 15, isPositive: true }}
                />
              </motion.div>
            </motion.div>
          )}

          {/* Top Skills */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="p-5 rounded-lg bg-slate-700/30 border border-slate-600 mb-8"
          >
            <h2 className="text-lg font-semibold text-white mb-4">
              In-Demand Skills
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
              {topSkills.map((skill, idx) => (
                <motion.div
                  key={idx}
                  className="p-3 rounded bg-slate-600/50 text-center hover:bg-slate-600 transition-colors"
                >
                  <p className="font-medium text-white text-xs line-clamp-2">
                    {skill.name}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {skill.count} devs
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Feature Cards */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <motion.div variants={itemVariants}>
              <FeatureCard
                title="Talent Pool"
                description="Browse and recruit top developers"
                href="/analytics/developers"
                icon="👥"
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <FeatureCard
                title="Skills Market"
                description="Track in-demand technical skills"
                href="/analytics/skills"
                icon="📊"
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <FeatureCard
                title={tier === "PRO" ? "Pro Plan" : "Upgrade Plan"}
                description={
                  tier === "PRO"
                    ? "You have full access to all premium features"
                    : "Unlock exclusive analytics and advanced features"
                }
                href="/analytics/upgrade"
                icon={tier === "PRO" ? "✅" : "🚀"}
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
