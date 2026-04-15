import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  ShieldX,
  AlertTriangle,
  Search,
  CheckCircle2,
  XCircle,
  Hash,
  Calendar,
  Building2,
  Cpu,
  Fingerprint,
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
          <ShieldCheck className="h-7 w-7 text-primary" />
          Credential Verification Portal
        </h2>
        <p className="text-muted-foreground mt-1">
          Verify any credential by its ID. Results are checked against the blockchain ledger.
        </p>
      </div>

      <Card className="border-none shadow-md">
        <CardHeader>
          <CardTitle className="text-base">Enter Credential ID</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={credentialId}
              onChange={(e) => setCredentialId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleVerify()}
              placeholder="e.g. vc-1716000000000-abc12345"
              className="font-mono text-sm"
            />
            <Button onClick={handleVerify} disabled={verifyMutation.isPending || !credentialId.trim()} className="gap-2 shrink-0">
              <Search className="h-4 w-4" />
              {verifyMutation.isPending ? "Checking..." : "Verify"}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Credential IDs are found in your Credential Wallet or on the QR code attached to shared documents.
          </p>
        </CardContent>
      </Card>

      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            key={credentialId + result.valid}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Card className={`border-2 shadow-lg overflow-hidden ${result.valid ? "border-emerald-300 dark:border-emerald-700" : "border-red-300 dark:border-red-700"}`}>
              <div className={`h-1.5 ${result.valid ? "bg-gradient-to-r from-emerald-400 to-green-500" : "bg-gradient-to-r from-red-400 to-rose-500"}`} />
              <CardContent className="pt-6 space-y-6">
                <div className={`flex items-center gap-4 p-5 rounded-2xl ${result.valid ? "bg-emerald-50 dark:bg-emerald-950/30" : "bg-red-50 dark:bg-red-950/30"}`}>
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center shrink-0 ${result.valid ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"}`}>
                    {result.valid ? <CheckCircle2 className="w-9 h-9" /> : result.revoked ? <AlertTriangle className="w-9 h-9" /> : <XCircle className="w-9 h-9" />}
                  </div>
                  <div>
                    <p className={`text-2xl font-bold ${result.valid ? "text-emerald-800 dark:text-emerald-200" : "text-red-800 dark:text-red-200"}`}>
                      {result.valid ? "Valid Credential" : result.revoked ? "Revoked" : "Invalid Credential"}
                    </p>
                    <p className={`text-sm mt-0.5 ${result.valid ? "text-emerald-700 dark:text-emerald-300" : "text-red-700 dark:text-red-300"}`}>
                      {result.reason}
                    </p>
                  </div>
                </div>

                {result.credentialId && (
                  <div className="grid gap-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-muted/40 p-3 rounded-xl">
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1"><Fingerprint className="h-3 w-3" />Type</p>
                        <p className="font-semibold">{TYPE_LABELS[result.type ?? ""] ?? result.type}</p>
                      </div>
                      <div className="bg-muted/40 p-3 rounded-xl">
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1"><Building2 className="h-3 w-3" />Issuer</p>
                        <p className="font-semibold">UIDAI India</p>
                      </div>
                      <div className="bg-muted/40 p-3 rounded-xl">
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1"><Calendar className="h-3 w-3" />Issued</p>
                        <p className="font-semibold">{result.issuanceDate ? new Date(result.issuanceDate).toLocaleDateString("en-IN") : "—"}</p>
                      </div>
                      <div className="bg-muted/40 p-3 rounded-xl">
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1"><Cpu className="h-3 w-3" />Network</p>
                        <p className="font-semibold text-emerald-700 dark:text-emerald-400">{result.network ?? "—"}</p>
                      </div>
                    </div>

                    <div className="bg-muted/40 rounded-xl p-4 space-y-2 text-xs font-mono">
                      <p className="font-sans font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
                        <Hash className="h-4 w-4" /> Blockchain Verification
                      </p>
                      <div className="flex justify-between gap-2">
                        <span className="text-muted-foreground shrink-0">Credential Hash</span>
                        <span className="truncate text-right">{result.hash?.slice(0, 24)}...</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-muted-foreground shrink-0">On-chain Hash</span>
                        <span className={`truncate text-right ${result.tampered ? "text-red-500" : "text-emerald-600"}`}>
                          {result.blockchainHash?.slice(0, 24)}...
                        </span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-muted-foreground shrink-0">Tx Hash</span>
                        <span className="truncate text-right">{result.txHash}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Block Number</span>
                        <span>#{result.blockNumber?.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t">
                        <span className="text-muted-foreground">Hash Match</span>
                        <Badge variant="outline" className={!result.tampered ? "border-emerald-300 text-emerald-700" : "border-red-300 text-red-700"}>
                          {!result.tampered ? <><CheckCircle2 className="h-3 w-3 mr-1" />Match</> : <><XCircle className="h-3 w-3 mr-1" />Mismatch</>}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {!result && !verifyMutation.isPending && (
        <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-2xl">
          <ShieldCheck className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p className="font-medium">Enter a Credential ID above to verify</p>
          <p className="text-sm mt-1">You can find Credential IDs in your Credential Wallet</p>
        </div>
      )}
    </div>
  );
}
