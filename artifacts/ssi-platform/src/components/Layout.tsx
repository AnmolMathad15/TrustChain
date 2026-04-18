import React, { memo, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Home, CreditCard, FileText, FileEdit, Heart, Wallet,
  Umbrella, Bell, User, Bot, Menu, Moon, ShieldCheck,
  ScanSearch, Sun, Shield, LayoutDashboard, Contrast, Zap,
  Building2, ScanLine, Rocket,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../contexts/LanguageContext";
import { useKioskMode } from "../contexts/KioskModeContext";
import { useHighContrast } from "../contexts/HighContrastContext";
import { useTheme } from "next-themes";
import { useListNotifications } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import AIAssistantWidget from "./AIAssistantWidget";
import OfflineBanner from "./OfflineBanner";

interface NavItemConfig {
  href: string;
  icon: React.FC<{ size?: number; className?: string }>;
  label: string;
  badge?: number;
  color?: string;
}

interface NavContentProps {
  navItems: NavItemConfig[];
  location: string;
  isKioskMode: boolean;
}

const NavContent = memo(function NavContent({ navItems, location, isKioskMode }: NavContentProps) {
  return (
    <div className="flex flex-col h-full relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none animate-float-slow" />
      <div className="absolute bottom-20 -right-12 w-40 h-40 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" style={{ animation: "float-slow 11s ease-in-out infinite reverse" }} />

      {/* Logo */}
      <div className="px-5 pt-6 pb-5 relative">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/40">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold leading-none gradient-text">Trustchain</h1>
            <p className="text-[10px] text-slate-400 mt-0.5 font-medium tracking-wider uppercase">Single Smart Interface</p>
          </div>
        </div>
        <div className="mt-4 h-px bg-gradient-to-r from-transparent via-slate-600/60 to-transparent" />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto py-1">
        {navItems.map((item, i) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href} className="block">
              <motion.div
                initial={false}
                animate={isActive ? { x: 0 } : { x: 0 }}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className={`relative flex items-center gap-3 px-3.5 rounded-xl transition-colors cursor-pointer ${
                  isKioskMode ? "py-4 text-xl" : "py-2.5"
                } ${
                  isActive
                    ? "bg-gradient-to-r from-indigo-600/90 to-purple-600/90 text-white font-semibold nav-glow"
                    : "text-slate-400 hover:text-slate-100 hover:bg-white/6"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-active-pill"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-600/90 to-purple-600/90"
                    style={{ zIndex: -1 }}
                    transition={{ type: "spring", stiffness: 380, damping: 35 }}
                  />
                )}
                <Icon size={isKioskMode ? 28 : 18} className={isActive ? "text-white drop-shadow-sm" : ""} />
                <span className={`text-sm font-medium ${isActive ? "text-white" : ""}`}>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center ${
                    isActive ? "bg-white/25 text-white" : "bg-rose-500 text-white"
                  }`}>
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 pt-4 pb-5">
        <div className="h-px bg-gradient-to-r from-transparent via-slate-600/60 to-transparent mb-4" />
        <div className="flex items-center gap-2 px-1">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <ShieldCheck className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-medium">Powered by AI</p>
            <p className="text-[10px] text-slate-500">Digital India Initiative</p>
          </div>
        </div>
      </div>
    </div>
  );
});

export default function Layout({ children }: { children: React.ReactNode }) {
  const { t, language, setLanguage } = useLanguage();
  const { isKioskMode } = useKioskMode();
  const { theme, setTheme } = useTheme();
  const { isHighContrast, setHighContrast } = useHighContrast();
  const [location] = useLocation();
  const { data: notifications } = useListNotifications();

  const unreadCount = notifications?.filter((n: any) => !n.isRead).length ?? 0;

  const navItems: NavItemConfig[] = [
    { href: "/", icon: Home, label: t("nav.dashboard") },
    { href: "/atm", icon: CreditCard, label: t("nav.atm") },
    { href: "/documents", icon: FileText, label: t("nav.documents") },
    { href: "/forms", icon: FileEdit, label: t("nav.forms") },
    { href: "/healthcare", icon: Heart, label: t("nav.healthcare") },
    { href: "/payments", icon: Wallet, label: t("nav.payments") },
    { href: "/schemes", icon: Umbrella, label: t("nav.schemes") },
    { href: "/notifications", icon: Bell, label: t("nav.notifications"), badge: unreadCount },
    { href: "/credentials", icon: ShieldCheck, label: "Credentials" },
    { href: "/verify", icon: ScanSearch, label: "Verify VC" },
    { href: "/issuer", icon: Building2, label: "Issuer Portal" },
    { href: "/verifier", icon: ScanLine, label: "Verifier Portal" },
    { href: "/security", icon: Shield, label: "Security" },
    { href: "/profile", icon: User, label: t("nav.profile") },
    { href: "/ai-assistant", icon: Bot, label: t("nav.ai_assistant") },
    { href: "/admin", icon: LayoutDashboard, label: "Admin" },
    { href: "/landing", icon: Rocket, label: "About Trustchain" },
  ];

  return (
    <div className={`min-h-screen bg-background flex ${isHighContrast ? "high-contrast" : ""}`}>
      <OfflineBanner />

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-68 shrink-0 flex-col z-20 relative" style={{ width: "268px" }}>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-r border-slate-800/60" />
        <div className="relative flex-1 flex flex-col overflow-hidden">
          <NavContent navItems={navItems} location={location} isKioskMode={isKioskMode} />
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Header */}
        <header className="h-14 border-b border-border/60 bg-card/80 backdrop-blur-sm flex items-center justify-between px-4 shrink-0 z-10 shadow-sm">
          <div className="flex items-center gap-3 md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72 bg-slate-900 border-slate-800">
                <NavContent navItems={navItems} location={location} isKioskMode={isKioskMode} />
              </SheetContent>
            </Sheet>
            <span className="text-base font-bold gradient-text">Trustchain</span>
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-[108px] h-8 text-xs rounded-lg">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="hi">हिंदी</SelectItem>
                <SelectItem value="kn">ಕನ್ನಡ</SelectItem>
              </SelectContent>
            </Select>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setHighContrast(!isHighContrast)} data-testid="high-contrast-toggle">
                  <Contrast className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>High Contrast</TooltipContent>
            </Tooltip>

            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            <Link href="/notifications">
              <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-lg">
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center text-[9px] font-bold px-1 bg-rose-500 text-white rounded-full leading-none"
                  >
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </motion.span>
                )}
              </Button>
            </Link>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto relative" style={{ background: "hsl(var(--background))" }}>
          {/* Subtle mesh background */}
          <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-indigo-500/3 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-purple-500/3 blur-3xl" />
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={location}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className={`relative z-10 p-5 md:p-8 mx-auto max-w-7xl ${isKioskMode ? "space-y-8" : "space-y-6"}`}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <AIAssistantWidget />
    </div>
  );
}
