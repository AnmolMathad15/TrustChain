import React, { useState } from "react";
import { useListDocuments } from "@workspace/api-client-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileText, Download, Sparkles, QrCode, ShieldCheck, CheckCircle2, ShieldX } from "lucide-react";
import { motion } from "framer-motion";
import QRCode from "react-qr-code";
import { useToast } from "@/hooks/use-toast";

type VC = {
  credentialId: string;
  type: string;
  hash: string;
  ipfsCid: string;
  status: string;
  blockchain: { txHash: string; blockNumber: number; network: string } | null;
  documentId: number;
};

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
        <h2 className="text-2xl font-bold">Documents</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => <Skeleton key={i} className="h-64 w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">DigiLocker</h2>
          <p className="text-muted-foreground">Secure access to your verified documents.</p>
        </div>
        <Button>Add Document</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {documents?.map((doc, i) => {
          const vc = getVC(doc.id);
          const isVerified = vc && vc.status === "active";
          const isRevoked = vc && vc.status === "revoked";
          return (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="overflow-hidden border-t-4 border-t-primary">
                <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">{doc.name}</CardTitle>
                    <p className="text-sm font-mono text-muted-foreground">{doc.documentNumber}</p>
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    <Badge variant={doc.status === "Verified" ? "default" : "secondary"}>
                      {doc.status}
                    </Badge>
                    {isVerified && (
                      <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200 gap-1">
                        <ShieldCheck className="h-3 w-3" />VC Active
                      </Badge>
                    )}
                    {isRevoked && (
                      <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200 gap-1">
                        <ShieldX className="h-3 w-3" />VC Revoked
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  {isVerified && vc.blockchain && (
                    <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1.5 rounded-lg mb-3">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                      <span>Anchored on Polygon · Block #{vc.blockchain.blockNumber.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-2 text-sm">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground capitalize">{doc.type}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1">Issued On</p>
                      <p className="font-medium">{doc.issuedDate || "N/A"}</p>
                    </div>
                    {doc.expiryDate && (
                      <div>
                        <p className="text-muted-foreground mb-1">Valid Till</p>
                        <p className="font-medium">{doc.expiryDate}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/30 pt-4 flex flex-wrap gap-2">
                  <Button variant="outline" className="flex-1 flex items-center gap-2">
                    <Download className="h-4 w-4" /> Download
                  </Button>
                  {vc && (
                    <Button
                      variant="outline"
                      className="flex-1 flex items-center gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
                      onClick={() => setQrDoc({ doc, vc })}
                    >
                      <QrCode className="h-4 w-4" /> Share VC
                    </Button>
                  )}
                  {vc && (
                    <Button
                      variant="outline"
                      className="flex-1 flex items-center gap-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200"
                      onClick={() => verifyMutation.mutate(vc.credentialId)}
                      disabled={verifyMutation.isPending}
                    >
                      <ShieldCheck className="h-4 w-4" /> Verify
                    </Button>
                  )}
                  <Button variant="secondary" className="flex-1 flex items-center gap-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200">
                    <Sparkles className="h-4 w-4" /> AI Explain
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          );
        })}
      </div>

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
                <p className="text-sm font-semibold">{qrDoc.doc.name}</p>
                <p className="text-xs font-mono text-muted-foreground mt-1">{qrDoc.vc.credentialId}</p>
              </div>
              <div className="w-full space-y-1 text-xs font-mono bg-muted/50 rounded-xl p-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hash</span>
                  <span>{qrDoc.vc.hash.slice(0, 18)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">IPFS</span>
                  <span>{qrDoc.vc.ipfsCid.slice(0, 18)}...</span>
                </div>
                {qrDoc.vc.blockchain && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Block</span>
                    <span>#{qrDoc.vc.blockchain.blockNumber.toLocaleString()}</span>
                  </div>
                )}
              </div>
              <Button
                className="w-full gap-2"
                onClick={() => { verifyMutation.mutate(qrDoc.vc.credentialId); setQrDoc(null); }}
              >
                <CheckCircle2 className="h-4 w-4" /> Verify on Blockchain
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
