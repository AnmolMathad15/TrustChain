import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pill, FlaskConical, Stethoscope, ScanLine, ShieldCheck, ChevronDown } from "lucide-react";
import type { MedicalRecord } from "../../types/healthcare";
import RecordExpandPanel from "./RecordExpandPanel";
import HealthAiExplainer from "./HealthAiExplainer";
import { useHealthcareStore } from "../../store/healthcareStore";

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  prescription: { icon: Pill, color: "#DC2626", label: "Prescription" },
  lab_report: { icon: FlaskConical, color: "#2563EB", label: "Lab Report" },
  consultation: { icon: Stethoscope, color: "#059669", label: "Consultation" },
  radiology: { icon: ScanLine, color: "#D97706", label: "Radiology" },
  vaccination: { icon: ShieldCheck, color: "#9333EA", label: "Vaccination" },
  discharge_summary: { icon: Stethoscope, color: "#64748B", label: "Discharge" },
};

interface Props {
  record: MedicalRecord;
  isExpanded: boolean;
  onToggle: () => void;
}

export default function MedicalRecordCard({ record, isExpanded, onToggle }: Props) {
  const { aiExplanations } = useHealthcareStore();
  const cfg = TYPE_CONFIG[record.type] ?? TYPE_CONFIG.consultation;
  const Icon = cfg.icon;

  const dateFormatted = new Date(record.date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all"
      style={{
        background: "var(--glass-bg)",
        backdropFilter: "blur(8px)",
        border: `1px solid ${isExpanded ? "rgba(220,38,38,0.3)" : "var(--glass-border)"}`,
        boxShadow: isExpanded ? "0 4px 20px rgba(220,38,38,0.08)" : "var(--shadow-sm)",
      }}
    >
      {/* Collapsed row */}
      <div
        className="flex items-center gap-3 p-3.5 cursor-pointer group hover:bg-white/[0.02]"
        onClick={onToggle}
      >
        {/* Type icon */}
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${cfg.color}18`, border: `1px solid ${cfg.color}30` }}
        >
          <Icon size={15} style={{ color: cfg.color }} />
        </div>

        {/* Middle info */}
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold leading-tight" style={{ color: "var(--text-primary)" }}>
            {record.title}
          </p>
          <p className="text-[11px] mt-0.5 truncate" style={{ color: "var(--text-muted)" }}>
            {record.doctor && `${record.doctor} · `}{record.hospital}
          </p>
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize"
              style={{ background: `${cfg.color}18`, color: cfg.color, border: `1px solid ${cfg.color}30` }}
            >
              {cfg.label}
            </span>
            {record.vcAnchored && (
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"
                style={{ background: "rgba(34,197,94,0.12)", color: "#22C55E", border: "1px solid rgba(34,197,94,0.25)" }}
              >
                <ShieldCheck size={9} /> VC Anchored
              </span>
            )}
            {record.tags?.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-1.5 py-0.5 rounded-md font-mono"
                style={{ background: "var(--bg-elevated)", color: "var(--text-muted)" }}
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Right: date + actions */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <span
            className="text-[10px] font-mono"
            style={{ color: "var(--text-muted)" }}
          >
            {dateFormatted}
          </span>
          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={onToggle}
              className="text-[12px] px-2.5 py-1 rounded-lg transition-all hover:opacity-80"
              style={{
                border: "1px solid var(--border-default)",
                color: "var(--text-secondary)",
                background: "transparent",
              }}
            >
              View
            </button>
            <HealthAiExplainer
              recordId={record.id}
              recordTitle={record.title}
              recordDetails={record.details ?? record.summary ?? ""}
              recordType={record.type}
              doctor={record.doctor}
              date={record.date}
              onExpand={onToggle}
            />
          </div>
        </div>

        {/* Expand chevron */}
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="ml-1 flex-shrink-0"
          style={{ color: "var(--text-muted)" }}
        >
          <ChevronDown size={14} />
        </motion.div>
      </div>

      {/* Expanded panel */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="expand"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <RecordExpandPanel
              record={record}
              aiExplanation={aiExplanations[record.id]}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
