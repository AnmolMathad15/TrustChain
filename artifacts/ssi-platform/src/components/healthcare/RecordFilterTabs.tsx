import React from "react";
import { motion } from "framer-motion";
import type { RecordFilter, MedicalRecord } from "../../types/healthcare";

const TABS: { key: RecordFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "prescription", label: "Prescriptions" },
  { key: "lab_report", label: "Lab Reports" },
  { key: "consultation", label: "Consultations" },
  { key: "radiology", label: "Radiology" },
];

interface Props {
  activeFilter: RecordFilter;
  setFilter: (f: RecordFilter) => void;
  records: MedicalRecord[];
}

function countFor(records: MedicalRecord[], key: RecordFilter) {
  if (key === "all") return records.length;
  return records.filter((r) => r.type === key).length;
}

export default function RecordFilterTabs({ activeFilter, setFilter, records }: Props) {
  return (
    <div
      className="flex gap-1.5 p-1 rounded-xl w-full overflow-x-auto scrollbar-none"
      style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}
    >
      {TABS.map((tab) => {
        const count = countFor(records, tab.key);
        const isActive = tab.key === activeFilter;
        return (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className="relative flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors"
            style={{
              color: isActive ? "var(--text-primary)" : "var(--text-muted)",
              background: "transparent",
            }}
          >
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 rounded-lg"
                style={{ background: "var(--bg-overlay)", border: "0.5px solid var(--border-default)" }}
                transition={{ type: "spring", stiffness: 400, damping: 35 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
            <span
              className="relative z-10 text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
              style={{
                background: isActive ? "rgba(220,38,38,0.12)" : "var(--bg-elevated)",
                color: isActive ? "#DC2626" : "var(--text-muted)",
              }}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
