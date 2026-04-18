import React, { useRef } from "react";
import { useGetDashboardSummary, useGetUserProfile, useListNotifications, useListBills } from "@workspace/api-client-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useKioskMode } from "../contexts/KioskModeContext";
import { useLanguage } from "../contexts/LanguageContext";
import { Link } from "wouter";
import {
  CreditCard, FileText, FileEdit, Heart, Wallet, Umbrella,
  Bell, ChevronRight, Sparkles, ShieldCheck, TrendingUp, Clock,
  ArrowRight, Activity, Zap,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

function TiltCard({ children, className = "", style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [6, -6]), { stiffness: 400, damping: 35 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-6, 6]), { stiffness: 400, damping: 35 });

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    x.set((e.clientX - left) / width - 0.5);
    y.set((e.clientY - top) / height - 0.5);
  };
  return (
    <div className="perspective" ref={ref} onMouseMove={handleMove} onMouseLeave={() => { x.set(0); y.set(0); }}>
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d", ...style }}
        whileHover={{ scale: 1.03, z: 20 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.18 }}
        className={`shimmer-card ${className}`}
      >
        {children}
      </motion.div>
    </div>
  );
}

const STAGGER = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };
const ITEM = { hidden: { opacity: 0, y: 20, scale: 0.96 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: [0.23, 1, 0.32, 1] } } };

const STATS = [
  { label: "Documents", key: "documentsCount", icon: FileText, accent: "#2563EB", accentRgb: "37,99,235" },
  { label: "Pending Bills", key: "pendingBills", icon: Wallet, accent: "#D97706", accentRgb: "217,119,6" },
  { label: "Schemes", key: "availableSchemes", icon: ShieldCheck, accent: "#059669", accentRgb: "5,150,105" },
  { label: "Pending Forms", key: "pendingForms", icon: TrendingUp, accent: "#7C3AED", accentRgb: "124,58,237" },
];

const MODULES = [
  { href: "/atm", icon: CreditCard, label: "ATM Assistant", accent: "#3B82F6", accentRgb: "59,130,246", desc: "Cash & banking" },
  { href: "/documents", icon: FileText, label: "Documents", accent: "#2563EB", accentRgb: "37,99,235", desc: "DigiLocker & VCs", key: "documentsCount" },
  { href: "/forms", icon: FileEdit, label: "Forms", accent: "#7C3AED", accentRgb: "124,58,237", desc: "Govt applications", key: "pendingForms" },
  { href: "/healthcare", icon: Heart, label: "Healthcare", accent: "#DC2626", accentRgb: "220,38,38", desc: "ABHA & records" },
  { href: "/payments", icon: Wallet, label: "Payments", accent: "#D97706", accentRgb: "217,119,6", desc: "Bills & UPI", key: "pendingBills" },
  { href: "/schemes", icon: Umbrella, label: "Schemes", accent: "#059669", accentRgb: "5,150,105", desc: "Govt benefits", key: "availableSchemes" },
];

