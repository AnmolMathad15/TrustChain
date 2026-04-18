import React from "react";
import { motion } from "framer-motion";
import { Heart, RefreshCw, Share2, ShieldCheck } from "lucide-react";
import { useHealthcareStore } from "../../store/healthcareStore";
import { useAbhaProfile } from "../../hooks/healthcare/useAbhaProfile";
import { useHealthRecords } from "../../hooks/healthcare/useHealthRecords";
import { useAppointments } from "../../hooks/healthcare/useAppointments";
import { useMedications } from "../../hooks/healthcare/useMedications";
import { mockVitalReadings } from "../../lib/healthcareMockData";

import {
  AbhaProfileCard,
  BpTrendCard,
  MedicationsCard,
  AppointmentsList,
  MedicalRecordCard,
  RecordFilterTabs,
  ShareRecordsModal,
  HealthcareSkeleton,
} from "../../components/healthcare";

import PageHeader, { GlassButton, AccentButton } from "../../components/PageHeader";

const ACCENT = "#DC2626";
const ACCENT_RGB = "220,38,38";

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  },
};

const containerVariants = {
  animate: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

export default function HealthcarePage() {
  const { activeFilter, setFilter, toggleRecord, expandedRecordId, openShareModal } =
    useHealthcareStore();

  const { data: profile, isLoading: profileLoading } = useAbhaProfile();
  const { data: records, isLoading: recordsLoading } = useHealthRecords();
  const { data: appointments, isLoading: appointmentsLoading } = useAppointments();
  const { data: medications, isLoading: medsLoading } = useMedications();

  const isLoading = profileLoading || recordsLoading || appointmentsLoading || medsLoading;

  const filteredRecords = (records ?? []).filter(
    (r) => activeFilter === "all" || r.type === activeFilter
  );

  const vcCount = (records ?? []).filter((r) => r.vcAnchored).length;

  if (isLoading) return <HealthcareSkeleton />;

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="space-y-5"
    >
      {/* Page Header */}
      <PageHeader
        icon={<Heart size={20} />}
        title="ABHA Health ID"
        subtitle="Your secure health profile, records, and linked hospital data · Last synced 2h ago"
        accent={ACCENT}
        accentRgb={ACCENT_RGB}
        actions={
          <>
            <GlassButton
              onClick={openShareModal}
              className="flex items-center gap-1.5"
            >
              <Share2 size={13} /> Share Records
            </GlassButton>
            <GlassButton className="flex items-center gap-1.5">
              <RefreshCw size={13} /> Sync
            </GlassButton>
          </>
        }
      />

      {/* ABHA Profile Card */}
      {profile && <AbhaProfileCard profile={profile} />}

      {/* Insights row: BP Trend + Medications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BpTrendCard readings={mockVitalReadings} />
        {medications && medications.length > 0 && (
          <MedicationsCard medications={medications} />
        )}
      </div>

      {/* Appointments */}
      <motion.div variants={itemVariants}>
        <AppointmentsList appointments={appointments ?? []} />
      </motion.div>

      {/* Medical Records */}
      <div className="space-y-3">
        {/* Section header */}
        <div className="flex items-center justify-between">
          <p className="text-[15px] font-semibold" style={{ color: "var(--text-primary)" }}>
            Medical Records
          </p>
          <div className="flex items-center gap-2">
            <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
              {(records ?? []).length} records
            </span>
            {vcCount > 0 && (
              <span
                className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: "rgba(34,197,94,0.12)", color: "#22C55E", border: "1px solid rgba(34,197,94,0.25)" }}
              >
                <ShieldCheck size={9} /> {vcCount} VC ✓
              </span>
            )}
          </div>
        </div>

        {/* Filter tabs */}
        <RecordFilterTabs
          activeFilter={activeFilter}
          setFilter={setFilter}
          records={records ?? []}
        />

        {/* Record cards */}
        <motion.div
          variants={containerVariants}
          initial="initial"
          animate="animate"
          className="space-y-2.5"
        >
          {filteredRecords.map((record) => (
            <motion.div key={record.id} variants={itemVariants}>
              <MedicalRecordCard
                record={record}
                isExpanded={expandedRecordId === record.id}
                onToggle={() => toggleRecord(record.id)}
              />
            </motion.div>
          ))}
          {filteredRecords.length === 0 && (
            <div
              className="text-center py-12 rounded-2xl"
              style={{ border: "1px dashed var(--border-default)", color: "var(--text-muted)" }}
            >
              No records found for this filter.
            </div>
          )}
        </motion.div>
      </div>

      {/* Share Modal (global, rendered at page level) */}
      <ShareRecordsModal />
    </motion.div>
  );
}
