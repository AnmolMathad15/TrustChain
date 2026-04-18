import React, { useState, useCallback, useRef } from "react";
import { useListBills, useListTransactions } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  Zap, Droplet, Wifi, Landmark, ArrowRightLeft, CreditCard,
  CheckCircle2, XCircle, Loader2, IndianRupee, ShieldCheck, CalendarClock, Sparkles,
} from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "../components/PageHeader";

type Bill = {
  id: number;
  provider: string;
  type: string;
  accountNumber: string;
  amount: number;
  dueDate: string;
  isPaid: boolean;
  billerName?: string;
  status?: string;
};

type PaymentSession = { bill: Bill | null; isAll: boolean };
type PaymentResult = { success: boolean; transactionId?: string; amount?: number; message?: string; error?: string };

const PROVIDER_ICON: Record<string, { icon: React.ReactNode; gradient: string; glow: string }> = {
  electricity: { icon: <Zap className="w-6 h-6 text-white" />, gradient: "from-yellow-400 to-orange-500", glow: "shadow-orange-500/30" },
  water:       { icon: <Droplet className="w-6 h-6 text-white" />, gradient: "from-blue-400 to-cyan-600", glow: "shadow-blue-500/30" },
  internet:    { icon: <Wifi className="w-6 h-6 text-white" />, gradient: "from-indigo-500 to-purple-600", glow: "shadow-indigo-500/30" },
};
const DEFAULT_PROVIDER = { icon: <Landmark className="w-6 h-6 text-white" />, gradient: "from-slate-400 to-slate-600", glow: "shadow-slate-500/20" };

function getBillStyle(type: string) { return PROVIDER_ICON[type] ?? DEFAULT_PROVIDER; }

async function createPaymentSession(payload: { billId?: number; amount: number; upiId: string; description: string }): Promise<PaymentResult> {
  const res = await fetch("/api/payments/pay", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error ?? `HTTP ${res.status}`); }
  return res.json();
}

/* ── 3D Tilt Card ──────────────────────────────────────────────── */
function TiltCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [6, -6]), { stiffness: 400, damping: 40 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-6, 6]), { stiffness: 400, damping: 40 });
  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    x.set((e.clientX - left) / width - 0.5);
    y.set((e.clientY - top) / height - 0.5);
  };
  return (
    <div ref={ref} className="perspective" onMouseMove={handleMove} onMouseLeave={() => { x.set(0); y.set(0); }}>
      <motion.div style={{ rotateX, rotateY, transformStyle: "preserve-3d" }} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className={`shimmer-card ${className}`}>
        {children}
      </motion.div>
    </div>
  );
}

