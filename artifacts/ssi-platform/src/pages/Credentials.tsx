import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import QRCode from "react-qr-code";
import {
  ShieldCheck,
  ShieldX,
  QrCode,
  CheckCircle2,
  ExternalLink,
  Fingerprint,
  Hash,
  Calendar,
  Building2,
  Link2,
  AlertTriangle,
  Cpu,
  Zap,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";

type VC = {
  id: number;
  credentialId: string;
  type: string;
  issuer: string;
  issuanceDate: string;
  credentialSubject: {
    id: string;
    documentName: string;
    documentNumber: string;
    documentType: string;
    issuedDate: string;
    expiryDate: string;
  };
  proof: { type: string; hash: string; created: string };
  hash: string;
  ipfsCid: string;
  status: string;
  blockchain: { txHash: string; blockNumber: number; network: string; anchoredAt: string } | null;
  createdAt: string;
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

const TYPE_CONFIG: Record<string, { gradient: string; accent: string; icon: string }> = {
  AadhaarCredential: { gradient: "from-blue-600 to-indigo-700", accent: "bg-blue-500/10 border-blue-500/30 text-blue-400", icon: "🪪" },
  PanCardCredential: { gradient: "from-amber-500 to-orange-600", accent: "bg-amber-500/10 border-amber-500/30 text-amber-400", icon: "💳" },
  DrivingLicenseCredential: { gradient: "from-emerald-500 to-teal-700", accent: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400", icon: "🚗" },
  PassportCredential: { gradient: "from-indigo-600 to-purple-700", accent: "bg-indigo-500/10 border-indigo-500/30 text-indigo-400", icon: "🛂" },
  VoterIdCredential: { gradient: "from-rose-600 to-red-700", accent: "bg-rose-500/10 border-rose-500/30 text-rose-400", icon: "🗳️" },
  RationCardCredential: { gradient: "from-teal-500 to-cyan-700", accent: "bg-teal-500/10 border-teal-500/30 text-teal-400", icon: "🧾" },
  HealthRecordCredential: { gradient: "from-pink-600 to-rose-700", accent: "bg-pink-500/10 border-pink-500/30 text-pink-400", icon: "🏥" },
  default: { gradient: "from-slate-600 to-slate-700", accent: "bg-slate-500/10 border-slate-500/30 text-slate-400", icon: "📄" },
};

export default function Credentials() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedVC, setSelectedVC] = useState<VC | null>(null);
  const [qrVC, setQrVC] = useState<VC | null>(null);

  const { data: credentials = [], isLoading } = useQuery<VC[]>({
    queryKey: ["credentials"],
    queryFn: () => fetch("/api/credentials/1").then((r) => r.json()),
  });

  const revokeMutation = useMutation({
    mutationFn: (credentialId: string) =>
      fetch(`/api/credentials/${credentialId}/revoke`, { method: "POST" }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credentials"] });
      toast({ title: "Credential revoked", description: "The credential has been revoked from the blockchain." });
      setSelectedVC(null);
    },
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
        title: data.valid ? "Credential verified" : "Verification failed",
        description: data.reason,
        variant: data.valid ? "default" : "destructive",
      });
    },
  });

  const activeCount = credentials.filter((c) => c.status === "active").length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-72" />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-72 w-full rounded-3xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ShieldCheck className="h-7 w-7 text-primary" />
            Credential Wallet
          </h2>
          <p className="text-muted-foreground mt-1">
            {activeCount} active verifiable credential{activeCount !== 1 ? "s" : ""} anchored on blockchain
          </p>
        </div>
        <motion.div
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="flex items-center gap-2 text-xs px-4 py-2 bg-emerald-950/60 text-emerald-400 rounded-full border border-emerald-500/30 backdrop-blur"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Polygon Mumbai Testnet — Live
        </motion.div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {credentials.map((vc, i) => {
            const cfg = TYPE_CONFIG[vc.type] ?? TYPE_CONFIG.default;
            const isRevoked = vc.status === "revoked";
            return (
              <motion.div
                key={vc.credentialId}
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.09, duration: 0.45, ease: "easeOut" }}
                whileHover={{ y: -6, scale: 1.02 }}
                className="group"
              >
                <Card className={`overflow-hidden border-none shadow-xl hover:shadow-2xl transition-all duration-300 h-full ${isRevoked ? "opacity-60 grayscale" : ""}`}>
                  <div className={`h-28 bg-gradient-to-br ${cfg.gradient} relative overflow-hidden`}>
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/30 blur-2xl" />
                      <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-black/30 blur-xl" />
                    </div>
                    <div className="relative z-10 p-5 flex items-start justify-between h-full">
                      <div>
                        <p className="text-xs text-white/60 uppercase tracking-widest font-medium mb-1">Verifiable Credential</p>
                        <h3 className="text-lg font-bold text-white leading-tight">{TYPE_LABELS[vc.type] ?? vc.type}</h3>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge className={`text-xs border ${isRevoked ? "bg-red-950/60 border-red-500/40 text-red-400" : "bg-emerald-950/60 border-emerald-500/40 text-emerald-400"}`}>
                          {isRevoked ? <><ShieldX className="w-3 h-3 mr-1" />Revoked</> : <><ShieldCheck className="w-3 h-3 mr-1" />Active</>}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <CardContent className="pt-4 pb-3 space-y-3">
                    <div className="bg-muted/40 rounded-xl p-3 space-y-2 font-mono text-xs border border-border/50">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Fingerprint className="h-3.5 w-3.5 shrink-0 text-primary/60" />
                        <span className="truncate">{vc.credentialId}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Hash className="h-3.5 w-3.5 shrink-0 text-primary/60" />
                        <span className="truncate">{vc.hash.slice(0, 22)}…</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-muted/30 rounded-lg p-2">
                        <p className="text-muted-foreground flex items-center gap-1 mb-0.5"><Building2 className="h-3 w-3" /> Issuer</p>
                        <p className="font-semibold truncate">UIDAI India</p>
                      </div>
                      <div className="bg-muted/30 rounded-lg p-2">
                        <p className="text-muted-foreground flex items-center gap-1 mb-0.5"><Calendar className="h-3 w-3" /> Issued</p>
                        <p className="font-semibold">{formatDistanceToNow(new Date(vc.issuanceDate), { addSuffix: true })}</p>
                      </div>
                    </div>

                    {vc.blockchain && (
                      <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-2 rounded-xl border border-emerald-200/50 dark:border-emerald-500/20">
                        <Zap className="h-3.5 w-3.5 shrink-0" />
                        <span className="font-medium">Block #{vc.blockchain.blockNumber.toLocaleString()}</span>
                        <span className="ml-auto font-mono opacity-75">{vc.blockchain.txHash.slice(0, 10)}…</span>
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="pt-0 pb-4 px-4 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1.5 hover:bg-primary/5 hover:border-primary/30 transition-colors"
                      onClick={() => setQrVC(vc)}
                    >
                      <QrCode className="h-3.5 w-3.5" /> Share
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1.5 hover:bg-primary/5 hover:border-primary/30 transition-colors"
                      onClick={() => setSelectedVC(vc)}
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> Details
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {credentials.length === 0 && (
        <div className="text-center py-24 text-muted-foreground border-2 border-dashed rounded-3xl">
          <ShieldCheck className="h-14 w-14 mx-auto mb-4 opacity-20" />
          <p className="font-semibold">No credentials issued yet</p>
          <p className="text-sm mt-1">Go to Documents to generate verifiable credentials.</p>
        </div>
      )}

      <Dialog open={!!qrVC} onOpenChange={(o) => !o && setQrVC(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-primary" /> Share Credential
            </DialogTitle>
          </DialogHeader>
          {qrVC && (
            <div className="flex flex-col items-center gap-5 py-2">
              <div className="relative p-4 bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl shadow-xl">
                <div className="absolute inset-0 rounded-2xl ring-2 ring-indigo-500/30 ring-offset-2 ring-offset-background" />
                <div className="p-3 bg-white rounded-xl">
                  <QRCode value={JSON.stringify({ credentialId: qrVC.credentialId, hash: qrVC.hash, type: qrVC.type })} size={160} />
                </div>
              </div>
              <div className="text-center space-y-1.5">
                <p className="text-sm font-bold">{TYPE_LABELS[qrVC.type] ?? qrVC.type}</p>
                <p className="text-xs font-mono text-muted-foreground break-all px-4">{qrVC.credentialId}</p>
              </div>
              <div className="w-full bg-muted/50 rounded-2xl p-4 text-xs font-mono space-y-2 border">
                {[
                  ["Hash", qrVC.hash.slice(0, 20) + "…"],
                  ["IPFS", qrVC.ipfsCid.slice(0, 20) + "…"],
                  ["Network", "Polygon Mumbai"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between items-center">
                    <span className="text-muted-foreground">{k}</span>
                    <span className="font-medium">{v}</span>
                  </div>
                ))}
              </div>
              <Button
                className="w-full gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg"
                onClick={() => { verifyMutation.mutate(qrVC.credentialId); setQrVC(null); }}
              >
                <CheckCircle2 className="h-4 w-4" /> Verify on Blockchain
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedVC} onOpenChange={(o) => !o && setSelectedVC(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5 text-primary" /> Credential Details
            </DialogTitle>
          </DialogHeader>
          {selectedVC && (
            <div className="space-y-4 py-2">
              <div className={`h-1 w-full rounded-full bg-gradient-to-r ${TYPE_CONFIG[selectedVC.type]?.gradient ?? TYPE_CONFIG.default.gradient}`} />
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="col-span-2 bg-muted/40 p-4 rounded-2xl border">
                  <p className="text-xs text-muted-foreground mb-1">Credential ID</p>
                  <p className="font-mono text-xs break-all font-medium">{selectedVC.credentialId}</p>
                </div>
                <div className="bg-muted/30 p-3 rounded-xl">
                  <p className="text-xs text-muted-foreground mb-1">Type</p>
                  <p className="font-semibold text-sm">{TYPE_LABELS[selectedVC.type] ?? selectedVC.type}</p>
                </div>
                <div className="bg-muted/30 p-3 rounded-xl">
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <Badge variant="outline" className={selectedVC.status === "active" ? "border-emerald-400 text-emerald-600 bg-emerald-50" : "border-red-400 text-red-600 bg-red-50"}>
                    {selectedVC.status}
                  </Badge>
                </div>
              </div>

              <div className="bg-muted/40 rounded-2xl p-4 space-y-3 text-xs border">
                <p className="font-bold text-sm text-foreground flex items-center gap-2">
                  <Zap className="h-4 w-4 text-emerald-500" /> Blockchain Anchor
                </p>
                {selectedVC.blockchain ? (
                  <div className="space-y-2">
                    {[
                      ["Tx Hash", selectedVC.blockchain.txHash],
                      ["Block", `#${selectedVC.blockchain.blockNumber.toLocaleString()}`],
                      ["Network", selectedVC.blockchain.network],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-2">
                        <span className="text-muted-foreground shrink-0">{k}</span>
                        <span className={`font-mono text-right truncate max-w-[220px] ${k === "Network" ? "text-emerald-600" : ""}`}>{v}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Not anchored yet</p>
                )}
              </div>

              <div className="bg-muted/40 rounded-2xl p-4 text-xs border">
                <p className="font-bold text-sm text-foreground mb-2 flex items-center gap-2">
                  <Link2 className="h-4 w-4 text-indigo-500" /> IPFS Storage
                </p>
                <p className="font-mono break-all text-muted-foreground">{selectedVC.ipfsCid}</p>
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1 gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md"
                  onClick={() => { verifyMutation.mutate(selectedVC.credentialId); setSelectedVC(null); }}
                  disabled={verifyMutation.isPending}
                >
                  <CheckCircle2 className="h-4 w-4" /> Verify
                </Button>
                {selectedVC.status === "active" && (
                  <Button
                    variant="destructive"
                    className="gap-2"
                    onClick={() => revokeMutation.mutate(selectedVC.credentialId)}
                    disabled={revokeMutation.isPending}
                  >
                    <AlertTriangle className="h-4 w-4" /> Revoke
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
