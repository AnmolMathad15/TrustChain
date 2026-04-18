import React, { useState } from "react";
import { useListSchemes, useCheckSchemeEligibility } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Umbrella, CheckCircle2, AlertCircle, Zap } from "lucide-react";
import { motion } from "framer-motion";
import PageHeader, { AccentButton } from "../components/PageHeader";

const ACCENT = "#059669";
const ACCENT_RGB = "5,150,105";

const STAGGER = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };
const ITEM = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

export default function Schemes() {
  const { data: schemes, isLoading } = useListSchemes();
  const [search, setSearch] = useState("");

  const filtered = schemes?.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.category.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 w-full rounded-xl" style={{ background: "var(--bg-elevated)" }} />
        <div className="grid gap-5 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-56 w-full rounded-2xl" style={{ background: "var(--bg-elevated)" }} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Umbrella size={20} />}
        title="Schemes & Benefits"
        subtitle="Discover and apply for government welfare schemes you qualify for."
        accent={ACCENT}
        accentRgb={ACCENT_RGB}
        actions={
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
            <input
              placeholder="Search schemes..."
              className="pl-8 pr-4 py-2 rounded-[10px] text-[13px] outline-none w-56 transition-all"
              style={{
                background: "var(--glass-bg)",
                backdropFilter: "blur(8px)",
                border: "1px solid var(--border-default)",
                color: "var(--text-primary)",
              }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        }
      />

      <motion.div
        variants={STAGGER}
        initial="hidden"
        animate="visible"
        className="grid gap-5 md:grid-cols-2"
      >
        {filtered?.map((scheme) => (
          <motion.div key={scheme.id} variants={ITEM}>
            <SchemeCard scheme={scheme} />
          </motion.div>
        ))}
        {filtered?.length === 0 && (
          <div className="col-span-full py-16 text-center" style={{ color: "var(--text-muted)" }}>
            No schemes found matching your search.
          </div>
        )}
      </motion.div>
    </div>
  );
}

function SchemeCard({ scheme }: { scheme: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const eligibility = useCheckSchemeEligibility(scheme.id, { query: { enabled: isOpen, queryKey: ["eligibility", scheme.id] } });

  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col h-full transition-all hover:translate-y-[-2px]"
      style={{
        background: "var(--glass-bg)",
        backdropFilter: "blur(12px)",
        border: "1px solid var(--glass-border)",
        borderTop: `2px solid ${ACCENT}`,
        boxShadow: `var(--shadow-md), 0 0 20px rgba(${ACCENT_RGB}, 0.08)`,
      }}
    >
      <div className="p-5 pb-3 flex-1">
        {/* Tags row */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className="badge-category text-[10px]"
            style={{ background: `rgba(${ACCENT_RGB}, 0.12)`, color: ACCENT, border: `1px solid rgba(${ACCENT_RGB}, 0.25)` }}
          >
            {scheme.category}
          </span>
          {scheme.isActive ? (
            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1"
              style={{ background: "rgba(34,197,94,0.15)", color: "#22C55E", border: "1px solid rgba(34,197,94,0.3)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Active
            </span>
          ) : (
            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
              style={{ background: "rgba(107,114,128,0.15)", color: "#6B7280", border: "1px solid rgba(107,114,128,0.3)" }}>
              Closed
            </span>
          )}
        </div>

        <h3 className="text-[17px] font-bold leading-snug mb-2" style={{ color: "var(--text-primary)" }}>
          {scheme.name}
        </h3>
        <p className="text-[13px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          {scheme.description}
        </p>

        {/* Benefits box */}
        <div
          className="mt-4 p-3.5 rounded-xl"
          style={{ background: `rgba(${ACCENT_RGB}, 0.07)`, border: `1px solid rgba(${ACCENT_RGB}, 0.15)` }}
        >
          <p className="text-[12px] font-semibold flex items-center gap-1.5 mb-1.5" style={{ color: ACCENT }}>
            <Zap size={12} /> Key Benefits
          </p>
          <p className="text-[13px]" style={{ color: "var(--text-secondary)" }}>{scheme.benefits}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 pb-5 pt-3" style={{ borderTop: "1px solid var(--border-subtle)" }}>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <div className="w-full">
              <AccentButton
                accent={ACCENT}
                accentRgb={ACCENT_RGB}
                className="w-full flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={14} /> Check Eligibility
              </AccentButton>
            </div>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{scheme.name} — Eligibility</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-5">
              {eligibility.isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-20 w-full" style={{ background: "var(--bg-elevated)" }} />
                  <Skeleton className="h-28 w-full" style={{ background: "var(--bg-elevated)" }} />
                </div>
              ) : eligibility.data ? (
                <>
                  <div
                    className="p-4 rounded-xl flex items-start gap-3"
                    style={eligibility.data.eligible
                      ? { background: "rgba(5,150,105,0.10)", border: "1px solid rgba(5,150,105,0.25)" }
                      : { background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.25)" }
                    }
                  >
                    {eligibility.data.eligible
                      ? <CheckCircle2 className="w-5 h-5 mt-0.5" style={{ color: ACCENT }} />
                      : <AlertCircle className="w-5 h-5 mt-0.5" style={{ color: "#EF4444" }} />
                    }
                    <div>
                      <h4 className="font-bold text-[15px]" style={{ color: eligibility.data.eligible ? ACCENT : "#EF4444" }}>
                        {eligibility.data.eligible ? "You are eligible!" : "Not currently eligible"}
                      </h4>
                      <p className="text-[13px] mt-1" style={{ color: "var(--text-secondary)" }}>{eligibility.data.reason}</p>
                    </div>
                  </div>

                  {eligibility.data.requirements?.length > 0 && (
                    <div>
                      <h5 className="text-[13px] font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Required Documents</h5>
                      <ul className="space-y-1">
                        {eligibility.data.requirements.map((req: string, i: number) => (
                          <li key={i} className="flex items-center gap-2 text-[13px]" style={{ color: "var(--text-secondary)" }}>
                            <span className="w-1 h-1 rounded-full" style={{ background: ACCENT }} />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <AccentButton
                    accent={eligibility.data.eligible ? ACCENT : "#6B7280"}
                    accentRgb={eligibility.data.eligible ? ACCENT_RGB : "107,114,128"}
                    className="w-full flex items-center justify-center gap-2"
                    disabled={!eligibility.data.eligible}
                  >
                    {eligibility.data.eligible ? "Apply Now" : "Requirements not met"}
                  </AccentButton>
                </>
              ) : (
                <p className="text-center py-4 text-[13px]" style={{ color: "var(--text-muted)" }}>Failed to check eligibility.</p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