export default function Payments() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: bills, isLoading: billsLoading } = useListBills();
  const { data: transactions, isLoading: txLoading } = useListTransactions();

  const [session, setSession] = useState<PaymentSession | null>(null);
  const [upiId, setUpiId] = useState("user@upi");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<PaymentResult | null>(null);

  const pendingBills = (bills?.filter((b: Bill) => !b.isPaid) ?? []) as Bill[];
  const totalDue = pendingBills.reduce((acc, b) => acc + Number(b.amount), 0);

  const openSingleSession = useCallback((bill: Bill) => { setResult(null); setSession({ bill, isAll: false }); }, []);
  const openPayAllSession = useCallback(() => { setResult(null); setSession({ bill: null, isAll: true }); }, []);
  const closeSession = useCallback(() => { if (isProcessing) return; setSession(null); setResult(null); }, [isProcessing]);

  const handlePay = useCallback(async () => {
    if (!session || !upiId.trim()) return;
    setIsProcessing(true); setResult(null);
    const billsToProcess = session.isAll ? pendingBills : session.bill ? [session.bill] : [];
    try {
      let lastResult: PaymentResult | null = null; let totalAmount = 0;
      for (const bill of billsToProcess) {
        console.log("[Payment] Initiating session", bill.id);
        const res = await createPaymentSession({ billId: bill.id, amount: Number(bill.amount), upiId: upiId.trim(), description: `${bill.provider} — ${bill.accountNumber}` });
        lastResult = res; totalAmount += Number(bill.amount);
      }
      const finalResult: PaymentResult = { success: true, transactionId: lastResult?.transactionId, amount: totalAmount, message: billsToProcess.length > 1 ? `All ${billsToProcess.length} bills paid via UPI.` : lastResult?.message ?? "Payment successful!" };
      setResult(finalResult);
      queryClient.invalidateQueries({ queryKey: ["/api/payments/bills"] });
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      toast({ title: "Payment successful", description: finalResult.message });
    } catch (err: any) {
      setResult({ success: false, error: err?.message ?? "Payment failed." });
      toast({ title: "Payment failed", description: err?.message, variant: "destructive" });
    } finally { setIsProcessing(false); }
  }, [session, upiId, pendingBills, queryClient, toast]);

  const sessionAmount = session?.isAll ? totalDue : session?.bill ? Number(session.bill.amount) : 0;
  const sessionLabel = session?.isAll ? `Pay All ${pendingBills.length} Bills` : session?.bill?.provider ?? "";

  if (billsLoading || txLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64 rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-3xl" />
        <div className="grid gap-4 md:grid-cols-2">{[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-48 w-full rounded-2xl" />)}</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        icon={<IndianRupee size={20} />}
        title="Payments & Bills"
        subtitle="Manage your utility bills and BHIM UPI payments."
        accent="#D97706"
        accentRgb="217,119,6"
      />

      {/* ── Summary Hero Card ─────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1, duration: 0.4 }}>
        <div className="relative overflow-hidden rounded-3xl p-8 noise" style={{ background: "linear-gradient(135deg,#1e1b4b,#312e81,#4c1d95,#6d28d9)", backgroundSize: "300% 300%", animation: "gradient-x 8s ease infinite" }}>
          <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full bg-white/5 blur-3xl animate-float-slow pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <p className="text-indigo-300 text-xs font-semibold uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <IndianRupee className="h-3 w-3" /> Total Pending Due
              </p>
              <motion.h3
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-5xl font-black tracking-tight text-white"
              >
                ₹{totalDue.toLocaleString("en-IN")}
              </motion.h3>
              <p className="text-indigo-300/80 text-sm mt-2">{pendingBills.length} bill{pendingBills.length !== 1 ? "s" : ""} pending</p>
            </div>
            <div className="flex flex-col gap-3 w-full md:w-auto">
              <Button
                size="lg"
                onClick={openPayAllSession}
                disabled={pendingBills.length === 0}
                className="gap-2 h-13 px-8 text-base font-bold bg-white text-indigo-700 hover:bg-white/90 shadow-2xl shadow-indigo-900/50 rounded-2xl transition-all"
                data-testid="pay-all-button"
              >
                <Sparkles className="h-5 w-5" /> Pay All via UPI
              </Button>
              <Link href="/atm">
                <Button variant="outline" className="w-full gap-2 border-white/20 text-white hover:bg-white/10 rounded-2xl bg-white/8 backdrop-blur">
                  <CreditCard className="w-4 h-4" /> ATM Mode
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Tabs ──────────────────────────────────────────────── */}
      <Tabs defaultValue="bills" className="w-full">
        <TabsList className="grid w-full max-w-sm grid-cols-2 rounded-xl">
          <TabsTrigger value="bills" className="rounded-lg">Pending Bills</TabsTrigger>
          <TabsTrigger value="history" className="rounded-lg">History</TabsTrigger>
        </TabsList>

        <TabsContent value="bills" className="mt-6">
          <div className="grid gap-5 md:grid-cols-2">
            <AnimatePresence>
              {pendingBills.map((bill, i) => {
                const style = getBillStyle(bill.type);
                return (
                  <motion.div
                    key={bill.id}
                    initial={{ opacity: 0, y: 24, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: i * 0.08, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                  >
                    <TiltCard>
                      <Card className="flex flex-col border-none shadow-xl overflow-hidden h-full">
                        <div className={`h-2 bg-gradient-to-r ${style.gradient}`} />
                        <CardHeader className="flex flex-row items-center gap-4 pb-2 pt-4">
                          <div className={`w-12 h-12 bg-gradient-to-br ${style.gradient} rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${style.glow}`}>
                            {style.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base leading-tight truncate">{bill.provider}</CardTitle>
                            <p className="text-xs text-muted-foreground font-mono mt-0.5">{bill.accountNumber}</p>
                          </div>
                        </CardHeader>
                        <CardContent className="flex items-end justify-between py-4 flex-1">
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5 font-medium">Amount Due</p>
                            <p className="text-3xl font-black">₹{Number(bill.amount).toLocaleString("en-IN")}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5 font-medium">Due Date</p>
                            <p className="font-bold text-destructive flex items-center gap-1 justify-end text-sm">
                              <CalendarClock className="h-3.5 w-3.5" />
                              {new Date(bill.dueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                            </p>
                          </div>
                        </CardContent>
                        <CardFooter className="pt-0 px-4 pb-4">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => openSingleSession(bill)}
                            data-testid={`pay-now-btn-${bill.id}`}
                            className={`w-full py-3 rounded-2xl text-sm font-bold text-white bg-gradient-to-r ${style.gradient} shadow-lg ${style.glow} hover:opacity-90 transition-opacity`}
                          >
                            Pay Now — ₹{Number(bill.amount).toLocaleString("en-IN")}
                          </motion.button>
                        </CardFooter>
                      </Card>
                    </TiltCard>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {pendingBills.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full py-20 text-center text-muted-foreground border-2 border-dashed border-muted-foreground/15 rounded-3xl"
              >
                <CheckCircle2 className="h-14 w-14 mx-auto mb-4 text-emerald-500/40" />
                <p className="font-bold text-base">All caught up!</p>
                <p className="text-sm mt-1">No pending bills.</p>
              </motion.div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card className="border-none shadow-md overflow-hidden">
            <div className="divide-y divide-border/50">
              {(transactions as any[])?.map((tx: any, i: number) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="p-4 flex items-center justify-between hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${tx.type === "credit" ? "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400" : "bg-red-100 dark:bg-red-950/50 text-red-500 dark:text-red-400"}`}>
                      <ArrowRightLeft className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm leading-snug">{tx.description || tx.recipient}</p>
                      <p className="text-xs text-muted-foreground">{new Date(tx.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-extrabold text-base ${tx.type === "credit" ? "text-emerald-600 dark:text-emerald-400" : ""}`}>
                      {tx.type === "credit" ? "+" : "-"}₹{Number(tx.amount).toLocaleString("en-IN")}
                    </p>
                    <Badge variant="outline" className={`mt-1 capitalize text-xs ${tx.status === "success" ? "border-emerald-400/50 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/30" : ""}`}>
                      {tx.status}
                    </Badge>
                  </div>
                </motion.div>
              ))}
              {(!transactions || (transactions as any[]).length === 0) && (
                <div className="py-16 text-center text-muted-foreground">
                  <ArrowRightLeft className="h-12 w-12 mx-auto mb-3 opacity-15" />
                  <p className="text-sm">No transactions yet.</p>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── Payment Dialog ────────────────────────────────────── */}
      <Dialog open={!!session} onOpenChange={(open) => !open && closeSession()}>
        <DialogContent className="max-w-md overflow-hidden">
          <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${result?.success ? "from-emerald-400 to-teal-500" : result?.error ? "from-red-400 to-rose-600" : "from-indigo-500 to-purple-600"}`} />
          <DialogHeader className="pt-2">
            <DialogTitle className="flex items-center gap-2 text-base">
              {result?.success ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : result?.error ? <XCircle className="h-5 w-5 text-destructive" /> : <IndianRupee className="h-5 w-5 text-primary" />}
              {result ? (result.success ? "Payment Successful" : "Payment Failed") : `Pay — ${sessionLabel}`}
            </DialogTitle>
            <DialogDescription>{result ? (result.success ? "Your payment was processed securely." : "There was an issue processing your payment.") : "Review and confirm your UPI payment."}</DialogDescription>
          </DialogHeader>

          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div key="form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5 py-2">
                <div className="bg-gradient-to-br from-muted/60 to-muted/30 rounded-2xl p-5 space-y-3 border">
                  {session?.isAll ? (
                    <div className="space-y-2">
                      {pendingBills.map((b) => (
                        <div key={b.id} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{b.provider}</span>
                          <span className="font-semibold">₹{Number(b.amount).toLocaleString("en-IN")}</span>
                        </div>
                      ))}
                      <div className="border-t pt-2 mt-2 flex justify-between font-extrabold text-base">
                        <span>Total</span><span>₹{totalDue.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-2">
                      <p className="text-sm text-muted-foreground mb-1">{session?.bill?.provider}</p>
                      <motion.p initial={{ scale: 0.7 }} animate={{ scale: 1 }} transition={{ type: "spring" }} className="text-4xl font-black">
                        ₹{sessionAmount.toLocaleString("en-IN")}
                      </motion.p>
                      <p className="text-xs text-muted-foreground mt-1 font-mono">{session?.bill?.accountNumber}</p>
                    </div>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="upi-id" className="text-sm font-semibold">UPI ID</Label>
                  <Input id="upi-id" value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="yourname@upi" className="h-11 rounded-xl font-mono text-sm" data-testid="upi-input" />
                  <p className="text-xs text-muted-foreground">Enter your BHIM/UPI ID to complete payment.</p>
                </div>
              </motion.div>
            ) : (
              <motion.div key="result" initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 300 }} className="py-4">
                <div className={`rounded-2xl p-7 text-center ${result.success ? "bg-emerald-950/30 border border-emerald-500/20" : "bg-red-950/30 border border-red-500/20"}`}>
                  {result.success ? (
                    <>
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 250, delay: 0.1 }}>
                        <CheckCircle2 className="h-16 w-16 text-emerald-400 mx-auto mb-3" />
                      </motion.div>
                      <p className="font-extrabold text-xl text-emerald-300">Payment Successful</p>
                      <p className="text-sm text-emerald-400/80 mt-1">{result.message}</p>
                      {result.transactionId && <p className="text-xs font-mono text-muted-foreground mt-3 bg-black/30 rounded-xl px-3 py-2">Txn: {result.transactionId}</p>}
                      {result.amount && <p className="text-3xl font-black mt-4 text-white">₹{Number(result.amount).toLocaleString("en-IN")}</p>}
                    </>
                  ) : (
                    <>
                      <XCircle className="h-16 w-16 text-red-400 mx-auto mb-3" />
                      <p className="font-extrabold text-xl text-red-300">Payment Failed</p>
                      <p className="text-sm text-red-400/80 mt-1">{result.error}</p>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <DialogFooter className="gap-2">
            {!result ? (
              <>
                <Button variant="outline" onClick={closeSession} disabled={isProcessing} className="flex-1 rounded-xl">Cancel</Button>
                <Button
                  onClick={handlePay}
                  disabled={isProcessing || !upiId.trim() || sessionAmount === 0}
                  className="flex-1 gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 font-bold shadow-lg"
                  data-testid="confirm-pay-button"
                >
                  {isProcessing ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</> : <><ShieldCheck className="h-4 w-4" /> Pay ₹{sessionAmount.toLocaleString("en-IN")}</>}
                </Button>
              </>
            ) : (
              <Button className="w-full rounded-xl" onClick={closeSession}>Done</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
