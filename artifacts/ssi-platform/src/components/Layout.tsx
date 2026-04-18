import React, { memo, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Home, CreditCard, FileText, FileEdit, Heart, Wallet,
  Umbrella, Bell, User, Bot, Menu, Moon, ShieldCheck,
  ScanSearch, Sun, Shield, LayoutDashboard, Contrast, Zap,
  Building2, ScanLine, Rocket, Copy, CheckCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../contexts/LanguageContext";
import { useKioskMode } from "../contexts/KioskModeContext";
import { useHighContrast } from "../contexts/HighContrastContext";
import { useTheme } from "next-themes";
import { useListNotifications, useGetUserProfile } from "@workspace/api-client-react";
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
  accent: string;
  accentRgb: string;
}

interface NavSection {
  title: string;
  items: NavItemConfig[];
}

function DIDStrip({ did }: { did?: string }) {
  const [copied, setCopied] = useState(false);
  const display = did
    ? did.length > 22 ? did.slice(0, 12) + "..." + did.slice(-6) : did
    : "did:ssi:loading...";

  const copy = () => {
    if (did) {
      navigator.clipboard.writeText(did).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  return (
    <div className="flex items-center gap-1.5 group cursor-pointer" onClick={copy}>
      <span className="did-text truncate max-w-[140px]">{display}</span>
      {did && (
        <span className="text-[10px] text-emerald-400 font-medium flex-shrink-0">
          {copied ? <CheckCheck size={11} /> : <Copy size={11} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
        </span>
      )}
    </div>
  );
}

const NavContent = memo(function NavContent({
  sections, location, isKioskMode,
}: {
  sections: NavSection[];
  location: string;
  isKioskMode: boolean;
}) {
  const { data: profile } = useGetUserProfile();

  return (
    <div className="flex flex-col h-full relative overflow-hidden">
      {/* Subtle background orbs */}
      <div className="absolute -top-20 -left-20 w-56 h-56 rounded-full blur-3xl pointer-events-none animate-float-slow"
        style={{ background: "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)" }} />
      <div className="absolute bottom-24 -right-16 w-44 h-44 rounded-full blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 70%)", animation: "float-slow 11s ease-in-out infinite reverse" }} />

      {/* ── Logo ── */}
      <div className="px-5 pt-5 pb-4 relative flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: "linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)", boxShadow: "0 0 20px rgba(124,58,237,0.4)" }}>
              <Zap className="w-4.5 h-4.5 text-white" size={18} />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#080B14] animate-pulse" />
          </div>
          <div>
            <h1 className="text-[15px] font-extrabold leading-none gradient-text tracking-tight">Trustchain</h1>
            <p className="text-[9px] mt-0.5 font-semibold tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>SSSI Platform</p>
          </div>
        </div>
        <div className="mt-4 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)" }} />
      </div>

      {/* ── User Profile Strip ── */}
      <div className="px-4 pb-3 flex-shrink-0">
        <div className="rounded-xl p-2.5 flex items-center gap-2.5" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}>
            {profile?.name ? profile.name.charAt(0).toUpperCase() : "R"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-semibold truncate" style={{ color: "var(--text-primary)" }}>
              {profile?.name || "Rahul Kumar"}
            </p>
            <div className="flex items-center gap-1">
              <DIDStrip did={profile?.ssiId ? `did:ssi:${profile.ssiId}` : undefined} />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Nav Sections ── */}
      <nav className="flex-1 px-3 overflow-y-auto pb-2">
        {sections.map((section) => (
          <div key={section.title} className="mb-3">
            <p className="px-2 mb-1.5 text-[9px] font-bold tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>
              {section.title}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href ||
                  (item.href !== "/" && location.startsWith(item.href));
                return (
                  <Link key={item.href} href={item.href} className="block">
                    <motion.div
                      whileHover={{ x: 3 }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ duration: 0.12 }}
                      className={`relative flex items-center gap-2.5 rounded-lg cursor-pointer transition-colors ${isKioskMode ? "py-3.5 px-3" : "py-2 px-3"}`}
                      style={isActive ? {
                        background: `rgba(${item.accentRgb}, 0.14)`,
                        borderLeft: `3px solid ${item.accent}`,
                        borderRadius: "0 8px 8px 0",
                        paddingLeft: "calc(12px - 3px)",
                      } : {
                        borderLeft: "3px solid transparent",
                        borderRadius: "0 8px 8px 0",
                        paddingLeft: "calc(12px - 3px)",
                      }}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="nav-active-pill"
                          className="absolute inset-0 rounded-r-lg"
                          style={{
                            background: `rgba(${item.accentRgb}, 0.10)`,
                            zIndex: -1,
                          }}
                          transition={{ type: "spring", stiffness: 400, damping: 35 }}
                        />
                      )}
                      <Icon
                        size={isKioskMode ? 22 : 15}
                        style={{ color: isActive ? item.accent : "var(--text-secondary)", flexShrink: 0 }}
                      />
                      <span
                        className={`text-[13px] font-medium flex-1 ${isKioskMode ? "text-base" : ""}`}
                        style={{ color: isActive ? item.accent : "var(--text-secondary)" }}
                      >
                        {item.label}
                      </span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center"
                          style={isActive
                            ? { background: `rgba(${item.accentRgb}, 0.25)`, color: item.accent }
                            : { background: "#ef4444", color: "white" }
                          }>
                          {item.badge > 99 ? "99+" : item.badge}
                        </span>
                      )}
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Footer ── */}
      <div className="px-4 pt-3 pb-4 flex-shrink-0">
        <div className="h-px mb-3" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)" }} />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #059669, #0d9488)" }}>
              <ShieldCheck size={11} className="text-white" />
            </div>
            <div>
              <p className="text-[9px] font-semibold tracking-wide" style={{ color: "var(--text-muted)" }}>Digital India · v2.0.0</p>
            </div>
          </div>
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md"
            style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.2)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[9px] font-semibold text-emerald-400">LIVE</span>
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

  const sections: NavSection[] = [
    {
      title: "Main",
      items: [
        { href: "/", icon: Home, label: t("nav.dashboard"), accent: "#7C3AED", accentRgb: "124,58,237" },
        { href: "/atm", icon: CreditCard, label: t("nav.atm"), accent: "#3B82F6", accentRgb: "59,130,246" },
        { href: "/documents", icon: FileText, label: t("nav.documents"), accent: "#2563EB", accentRgb: "37,99,235" },
        { href: "/forms", icon: FileEdit, label: t("nav.forms"), accent: "#7C3AED", accentRgb: "124,58,237" },
        { href: "/healthcare", icon: Heart, label: t("nav.healthcare"), accent: "#DC2626", accentRgb: "220,38,38" },
        { href: "/payments", icon: Wallet, label: t("nav.payments"), accent: "#D97706", accentRgb: "217,119,6" },
        { href: "/schemes", icon: Umbrella, label: t("nav.schemes"), accent: "#059669", accentRgb: "5,150,105" },
      ],
    },
    {
      title: "Identity",
      items: [
        { href: "/credentials", icon: ShieldCheck, label: "Credentials", accent: "#0891B2", accentRgb: "8,145,178" },
        { href: "/verify", icon: ScanSearch, label: "Verify VC", accent: "#16A34A", accentRgb: "22,163,74" },
        { href: "/security", icon: Shield, label: "Security", accent: "#9333EA", accentRgb: "147,51,234" },
      ],
    },
    {
      title: "SaaS Portals",
      items: [
        { href: "/issuer", icon: Building2, label: "Issuer Portal", accent: "#0891B2", accentRgb: "8,145,178" },
        { href: "/verifier", icon: ScanLine, label: "Verifier Portal", accent: "#2563EB", accentRgb: "37,99,235" },
      ],
    },
    {
      title: "Other",
      items: [
        { href: "/notifications", icon: Bell, label: t("nav.notifications"), badge: unreadCount, accent: "#F59E0B", accentRgb: "245,158,11" },
        { href: "/ai-assistant", icon: Bot, label: t("nav.ai_assistant"), accent: "#F59E0B", accentRgb: "245,158,11" },
        { href: "/profile", icon: User, label: t("nav.profile"), accent: "#7C3AED", accentRgb: "124,58,237" },
        { href: "/admin", icon: LayoutDashboard, label: "Admin", accent: "#9333EA", accentRgb: "147,51,234" },
        { href: "/landing", icon: Rocket, label: "About Trustchain", accent: "#7C3AED", accentRgb: "124,58,237" },
      ],
    },
  ];

  const currentAccent = sections
    .flatMap((s) => s.items)
    .find((item) => item.href === location || (item.href !== "/" && location.startsWith(item.href)))
    ?.accent ?? "#7C3AED";

  return (
    <div className={`min-h-screen flex ${isHighContrast ? "high-contrast" : ""}`}
      style={{ background: "var(--bg-surface)" }}>
      <OfflineBanner />

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex shrink-0 flex-col z-20 relative" style={{ width: "228px" }}>
        <div className="absolute inset-0"
          style={{
            background: "rgba(8, 11, 20, 0.92)",
            backdropFilter: "blur(20px)",
            borderRight: "1px solid var(--border-subtle)",
          }} />
        <div className="relative flex-1 flex flex-col overflow-hidden">
          <NavContent sections={sections} location={location} isKioskMode={isKioskMode} />
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Header */}
        <header className="h-13 flex items-center justify-between px-4 shrink-0 z-10"
          style={{
            height: "52px",
            background: "rgba(13, 17, 23, 0.80)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid var(--border-subtle)",
          }}>
          {/* Mobile hamburger */}
          <div className="flex items-center gap-3 md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-[228px] border-r-0"
                style={{ background: "rgba(8, 11, 20, 0.97)" }}>
                <NavContent sections={sections} location={location} isKioskMode={isKioskMode} />
              </SheetContent>
            </Sheet>
            <span className="text-sm font-bold gradient-text">Trustchain</span>
          </div>

          {/* Right controls */}
          <div className="ml-auto flex items-center gap-1">
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-[100px] h-7 text-xs rounded-lg border-none"
                style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--text-secondary)" }}>
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
                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg"
                  style={{ color: "var(--text-secondary)" }}
                  onClick={() => setHighContrast(!isHighContrast)}
                  data-testid="high-contrast-toggle">
                  <Contrast className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>High Contrast</TooltipContent>
            </Tooltip>

            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg"
              style={{ color: "var(--text-secondary)" }}
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              {theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            </Button>

            <Link href="/notifications">
              <Button variant="ghost" size="icon" className="relative h-7 w-7 rounded-lg"
                style={{ color: "var(--text-secondary)" }}>
                <Bell className="h-3.5 w-3.5" />
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 min-w-[14px] h-3.5 flex items-center justify-center text-[8px] font-bold px-1 rounded-full leading-none"
                    style={{ background: "#ef4444", color: "white" }}
                  >
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </motion.span>
                )}
              </Button>
            </Link>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto relative">
          {/* Background glow orbs */}
          <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            <div className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full blur-3xl"
              style={{ background: `radial-gradient(circle, ${currentAccent}08 0%, transparent 60%)` }} />
            <div className="absolute bottom-0 left-60 w-[500px] h-[500px] rounded-full blur-3xl"
              style={{ background: "radial-gradient(circle, rgba(37,99,235,0.05) 0%, transparent 60%)" }} />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={location}
              initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] } }}
              exit={{ opacity: 0, y: -8, transition: { duration: 0.18 } }}
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