export default function Dashboard() {
  const { data: profile, isLoading: profileLoading } = useGetUserProfile();
  const { data: summary, isLoading: summaryLoading } = useGetDashboardSummary();
  const { data: notifications } = useListNotifications();
  const { data: bills } = useListBills();
  const { isKioskMode } = useKioskMode();
  const { t } = useLanguage();

  const { data: activityLog = [] } = useQuery<any[]>({
    queryKey: ["activity-log"],
    queryFn: () => fetch("/api/admin/activity").then((r) => r.json()),
    refetchInterval: 30_000,
  });

  const unread = notifications?.filter((n: any) => !n.isRead).length ?? 0;
  const pendingBills = bills?.filter((b: any) => b.status === "pending") ?? [];

  const suggestions = [
    ...pendingBills.slice(0, 2).map((b: any) => ({
      label: `Pay ${b.billerName} — ₹${Number(b.amount).toLocaleString("en-IN")} due soon`,
      href: "/payments", icon: Wallet, urgent: true,
    })),
    ...(unread > 0 ? [{ label: `${unread} unread notification${unread > 1 ? "s" : ""}`, href: "/notifications", icon: Bell, urgent: false }] : []),
  ].slice(0, 3);

  if (profileLoading || summaryLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-44 w-full rounded-2xl" style={{ background: "var(--bg-elevated)" }} />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map((i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" style={{ background: "var(--bg-elevated)" }} />)}
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
          {[1,2,3,4,5,6].map((i) => <Skeleton key={i} className="h-44 w-full rounded-2xl" style={{ background: "var(--bg-elevated)" }} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      {/* ── Hero Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
        className="relative overflow-hidden rounded-2xl noise"
        style={{
          background: "linear-gradient(135deg, #1e1b4b 0%, #3730a3 30%, #7c3aed 65%, #a21caf 100%)",
          boxShadow: "0 8px 40px rgba(124,58,237,0.35)",
        }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full opacity-20 blur-3xl animate-float-slow"
            style={{ background: "radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)" }} />
          <div className="absolute -bottom-12 -left-8 w-56 h-56 rounded-full opacity-15 blur-2xl"
            style={{ background: "radial-gradient(circle, rgba(167,139,250,0.5) 0%, transparent 70%)", animation: "float-slow 10s ease-in-out infinite reverse" }} />
        </div>
        <div className="relative z-10 p-7 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <motion.p initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
              className="text-purple-200 text-xs font-semibold mb-1 tracking-widest uppercase">
              Welcome back
            </motion.p>
            <motion.h2 initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
              className={`font-extrabold tracking-tight text-white ${isKioskMode ? "text-4xl" : "text-[28px]"}`}>
              {t("greeting")}, {profile?.name || "Rahul Kumar"}
            </motion.h2>
            <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
              className="flex items-center gap-2 mt-3">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
              <span className="font-mono text-xs text-purple-200/90">{profile?.ssiId || "SSI20240001"}</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: "rgba(52,211,153,0.2)", color: "#6ee7b7", border: "1px solid rgba(52,211,153,0.3)" }}>
                Verified
              </span>
            </motion.div>
          </div>
          <div className="flex flex-col items-start md:items-end gap-2.5">
            {unread > 0 && !isKioskMode && (
              <Link href="/notifications">
                <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl cursor-pointer text-white text-xs font-semibold"
                  style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)" }}>
                  <Bell className="h-3.5 w-3.5" />
                  {unread} new alert{unread > 1 ? "s" : ""}
                  <ArrowRight className="h-3.5 w-3.5" />
                </motion.div>
              </Link>
            )}
            <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 3 }}
              className="flex items-center gap-1.5 text-[11px] text-purple-200/70">
              <Activity className="h-3 w-3" />
              <span>Polygon Mumbai · All systems live</span>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* ── Stats Row ── */}
      {!isKioskMode && (
        <motion.div variants={STAGGER} initial="hidden" animate="visible" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map((stat, i) => {
            const Icon = stat.icon;
            const val = (summary as any)?.[stat.key] ?? 0;
            return (
              <motion.div key={stat.label} variants={ITEM}>
                <TiltCard>
                  <div className="rounded-2xl p-5 flex items-center gap-4 transition-all"
                    style={{
                      background: "var(--glass-bg)",
                      border: `1px solid rgba(${stat.accentRgb}, 0.20)`,
                      borderTop: `2px solid ${stat.accent}`,
                    }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `rgba(${stat.accentRgb}, 0.15)` }}>
                      <Icon className="h-5 w-5" style={{ color: stat.accent }} />
                    </div>
                    <div>
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + i * 0.07 }}
                        className="text-2xl font-extrabold leading-none" style={{ color: "var(--text-primary)" }}>
                        {val}
                      </motion.p>
                      <p className="text-xs mt-0.5 font-medium" style={{ color: "var(--text-secondary)" }}>{stat.label}</p>
                    </div>
                  </div>
                </TiltCard>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* ── Smart Suggestions ── */}
      {suggestions.length > 0 && !isKioskMode && (
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="rounded-2xl p-5"
            style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", backdropFilter: "blur(12px)" }}>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-3.5 w-3.5 animate-pulse" style={{ color: "#F59E0B" }} />
              <p className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>Smart Suggestions</p>
            </div>
            <div className="space-y-1.5">
              {suggestions.map((s, i) => {
                const Icon = s.icon;
                return (
                  <Link key={i} href={s.href}>
                    <motion.div whileHover={{ x: 6 }} className="flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-colors"
                      style={{ background: s.urgent ? "rgba(217,119,6,0.08)" : "var(--glass-bg)", border: s.urgent ? "1px solid rgba(217,119,6,0.2)" : "1px solid transparent" }}>
                      <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: s.urgent ? "#D97706" : "var(--text-muted)" }} />
                      <p className="text-xs font-medium flex-1" style={{ color: s.urgent ? "#D97706" : "var(--text-secondary)" }}>{s.label}</p>
                      <ChevronRight className="h-3.5 w-3.5" style={{ color: "var(--text-muted)" }} />
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Module Grid ── */}
      <motion.div variants={STAGGER} initial="hidden" animate="visible"
        className={`grid gap-4 ${isKioskMode ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-2 lg:grid-cols-3"}`}>
        {MODULES.map((mod) => {
          const Icon = mod.icon;
          const count = (summary as any)?.[mod.key ?? ""] as number | undefined;
          return (
            <motion.div key={mod.href} variants={ITEM}>
              <Link href={mod.href} className="block">
                <TiltCard>
                  <div className="rounded-2xl overflow-hidden group cursor-pointer"
                    style={{
                      background: `linear-gradient(135deg, rgba(${mod.accentRgb}, 0.12) 0%, rgba(${mod.accentRgb}, 0.05) 100%)`,
                      border: `1px solid rgba(${mod.accentRgb}, 0.22)`,
                      borderTop: `2px solid ${mod.accent}`,
                      boxShadow: `0 4px 20px rgba(${mod.accentRgb}, 0.10)`,
                    }}>
                    <div className={`${isKioskMode ? "p-8" : "p-6"} flex flex-col items-center text-center gap-4`}>
                      <div className="relative w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-400 group-hover:scale-110 group-hover:rotate-6"
                        style={{ background: `rgba(${mod.accentRgb}, 0.18)`, boxShadow: `0 0 20px rgba(${mod.accentRgb}, 0.25)` }}>
                        <Icon size={isKioskMode ? 36 : 24} style={{ color: mod.accent }} />
                      </div>
                      <div>
                        <h3 className={`font-bold leading-tight ${isKioskMode ? "text-xl" : "text-[15px]"}`}
                          style={{ color: "var(--text-primary)" }}>{mod.label}</h3>
                        <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>{mod.desc}</p>
                        {count !== undefined && count !== null && (
                          <p className="text-xs mt-1.5 font-semibold" style={{ color: mod.accent }}>{count} available</p>
                        )}
                      </div>
                    </div>
                  </div>
                </TiltCard>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>

      {/* ── Bottom: Activity + Quick Actions ── */}
      {!isKioskMode && (
        <div className="grid gap-5 md:grid-cols-2">
          {/* Activity Feed */}
          <div className="rounded-2xl p-5" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", backdropFilter: "blur(12px)" }}>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-3.5 w-3.5" style={{ color: "#7C3AED" }} />
              <p className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>{t("recent_activity")}</p>
            </div>
            {activityLog.length === 0 ? (
              <p className="text-xs text-center py-6" style={{ color: "var(--text-muted)" }}>No recent activity yet.</p>
            ) : (
              <div className="relative border-l-2 border-dashed ml-2 space-y-3.5 pb-1"
                style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                {activityLog.slice(0, 5).map((item: any, i: number) => (
                  <motion.div key={item.id ?? i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }} className="pl-4 relative">
                    <div className={`absolute w-2.5 h-2.5 rounded-full -left-[7px] top-1.5`}
                      style={{
                        background: i === 0 ? "#7C3AED" : "rgba(255,255,255,0.15)",
                        boxShadow: i === 0 ? "0 0 8px rgba(124,58,237,0.5)" : "none",
                        border: "2px solid var(--bg-surface)",
                      }} />
                    <p className="text-[12px] font-medium capitalize leading-snug" style={{ color: "var(--text-primary)" }}>
                      {item.description}
                    </p>
                    <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                      {item.module && <span className="mr-1 font-semibold" style={{ color: "#7C3AED" }}>[{item.module}]</span>}
                      {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="rounded-2xl p-5" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", backdropFilter: "blur(12px)" }}>
            <div className="flex items-center gap-2 mb-4">
              <Zap className="h-3.5 w-3.5" style={{ color: "#7C3AED" }} />
              <p className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>Quick Actions</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Pay Bills", href: "/payments", accent: "#D97706", accentRgb: "217,119,6" },
                { label: "Check Schemes", href: "/schemes", accent: "#059669", accentRgb: "5,150,105" },
                { label: "My Health", href: "/healthcare", accent: "#DC2626", accentRgb: "220,38,38" },
                { label: "Documents", href: "/documents", accent: "#2563EB", accentRgb: "37,99,235" },
              ].map((action) => (
                <Link key={action.href} href={action.href}>
                  <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.96 }}
                    className="text-[13px] font-bold px-4 py-4 rounded-xl cursor-pointer text-center transition-all"
                    style={{
                      background: `rgba(${action.accentRgb}, 0.12)`,
                      border: `1px solid rgba(${action.accentRgb}, 0.25)`,
                      color: action.accent,
                      boxShadow: `0 4px 16px rgba(${action.accentRgb}, 0.12)`,
                    }}>
                    {action.label}
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
