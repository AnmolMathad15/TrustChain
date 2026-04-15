import React, { memo } from "react";
import { Link, useLocation } from "wouter";
import {
  Home,
  CreditCard,
  FileText,
  FileEdit,
  Heart,
  Wallet,
  Umbrella,
  Bell,
  User,
  Bot,
  Menu,
  Moon,
  ShieldCheck,
  ScanSearch,
  Sun,
  Shield,
  LayoutDashboard,
  Contrast,
} from "lucide-react";
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
  icon: React.FC<{ size?: number }>;
  label: string;
  badge?: number;
}

interface NavContentProps {
  navItems: NavItemConfig[];
  location: string;
  isKioskMode: boolean;
}

const NavContent = memo(function NavContent({ navItems, location, isKioskMode }: NavContentProps) {
  return (
    <div className="flex flex-col h-full py-4">
      <div className="px-6 mb-8">
        <h1 className="text-2xl font-bold text-primary tracking-tight">SSI Platform</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Single Smart Interface</p>
      </div>
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href} className="block">
              <div className={`flex items-center gap-3 px-4 rounded-xl transition-all relative ${isKioskMode ? "py-5 text-xl" : "py-2.5"} ${
                isActive
                  ? "bg-primary text-primary-foreground font-semibold shadow-md"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}>
                <Icon size={isKioskMode ? 28 : 20} />
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-destructive text-destructive-foreground"}`}>
                    {item.badge}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>
      <div className="px-4 mt-4 pt-4 border-t">
        <p className="text-xs text-muted-foreground text-center">Powered by AI · Digital India</p>
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
    { href: "/security", icon: Shield, label: "Security" },
    { href: "/profile", icon: User, label: t("nav.profile") },
    { href: "/ai-assistant", icon: Bot, label: t("nav.ai_assistant") },
    { href: "/admin", icon: LayoutDashboard, label: "Admin" },
  ];

  return (
    <div className={`min-h-screen bg-background flex ${isHighContrast ? "high-contrast" : ""}`}>
      <OfflineBanner />

      <aside className="hidden md:block w-72 border-r bg-card shrink-0 shadow-sm z-10">
        <NavContent navItems={navItems} location={location} isKioskMode={isKioskMode} />
      </aside>

      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="h-16 border-b bg-card flex items-center justify-between px-4 shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-4 md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-80">
                <NavContent navItems={navItems} location={location} isKioskMode={isKioskMode} />
              </SheetContent>
            </Sheet>
            <h1 className="text-lg font-bold text-primary tracking-tight">SSI</h1>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-[110px] h-9 text-sm">
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
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setHighContrast(!isHighContrast)}
                  data-testid="high-contrast-toggle"
                >
                  <Contrast className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>High Contrast</TooltipContent>
            </Tooltip>

            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            <Link href="/notifications">
              <Button variant="ghost" size="icon" className="relative h-9 w-9">
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold px-1 bg-destructive text-destructive-foreground rounded-full leading-none">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Button>
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-muted/20">
          <div className={`p-4 md:p-8 mx-auto max-w-7xl ${isKioskMode ? "space-y-8" : "space-y-6"}`}>
            {children}
          </div>
        </main>
      </div>

      <AIAssistantWidget />
    </div>
  );
}
