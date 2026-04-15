import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
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
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";

type VC = {
  id: number;
  credentialId: string;
  type: string;
  issuer: string;
  issuanceDate: string;
  credentialSubject: { id: string; documentName: string; documentNumber: string; documentType: string; issuedDate: string; expiryDate: string };
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

const TYPE_COLORS: Record<string, string> = {
  AadhaarCredential: "from-blue-600 to-blue-700",
  PanCardCredential: "from-amber-600 to-orange-600",
  DrivingLicenseCredential: "from-green-600 to-emerald-700",
  PassportCredential: "from-indigo-600 to-purple-700",
  VoterIdCredential: "from-rose-600 to-red-700",
  RationCardCredential: "from-teal-600 to-cyan-700",
  HealthRecordCredential: "from-pink-600 to-rose-700",
  default: "from-slate-600 to-slate-700",
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
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-64 w-full rounded-2xl" />)}
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
        <div className="flex items-center gap-2 text-xs px-3 py-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-full border border-emerald-200 dark:border-emerald-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Polygon Mumbai Testnet
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {credentials.map((vc, i) => {
            const gradient = TYPE_COLORS[vc.type] ?? TYPE_COLORS.default;
            const isRevoked = vc.status === "revoked";
            return (
              <motion.div
                key={vc.credentialId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
              >
                <Card className={`overflow-hidden border-none shadow-lg ${isRevoked ? "opacity-60" : ""} hover:shadow-xl transition-shadow`}>
                  <div className={`h-2 bg-gradient-to-r ${gradient}`} />
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Verifiable Credential</p>
                        <CardTitle className="text-lg leading-tight">
                          {TYPE_LABELS[vc.type] ?? vc.type}
                        </CardTitle>
                      </div>
                      <Badge
                        className={isRevoked ? "bg-red-100 text-red-700 border-red-200" : "bg-emerald-100 text-emerald-700 border-emerald-200"}
                        variant="outline"
                      >
                        {isRevoked ? (
                          <><ShieldX className="w-3 h-3 mr-1" />Revoked</>
                        ) : (
                          <><ShieldCheck className="w-3 h-3 mr-1" />Active</>
                        )}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 pb-3">
                    <div className="bg-muted/40 rounded-xl p-3 space-y-2 font-mono text-xs">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Fingerprint className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{vc.credentialId}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Hash className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{vc.hash.slice(0, 20)}...</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-muted-foreground flex items-center gap-1"><Building2 className="h-3 w-3" /> Issuer</p>
                        <p className="font-medium truncate">UIDAI India</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" /> Issued</p>
                        <p className="font-medium">{formatDistanceToNow(new Date(vc.issuanceDate), { addSuffix: true })}</p>
                      </div>
                    </div>

                    {vc.blockchain && (
                      <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1.5 rounded-lg">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                        <span>Block #{vc.blockchain.blockNumber.toLocaleString()}</span>
                        <span className="ml-auto font-mono">{vc.blockchain.txHash.slice(0, 10)}...</span>
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="pt-0 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1.5"
                      onClick={() => setQrVC(vc)}
                    >
                      <QrCode className="h-4 w-4" /> Share
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1.5"
                      onClick={() => setSelectedVC(vc)}
                    >
                      <ExternalLink className="h-4 w-4" /> Details
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {credentials.length === 0 && (
        <div className="text-center py-20 text-muted-foreground border-2 border-dashed rounded-2xl">
          <ShieldCheck className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p>No credentials issued yet. Go to Documents to generate them.</p>
        </div>
      )}

      <Dialog open={!!qrVC} onOpenChange={(o) => !o && setQrVC(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Share Credential</DialogTitle>
          </DialogHeader>
          {qrVC && (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="p-4 bg-white rounded-2xl shadow-inner border">
                <QRCode
                  value={JSON.stringify({ credentialId: qrVC.credentialId, hash: qrVC.hash, type: qrVC.type })}
                  size={180}
                />
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-semibold">{TYPE_LABELS[qrVC.type] ?? qrVC.type}</p>
                <p className="text-xs font-mono text-muted-foreground break-all">{qrVC.credentialId}</p>
              </div>
              <div className="w-full bg-muted/50 rounded-xl p-3 text-xs font-mono text-muted-foreground space-y-1">
                <div className="flex justify-between">
                  <span>Hash</span>
                  <span className="truncate max-w-[150px]">{qrVC.hash.slice(0, 16)}...</span>
                </div>
                <div className="flex justify-between">
                  <span>IPFS CID</span>
                  <span className="truncate max-w-[150px]">{qrVC.ipfsCid.slice(0, 16)}...</span>
                </div>
                <div className="flex justify-between">
                  <span>Network</span>
                  <span>Polygon Mumbai</span>
                </div>
              </div>
              <Button
                className="w-full gap-2"
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
            <DialogTitle>Credential Details</DialogTitle>
          </DialogHeader>
          {selectedVC && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="col-span-2 bg-muted/40 p-3 rounded-xl">
                  <p className="text-xs text-muted-foreground mb-1">Credential ID</p>
                  <p className="font-mono text-xs break-all">{selectedVC.credentialId}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Type</p>
                  <p className="font-medium">{TYPE_LABELS[selectedVC.type] ?? selectedVC.type}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge variant="outline" className={selectedVC.status === "active" ? "border-emerald-300 text-emerald-700" : "border-red-300 text-red-700"}>
                    {selectedVC.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Holder DID</p>
                  <p className="font-mono text-xs truncate">{selectedVC.credentialSubject.id}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Issued</p>
                  <p className="text-xs">{new Date(selectedVC.issuanceDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="bg-muted/40 rounded-xl p-3 space-y-2 text-xs">
                <p className="font-semibold text-foreground">Blockchain Anchor</p>
                {selectedVC.blockchain ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tx Hash</span>
                      <span className="font-mono truncate max-w-[180px]">{selectedVC.blockchain.txHash}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Block</span>
                      <span>#{selectedVC.blockchain.blockNumber.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Network</span>
                      <span className="text-emerald-600">{selectedVC.blockchain.network}</span>
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground">Not yet anchored</p>
                )}
              </div>

              <div className="bg-muted/40 rounded-xl p-3 text-xs">
                <p className="font-semibold text-foreground mb-2">IPFS Storage</p>
                <div className="flex items-center gap-2">
                  <Link2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="font-mono break-all text-muted-foreground">{selectedVC.ipfsCid}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1 gap-2"
                  onClick={() => { verifyMutation.mutate(selectedVC.credentialId); setSelectedVC(null); }}
                  disabled={verifyMutation.isPending}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Verify
                </Button>
                {selectedVC.status === "active" && (
                  <Button
                    variant="destructive"
                    className="gap-2"
                    onClick={() => revokeMutation.mutate(selectedVC.credentialId)}
                    disabled={revokeMutation.isPending}
                  >
                    <AlertTriangle className="h-4 w-4" />
                    Revoke
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
