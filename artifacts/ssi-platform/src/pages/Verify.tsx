import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  AlertTriangle,
  Search,
  CheckCircle2,
  XCircle,
  Hash,
  Calendar,
  Building2,
  Cpu,
  Fingerprint,
  Zap,
  Lock,
} from "lucide-react";

type VerifyResult = {
  valid: boolean;
  tampered?: boolean;
  revoked?: boolean;
  credentialId?: string;
  type?: string;
  issuer?: string;
  issuanceDate?: string;
  hash?: string;
  blockchainHash?: string;
  txHash?: string;
  blockNumber?: number;
  network?: string;
  anchoredAt?: string;
  reason: string;
};

const TYPE_LABELS: Record<string, string> = {
  AadhaarCredential: "Aadhaar Card",
  PanCardCredential: "PAN Card",
  DrivingLicenseCredential: "Driving License",
  PassportCredential: "Passport",
  VoterIdCredential: "Voter ID",
  RationCardCredential: "Ration Card",
  HealthRecordCredential: "Health Record",
  AcademicCredential: "Academic Certificate",
  VerifiableCredential: "Document",
};

export default function Verify() {
  const [credentialId, setCredentialId] = useState("");

  const verifyMutation = useMutation<VerifyResult, Error, string>({
    mutationFn: (id: string) =>
      fetch("/api/credentials/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credentialId: id }),
      }).then((r) => r.json()),
  });

  const handleVerify = () => {
    if (!credentialId.trim()) return;
    verifyMutation.mutate(credentialId.trim());
  };

  const result = verifyMutation.data;

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Lock className="h-7 w-7 text-primary" />
          Credential Verification Portal
        </h2>
        <p className="text-muted-foreground mt-1">
          Verify any credential against the blockchain ledger in real time.
        </p>
      </div>

      <Card className="border-none shadow-xl overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600" />
        <CardContent className="pt-6 pb-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Fingerprint className="h-4 w-4 text-primary" />
              Enter Credential ID
            </label>
            <div className="flex gap-2">
              <Input
                value={credentialId}
                onChange={(e) => setCredentialId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                placeholder="e.g. vc-1716000000000-abc12345"
                className="font-mono text-sm h-12 rounded-xl border-2 focus:border-primary/50"
                data-testid="credential-id-input"
              />
              <Button
                onClick={handleVerify}
                disabled={verifyMutation.isPending || !credentialId.trim()}
                className="h-12 px-6 gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg font-semibold shrink-0"
                data-testid="verify-button"
              >
                {verifyMutation.isPending ? (
                  <>
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                      <Cpu className="h-4 w-4" />
                    </motion.div>
                    Verifying…
                  </>
                ) : (
                  <><Search className="h-4 w-4" /> Verify</>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground pl-1">
              Credential IDs are found in your Credential Wallet or shared QR codes.
            </p>
          </div>
        </CardContent>
      </Card>

      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            key={credentialId + String(result.valid)}
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <Card className="border-none shadow-2xl overflow-hidden">
              <div className={`h-1.5 bg-gradient-to-r ${result.valid ? "from-emerald-400 via-green-500 to-teal-500" : "from-red-400 via-rose-500 to-red-600"}`} />

              <div className={`px-6 py-8 ${result.valid ? "bg-gradient-to-br from-emerald-950/30 to-teal-950/20" : "bg-gradient-to-br from-red-950/30 to-rose-950/20"}`}>
                <div className="flex items-center gap-5">
                  <motion.div
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                    className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-xl shrink-0 ${result.valid ? "bg-emerald-500/20 ring-2 ring-emerald-500/40" : "bg-red-500/20 ring-2 ring-red-500/40"}`}
                  >
                    {result.valid
                      ? <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                      : result.revoked
                        ? <AlertTriangle className="w-10 h-10 text-amber-400" />
                        : <XCircle className="w-10 h-10 text-red-400" />
                    }
                  </motion.div>
                  <div>
                    <p className={`text-2xl font-extrabold ${result.valid ? "text-emerald-300" : "text-red-300"}`}>
                      {result.valid ? "Verified" : result.revoked ? "Credential Revoked" : "Verification Failed"}
                    </p>
                    <p className={`text-sm mt-1 ${result.valid ? "text-emerald-400/80" : "text-red-400/80"}`}>
                      {result.reason}
                    </p>
                  </div>
                </div>
              </div>

              {result.credentialId && (
                <CardContent className="pt-5 pb-6 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: Fingerprint, label: "Type", value: TYPE_LABELS[result.type ?? ""] ?? result.type },
                      { icon: Building2, label: "Issuer", value: "UIDAI India" },
                      { icon: Calendar, label: "Issued", value: result.issuanceDate ? new Date(result.issuanceDate).toLocaleDateString("en-IN") : "—" },
                      { icon: Cpu, label: "Network", value: result.network ?? "—", accent: true },
                    ].map(({ icon: Icon, label, value, accent }) => (
                      <div key={label} className="bg-muted/40 rounded-xl p-3 border border-border/40">
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                          <Icon className="h-3 w-3" /> {label}
                        </p>
                        <p className={`text-sm font-bold ${accent ? "text-emerald-600 dark:text-emerald-400" : ""}`}>{value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-slate-950/60 rounded-2xl p-5 space-y-3 text-xs font-mono border border-slate-800/60">
                    <p className="font-sans font-bold text-sm text-foreground flex items-center gap-2 mb-4">
                      <Zap className="h-4 w-4 text-yellow-400" />
                      Blockchain Proof
                    </p>
                    {[
                      ["Credential Hash", result.hash ? result.hash.slice(0, 28) + "…" : "—"],
                      ["On-chain Hash", result.blockchainHash ? result.blockchainHash.slice(0, 28) + "…" : "—", !result.tampered],
                      ["Transaction", result.txHash ?? "—"],
                      ["Block Number", result.blockNumber ? `#${result.blockNumber.toLocaleString()}` : "—"],
                    ].map(([key, value, isGreen]) => (
                      <div key={key} className="flex justify-between items-start gap-3">
                        <span className="text-slate-400 shrink-0">{key}</span>
                        <span className={`text-right break-all ${isGreen === true ? "text-emerald-400" : isGreen === false ? "text-red-400" : "text-slate-200"}`}>
                          {value}
                        </span>
                      </div>
                    ))}
                    <div className="border-t border-slate-700/50 pt-3 flex items-center justify-between">
                      <span className="text-slate-400">Hash Match</span>
                      <Badge className={`border ${!result.tampered ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-400" : "bg-red-950/60 border-red-500/40 text-red-400"}`}>
                        {!result.tampered ? <><CheckCircle2 className="h-3 w-3 mr-1" />Match</> : <><XCircle className="h-3 w-3 mr-1" />Mismatch</>}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {!result && !verifyMutation.isPending && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 text-muted-foreground border-2 border-dashed border-muted-foreground/20 rounded-3xl"
        >
          <div className="relative inline-block mb-5">
            <ShieldCheck className="h-16 w-16 opacity-15" />
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
              className="absolute inset-0 rounded-full bg-primary/10"
            />
          </div>
          <p className="font-semibold text-base">Enter a Credential ID to verify</p>
          <p className="text-sm mt-1 opacity-70">Results are cryptographically checked against the blockchain ledger.</p>
        </motion.div>
      )}
    </div>
  );
}
