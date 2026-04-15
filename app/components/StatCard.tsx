"use client";

import { motion } from "framer-motion";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  trend?: { value: number; isPositive: boolean };
}

export default function StatCard({
  label,
  value,
  icon,
  trend,
}: StatCardProps) {
  return (
    <motion.div className="rounded-lg bg-slate-700/30 border border-slate-600 p-5 hover:bg-slate-700/50 transition-colors duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-slate-400 text-sm font-medium mb-2">{label}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-semibold text-white">{value}</p>
            {trend && (
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                  trend.isPositive
                    ? "bg-blue-500/20 text-blue-300"
                    : "bg-slate-600/50 text-slate-300"
                }`}
              >
                <span>{trend.isPositive ? "↑" : "↓"}</span>
                <span>{trend.value}%</span>
              </div>
            )}
          </div>
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </motion.div>
  );
}
