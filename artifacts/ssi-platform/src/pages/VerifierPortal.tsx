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
  ScanLine, Key, CheckCircle2, XCircle, TrendingUp, ShieldCheck,
  Copy, Trash2, Plus, Loader2, Activity, ExternalLink, Eye, EyeOff,
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

function StatCard({ icon: Icon, label, value, gradient, glow, suffix }: any) {
  return (
    <Card className="border-none shadow-lg overflow-hidden shimmer-card">
      <CardContent className="p-5 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg shrink-0 ${glow}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-2xl font-extrabold leading-none">{value}{suffix}</p>
          <p className="text-xs text-muted-foreground mt-1 font-medium">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

const TIER_COLORS: Record<string, string> = {
  enterprise: "from-orange-500 to-rose-600",
  starter: "from-indigo-500 to-purple-600",
  free: "from-slate-400 to-slate-600",
};

const TIER_LIMITS: Record<string, number> = { free: 10, starter: 500, enterprise: 99999 };

export default function VerifierPortal() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: stats, isLoading: statsLoading } = useQuery({ queryKey: ["/api/verifier/stats"], queryFn: () => fetchJson("/verifier/stats") });
  const { data: apiKeys = [], isLoading: keysLoading } = useQuery({ queryKey: ["/api/verifier/api-keys"], queryFn: () => fetchJson("/verifier/api-keys") });
  const { data: logs = [], isLoading: logsLoading } = useQuery({ queryKey: ["/api/verifier/logs"], queryFn: () => fetchJson("/verifier/logs") });

  const [newKey, setNewKey] = useState({ orgName: "", verifierDid: "", tier: "starter" });
  const [revealedKeys, setRevealedKeys] = useState<Set<number>>(new Set());
  const [copied, setCopied] = useState<number | null>(null);

  const createKeyMutation = useMutation({
    mutationFn: (data: typeof newKey) =>
      fetch(`${BASE}/verifier/api-keys`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: (data) => {
      if (data.error) { toast({ title: "Failed", description: data.error, variant: "destructive" }); return; }
      toast({ title: "API key created", description: data.apiKey?.key?.slice(0, 20) + "..." });
      queryClient.invalidateQueries({ queryKey: ["/api/verifier/api-keys"] });
      queryClient.invalidateQueries({ queryKey: ["/api/verifier/stats"] });
      setNewKey({ orgName: "", verifierDid: "", tier: "starter" });
    },
  });

  const revokeKeyMutation = useMutation({
    mutationFn: (id: number) => fetch(`${BASE}/verifier/api-keys/${id}`, { method: "DELETE" }).then(r => r.json()),
    onSuccess: () => { toast({ title: "Key revoked", variant: "destructive" }); queryClient.invalidateQueries({ queryKey: ["/api/verifier/api-keys"] }); },
  });

  const copyKey = async (key: string, id: number) => {
    await navigator.clipboard.writeText(key);
    setCopied(id);
    toast({ title: "Copied to clipboard" });
    setTimeout(() => setCopied(null), 2000);
  };

  const toggleReveal = (id: number) => {
    setRevealedKeys(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  };

  const statCards = [
    { icon: Key, label: "Active API Keys", value: stats?.activeApiKeys ?? "—", gradient: "from-indigo-500 to-purple-600", glow: "shadow-indigo-500/30", suffix: "" },
    { icon: Activity, label: "Total Verifications", value: stats?.totalVerifications ?? "—", gradient: "from-blue-500 to-cyan-600", glow: "shadow-blue-500/30", suffix: "" },
    { icon: CheckCircle2, label: "Successful", value: stats?.successfulVerifications ?? "—", gradient: "from-emerald-500 to-teal-600", glow: "shadow-emerald-500/30", suffix: "" },
    { icon: TrendingUp, label: "Success Rate", value: stats?.successRate ?? "—", gradient: "from-orange-500 to-amber-500", glow: "shadow-orange-500/30", suffix: stats?.successRate !== undefined ? "%" : "" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <ScanLine className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight">Verifier Portal</h2>
            <p className="text-xs text-muted-foreground font-medium">API Keys · Verification Logs · QR Scanner</p>
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
      <Tabs defaultValue="keys" className="w-full">
        <TabsList className="grid w-full max-w-lg grid-cols-3 rounded-xl">
          <TabsTrigger value="keys" className="rounded-lg">API Keys</TabsTrigger>
          <TabsTrigger value="logs" className="rounded-lg">Verification Logs</TabsTrigger>
          <TabsTrigger value="scanner" className="rounded-lg">QR Scanner</TabsTrigger>
        </TabsList>

        {/* API Keys tab */}
        <TabsContent value="keys" className="mt-6">
          <div className="grid md:grid-cols-5 gap-6">
            <div className="md:col-span-2">
              <Card className="border-none shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Plus className="h-4 w-4 text-primary" /> Create API Key
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold">Organisation Name</Label>
                    <Input placeholder="Infosys BPO" value={newKey.orgName} onChange={e => setNewKey(k => ({ ...k, orgName: e.target.value }))} className="h-10 rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold">Verifier DID</Label>
                    <Input placeholder="did:ssi:..." value={newKey.verifierDid} onChange={e => setNewKey(k => ({ ...k, verifierDid: e.target.value }))} className="h-10 rounded-xl font-mono text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold">Tier</Label>
                    <Select value={newKey.tier} onValueChange={v => setNewKey(k => ({ ...k, tier: v }))}>
                      <SelectTrigger className="h-10 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="free">Free — 10 calls/month</SelectItem>
                        <SelectItem value="starter">Starter — 500 calls/month</SelectItem>
                        <SelectItem value="enterprise">Enterprise — Unlimited</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 font-bold gap-2 shadow-lg"
                    onClick={() => createKeyMutation.mutate(newKey)}
                    disabled={createKeyMutation.isPending || !newKey.orgName || !newKey.verifierDid}
                  >
                    {createKeyMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Key className="h-4 w-4" />}
                    Generate API Key
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-3 space-y-3">
              {keysLoading
                ? [1, 2, 3].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)
                : (apiKeys as any[]).map((k: any, i: number) => (
                  <motion.div key={k.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                    <Card className={`border-none shadow-md overflow-hidden ${!k.isActive ? "opacity-50" : ""}`}>
                      <div className={`h-1 bg-gradient-to-r ${TIER_COLORS[k.tier] ?? "from-slate-400 to-slate-600"}`} />
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold text-sm">{k.orgName}</p>
                            <p className="text-xs text-muted-foreground font-mono truncate max-w-[200px]">{k.verifierDid}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={`text-xs text-white bg-gradient-to-r ${TIER_COLORS[k.tier]}`}>{k.tier}</Badge>
                            {!k.isActive && <Badge variant="destructive" className="text-xs">Revoked</Badge>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-muted/60 rounded-lg px-3 py-2 font-mono text-xs overflow-hidden truncate">
                            {revealedKeys.has(k.id) ? k.key : "tc_" + "•".repeat(30)}
                          </div>
                          <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={() => toggleReveal(k.id)}>
                            {revealedKeys.has(k.id) ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={() => copyKey(k.key, k.id)}>
                            {copied === k.id ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                          </Button>
                          {k.isActive && (
                            <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0 text-destructive" onClick={() => revokeKeyMutation.mutate(k.id)} disabled={revokeKeyMutation.isPending}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{k.usageCount.toLocaleString()} / {k.monthlyLimit === 99999 ? "∞" : k.monthlyLimit.toLocaleString()} calls</span>
                          <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className={`h-full rounded-full bg-gradient-to-r ${TIER_COLORS[k.tier]}`} style={{ width: `${Math.min((k.usageCount / (k.monthlyLimit === 99999 ? 1000 : k.monthlyLimit)) * 100, 100)}%` }} />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              {!keysLoading && (apiKeys as any[]).length === 0 && (
                <div className="py-12 text-center text-muted-foreground text-sm">No API keys yet. Create one above.</div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Logs tab */}
        <TabsContent value="logs" className="mt-6">
          <Card className="border-none shadow-md overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" /> Verification History ({(logs as any[]).length})
              </CardTitle>
            </CardHeader>
            <div className="divide-y divide-border/50">
              {logsLoading
                ? [1, 2, 3].map(i => <Skeleton key={i} className="h-16 m-4 rounded-xl" />)
                : (logs as any[]).map((log: any, i: number) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${log.result ? "bg-emerald-100 dark:bg-emerald-950/50" : "bg-red-100 dark:bg-red-950/50"}`}>
                        {log.result ? <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> : <XCircle className="h-4 w-4 text-red-500" />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{log.verifierOrg || log.verifierDid}</p>
                        <p className="text-xs font-mono text-muted-foreground truncate">{log.credentialId}</p>
                        {log.failureReason && <p className="text-xs text-destructive mt-0.5">{log.failureReason}</p>}
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <Badge variant="outline" className={`text-xs ${log.result ? "border-emerald-400/50 text-emerald-600 dark:text-emerald-400" : "border-red-400/50 text-red-500"}`}>
                        {log.result ? "Verified" : "Failed"}
                      </Badge>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {new Date(log.verifiedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </motion.div>
                ))}
              {!logsLoading && (logs as any[]).length === 0 && (
                <div className="py-12 text-center text-muted-foreground text-sm">No verifications yet.</div>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* QR Scanner tab */}
        <TabsContent value="scanner" className="mt-6">
          <div className="flex flex-col items-center justify-center py-16 gap-6 text-center">
            <motion.div
              animate={{ scale: [1, 1.05, 1], rotate: [0, 3, -3, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-2xl shadow-emerald-500/30"
            >
              <ScanLine className="h-12 w-12 text-white" />
            </motion.div>
            <div>
              <h3 className="text-xl font-bold mb-2">QR Credential Scanner</h3>
              <p className="text-muted-foreground max-w-sm text-sm">Scan a holder's Verifiable Credential QR code to verify it against the blockchain in real time.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button className="gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 shadow-lg" onClick={() => window.location.href = "/verify"}>
                <ScanLine className="h-4 w-4" /> Open QR Scanner
              </Button>
              <Button variant="outline" className="gap-2 rounded-xl" onClick={() => window.location.href = "/verify"}>
                <ShieldCheck className="h-4 w-4" /> Manual Verify
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Uses the cryptographic hash anchored on Polygon to verify authenticity.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
