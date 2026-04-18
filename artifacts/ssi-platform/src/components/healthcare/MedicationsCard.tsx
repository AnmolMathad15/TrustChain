import React from "react";
import { motion } from "framer-motion";
import { Pill, Sparkles } from "lucide-react";
import type { Medication } from "../../types/healthcare";
import { daysUntilRefill } from "../../hooks/healthcare/useMedications";

const ACCENT = "#DC2626";

function refillColor(days: number) {
  if (days < 7) return "#DC2626";
  if (days < 14) return "#F59E0B";
  return "#22C55E";
}

function RefillBar({ days, max = 30 }: { days: number; max?: number }) {
  const pct = Math.min(100, (days / max) * 100);
  const color = refillColor(days);
  return (
    <div className="mt-1.5">
      <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-elevated)" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
      <p className="text-[10px] mt-0.5 font-medium" style={{ color }}>
        Refill in {days} day{days !== 1 ? "s" : ""}
      </p>
    </div>
  );
}

const MED_COLORS = ["#DC2626", "#2563EB", "#9333EA", "#059669"];

interface Props {
  medications: Medication[];
}

export default function MedicationsCard({ medications }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.15 }}
      className="rounded-2xl h-full flex flex-col"
      style={{
        background: "var(--glass-bg)",
        backdropFilter: "blur(12px)",
        border: "1px solid var(--glass-border)",
        borderTop: `3px solid ${ACCENT}`,
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div className="p-5 flex-1">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>
            Active medications
          </p>
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: `rgba(220,38,38,0.12)`, color: ACCENT, border: "1px solid rgba(220,38,38,0.25)" }}
          >
            {medications.length} active
          </span>
        </div>

        <div className="space-y-4">
          {medications.map((med, i) => {
            const days = daysUntilRefill(med.refillDate);
            const color = MED_COLORS[i % MED_COLORS.length];
            return (
              <div key={med.id} className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: `${color}22`, border: `1px solid ${color}44` }}
                >
                  <Pill size={14} style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-1.5">
                    <p className="text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>
                      {med.name}
                    </p>
                    <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                      {med.dosage}
                    </span>
                  </div>
                  <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                    {med.frequency} · {med.condition}
                  </p>
                  <RefillBar days={days} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div
        className="px-5 py-3 border-t"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <button
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-[12px] font-medium transition-all hover:opacity-80"
          style={{
            background: "rgba(245,158,11,0.10)",
            color: "#F59E0B",
            border: "1px solid rgba(245,158,11,0.25)",
          }}
        >
          <Sparkles size={12} /> Ask AI about interactions
        </button>
      </div>
    </motion.div>
  );
}
