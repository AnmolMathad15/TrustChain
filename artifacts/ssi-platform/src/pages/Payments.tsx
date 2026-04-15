import React, { useState, useCallback } from "react";
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
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, Droplet, Wifi, Landmark, ArrowRightLeft, CreditCard,
  CheckCircle2, XCircle, Loader2, IndianRupee, ShieldCheck, CalendarClock,
} from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

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

type PaymentSession = {
  bill: Bill | null;
  isAll: boolean;
};

type PaymentResult = {
  success: boolean;
  transactionId?: string;
  amount?: number;
  message?: string;
  error?: string;
};

const PROVIDER_ICON: Record<string, React.ReactNode> = {
  electricity: <Zap className="text-yellow-500 w-6 h-6" />,
  water: <Droplet className="text-blue-500 w-6 h-6" />,
  internet: <Wifi className="text-indigo-500 w-6 h-6" />,
};

function getIcon(type: string) {
  return PROVIDER_ICON[type] ?? <Landmark className="text-gray-500 w-6 h-6" />;
}

async function createPaymentSession(payload: {
  billId?: number;
  amount: number;
  upiId: string;
  description: string;
}): Promise<PaymentResult> {
  const response = await fetch("/api/payments/pay", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error ?? `HTTP ${response.status}`);
  }
  return response.json();
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

  const openSingleSession = useCallback((bill: Bill) => {
    setResult(null);
    setSession({ bill, isAll: false });
  }, []);

  const openPayAllSession = useCallback(() => {
    setResult(null);
    setSession({ bill: null, isAll: true });
  }, []);

  const closeSession = useCallback(() => {
    if (isProcessing) return;
    setSession(null);
    setResult(null);
  }, [isProcessing]);

  const handlePay = useCallback(async () => {
    if (!session || !upiId.trim()) return;
    setIsProcessing(true);
    setResult(null);

    const billsToProcess = session.isAll ? pendingBills : session.bill ? [session.bill] : [];

    try {
      let lastResult: PaymentResult | null = null;
      let totalAmount = 0;

      for (const bill of billsToProcess) {
        console.log("[Payment] Creating session for bill", bill.id, "amount", bill.amount);
        const res = await createPaymentSession({
          billId: bill.id,
          amount: Number(bill.amount),
          upiId: upiId.trim(),
          description: `${bill.provider} — ${bill.accountNumber}`,
        });
        console.log("[Payment] Session result:", res);
        lastResult = res;
        totalAmount += Number(bill.amount);
      }

      const finalResult: PaymentResult = {
        success: true,
        transactionId: lastResult?.transactionId,
        amount: totalAmount,
        message:
          billsToProcess.length > 1
            ? `All ${billsToProcess.length} bills paid successfully via UPI.`
            : lastResult?.message ?? "Payment successful!",
      };

      setResult(finalResult);
      queryClient.invalidateQueries({ queryKey: ["/api/payments/bills"] });
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      toast({ title: "Payment successful", description: finalResult.message });
    } catch (err: any) {
      console.error("[Payment] Error:", err);
      const failResult: PaymentResult = {
        success: false,
        error: err?.message ?? "Payment failed. Please try again.",
      };
      setResult(failResult);
      toast({ title: "Payment failed", description: failResult.error, variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  }, [session, upiId, pendingBills, queryClient, toast]);

  const sessionAmount = session?.isAll
    ? totalDue
    : session?.bill
    ? Number(session.bill.amount)
    : 0;

  const sessionLabel = session?.isAll
    ? `Pay All ${pendingBills.length} Bills`
    : session?.bill?.provider ?? "";

  if (billsLoading || txLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-40 w-full rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Payments & Bills</h2>
          <p className="text-muted-foreground">Manage your utility bills and BHIM UPI payments.</p>
        </div>
        <Link href="/atm">
          <Button variant="outline" className="gap-2">
            <CreditCard className="w-4 h-4" /> ATM Mode
          </Button>
        </Link>
      </div>

      <Card className="overflow-hidden border-none shadow-xl">
        <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600" />
        <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-gradient-to-br from-indigo-950/30 to-purple-950/20">
          <div>
            <p className="text-sm font-medium text-indigo-400 mb-1 flex items-center gap-1.5">
              <IndianRupee className="h-3.5 w-3.5" /> Total Pending Due
            </p>
            <h3 className="text-4xl font-extrabold tracking-tight">₹{totalDue.toLocaleString("en-IN")}</h3>
            <p className="text-sm text-muted-foreground mt-2">{pendingBills.length} bill{pendingBills.length !== 1 ? "s" : ""} pending</p>
          </div>
          <Button
            size="lg"
            onClick={openPayAllSession}
            disabled={pendingBills.length === 0}
            className="w-full md:w-auto h-12 px-8 text-base font-semibold shadow-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 gap-2"
            data-testid="pay-all-button"
          >
            <ShieldCheck className="h-5 w-5" />
            Pay All via UPI
          </Button>
        </CardContent>
      </Card>

      <Tabs defaultValue="bills" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="bills">Pending Bills</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="bills" className="mt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {pendingBills.map((bill, i) => (
              <motion.div
                key={bill.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
              >
                <Card className="flex flex-col border-none shadow-md hover:shadow-lg transition-shadow h-full">
                  <CardHeader className="flex flex-row items-center gap-4 pb-2">
                    <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center shrink-0">
                      {getIcon(bill.type)}
                    </div>
                    <div className="flex-1 space-y-0.5">
                      <CardTitle className="text-lg leading-tight">{bill.provider}</CardTitle>
                      <p className="text-sm text-muted-foreground font-mono">{bill.accountNumber}</p>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex items-end justify-between py-4">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Amount</p>
                      <p className="text-2xl font-bold">₹{Number(bill.amount).toLocaleString("en-IN")}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Due</p>
                      <p className="font-semibold text-destructive flex items-center gap-1 justify-end">
                        <CalendarClock className="h-3.5 w-3.5" />
                        {new Date(bill.dueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0 border-t mt-auto px-4 py-4">
                    <Button
                      className="w-full gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                      onClick={() => openSingleSession(bill)}
                      data-testid={`pay-now-btn-${bill.id}`}
                    >
                      Pay Now — ₹{Number(bill.amount).toLocaleString("en-IN")}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
            {pendingBills.length === 0 && (
              <div className="col-span-full py-16 text-center text-muted-foreground border-2 border-dashed rounded-2xl">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-emerald-500/40" />
                <p className="font-semibold">All caught up!</p>
                <p className="text-sm mt-1">No pending bills.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card className="border-none shadow-md">
            <CardContent className="p-0">
              <div className="divide-y">
                {(transactions as any[])?.map((tx: any) => (
                  <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-muted/40 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tx.type === "credit" ? "bg-green-100 text-green-600 dark:bg-green-950/50 dark:text-green-400" : "bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400"}`}>
                        <ArrowRightLeft className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{tx.description || tx.recipient}</p>
                        <p className="text-xs text-muted-foreground">{new Date(tx.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-base ${tx.type === "credit" ? "text-green-600 dark:text-green-400" : ""}`}>
                        {tx.type === "credit" ? "+" : "-"}₹{Number(tx.amount).toLocaleString("en-IN")}
                      </p>
                      <Badge variant="outline" className={`mt-1 capitalize text-xs ${tx.status === "success" ? "border-emerald-400 text-emerald-600 dark:text-emerald-400" : ""}`}>
                        {tx.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                {(!transactions || (transactions as any[]).length === 0) && (
                  <div className="py-12 text-center text-muted-foreground">
                    <ArrowRightLeft className="h-10 w-10 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">No transactions yet.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!session} onOpenChange={(open) => !open && closeSession()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {result?.success ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              ) : result?.error ? (
                <XCircle className="h-5 w-5 text-destructive" />
              ) : (
                <IndianRupee className="h-5 w-5 text-primary" />
              )}
              {result ? (result.success ? "Payment Successful" : "Payment Failed") : `Pay — ${sessionLabel}`}
            </DialogTitle>
            <DialogDescription>
              {result
                ? result.success
                  ? "Your payment was processed securely."
                  : "There was an issue processing your payment."
                : "Review and confirm your UPI payment."}
            </DialogDescription>
          </DialogHeader>

          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-5 py-2"
              >
                <div className="bg-muted/50 rounded-2xl p-5 space-y-3 border">
                  {session?.isAll ? (
                    <div className="space-y-2">
                      {pendingBills.map((b) => (
                        <div key={b.id} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{b.provider}</span>
                          <span className="font-medium">₹{Number(b.amount).toLocaleString("en-IN")}</span>
                        </div>
                      ))}
                      <div className="border-t pt-2 flex justify-between font-bold">
                        <span>Total</span>
                        <span>₹{totalDue.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-1">{session?.bill?.provider}</p>
                      <p className="text-3xl font-extrabold">₹{sessionAmount.toLocaleString("en-IN")}</p>
                      <p className="text-xs text-muted-foreground mt-1 font-mono">{session?.bill?.accountNumber}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="upi-id" className="text-sm font-semibold">
                    UPI ID
                  </Label>
                  <Input
                    id="upi-id"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="yourname@upi"
                    className="h-11 rounded-xl font-mono"
                    data-testid="upi-input"
                  />
                  <p className="text-xs text-muted-foreground">Enter your BHIM/UPI ID to complete the payment.</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-4"
              >
                <div className={`rounded-2xl p-6 text-center ${result.success ? "bg-emerald-950/30 border border-emerald-500/20" : "bg-red-950/30 border border-red-500/20"}`}>
                  {result.success ? (
                    <>
                      <CheckCircle2 className="h-14 w-14 text-emerald-400 mx-auto mb-3" />
                      <p className="font-bold text-lg text-emerald-300">Payment Successful</p>
                      <p className="text-sm text-emerald-400/80 mt-1">{result.message}</p>
                      {result.transactionId && (
                        <p className="text-xs font-mono text-muted-foreground mt-3 bg-black/30 rounded-lg px-3 py-2">
                          Txn ID: {result.transactionId}
                        </p>
                      )}
                      {result.amount && (
                        <p className="text-2xl font-extrabold mt-3">₹{Number(result.amount).toLocaleString("en-IN")}</p>
                      )}
                    </>
                  ) : (
                    <>
                      <XCircle className="h-14 w-14 text-red-400 mx-auto mb-3" />
                      <p className="font-bold text-lg text-red-300">Payment Failed</p>
                      <p className="text-sm text-red-400/80 mt-1">{result.error}</p>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <DialogFooter className="gap-2 mt-2">
            {!result ? (
              <>
                <Button variant="outline" onClick={closeSession} disabled={isProcessing} className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={handlePay}
                  disabled={isProcessing || !upiId.trim() || sessionAmount === 0}
                  className="flex-1 gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                  data-testid="confirm-pay-button"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Processing…
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4" /> Pay ₹{sessionAmount.toLocaleString("en-IN")}
                    </>
                  )}
                </Button>
              </>
            ) : (
              <Button className="w-full" onClick={closeSession}>
                Done
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
