import React from "react";
import { useGetDashboardSummary, useGetUserProfile, useListNotifications, useListBills } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { useKioskMode } from "../contexts/KioskModeContext";
import { useLanguage } from "../contexts/LanguageContext";
import { Link } from "wouter";
import { CreditCard, FileText, FileEdit, Heart, Wallet, Umbrella, Bell, ChevronRight, Sparkles } from "lucide-react";
import { format } from "date-fns";

export default function Dashboard() {
  const { data: profile, isLoading: isProfileLoading } = useGetUserProfile();
  const { data: summary, isLoading: isSummaryLoading } = useGetDashboardSummary();
  const { data: notifications } = useListNotifications();
  const { data: bills } = useListBills();
  const { isKioskMode } = useKioskMode();
  const { t } = useLanguage();

  const modules = [
    { href: "/atm", icon: CreditCard, label: t("nav.atm"), color: "from-blue-500 to-blue-600", count: null },
    { href: "/documents", icon: FileText, label: t("nav.documents"), color: "from-indigo-500 to-indigo-600", count: summary?.documentsCount },
    { href: "/forms", icon: FileEdit, label: t("nav.forms"), color: "from-purple-500 to-purple-600", count: summary?.pendingForms },
    { href: "/healthcare", icon: Heart, label: t("nav.healthcare"), color: "from-rose-500 to-rose-600", count: null },
    { href: "/payments", icon: Wallet, label: t("nav.payments"), color: "from-orange-500 to-amber-500", count: summary?.pendingBills },
    { href: "/schemes", icon: Umbrella, label: t("nav.schemes"), color: "from-emerald-500 to-green-600", count: summary?.availableSchemes },
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

  if (isProfileLoading || isSummaryLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-40 w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className={`font-bold tracking-tight text-foreground ${isKioskMode ? "text-4xl" : "text-3xl"}`}>
            {t("greeting")}, {profile?.name || "User"}
          </h2>
          <p className="text-muted-foreground mt-1">
            SSI ID: <span className="font-mono text-sm">{profile?.ssiId}</span>
          </p>
        </div>
        {unreadNotifications > 0 && !isKioskMode && (
          <Link href="/notifications">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300 text-sm font-medium cursor-pointer"
            >
              <Bell className="h-4 w-4" />
              {unreadNotifications} new alert{unreadNotifications > 1 ? "s" : ""}
              <ChevronRight className="h-4 w-4" />
            </motion.div>
          </Link>
        )}
      </div>

      {smartSuggestions.length > 0 && !isKioskMode && (
        <Card className="border-none shadow-md bg-gradient-to-r from-primary/5 to-indigo-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Smart Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {smartSuggestions.map((s, i) => {
              const Icon = s.icon;
              return (
                <Link key={i} href={s.href}>
                  <motion.div
                    whileHover={{ x: 4 }}
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
      )}

      <div className={`grid gap-5 ${isKioskMode ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-2 lg:grid-cols-3"}`}>
        {modules.map((mod, index) => {
          const Icon = mod.icon;
          return (
            <Link key={mod.href} href={mod.href} className="block">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.07 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className={`overflow-hidden border-none shadow-md hover:shadow-xl transition-all h-full group backdrop-blur-sm bg-card/80`}>
                  <CardContent className={`${isKioskMode ? "p-8" : "p-6"} flex flex-col items-center justify-center text-center h-full gap-4`}>
                    <div className={`rounded-2xl flex items-center justify-center text-white bg-gradient-to-br ${mod.color} shadow-lg group-hover:scale-110 transition-transform ${isKioskMode ? "w-24 h-24" : "w-16 h-16"}`}>
                      <Icon size={isKioskMode ? 48 : 30} />
                    </div>
                    <div>
                      <h3 className={`font-semibold ${isKioskMode ? "text-2xl mt-3" : "text-base"}`}>{mod.label}</h3>
                      {mod.count !== undefined && mod.count !== null && (
                        <p className={`text-muted-foreground ${isKioskMode ? "text-lg mt-2" : "text-sm mt-1"}`}>
                          {mod.count} available
                        </p>
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
            <CardHeader>
              <CardTitle>{t("recent_activity")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative border-l ml-2 space-y-4 pb-2">
                {[
                  { label: "Electricity Bill Paid", time: "Today at 10:30 AM", active: true },
                  { label: "Aadhaar Card Viewed", time: "Yesterday", active: false },
                  { label: "PM-KISAN Eligibility Checked", time: "2 days ago", active: false },
                ].map((item, i) => (
                  <div key={i} className="pl-5 relative">
                    <div className={`absolute w-2.5 h-2.5 rounded-full -left-[5px] top-1.5 ring-4 ring-background ${item.active ? "bg-primary" : "bg-muted-foreground/30"}`} />
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.time}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              {[
                { label: "Pay Bills", href: "/payments", color: "bg-orange-500" },
                { label: "Check Schemes", href: "/schemes", color: "bg-emerald-500" },
                { label: "My Health", href: "/healthcare", color: "bg-rose-500" },
                { label: "Documents", href: "/documents", color: "bg-indigo-500" },
              ].map((action) => (
                <Link key={action.href} href={action.href}>
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className={`${action.color} text-white text-sm font-semibold px-4 py-3 rounded-xl cursor-pointer text-center shadow-md hover:opacity-90 transition-opacity`}
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
