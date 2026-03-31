import React from "react";
import { useGetDashboardSummary, useGetUserProfile } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { useKioskMode } from "../contexts/KioskModeContext";
import { useLanguage } from "../contexts/LanguageContext";
import { Link } from "wouter";
import { CreditCard, FileText, FileEdit, Heart, Wallet, Umbrella } from "lucide-react";

export default function Dashboard() {
  const { data: profile, isLoading: isProfileLoading } = useGetUserProfile();
  const { data: summary, isLoading: isSummaryLoading } = useGetDashboardSummary();
  const { isKioskMode } = useKioskMode();
  const { t } = useLanguage();

  const modules = [
    { href: "/atm", icon: CreditCard, label: t("nav.atm"), color: "bg-blue-500", count: null },
    { href: "/documents", icon: FileText, label: t("nav.documents"), color: "bg-indigo-500", count: summary?.documentsCount },
    { href: "/forms", icon: FileEdit, label: t("nav.forms"), color: "bg-purple-500", count: summary?.pendingForms },
    { href: "/healthcare", icon: Heart, label: t("nav.healthcare"), color: "bg-rose-500", count: null },
    { href: "/payments", icon: Wallet, label: t("nav.payments"), color: "bg-orange-500", count: summary?.pendingBills },
    { href: "/schemes", icon: Umbrella, label: t("nav.schemes"), color: "bg-emerald-500", count: summary?.availableSchemes },
  ];

  if (isProfileLoading || isSummaryLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-40 w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            {t("greeting")}, {profile?.name || "User"}
          </h2>
          <p className="text-muted-foreground mt-1">
            Access all your citizen services in one place.
          </p>
        </div>
      </div>

      <div className={`grid gap-6 ${isKioskMode ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2 lg:grid-cols-3'}`}>
        {modules.map((mod, index) => {
          const Icon = mod.icon;
          return (
            <Link key={mod.href} href={mod.href} className="block">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className={`overflow-hidden border-none shadow-md hover:shadow-lg transition-all h-full ${isKioskMode ? 'p-6' : ''}`}>
                  <CardContent className={`p-6 ${isKioskMode ? 'p-8' : ''} flex flex-col items-center justify-center text-center h-full gap-4`}>
                    <div className={`rounded-2xl flex items-center justify-center text-white ${mod.color} ${isKioskMode ? 'w-24 h-24' : 'w-16 h-16'}`}>
                      <Icon size={isKioskMode ? 48 : 32} />
                    </div>
                    <div>
                      <h3 className={`font-semibold ${isKioskMode ? 'text-2xl mt-4' : 'text-lg'}`}>{mod.label}</h3>
                      {mod.count !== undefined && mod.count !== null && (
                        <p className={`text-muted-foreground ${isKioskMode ? 'text-lg mt-2' : 'text-sm mt-1'}`}>
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
          <Card>
            <CardHeader>
              <CardTitle>{t("recent_activity")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <div>
                    <p className="text-sm font-medium">Electricity Bill Paid</p>
                    <p className="text-xs text-muted-foreground">Today at 10:30 AM</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-muted" />
                  <div>
                    <p className="text-sm font-medium">Aadhaar Card Viewed</p>
                    <p className="text-xs text-muted-foreground">Yesterday</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Link href="/payments"><div className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 cursor-pointer">Pay Bills</div></Link>
              <Link href="/schemes"><div className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 cursor-pointer">Check Schemes</div></Link>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}