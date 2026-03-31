import React from "react";
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
  Sun
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useKioskMode } from "../contexts/KioskModeContext";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AIAssistantWidget from "./AIAssistantWidget";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { t, language, setLanguage } = useLanguage();
  const { isKioskMode } = useKioskMode();
  const { theme, setTheme } = useTheme();
  const [location] = useLocation();

  const navItems = [
    { href: "/", icon: Home, label: t("nav.dashboard") },
    { href: "/atm", icon: CreditCard, label: t("nav.atm") },
    { href: "/documents", icon: FileText, label: t("nav.documents") },
    { href: "/forms", icon: FileEdit, label: t("nav.forms") },
    { href: "/healthcare", icon: Heart, label: t("nav.healthcare") },
    { href: "/payments", icon: Wallet, label: t("nav.payments") },
    { href: "/schemes", icon: Umbrella, label: t("nav.schemes") },
    { href: "/notifications", icon: Bell, label: t("nav.notifications") },
    { href: "/profile", icon: User, label: t("nav.profile") },
    { href: "/ai-assistant", icon: Bot, label: t("nav.ai_assistant") },
  ];

  const NavContent = () => (
    <div className="flex flex-col h-full py-4">
      <div className="px-6 mb-8">
        <h1 className="text-2xl font-bold text-primary tracking-tight">SSI Platform</h1>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href} className="block">
              <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isKioskMode ? 'py-5 text-xl' : 'py-3'} ${
                isActive 
                  ? "bg-primary text-primary-foreground font-medium" 
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}>
                <Icon size={isKioskMode ? 28 : 20} />
                <span>{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-72 border-r bg-card shrink-0 shadow-sm z-10">
        <NavContent />
      </aside>

      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top Ribbon */}
        <header className="h-16 border-b bg-card flex items-center justify-between px-4 shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-4 md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-80">
                <NavContent />
              </SheetContent>
            </Sheet>
            <h1 className="text-lg font-bold text-primary tracking-tight">SSI</h1>
          </div>

          <div className="ml-auto flex items-center gap-4">
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="hi">हिंदी</SelectItem>
                <SelectItem value="kn">ಕನ್ನಡ</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            <Link href="/notifications">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-2 h-2 w-2 bg-destructive rounded-full" />
              </Button>
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-muted/30">
          <div className={`p-4 md:p-8 mx-auto max-w-7xl ${isKioskMode ? 'space-y-8' : 'space-y-6'}`}>
            {children}
          </div>
        </main>
      </div>

      <AIAssistantWidget />
    </div>
  );
}