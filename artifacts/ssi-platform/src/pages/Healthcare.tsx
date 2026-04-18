import React from "react";
import { useGetHealthProfile, useListHealthRecords } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, Activity, FileText, Pill, Stethoscope, Sparkles, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { useKioskMode } from "../contexts/KioskModeContext";
import PageHeader, { AccentButton, GlassButton } from "../components/PageHeader";

const ACCENT = "#DC2626";
const ACCENT_RGB = "220,38,38";

const STAGGER = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const ITEM = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

const TYPE_ICON: Record<string, React.ReactNode> = {
  prescription: <Pill size={18} style={{ color: "#2563EB" }} />,
  "lab-report": <FileText size={18} style={{ color: "#9333EA" }} />,
  consultation: <Stethoscope size={18} style={{ color: "#059669" }} />,
};

function getTypeIcon(type: string) {
  return TYPE_ICON[type] ?? <Stethoscope size={18} style={{ color: "#059669" }} />;
}

export default function Healthcare() {
  const { data: profile, isLoading: profileLoading } = useGetHealthProfile();
  const { data: records, isLoading: recordsLoading } = useListHealthRecords();
  const { isKioskMode } = useKioskMode();

  if (profileLoading || recordsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 w-full rounded-xl" style={{ background: "var(--bg-elevated)" }} />
        <Skeleton className="h-44 w-full rounded-2xl" style={{ background: "var(--bg-elevated)" }} />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" style={{ background: "var(--bg-elevated)" }} />)}
        </div>
      </div>
    );
  }

  const vitals = [
    { label: "Blood Group", value: profile?.bloodGroup || "B+", accent: ACCENT },
    { label: "Height", value: profile?.height ? `${profile.height}cm` : "172.5cm" },
    { label: "Weight", value: profile?.weight ? `${profile.weight}kg` : "68kg" },
    { label: "Vitals", value: "Normal", isStatus: true },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Heart size={20} />}
        title="ABHA Health ID"
        subtitle="Your secure health profile, records, and linked hospital data."
        accent={ACCENT}
        accentRgb={ACCENT_RGB}
        actions={
          <GlassButton className="flex items-center gap-1.5">
            <RefreshCw size={13} /> Sync Records
          </GlassButton>
        }
      />

      {/* Health Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="rounded-2xl overflow-hidden"
        style={{
          background: "var(--glass-bg)",
          backdropFilter: "blur(12px)",
          border: "1px solid var(--glass-border)",
          borderTop: `2px solid ${ACCENT}`,
          boxShadow: `var(--shadow-md), 0 0 24px rgba(${ACCENT_RGB}, 0.10)`,
        }}
      >
        <div className="p-5 pb-4">
          <div className="flex items-center gap-3 mb-5">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `rgba(${ACCENT_RGB}, 0.12)`, border: `1px solid rgba(${ACCENT_RGB}, 0.25)` }}
            >
              <Heart size={20} style={{ color: ACCENT }} />
            </div>
            <div>
              <h3 className="text-[15px] font-bold" style={{ color: "var(--text-primary)" }}>Health Profile</h3>
              <p className="text-[12px]" style={{ color: ACCENT }}>
                Last checkup: {profile?.lastCheckup ? new Date(profile.lastCheckup).toLocaleDateString("en-IN") : "2024-01-15"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {vitals.map(({ label, value, accent: vAccent, isStatus }) => (
              <div
                key={label}
                className="p-3.5 rounded-xl"
                style={{ background: "var(--glass-bg)", border: "1px solid var(--border-subtle)" }}
              >
                <p className="text-[10px] font-medium uppercase tracking-wide mb-1.5" style={{ color: "var(--text-muted)" }}>{label}</p>
                {isStatus ? (
                  <div className="flex items-center gap-1.5">
                    <Activity size={14} style={{ color: "#22C55E" }} />
                    <span className="text-[14px] font-bold" style={{ color: "#22C55E" }}>{value}</span>
                  </div>
                ) : (
                  <p className="text-[20px] font-extrabold" style={{ color: vAccent || "var(--text-primary)" }}>{value}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Medical Records */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-[15px] font-semibold" style={{ color: "var(--text-primary)" }}>Medical Records</h3>
          <span className="text-[11px] font-medium" style={{ color: "var(--text-muted)" }}>
            {records?.length ?? 0} records
          </span>
        </div>

        <motion.div variants={STAGGER} initial="hidden" animate="visible" className="space-y-3">
          {records?.map((record) => (
            <motion.div key={record.id} variants={ITEM}>
              <div
                className="rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-all hover:translate-y-[-1px]"
                style={{
                  background: "var(--glass-bg)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid var(--glass-border)",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <div
                  className="p-2.5 rounded-xl flex-shrink-0"
                  style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}
                >
                  {getTypeIcon(record.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-[14px] font-semibold" style={{ color: "var(--text-primary)" }}>{record.title}</h4>
                    <span className="text-[11px] flex-shrink-0" style={{ color: "var(--text-muted)" }}>
                      {record.date ? new Date(record.date).toLocaleDateString("en-IN") : ""}
                    </span>
                  </div>
                  <p className="text-[12px] mt-0.5" style={{ color: "var(--text-secondary)" }}>
                    {record.doctor && `Dr. ${record.doctor} • `}{record.hospital}
                  </p>
                  <span
                    className="inline-block mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize"
                    style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)", border: "1px solid var(--border-subtle)" }}
                  >
                    {record.type}
                  </span>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <GlassButton className="flex-1 sm:flex-none text-center">View</GlassButton>
                  <GlassButton className="flex-1 sm:flex-none flex items-center justify-center gap-1.5">
                    <Sparkles size={12} style={{ color: "#F59E0B" }} /> Explain
                  </GlassButton>
                </div>
              </div>
            </motion.div>
          ))}
          {records?.length === 0 && (
            <div
              className="text-center py-12 rounded-2xl"
              style={{ border: "1px dashed var(--border-default)", color: "var(--text-muted)" }}
            >
              No health records found. Link your hospital to get started.
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
