import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link2, QrCode, Building2, X } from "lucide-react";
import { useHealthcareStore } from "../../store/healthcareStore";
import { useToast } from "@/hooks/use-toast";

const ACCENT = "#DC2626";

const OPTIONS = [
  {
    icon: Link2,
    color: "#2563EB",
    title: "Share via VC Link",
    sub: "Generate a time-limited verifiable credential link",
    action: "copy",
  },
  {
    icon: QrCode,
    color: "#9333EA",
    title: "Share via QR Code",
    sub: "Doctor or hospital scans to verify instantly",
    action: "qr",
  },
  {
    icon: Building2,
    color: "#059669",
    title: "Share with hospital",
    sub: "Send directly to registered ABDM provider",
    action: "hospital",
  },
];

export default function ShareRecordsModal() {
  const { isShareModalOpen, closeShareModal } = useHealthcareStore();
  const { toast } = useToast();

  const handleAction = (action: string) => {
    if (action === "copy") {
      const link = `https://trustchain.verifiable.id/vc/${Date.now()}`;
      navigator.clipboard?.writeText(link).catch(() => {});
      toast({ title: "Link copied to clipboard" });
      closeShareModal();
    } else if (action === "qr") {
      toast({ title: "QR code generated", description: "Scan with any ABDM-compatible reader" });
    } else {
      toast({ title: "Opening hospital selector..." });
    }
  };

  return (
    <AnimatePresence>
      {isShareModalOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
            onClick={closeShareModal}
          />

          {/* Modal */}
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md overflow-hidden"
            style={{
              background: "var(--glass-bg)",
              backdropFilter: "blur(16px)",
              border: "1px solid var(--glass-border)",
              borderTop: `3px solid ${ACCENT}`,
              borderRadius: "20px",
              boxShadow: "0 24px 60px rgba(0,0,0,0.3)",
            }}
          >
            <div className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-[15px] font-bold" style={{ color: "var(--text-primary)" }}>
                    Share health records
                  </h3>
                  <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                    Share your ABHA data securely as a verified credential
                  </p>
                </div>
                <button
                  onClick={closeShareModal}
                  className="p-1.5 rounded-lg transition-all hover:opacity-70"
                  style={{ background: "var(--bg-elevated)", color: "var(--text-muted)" }}
                >
                  <X size={14} />
                </button>
              </div>

              <div className="space-y-2">
                {OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.action}
                      onClick={() => handleAction(opt.action)}
                      className="w-full flex items-center gap-3 p-3.5 rounded-xl text-left transition-all hover:opacity-80 group"
                      style={{
                        border: "1px solid var(--border-subtle)",
                        background: "var(--bg-elevated)",
                      }}
                    >
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: `${opt.color}22`, border: `1px solid ${opt.color}44` }}
                      >
                        <Icon size={16} style={{ color: opt.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>
                          {opt.title}
                        </p>
                        <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                          {opt.sub}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
