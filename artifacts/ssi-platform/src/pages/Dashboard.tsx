import React from "react";
import { useGetDashboardSummary, useGetUserProfile, useListNotifications, useListBills } from "@workspace/api-client-react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useKioskMode } from "../contexts/KioskModeContext";
import { useLanguage } from "../contexts/LanguageContext";
import { Link } from "wouter";
import {
  CreditCard,
  FileText,
  FileEdit,
  Heart,
  Wallet,
  Umbrella,
  Bell,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Clock,
  ArrowRight,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const ITEM_VARIANTS = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" } }),
};

export default function Dashboard() {
  const { data: profile, isLoading: isProfileLoading } = useGetUserProfile();
  const { data: summary, isLoading: isSummaryLoading } = useGetDashboardSummary();
  const { data: notifications } = useListNotifications();
  const { data: bills } = useListBills();
  const { isKioskMode } = useKioskMode();
  const { t } = useLanguage();

  const { data: activityLog = [] } = useQuery<any[]>({
    queryKey: ["activity-log"],
    queryFn: () => fetch("/api/admin/activity").then((r) => r.json()),
    refetchInterval: 30_000,
  });

  const modules = [
    { href: "/atm", icon: CreditCard, label: t("nav.atm"), gradient: "from-blue-500 via-blue-600 to-blue-700", glow: "shadow-blue-500/25", count: null },
    { href: "/documents", icon: FileText, label: t("nav.documents"), gradient: "from-violet-500 via-indigo-600 to-indigo-700", glow: "shadow-indigo-500/25", count: summary?.documentsCount },
    { href: "/forms", icon: FileEdit, label: t("nav.forms"), gradient: "from-purple-500 via-purple-600 to-fuchsia-600", glow: "shadow-purple-500/25", count: summary?.pendingForms },
    { href: "/healthcare", icon: Heart, label: t("nav.healthcare"), gradient: "from-rose-500 via-rose-600 to-pink-600", glow: "shadow-rose-500/25", count: null },
    { href: "/payments", icon: Wallet, label: t("nav.payments"), gradient: "from-orange-500 via-amber-500 to-yellow-500", glow: "shadow-orange-500/25", count: summary?.pendingBills },
    { href: "/schemes", icon: Umbrella, label: t("nav.schemes"), gradient: "from-emerald-500 via-teal-500 to-green-600", glow: "shadow-emerald-500/25", count: summary?.availableSchemes },
  ];

  const unreadNotifications = notifications?.filter((n: any) => !n.isRead).length ?? 0;
  const pendingBillsData = bills?.filter((b: any) => b.status === "pending") ?? [];

  const smartSuggestions = [
    ...pendingBillsData.slice(0, 2).map((b: any) => ({
      label: `Pay ${b.billerName} — ₹${Number(b.amount).toLocaleString("en-IN")} due soon`,
      href: "/payments",
      icon: Wallet,
      urgent: true,
    })),
    ...(unreadNotifications > 0
      ? [{ label: `${unreadNotifications} unread notification${unreadNotifications > 1 ? "s" : ""}`, href: "/notifications", icon: Bell, urgent: false }]
      : []),
  ].slice(0, 3);

  const stats = [
    { label: "Documents", value: summary?.documentsCount ?? 0, icon: FileText, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-950/40" },
    { label: "Pending Bills", value: summary?.pendingBills ?? 0, icon: Wallet, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-950/40" },
    { label: "Schemes", value: summary?.availableSchemes ?? 0, icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
    { label: "Pending Forms", value: summary?.pendingForms ?? 0, icon: TrendingUp, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-950/40" },
  ];

  if (isProfileLoading || isSummaryLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full rounded-3xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-40 w-full rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-8 text-white shadow-2xl shadow-indigo-500/20"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-64 h-64 rounded-full bg-purple-400/30 blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="text-blue-200 text-sm font-medium mb-1">Welcome back</p>
            <h2 className={`font-bold tracking-tight ${isKioskMode ? "text-4xl" : "text-3xl"}`}>
              {t("greeting")}, {profile?.name || "User"}
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <ShieldCheck className="h-4 w-4 text-emerald-300" />
              <span className="font-mono text-sm text-blue-200">{profile?.ssiId}</span>
              <Badge className="bg-white/20 text-white border-white/20 text-xs">Verified</Badge>
            </div>
          </div>
          {unreadNotifications > 0 && !isKioskMode && (
            <Link href="/notifications">
              <motion.div
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/15 backdrop-blur border border-white/20 text-white text-sm font-semibold cursor-pointer hover:bg-white/25 transition-colors"
              >
                <Bell className="h-4 w-4" />
                {unreadNotifications} new alert{unreadNotifications > 1 ? "s" : ""}
                <ArrowRight className="h-4 w-4 ml-1" />
              </motion.div>
            </Link>
          )}
        </div>
      </motion.div>

      {!isKioskMode && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div key={stat.label} custom={i} variants={ITEM_VARIANTS} initial="hidden" animate="visible">
                <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className={`${stat.bg} ${stat.color} p-3 rounded-xl`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold leading-none">{stat.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {smartSuggestions.length > 0 && !isKioskMode && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-none shadow-md bg-gradient-to-r from-primary/5 via-indigo-500/5 to-purple-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                Smart Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {smartSuggestions.map((s, i) => {
                const Icon = s.icon;
                return (
                  <Link key={i} href={s.href}>
                    <motion.div
                      whileHover={{ x: 6 }}
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${s.urgent ? "bg-orange-50 dark:bg-orange-950/50 hover:bg-orange-100 dark:hover:bg-orange-900/50" : "bg-muted/50 hover:bg-muted"}`}
                    >
                      <Icon className={`h-4 w-4 ${s.urgent ? "text-orange-600" : "text-muted-foreground"}`} />
                      <p className={`text-sm font-medium flex-1 ${s.urgent ? "text-orange-700 dark:text-orange-300" : ""}`}>{s.label}</p>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </motion.div>
                  </Link>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className={`grid gap-5 ${isKioskMode ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-2 lg:grid-cols-3"}`}>
        {modules.map((mod, index) => {
          const Icon = mod.icon;
          return (
            <Link key={mod.href} href={mod.href} className="block">
              <motion.div
                custom={index}
                variants={ITEM_VARIANTS}
                initial="hidden"
                animate="visible"
                whileHover={{ scale: 1.03, y: -4 }}
                whileTap={{ scale: 0.97 }}
              >
                <Card className={`overflow-hidden border-none shadow-lg hover:shadow-2xl ${mod.glow} transition-all h-full group`}>
                  <CardContent className={`${isKioskMode ? "p-8" : "p-6"} flex flex-col items-center justify-center text-center h-full gap-4`}>
                    <div className={`rounded-2xl flex items-center justify-center text-white bg-gradient-to-br ${mod.gradient} shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 ${isKioskMode ? "w-24 h-24" : "w-16 h-16"}`}>
                      <Icon size={isKioskMode ? 48 : 30} />
                    </div>
                    <div>
                      <h3 className={`font-bold ${isKioskMode ? "text-2xl mt-3" : "text-base"}`}>{mod.label}</h3>
                      {mod.count !== undefined && mod.count !== null && (
                        <p className={`text-muted-foreground ${isKioskMode ? "text-lg mt-2" : "text-sm mt-1"}`}>{mod.count} available</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </Link>
          );
        })}
      </div>

      {!isKioskMode && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-none shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4 text-primary" />
                {t("recent_activity")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activityLog.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No recent activity yet.</p>
              ) : (
                <div className="relative border-l-2 border-dashed border-muted-foreground/20 ml-2 space-y-4 pb-2">
                  {activityLog.slice(0, 5).map((item: any, i: number) => (
                    <motion.div
                      key={item.id ?? i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className="pl-5 relative"
                    >
                      <div className={`absolute w-3 h-3 rounded-full -left-[7px] top-1.5 ring-4 ring-background border-2 ${i === 0 ? "bg-primary border-primary" : "bg-muted-foreground/40 border-muted-foreground/40"}`} />
                      <p className="text-sm font-medium capitalize leading-snug">{item.description}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.module && <span className="capitalize mr-1 text-primary/70 font-medium">[{item.module}]</span>}
                        {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                      </p>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              {[
                { label: "Pay Bills", href: "/payments", gradient: "from-orange-500 to-amber-500" },
                { label: "Check Schemes", href: "/schemes", gradient: "from-emerald-500 to-teal-500" },
                { label: "My Health", href: "/healthcare", gradient: "from-rose-500 to-pink-500" },
                { label: "Documents", href: "/documents", gradient: "from-indigo-500 to-violet-500" },
              ].map((action, i) => (
                <Link key={action.href} href={action.href}>
                  <motion.div
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    className={`bg-gradient-to-br ${action.gradient} text-white text-sm font-bold px-4 py-4 rounded-2xl cursor-pointer text-center shadow-lg hover:shadow-xl transition-all`}
                  >
                    {action.label}
                  </motion.div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
