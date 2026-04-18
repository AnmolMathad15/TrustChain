import React from "react";
import { motion } from "framer-motion";
import { CalendarDays, Clock, MapPin } from "lucide-react";
import type { Appointment } from "../../types/healthcare";

const STAGGER = {
  animate: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const ITEM = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

const TYPE_COLOR: Record<string, string> = {
  followup: "#2563EB",
  test: "#9333EA",
  procedure: "#DC2626",
  consultation: "#059669",
};

interface Props {
  appointments: Appointment[];
}

export default function AppointmentsList({ appointments }: Props) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CalendarDays size={14} style={{ color: "#D97706" }} />
          <p className="text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>
            Upcoming appointments
          </p>
        </div>
        <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
          Next 30 days
        </span>
      </div>

      {appointments.length === 0 ? (
        <div
          className="rounded-2xl text-center py-10"
          style={{ border: "1px dashed var(--border-default)", color: "var(--text-muted)" }}
        >
          <CalendarDays size={24} className="mx-auto mb-2 opacity-40" />
          <p className="text-[13px]">No upcoming appointments</p>
          <button
            className="mt-3 text-[12px] font-medium px-4 py-1.5 rounded-lg"
            style={{ background: "rgba(217,119,6,0.12)", color: "#D97706", border: "1px solid rgba(217,119,6,0.25)" }}
          >
            Book appointment
          </button>
        </div>
      ) : (
        <motion.div variants={STAGGER} initial="initial" animate="animate" className="space-y-2.5">
          {appointments.map((appt) => {
            const dateObj = new Date(appt.date);
            const month = dateObj.toLocaleDateString("en-IN", { month: "short" });
            const day = dateObj.getDate();
            const color = TYPE_COLOR[appt.type] ?? "#D97706";

            return (
              <motion.div
                key={appt.id}
                variants={ITEM}
                className="rounded-2xl p-3.5 flex items-center gap-3"
                style={{
                  background: "var(--glass-bg)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid var(--glass-border)",
                  borderLeft: `3px solid #D97706`,
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                {/* Date pill */}
                <div
                  className="flex-shrink-0 text-center px-3 py-2 rounded-xl min-w-[52px]"
                  style={{ background: "rgba(217,119,6,0.12)", border: "1px solid rgba(217,119,6,0.25)" }}
                >
                  <p className="text-[10px] font-medium uppercase" style={{ color: "#D97706" }}>{month}</p>
                  <p className="text-[20px] font-extrabold leading-none" style={{ color: "#D97706" }}>{day}</p>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold leading-tight" style={{ color: "var(--text-primary)" }}>
                    {appt.title}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Clock size={10} style={{ color: "var(--text-muted)" }} />
                    <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>{appt.time}</span>
                    <span style={{ color: "var(--border-default)" }}>·</span>
                    <MapPin size={10} style={{ color: "var(--text-muted)" }} />
                    <span className="text-[11px] truncate" style={{ color: "var(--text-muted)" }}>
                      {appt.doctor !== "Lab Technician" ? `${appt.doctor}, ` : ""}{appt.hospital}
                    </span>
                  </div>
                  {appt.notes && (
                    <p className="text-[10px] mt-1 px-2 py-0.5 rounded-md inline-block" style={{ background: "rgba(245,158,11,0.10)", color: "#D97706" }}>
                      {appt.notes}
                    </p>
                  )}
                </div>

                {/* Action */}
                <button
                  className="flex-shrink-0 text-[11px] px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
                  style={{ color: "var(--text-secondary)", border: "1px solid var(--border-default)", background: "transparent" }}
                >
                  Reschedule
                </button>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
