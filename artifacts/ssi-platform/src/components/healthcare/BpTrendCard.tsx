import React from "react";
import { motion } from "framer-motion";
import { AreaChart, Area, Tooltip, ResponsiveContainer } from "recharts";
import { ExternalLink } from "lucide-react";
import type { VitalReading } from "../../types/healthcare";

const ACCENT = "#DC2626";
const ACCENT_RGB = "220,38,38";

interface Props {
  readings: VitalReading[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: VitalReading }>;
  label?: string;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const r = payload[0].payload;
  return (
    <div
      className="rounded-lg px-2.5 py-2 text-[11px]"
      style={{
        background: "var(--bg-overlay)",
        border: "1px solid var(--border-default)",
        color: "var(--text-primary)",
      }}
    >
      <p className="font-mono font-semibold">
        {r.systolic}/{r.diastolic} <span style={{ color: "var(--text-muted)" }}>mmHg</span>
      </p>
      <p style={{ color: "var(--text-muted)" }}>
        {new Date(r.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
      </p>
    </div>
  );
}

export default function BpTrendCard({ readings }: Props) {
  const latest = readings[readings.length - 1];
  const latestDate = latest ? new Date(latest.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" }) : "";

  const chartData = readings.map((r) => ({
    ...r,
    date: new Date(r.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
  }));

  const latestBp = latest ? `${latest.systolic}/${latest.diastolic}` : "—";
  const isMonitor = latest && latest.systolic > 130;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="rounded-2xl overflow-hidden h-full"
      style={{
        background: "var(--glass-bg)",
        backdropFilter: "blur(12px)",
        border: "1px solid var(--glass-border)",
        borderTop: `3px solid ${ACCENT}`,
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-1">
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: ACCENT, boxShadow: `0 0 6px rgba(${ACCENT_RGB}, 0.7)` }}
            />
            <p className="text-[12px] font-medium" style={{ color: "var(--text-secondary)" }}>
              Blood pressure trend
            </p>
          </div>
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={
              isMonitor
                ? { background: "#F59E0B22", color: "#F59E0B", border: "1px solid #F59E0B44" }
                : { background: "#22C55E22", color: "#22C55E", border: "1px solid #22C55E44" }
            }
          >
            {isMonitor ? "Monitor" : "Normal"}
          </span>
        </div>

        <p className="text-[28px] font-extrabold tracking-tight mt-1" style={{ color: "var(--text-primary)" }}>
          {latestBp}{" "}
          <span className="text-[14px] font-normal" style={{ color: "var(--text-muted)" }}>
            mmHg
          </span>
        </p>
        <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>
          Last reading · {latestDate}
        </p>

        <div className="mt-4 -mx-1">
          <ResponsiveContainer width="100%" height={60}>
            <AreaChart data={chartData} margin={{ top: 4, bottom: 0, left: 0, right: 0 }}>
              <defs>
                <linearGradient id="bpGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={ACCENT} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={ACCENT} stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="systolic"
                stroke={ACCENT}
                strokeWidth={2}
                fill="url(#bpGradient)"
                dot={false}
                activeDot={{ r: 3, fill: ACCENT }}
              />
              <Tooltip content={<CustomTooltip />} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <button
          className="mt-3 text-[11px] flex items-center gap-1 transition-colors hover:opacity-80"
          style={{ color: ACCENT }}
        >
          View full history <ExternalLink size={10} />
        </button>
      </div>
    </motion.div>
  );
}
