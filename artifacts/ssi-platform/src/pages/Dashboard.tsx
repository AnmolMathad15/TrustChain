import React, { useRef } from "react";
import { useGetDashboardSummary, useGetUserProfile, useListNotifications, useListBills } from "@workspace/api-client-react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useKioskMode } from "../contexts/KioskModeContext";
import { useLanguage } from "../contexts/LanguageContext";
import { Link } from "wouter";
import {
  CreditCard, FileText, FileEdit, Heart, Wallet, Umbrella,
  Bell, ChevronRight, Sparkles, ShieldCheck, TrendingUp, Clock,
  ArrowRight, Activity,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

/* ── 3D tilt card hook ─────────────────────────────────────────── */
function TiltCard({ children, className = "", glow = "" }: { children: React.ReactNode; className?: string; glow?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 400, damping: 35 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 400, damping: 35 });

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    x.set((e.clientX - left) / width - 0.5);
    y.set((e.clientY - top) / height - 0.5);
  };
  const handleLeave = () => { x.set(0); y.set(0); };

  return (
    <div className="perspective" ref={ref} onMouseMove={handleMove} onMouseLeave={handleLeave}>
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        whileHover={{ scale: 1.04, z: 30 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
        className={`shimmer-card ${glow} ${className}`}
      >
        {children}
      </motion.div>
    </div>
  );
}

const STAGGER = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};
const ITEM = {
  hidden: { opacity: 0, y: 24, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] } },
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
    { href: "/atm", icon: CreditCard, label: t("nav.atm"), gradient: "from-blue-500 via-blue-600 to-cyan-600", glow: "glow-blue", count: null },
    { href: "/documents", icon: FileText, label: t("nav.documents"), gradient: "from-violet-500 via-indigo-600 to-indigo-700", glow: "glow-purple", count: summary?.documentsCount },
    { href: "/forms", icon: FileEdit, label: t("nav.forms"), gradient: "from-fuchsia-500 via-purple-600 to-violet-700", glow: "glow-purple", count: summary?.pendingForms },
    { href: "/healthcare", icon: Heart, label: t("nav.healthcare"), gradient: "from-rose-500 via-rose-600 to-pink-700", glow: "glow-rose", count: null },
    { href: "/payments", icon: Wallet, label: t("nav.payments"), gradient: "from-orange-500 via-amber-500 to-yellow-500", glow: "glow-orange", count: summary?.pendingBills },
    { href: "/schemes", icon: Umbrella, label: t("nav.schemes"), gradient: "from-emerald-500 via-teal-500 to-green-600", glow: "glow-emerald", count: summary?.availableSchemes },
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
    ...(unreadNotifications > 0 ? [{
      label: `${unreadNotifications} unread notification${unreadNotifications > 1 ? "s" : ""}`,
      href: "/notifications",
      icon: Bell,
      urgent: false,
    }] : []),
  ].slice(0, 3);

  const stats = [
    { label: "Documents", value: summary?.documentsCount ?? 0, icon: FileText, from: "from-blue-500", to: "to-indigo-600", glow: "shadow-blue-500/30" },
    { label: "Pending Bills", value: summary?.pendingBills ?? 0, icon: Wallet, from: "from-orange-500", to: "to-amber-500", glow: "shadow-orange-500/30" },
    { label: "Schemes", value: summary?.availableSchemes ?? 0, icon: ShieldCheck, from: "from-emerald-500", to: "to-teal-600", glow: "shadow-emerald-500/30" },
    { label: "Pending Forms", value: summary?.pendingForms ?? 0, icon: TrendingUp, from: "from-purple-500", to: "to-fuchsia-600", glow: "shadow-purple-500/30" },
  ];

  if (isProfileLoading || isSummaryLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-44 w-full rounded-3xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-44 w-full rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ── Hero Banner ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="relative overflow-hidden rounded-3xl noise"
        style={{
          background: "linear-gradient(135deg, #1e3a8a 0%, #4f46e5 40%, #7c3aed 70%, #a21caf 100%)",
          backgroundSize: "300% 300%",
          animation: "gradient-x 8s ease infinite",
        }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-white/8 blur-3xl animate-float-slow" />
          <div className="absolute -bottom-8 -left-8 w-48 h-48 rounded-full bg-purple-300/10 blur-2xl" style={{ animation: "float-slow 10s ease-in-out infinite reverse" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-32 rounded-full bg-indigo-400/5 blur-3xl" />
        </div>
        <div className="relative z-10 p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <motion.p
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="text-blue-200 text-sm font-semibold mb-1 tracking-wide"
            >
              Welcome back
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className={`font-extrabold tracking-tight text-white ${isKioskMode ? "text-4xl" : "text-3xl"}`}
            >
              {t("greeting")}, {profile?.name || "User"}
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              className="flex items-center gap-2 mt-3"
            >
              <ShieldCheck className="h-4 w-4 text-emerald-300" />
              <span className="font-mono text-sm text-blue-200/90">{profile?.ssiId}</span>
              <Badge className="bg-emerald-400/20 text-emerald-300 border-emerald-400/30 text-xs">Verified</Badge>
            </motion.div>
          </div>
          <div className="flex flex-col items-start md:items-end gap-3">
            {unreadNotifications > 0 && !isKioskMode && (
              <Link href="/notifications">
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/12 backdrop-blur border border-white/20 text-white text-sm font-semibold cursor-pointer hover:bg-white/20 transition-colors"
                >
                  <Bell className="h-4 w-4" />
                  {unreadNotifications} new alert{unreadNotifications > 1 ? "s" : ""}
                  <ArrowRight className="h-4 w-4" />
                </motion.div>
              </Link>
            )}
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="flex items-center gap-2 text-xs text-blue-200/80"
            >
              <Activity className="h-3.5 w-3.5" />
              <span>Polygon Mumbai · All systems live</span>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* ── Stats Row ───────────────────────────────────────────── */}
      {!isKioskMode && (
        <motion.div
          variants={STAGGER}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div key={stat.label} variants={ITEM}>
                <TiltCard glow={`shadow-lg ${stat.glow}`}>
                  <Card className="border-none h-full overflow-hidden">
                    <CardContent className="p-5 flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.from} ${stat.to} flex items-center justify-center shadow-lg shrink-0`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <motion.p
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.3 + i * 0.07, type: "spring" }}
                          className="text-2xl font-extrabold leading-none"
                        >
                          {stat.value}
                        </motion.p>
                        <p className="text-xs text-muted-foreground mt-1 font-medium">{stat.label}</p>
                      </div>
                    </CardContent>
                  </Card>
                </TiltCard>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* ── Smart Suggestions ───────────────────────────────────── */}
      {smartSuggestions.length > 0 && !isKioskMode && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <Card className="border-none shadow-lg overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-indigo-500/5 to-purple-500/5" />
            <CardHeader className="pb-2 relative">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                Smart Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 relative">
              {smartSuggestions.map((s, i) => {
                const Icon = s.icon;
                return (
                  <Link key={i} href={s.href}>
                    <motion.div
                      whileHover={{ x: 8, backgroundColor: s.urgent ? "rgb(255 237 213 / 0.7)" : "hsl(var(--muted))" }}
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${s.urgent ? "bg-orange-50/60 dark:bg-orange-950/30" : "bg-muted/40"}`}
                    >
                      <Icon className={`h-4 w-4 shrink-0 ${s.urgent ? "text-orange-600" : "text-muted-foreground"}`} />
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

      {/* ── Module Cards ────────────────────────────────────────── */}
      <motion.div
        variants={STAGGER}
        initial="hidden"
        animate="visible"
        className={`grid gap-5 ${isKioskMode ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-2 lg:grid-cols-3"}`}
      >
        {modules.map((mod) => {
          const Icon = mod.icon;
          return (
            <motion.div key={mod.href} variants={ITEM}>
              <Link href={mod.href} className="block">
                <TiltCard glow={`shadow-xl ${mod.glow}`}>
                  <Card className="overflow-hidden border-none h-full group">
                    <CardContent className={`${isKioskMode ? "p-8" : "p-6"} flex flex-col items-center justify-center text-center h-full gap-5`}>
                      <div className={`relative rounded-2xl flex items-center justify-center text-white bg-gradient-to-br ${mod.gradient} shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 ${isKioskMode ? "w-24 h-24" : "w-16 h-16"}`}>
                        <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <Icon size={isKioskMode ? 48 : 28} />
                      </div>
                      <div>
                        <h3 className={`font-bold leading-tight ${isKioskMode ? "text-2xl" : "text-base"}`}>{mod.label}</h3>
                        {mod.count !== undefined && mod.count !== null && (
                          <p className={`text-muted-foreground mt-1 font-medium ${isKioskMode ? "text-lg" : "text-sm"}`}>
                            {mod.count} available
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TiltCard>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>

      {/* ── Bottom Grid ─────────────────────────────────────────── */}
      {!isKioskMode && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-none shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <Clock className="h-4 w-4 text-primary" />
                {t("recent_activity")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activityLog.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">No recent activity yet.</p>
              ) : (
                <div className="relative border-l-2 border-dashed border-muted-foreground/15 ml-2 space-y-4 pb-2">
                  {activityLog.slice(0, 5).map((item: any, i: number) => (
                    <motion.div
                      key={item.id ?? i}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06, duration: 0.3 }}
                      className="pl-5 relative"
                    >
                      <div className={`absolute w-3 h-3 rounded-full -left-[7px] top-1.5 ring-4 ring-background ${i === 0 ? "bg-primary shadow-lg shadow-primary/40" : "bg-muted-foreground/30"}`} />
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
              <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              {[
                { label: "Pay Bills", href: "/payments", gradient: "from-orange-500 to-amber-500", shadow: "shadow-orange-500/30" },
                { label: "Check Schemes", href: "/schemes", gradient: "from-emerald-500 to-teal-500", shadow: "shadow-emerald-500/30" },
                { label: "My Health", href: "/healthcare", gradient: "from-rose-500 to-pink-500", shadow: "shadow-rose-500/30" },
                { label: "Documents", href: "/documents", gradient: "from-indigo-500 to-violet-600", shadow: "shadow-indigo-500/30" },
              ].map((action) => (
                <Link key={action.href} href={action.href}>
                  <motion.div
                    whileHover={{ scale: 1.05, y: -3, boxShadow: "0 12px 28px var(--tw-shadow-color)" }}
                    whileTap={{ scale: 0.96 }}
                    className={`bg-gradient-to-br ${action.gradient} text-white text-sm font-bold px-4 py-5 rounded-2xl cursor-pointer text-center shadow-lg ${action.shadow} transition-all`}
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
