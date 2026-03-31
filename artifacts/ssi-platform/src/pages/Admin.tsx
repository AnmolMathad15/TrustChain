import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Users, Activity, Zap, ShieldCheck, TrendingUp, AlertCircle, CheckCircle2, BarChart3 } from "lucide-react";
import { format } from "date-fns";

interface AdminStats {
  totalUsers: number;
  totalTransactions: number;
  totalSchemes: number;
  unreadNotifications: number;
  recentActivity: Array<{ id: number; action: string; description: string; createdAt: string }>;
  recentTransactions: Array<{ id: number; merchantName: string; amount: string; status: string; createdAt: string }>;
  popularServices: Array<{ service: string; usageCount: number }>;
  systemHealth: { apiStatus: string; dbStatus: string; aiStatus: string; uptime: string };
}

const statusColor: Record<string, string> = {
  healthy: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950",
  degraded: "text-amber-600 bg-amber-50 dark:bg-amber-950",
  down: "text-red-600 bg-red-50 dark:bg-red-950",
};

export default function Admin() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => setError("Failed to load admin stats"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28 w-full" />)}
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  const metricCards = [
    { icon: Users, label: "Total Users", value: stats?.totalUsers ?? 0, color: "text-blue-600 bg-blue-50 dark:bg-blue-950" },
    { icon: TrendingUp, label: "Transactions", value: stats?.totalTransactions ?? 0, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950" },
    { icon: BarChart3, label: "Schemes", value: stats?.totalSchemes ?? 0, color: "text-purple-600 bg-purple-50 dark:bg-purple-950" },
    { icon: Activity, label: "Unread Alerts", value: stats?.unreadNotifications ?? 0, color: "text-orange-600 bg-orange-50 dark:bg-orange-950" },
  ];

  const maxUsage = Math.max(...(stats?.popularServices.map((s) => s.usageCount) ?? [1]));

  return (
    <div className="space-y-8 max-w-6xl mx-auto" data-testid="admin-page">
      <div>
        <h2 className="text-3xl font-bold">Admin Dashboard</h2>
        <p className="text-muted-foreground mt-1">System overview and service analytics</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((m, i) => {
          const Icon = m.icon;
          return (
            <motion.div key={m.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Card className="border-none shadow-md">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${m.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{m.label}</p>
                    <p className="text-2xl font-bold">{m.value}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" /> Popular Services</CardTitle>
            <CardDescription>Most accessed modules by users</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats?.popularServices.map((s) => (
              <div key={s.service} className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{s.service}</span>
                  <span className="text-muted-foreground">{s.usageCount} uses</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(s.usageCount / maxUsage) * 100}%` }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Zap className="h-5 w-5" /> System Health</CardTitle>
            <CardDescription>Live status of all services</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats?.systemHealth && Object.entries(stats.systemHealth).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-3 bg-muted/40 rounded-xl">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span className="font-medium capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${statusColor[value] || "text-muted-foreground bg-muted"}`}>
                  {value}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Recent Activity</CardTitle>
          <CardDescription>Latest user actions across the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative border-l ml-3 space-y-5">
            {stats?.recentActivity.slice(0, 8).map((log, i) => (
              <motion.div key={log.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} className="pl-6 relative">
                <div className="absolute w-2.5 h-2.5 bg-primary rounded-full -left-[5px] top-1.5 ring-4 ring-background" />
                <p className="text-sm font-medium">{log.action}</p>
                <p className="text-sm text-muted-foreground">{log.description}</p>
                <p className="text-xs text-muted-foreground/70 mt-0.5">
                  {format(new Date(log.createdAt), "MMM d, h:mm a")}
                </p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-md">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left py-2 pr-4">Merchant</th>
                  <th className="text-right py-2 pr-4">Amount</th>
                  <th className="text-left py-2 pr-4">Status</th>
                  <th className="text-left py-2">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {stats?.recentTransactions.map((tx) => (
                  <tr key={tx.id}>
                    <td className="py-2.5 pr-4 font-medium">{tx.merchantName}</td>
                    <td className="py-2.5 pr-4 text-right">₹{Number(tx.amount).toLocaleString("en-IN")}</td>
                    <td className="py-2.5 pr-4">
                      <Badge variant={tx.status === "completed" ? "default" : "secondary"} className="capitalize">{tx.status}</Badge>
                    </td>
                    <td className="py-2.5 text-muted-foreground">{format(new Date(tx.createdAt), "MMM d")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
