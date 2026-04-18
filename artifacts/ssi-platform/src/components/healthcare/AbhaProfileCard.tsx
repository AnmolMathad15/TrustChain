import React from "react";
import { motion } from "framer-motion";
import { Heart, Activity } from "lucide-react";
import type { AbhaProfile } from "../../types/healthcare";

const ACCENT = "#DC2626";
const ACCENT_RGB = "220,38,38";

function getBmiColor(bmi: number) {
  if (bmi < 18.5) return "#3B82F6";
  if (bmi < 25) return "#22C55E";
  if (bmi < 30) return "#F59E0B";
  return "#DC2626";
}

function getBmiPercent(bmi: number) {
  return Math.min(100, Math.max(0, ((bmi - 15) / (40 - 15)) * 100));
}

interface VitalBoxProps {
  label: string;
  value: string;
  tag?: string;
  tagColor?: string;
  index: number;
  extra?: React.ReactNode;
}

function VitalBox({ label, value, tag, tagColor = "#22C55E", index, extra }: VitalBoxProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.08, duration: 0.2 }}
      className="p-3 rounded-xl"
      style={{ background: "var(--bg-overlay)", border: "1px solid var(--border-subtle)" }}
    >
      <p className="text-[10px] font-medium uppercase tracking-wide mb-1" style={{ color: "var(--text-muted)" }}>
        {label}
      </p>
      <p className="text-[20px] font-extrabold leading-none" style={{ color: "var(--text-primary)" }}>
        {value}
      </p>
      {extra}
      {tag && (
        <span
          className="inline-block mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full"
          style={{
            background: `${tagColor}22`,
            color: tagColor,
            border: `1px solid ${tagColor}44`,
          }}
        >
          {tag}
        </span>
      )}
    </motion.div>
  );
}

interface Props {
  profile: AbhaProfile;
}

export default function AbhaProfileCard({ profile }: Props) {
  const bmiColor = getBmiColor(profile.bmi);
  const bmiPct = getBmiPercent(profile.bmi);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl overflow-hidden"
      style={{
        background: "var(--glass-bg)",
        backdropFilter: "blur(12px)",
        border: "1px solid var(--glass-border)",
        borderTop: `3px solid ${ACCENT}`,
        boxShadow: `var(--shadow-md), 0 0 24px rgba(${ACCENT_RGB}, 0.08)`,
      }}
    >
      <div className="p-5 flex flex-col sm:flex-row gap-5">
        {/* Left: Avatar + identity */}
        <div className="flex items-start gap-3 flex-shrink-0">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: `rgba(${ACCENT_RGB}, 0.15)`, border: `2px solid rgba(${ACCENT_RGB}, 0.3)` }}
          >
            <Heart size={22} style={{ color: ACCENT }} />
          </div>
          <div>
            <p className="text-[15px] font-bold leading-tight" style={{ color: "var(--text-primary)" }}>
              {profile.name}
            </p>
            <p className="text-[11px] mt-0.5" style={{ color: "var(--text-secondary)" }}>
              ABHA Health Account · {profile.hospital}
            </p>
            <span
              className="inline-block mt-2 text-[10px] font-mono font-semibold px-2.5 py-1 rounded-lg"
              style={{
                background: `rgba(${ACCENT_RGB}, 0.10)`,
                color: ACCENT,
                border: `1px solid rgba(${ACCENT_RGB}, 0.25)`,
                letterSpacing: "0.05em",
              }}
            >
              {profile.abhaId}
            </span>
          </div>
        </div>

        {/* Right: Vitals grid */}
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <VitalBox
            index={0}
            label="Blood Group"
            value={profile.bloodGroup}
            tag={profile.bloodGroup}
            tagColor={ACCENT}
          />
          <VitalBox
            index={1}
            label="Height"
            value={`${profile.height}cm`}
            tag="Normal"
            tagColor="#22C55E"
          />
          <VitalBox
            index={2}
            label="Weight · BMI"
            value={`${profile.weight}kg`}
            extra={
              <div className="mt-1.5">
                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-elevated)" }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${bmiPct}%` }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="h-full rounded-full"
                    style={{ background: bmiColor }}
                  />
                </div>
                <p className="text-[10px] mt-0.5 font-mono" style={{ color: bmiColor }}>
                  BMI {profile.bmi.toFixed(1)}
                </p>
              </div>
            }
          />
          <VitalBox
            index={3}
            label="Vitals Status"
            value=""
            extra={
              <div className="flex items-center gap-1.5 mt-1">
                <Activity size={16} style={{ color: "#22C55E" }} />
                <span className="text-[15px] font-bold" style={{ color: "#22C55E" }}>
                  {profile.vitalsStatus === "normal" ? "Normal" : profile.vitalsStatus === "monitor" ? "Monitor" : "Critical"}
                </span>
              </div>
            }
            tag={profile.vitalsStatus === "normal" ? "All Clear" : "Watch"}
            tagColor={profile.vitalsStatus === "normal" ? "#22C55E" : "#F59E0B"}
          />
        </div>
      </div>
    </motion.div>
  );
}
