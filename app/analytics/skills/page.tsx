"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import PlatformNavbar from "../../components/PlatformNavbar";

interface Skill {
  name: string;
  count: number;
  frequency: number;
  proficiency: number;
}

interface SkillTrend {
  month: string;
  count: number;
}

export default function SkillsPage() {
  const [tier, setTier] = useState<"BASIC" | "PRO">("PRO");
  const [skills, setSkills] = useState<Skill[]>([]);
  const [trends, setTrends] = useState<SkillTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const userTier = localStorage.getItem("userPlan") || "PRO";
    setTier(userTier as "BASIC" | "PRO");

    const fetchSkills = async () => {
      try {
        const res = await fetch(`/api/analytics/skills?tier=${userTier}`);
        const data = await res.json();
        setSkills(data.skills);
        if (data.trending) {
          setTrends(data.trending);
        }
      } catch (error) {
        console.error("Error fetching skills:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
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

  const filteredSkills = skills.filter((skill) =>
    skill.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSkillColor = (index: number) => {
    const colors = [
      "from-blue-500 to-cyan-500",
      "from-purple-500 to-pink-500",
      "from-green-500 to-emerald-500",
      "from-orange-500 to-red-500",
      "from-indigo-500 to-purple-500",
      "from-yellow-500 to-orange-500",
      "from-rose-500 to-pink-500",
      "from-teal-500 to-cyan-500",
    ];
    return colors[index % colors.length];
  };

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
                  Skills Market
                </h1>
                <p className="text-slate-400">
                  Track in-demand technical skills across our platform
                </p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/20 border border-purple-500/50">
                <span className="text-sm text-slate-300">Plan:</span>
                <span className="font-semibold text-purple-300">{tier}</span>
              </div>
            </div>
          </motion.div>

          {/* Top Skills */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-4">
              {tier === "PRO" ? "Top 30 In-Demand Skills" : "Top 10 In-Demand Skills"}
            </h2>
            <input
              type="text"
              placeholder="Search skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 mb-6"
            />

            <div className="space-y-3">
              {filteredSkills.map((skill, idx) => {
                const maxCount = Math.max(...skills.map((s) => s.count));
                const percentage = (skill.count / maxCount) * 100;

                return (
                  <motion.div
                    key={skill.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-slate-400 w-8">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="font-semibold text-white">
                            {skill.name}
                          </p>
                          <p className="text-xs text-slate-400">
                            Proficiency: {skill.proficiency.toFixed(1)}/10
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-white">{skill.count}</p>
                        <p className="text-xs text-slate-400">developers</p>
                      </div>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-700 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8, delay: idx * 0.05 }}
                        className={`h-full bg-gradient-to-r ${getSkillColor(idx)}`}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Trends - PRO Only */}
          {tier === "PRO" && trends.length > 0 && (
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              className="p-6 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700"
            >
              <h2 className="text-2xl font-bold text-white mb-6">
                12-Month Trend
              </h2>
              <div className="space-y-4">
                {trends.map((trend, idx) => {
                  const maxTrendCount = Math.max(...trends.map((t) => t.count));
                  const percentage = (trend.count / maxTrendCount) * 100;

                  return (
                    <div key={idx} className="group">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">{trend.month}</span>
                        <span className="text-sm text-slate-400">
                          {trend.count} avg devs
                        </span>
                      </div>
                      <div className="w-full h-3 rounded-full bg-slate-600 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.8, delay: idx * 0.1 }}
                          className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* PRO Upgrade Notice for BASIC Users */}
          {tier === "BASIC" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/50 mt-8"
            >
              <h3 className="text-lg font-bold text-amber-200 mb-2">
                Upgrade to PRO to see complete insights
              </h3>
              <p className="text-amber-100 mb-4">
                Get access to detailed 12-month trends, full skill database, and advanced filtering.
              </p>
              <a
                href="/analytics/upgrade"
                className="inline-block px-6 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold transition-all"
              >
                View Pricing Plans
              </a>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}
