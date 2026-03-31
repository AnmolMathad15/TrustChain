import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Shield, Lock, Eye, AlertTriangle, CheckCircle2, Clock, Smartphone, Globe, Key } from "lucide-react";
import { format } from "date-fns";

interface AccessLogEntry {
  id: number;
  action: string;
  description: string;
  ipAddress: string;
  device: string;
  location: string;
  riskLevel: "low" | "medium" | "high";
  createdAt: string;
}

interface SecuritySummary {
  dataEncryption: string;
  sessionTimeout: string;
  lastPasswordChange: string;
  twoFactorEnabled: boolean;
  linkedDevices: number;
  dataSharedWith: Array<{ name: string; type: string; lastAccess: string }>;
}

const riskColors = {
  low: "text-emerald-700 bg-emerald-50 dark:bg-emerald-950",
  medium: "text-amber-700 bg-amber-50 dark:bg-amber-950",
  high: "text-red-700 bg-red-50 dark:bg-red-950",
};

export default function Security() {
  const [accessLog, setAccessLog] = useState<AccessLogEntry[]>([]);
  const [summary, setSummary] = useState<SecuritySummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/security/access-log").then((r) => r.json()),
      fetch("/api/security/summary").then((r) => r.json()),
    ]).then(([log, sum]) => {
      setAccessLog(log);
      setSummary(sum);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-10 w-56" />
        <div className="grid md:grid-cols-2 gap-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto" data-testid="security-page">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Shield className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-3xl font-bold">Security &amp; Privacy</h2>
          <p className="text-muted-foreground">Who accessed your data and how it's protected.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5" /> Data Protection</CardTitle>
            <CardDescription>How your data is secured</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { icon: Key, label: "Encryption", value: summary?.dataEncryption, ok: true },
              { icon: Clock, label: "Session Timeout", value: summary?.sessionTimeout, ok: true },
              { icon: Smartphone, label: "Linked Devices", value: `${summary?.linkedDevices} devices`, ok: (summary?.linkedDevices ?? 0) <= 3 },
              { icon: Shield, label: "2-Factor Auth", value: summary?.twoFactorEnabled ? "Enabled" : "Disabled", ok: summary?.twoFactorEnabled },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center justify-between p-3 bg-muted/40 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.ok ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                    )}
                    <span className="text-sm text-muted-foreground">{item.value}</span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5" /> Data Sharing</CardTitle>
            <CardDescription>Services that can access your data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary?.dataSharedWith.map((service) => (
              <div key={service.name} className="p-3 bg-muted/40 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{service.name}</p>
                  <Badge variant="outline" className="text-xs">{service.type}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">Last access: {service.lastAccess}</p>
              </div>
            ))}
            <p className="text-xs text-muted-foreground pt-2">
              Data sharing is governed by the Digital Personal Data Protection Act, 2023.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Eye className="h-5 w-5" /> Access Log — Who Accessed My Data</CardTitle>
          <CardDescription>All access events to your account in the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {accessLog.slice(0, 15).map((entry, i) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-muted/30 rounded-xl border border-border/50"
              >
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">{entry.action}</p>
                  <p className="text-xs text-muted-foreground">{entry.description}</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Smartphone className="h-3 w-3" /> {entry.device}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Globe className="h-3 w-3" /> {entry.location}
                    </span>
                    <span className="text-xs text-muted-foreground">{entry.ipAddress}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize ${riskColors[entry.riskLevel]}`}>
                    {entry.riskLevel} risk
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(entry.createdAt), "MMM d, h:mm a")}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
