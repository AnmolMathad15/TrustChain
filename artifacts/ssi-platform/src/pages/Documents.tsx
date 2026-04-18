import React, { useState } from "react";
import { useListDocuments } from "@workspace/api-client-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileText, Download, Sparkles, QrCode, ShieldCheck, CheckCircle2, ShieldX, Plus } from "lucide-react";
import { motion } from "framer-motion";
import QRCode from "react-qr-code";
import { useToast } from "@/hooks/use-toast";
import PageHeader, { AccentButton, GlassButton } from "../components/PageHeader";

const ACCENT = "#2563EB";
const ACCENT_RGB = "37,99,235";

type VC = {
  credentialId: string;
  type: string;
  hash: string;
  ipfsCid: string;
  status: string;
  blockchain: { txHash: string; blockNumber: number; network: string } | null;
  documentId: number;
};

const STAGGER = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const ITEM = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

export default function Documents() {
  const { data: documents, isLoading } = useListDocuments();
  const { toast } = useToast();
  const [qrDoc, setQrDoc] = useState<{ doc: any; vc: VC } | null>(null);

  const { data: credentials = [] } = useQuery<VC[]>({
    queryKey: ["credentials"],
    queryFn: () => fetch("/api/credentials/1").then((r) => r.json()),
  });

  const verifyMutation = useMutation({
    mutationFn: (credentialId: string) =>
      fetch("/api/credentials/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credentialId }),
      }).then((r) => r.json()),
    onSuccess: (data) => {
      toast({
        title: data.valid ? "Verified on Blockchain" : "Verification Failed",
        description: data.reason,
        variant: data.valid ? "default" : "destructive",
      });
    },
  });

  const getVC = (docId: number) => credentials.find((c: VC) => c.documentId === docId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 w-full rounded-xl" style={{ background: "var(--bg-elevated)" }} />
        <div className="grid gap-5 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-64 w-full rounded-2xl" style={{ background: "var(--bg-elevated)" }} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<FileText size={20} />}
        title="DigiLocker"
        subtitle="Your blockchain-anchored identity documents and Verifiable Credentials."
        accent={ACCENT}
        accentRgb={ACCENT_RGB}
        actions={
          <AccentButton accent={ACCENT} accentRgb={ACCENT_RGB} className="flex items-center gap-1.5">
            <Plus size={14} /> Add Document
          </AccentButton>
        }
      />

      <motion.div
        variants={STAGGER}
        initial="hidden"
        animate="visible"
        className="grid gap-5 md:grid-cols-2"
      >
        {documents?.map((doc, i) => {
          const vc = getVC(doc.id);
          const isVerified = vc && vc.status === "active";
          const isRevoked = vc && vc.status === "revoked";
          return (
            <motion.div key={doc.id} variants={ITEM}>
              <div
                className="rounded-2xl overflow-hidden transition-all hover:translate-y-[-2px]"
                style={{
                  background: "var(--glass-bg)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid var(--glass-border)",
                  borderTop: `2px solid ${ACCENT}`,
                  boxShadow: `var(--shadow-md), 0 0 20px rgba(${ACCENT_RGB}, 0.08)`,
                }}
              >
                {/* Card Header */}
                <div className="p-5 pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-[16px] font-bold" style={{ color: "var(--text-primary)" }}>{doc.name}</h3>
                      <p className="font-mono text-[12px] mt-0.5" style={{ color: "var(--text-muted)" }}>{doc.documentNumber}</p>
                    </div>
                    <div className="flex flex-col gap-1.5 items-end flex-shrink-0">
                      <span
                        className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
                        style={doc.status === "Verified"
                          ? { background: "rgba(34,197,94,0.15)", color: "#22C55E", border: "1px solid rgba(34,197,94,0.3)" }
                          : { background: "rgba(245,158,11,0.15)", color: "#F59E0B", border: "1px solid rgba(245,158,11,0.3)" }
                        }
                      >
                        {doc.status}
                      </span>
                      {isVerified && (
                        <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1"
                          style={{ background: `rgba(${ACCENT_RGB}, 0.12)`, color: ACCENT, border: `1px solid rgba(${ACCENT_RGB}, 0.25)` }}>
                          <ShieldCheck size={10} /> VC Active
                        </span>
                      )}
                      {isRevoked && (
                        <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1"
                          style={{ background: "rgba(239,68,68,0.12)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.25)" }}>
                          <ShieldX size={10} /> VC Revoked
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Blockchain badge */}
                  {isVerified && vc.blockchain && (
                    <div
                      className="flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                      style={{ background: `rgba(${ACCENT_RGB}, 0.08)`, border: `1px solid rgba(${ACCENT_RGB}, 0.15)` }}
                    >
                      <CheckCircle2 size={11} style={{ color: ACCENT }} />
                      <span className="font-mono text-[11px] font-medium" style={{ color: ACCENT }}>
                        Anchored on Polygon · Block #{vc.blockchain.blockNumber.toLocaleString()}
                      </span>
                    </div>
                  )}

                  {/* Meta */}
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-medium mb-0.5 uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                        Document Type
                      </p>
                      <div className="flex items-center gap-1.5">
                        <FileText size={12} style={{ color: "var(--text-secondary)" }} />
                        <p className="text-[13px] font-medium capitalize" style={{ color: "var(--text-primary)" }}>{doc.type}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium mb-0.5 uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                        Issued On
                      </p>
                      <p className="text-[13px] font-medium" style={{ color: "var(--text-primary)" }}>{doc.issuedDate || "N/A"}</p>
                    </div>
                    {doc.expiryDate && (
                      <div>
                        <p className="text-[10px] font-medium mb-0.5 uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                          Valid Till
                        </p>
                        <p className="text-[13px] font-medium" style={{ color: "var(--text-primary)" }}>{doc.expiryDate}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-5 pb-4 flex flex-wrap gap-2 pt-2"
                  style={{ borderTop: "1px solid var(--border-subtle)" }}>
                  <GlassButton className="flex items-center gap-1.5 flex-1">
                    <Download size={13} /> Download
                  </GlassButton>
                  {vc && (
                    <AccentButton
                      accent={ACCENT}
                      accentRgb={ACCENT_RGB}
                      className="flex items-center gap-1.5 flex-1"
                      onClick={() => setQrDoc({ doc, vc })}
                    >
                      <QrCode size={13} /> Share VC
                    </AccentButton>
                  )}
                  {vc && (
                    <motion.button
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => verifyMutation.mutate(vc.credentialId)}
                      disabled={verifyMutation.isPending}
                      className="flex items-center gap-1.5 flex-1 px-4 py-2 rounded-[10px] text-[13px] font-medium transition-all cursor-pointer disabled:opacity-50"
                      style={{
                        background: "rgba(22,163,74,0.12)",
                        border: "1px solid rgba(22,163,74,0.25)",
                        color: "#16A34A",
                      }}
                    >
                      <ShieldCheck size={13} /> Verify
                    </motion.button>
                  )}
                  <GlassButton className="flex items-center gap-1.5 flex-1">
                    <Sparkles size={13} style={{ color: "#F59E0B" }} /> AI Explain
                  </GlassButton>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* QR Share Dialog */}
      <Dialog open={!!qrDoc} onOpenChange={(o) => !o && setQrDoc(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Share Verifiable Credential</DialogTitle>
          </DialogHeader>
          {qrDoc && (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="p-4 bg-white rounded-2xl shadow-inner border">
                <QRCode
                  value={JSON.stringify({ credentialId: qrDoc.vc.credentialId, hash: qrDoc.vc.hash, type: qrDoc.vc.type })}
                  size={180}
                />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{qrDoc.doc.name}</p>
                <p className="font-mono text-[11px] mt-1" style={{ color: "var(--text-muted)" }}>{qrDoc.vc.credentialId}</p>
              </div>
              <div className="w-full space-y-1 rounded-xl p-3" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
                {[
                  { label: "Hash", value: qrDoc.vc.hash.slice(0, 18) + "..." },
                  { label: "IPFS", value: qrDoc.vc.ipfsCid.slice(0, 18) + "..." },
                  ...(qrDoc.vc.blockchain ? [{ label: "Block", value: `#${qrDoc.vc.blockchain.blockNumber.toLocaleString()}` }] : []),
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-[11px] font-mono">
                    <span style={{ color: "var(--text-muted)" }}>{label}</span>
                    <span style={{ color: ACCENT }}>{value}</span>
                  </div>
                ))}
              </div>
              <AccentButton
                accent={ACCENT}
                accentRgb={ACCENT_RGB}
                className="w-full flex items-center justify-center gap-2"
                onClick={() => { verifyMutation.mutate(qrDoc.vc.credentialId); setQrDoc(null); }}
              >
                <CheckCircle2 size={14} /> Verify on Blockchain
              </AccentButton>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
