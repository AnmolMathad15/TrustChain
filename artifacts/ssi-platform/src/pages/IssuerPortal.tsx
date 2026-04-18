import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Building2, ShieldCheck, FileCheck, TrendingUp, Users,
  CheckCircle2, XCircle, Clock, Hash, ExternalLink,
  Plus, Send, AlertTriangle, Star, Loader2, BadgeCheck,
} from "lucide-react";

const BASE = "/api";

async function fetchJson(path: string) {
  const r = await fetch(`${BASE}${path}`);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

const STAGGER = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };
const ITEM = {
  hidden: { opacity: 0, y: 20, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: [0.23, 1, 0.32, 1] } },
};

function StatCard({ icon: Icon, label, value, gradient, glow }: any) {
  return (
    <Card className="border-none shadow-lg overflow-hidden shimmer-card">
      <CardContent className="p-5 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg shrink-0 ${glow}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-2xl font-extrabold leading-none">{value}</p>
          <p className="text-xs text-muted-foreground mt-1 font-medium">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function IssuerPortal() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: stats, isLoading: statsLoading } = useQuery({ queryKey: ["/api/issuer/stats"], queryFn: () => fetchJson("/issuer/stats") });
  const { data: credentials = [], isLoading: credsLoading } = useQuery({ queryKey: ["/api/issuer/credentials"], queryFn: () => fetchJson("/issuer/credentials") });
  const { data: trusted = [], isLoading: trustedLoading } = useQuery({ queryKey: ["/api/issuer/trusted"], queryFn: () => fetchJson("/issuer/trusted") });

  const [issueForm, setIssueForm] = useState({ holderDid: "", type: "IdentityDocument", name: "", documentNumber: "" });

  const issueMutation = useMutation({
    mutationFn: (data: typeof issueForm) =>
      fetch(`${BASE}/credentials/issue`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: (data) => {
      if (data.error) { toast({ title: "Issue failed", description: data.error, variant: "destructive" }); return; }
      toast({ title: "Credential issued", description: `VC ID: ${data.credentialId}` });
      queryClient.invalidateQueries({ queryKey: ["/api/issuer/credentials"] });
      queryClient.invalidateQueries({ queryKey: ["/api/issuer/stats"] });
      setIssueForm({ holderDid: "", type: "IdentityDocument", name: "", documentNumber: "" });
    },
    onError: () => toast({ title: "Issue failed", variant: "destructive" }),
  });

  const approveMutation = useMutation({
    mutationFn: (id: number) => fetch(`${BASE}/issuer/admin/${id}/approve`, { method: "POST" }).then(r => r.json()),
    onSuccess: () => { toast({ title: "Issuer approved" }); queryClient.invalidateQueries({ queryKey: ["/api/issuer/trusted"] }); queryClient.invalidateQueries({ queryKey: ["/api/issuer/stats"] }); },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: number) => fetch(`${BASE}/issuer/admin/${id}/reject`, { method: "POST" }).then(r => r.json()),
    onSuccess: () => { toast({ title: "Issuer rejected", variant: "destructive" }); queryClient.invalidateQueries({ queryKey: ["/api/issuer/trusted"] }); },
  });

  const statCards = [
    { icon: FileCheck, label: "Total Credentials", value: stats?.totalCredentials ?? "—", gradient: "from-indigo-500 to-purple-600", glow: "shadow-indigo-500/30" },
    { icon: ShieldCheck, label: "Active", value: stats?.activeCredentials ?? "—", gradient: "from-emerald-500 to-teal-600", glow: "shadow-emerald-500/30" },
    { icon: Users, label: "Total Holders", value: stats?.totalHolders ?? "—", gradient: "from-blue-500 to-cyan-600", glow: "shadow-blue-500/30" },
    { icon: TrendingUp, label: "This Month", value: stats?.thisMonth ?? "—", gradient: "from-orange-500 to-amber-500", glow: "shadow-orange-500/30" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight">Issuer Portal</h2>
            <p className="text-xs text-muted-foreground font-medium">Issue · Manage · Revoke Verifiable Credentials</p>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={STAGGER} initial="hidden" animate="visible" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading
          ? [1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)
          : statCards.map(s => (
            <motion.div key={s.label} variants={ITEM}>
              <StatCard {...s} />
            </motion.div>
          ))}
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="issue" className="w-full">
        <TabsList className="grid w-full max-w-lg grid-cols-3 rounded-xl">
          <TabsTrigger value="issue" className="rounded-lg">Issue Credential</TabsTrigger>
          <TabsTrigger value="credentials" className="rounded-lg">All Credentials</TabsTrigger>
          <TabsTrigger value="registry" className="rounded-lg">Trust Registry</TabsTrigger>
        </TabsList>

        {/* Issue tab */}
        <TabsContent value="issue" className="mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-none shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <Plus className="h-4 w-4 text-primary" /> Issue New Credential
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold">Holder DID</Label>
                  <Input
                    placeholder="did:ssi:..."
                    value={issueForm.holderDid}
                    onChange={e => setIssueForm(f => ({ ...f, holderDid: e.target.value }))}
                    className="font-mono text-sm h-10 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold">Credential Type</Label>
                  <Select value={issueForm.type} onValueChange={v => setIssueForm(f => ({ ...f, type: v }))}>
                    <SelectTrigger className="h-10 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IdentityDocument">Identity Document</SelectItem>
                      <SelectItem value="EducationCredential">Education Credential</SelectItem>
                      <SelectItem value="BankCredential">Bank Credential</SelectItem>
                      <SelectItem value="HealthCredential">Health Credential</SelectItem>
                      <SelectItem value="EmploymentCredential">Employment Credential</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold">Document / Credential Name</Label>
                  <Input
                    placeholder="e.g. Aadhaar Card, B.Tech Degree"
                    value={issueForm.name}
                    onChange={e => setIssueForm(f => ({ ...f, name: e.target.value }))}
                    className="h-10 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold">Document Number</Label>
                  <Input
                    placeholder="e.g. 1234-5678-9012"
                    value={issueForm.documentNumber}
                    onChange={e => setIssueForm(f => ({ ...f, documentNumber: e.target.value }))}
                    className="h-10 rounded-xl font-mono"
                  />
                </div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    className="w-full h-11 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 font-bold gap-2 shadow-lg"
                    onClick={() => issueMutation.mutate(issueForm)}
                    disabled={issueMutation.isPending || !issueForm.name}
                  >
                    {issueMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    {issueMutation.isPending ? "Issuing..." : "Issue Credential"}
                  </Button>
                </motion.div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md">
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" /> Issuer Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                {[
                  "Only issue credentials to verified holders whose identity you have confirmed.",
                  "Credentials are signed with Ed25519 and anchored on Polygon blockchain.",
                  "Credential hashes are immutable — revocation is the only way to invalidate.",
                  "Your reputation score decreases for revoked credentials.",
                  "All issuance activity is logged in the public audit trail.",
                ].map((tip, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-indigo-500/15 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-indigo-500 text-[10px] font-bold">{i + 1}</span>
                    </div>
                    <p>{tip}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* All Credentials tab */}
        <TabsContent value="credentials" className="mt-6">
          <Card className="border-none shadow-md overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-primary" /> Issued Credentials ({credentials.length})
              </CardTitle>
            </CardHeader>
            <div className="divide-y divide-border/50">
              <AnimatePresence>
                {credsLoading
                  ? [1, 2, 3].map(i => <Skeleton key={i} className="h-20 m-4 rounded-xl" />)
                  : (credentials as any[]).map((vc: any, i: number) => (
                    <motion.div
                      key={vc.credentialId}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${vc.status === "active" ? "bg-emerald-100 dark:bg-emerald-950/50" : "bg-red-100 dark:bg-red-950/50"}`}>
                          {vc.status === "active" ? <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" /> : <XCircle className="h-5 w-5 text-red-500" />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm truncate">{vc.type}</p>
                          <p className="text-xs font-mono text-muted-foreground truncate">{vc.credentialId}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <Badge variant="outline" className={`text-xs capitalize ${vc.status === "active" ? "border-emerald-400/50 text-emerald-600 dark:text-emerald-400" : "border-red-400/50 text-red-500"}`}>
                          {vc.status}
                        </Badge>
                        {vc.blockchain?.txHash && (
                          <p className="text-[10px] font-mono text-muted-foreground mt-1 truncate max-w-[120px]">
                            {vc.blockchain.txHash.slice(0, 10)}...
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ))}
              </AnimatePresence>
              {!credsLoading && credentials.length === 0 && (
                <div className="py-12 text-center text-muted-foreground text-sm">No credentials issued yet.</div>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Trust Registry tab */}
        <TabsContent value="registry" className="mt-6">
          <div className="space-y-4">
            <div className="grid gap-4">
              {trustedLoading
                ? [1, 2, 3].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)
                : (trusted as any[]).map((issuer: any, i: number) => (
                  <motion.div
                    key={issuer.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.3 }}
                  >
                    <Card className="border-none shadow-md overflow-hidden">
                      <div className={`h-1 ${issuer.isApproved ? "bg-gradient-to-r from-emerald-500 to-teal-500" : "bg-gradient-to-r from-amber-400 to-orange-500"}`} />
                      <CardContent className="p-5 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 min-w-0">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${issuer.isApproved ? "bg-emerald-100 dark:bg-emerald-950/50" : "bg-amber-100 dark:bg-amber-950/30"}`}>
                            {issuer.isApproved ? <BadgeCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" /> : <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-base truncate">{issuer.orgName}</p>
                              <Badge variant="outline" className="text-[10px] capitalize hidden sm:flex">{issuer.orgType}</Badge>
                            </div>
                            <p className="text-xs font-mono text-muted-foreground truncate">{issuer.did}</p>
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                              <span className="text-xs font-semibold">{issuer.reputationScore}</span>
                              <span className="text-xs text-muted-foreground">reputation</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <Badge className={`text-xs ${issuer.isApproved ? "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-300/50" : "bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-300/50"}`}>
                            {issuer.isApproved ? "Approved" : "Pending"}
                          </Badge>
                          {!issuer.isApproved && (
                            <div className="flex gap-2">
                              <Button size="sm" className="h-7 text-xs rounded-lg bg-emerald-600 hover:bg-emerald-700" onClick={() => approveMutation.mutate(issuer.id)} disabled={approveMutation.isPending}>
                                Approve
                              </Button>
                              <Button size="sm" variant="destructive" className="h-7 text-xs rounded-lg" onClick={() => rejectMutation.mutate(issuer.id)} disabled={rejectMutation.isPending}>
                                Reject
                              </Button>
                            </div>
                          )}
                          {issuer.polygonTxHash && (
                            <a href={`https://mumbai.polygonscan.com/tx/${issuer.polygonTxHash}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[10px] text-primary hover:underline">
                              <ExternalLink className="h-3 w-3" /> Polygonscan
                            </a>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
