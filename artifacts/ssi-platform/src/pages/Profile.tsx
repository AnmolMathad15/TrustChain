import React, { useState } from "react";
import { useGetUserProfile, useGetActivityLog, useUpdateUserProfile } from "@workspace/api-client-react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useKioskMode } from "../contexts/KioskModeContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useHighContrast } from "../contexts/HighContrastContext";
import { User, Shield, LogOut, Activity, MonitorSmartphone, Users, Plus, Lock, Contrast, Fingerprint, QrCode, Copy } from "lucide-react";
import { format } from "date-fns";
import PinAuthModal from "../components/PinAuthModal";
import QRCode from "react-qr-code";
import { useToast } from "@/hooks/use-toast";

const FAMILY_MEMBERS = [
  { name: "Priya Kumar", relation: "Spouse", ssiId: "SSI-2024-002", verified: true },
  { name: "Arjun Kumar", relation: "Son", ssiId: "SSI-2024-003", verified: true },
];

export default function Profile() {
  const { data: profile, isLoading: profileLoading } = useGetUserProfile();
  const { data: activities, isLoading: activitiesLoading } = useGetActivityLog();
  const updateUser = useUpdateUserProfile();
  const { toast } = useToast();

  const { isKioskMode, setKioskMode } = useKioskMode();
  const { language, setLanguage } = useLanguage();
  const { isHighContrast, setHighContrast } = useHighContrast();
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pinAction, setPinAction] = useState<"setup" | "verify">("verify");
  const [pinSet, setPinSet] = useState(true);
  const [didQrOpen, setDidQrOpen] = useState(false);

  const { data: didData } = useQuery<{ did: string; publicKey: string; document: any; createdAt: string }>({
    queryKey: ["did", "1"],
    queryFn: () => fetch("/api/did/1").then((r) => r.json()),
  });

  if (profileLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-48 w-full" />
        <div className="grid md:grid-cols-2 gap-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  const handleKioskToggle = (checked: boolean) => {
    setKioskMode(checked);
    updateUser.mutate({ data: { isKioskMode: checked } });
  };

  const handleLanguageChange = (val: string) => {
    setLanguage(val);
    updateUser.mutate({ data: { preferredLanguage: val } });
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto" data-testid="profile-page">
      <Card className="border-none shadow-md overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-primary via-indigo-500 to-purple-600" />
        <CardContent className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-16 sm:-mt-12 mb-6 text-center sm:text-left">
            <div className="w-32 h-32 rounded-full border-4 border-background bg-muted flex items-center justify-center shadow-lg shrink-0">
              <User className="w-16 h-16 text-muted-foreground" />
            </div>
            <div className="flex-1 pb-2">
              <h1 className="text-3xl font-bold">{profile?.name}</h1>
              <div className="flex items-center gap-2 justify-center sm:justify-start text-muted-foreground mt-1">
                <Shield className="w-4 h-4 text-emerald-500" />
                <span className="font-mono text-sm">SSI ID: {profile?.ssiId}</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start">
                <Badge variant="secondary">Verified</Badge>
                <Badge variant="outline">{profile?.phone}</Badge>
              </div>
            </div>
            <Button variant="outline" className="mb-2 shrink-0">Edit Profile</Button>
          </div>
        </CardContent>
      </Card>

      {didData && (
        <Card className="border-none shadow-md bg-gradient-to-br from-slate-900 to-indigo-950 text-white overflow-hidden">
          <CardContent className="py-6 px-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-3 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Fingerprint className="h-5 w-5 text-indigo-300 shrink-0" />
                  <span className="text-sm font-semibold text-indigo-200 uppercase tracking-wider">Decentralized Identity (DID)</span>
                </div>
                <p className="font-mono text-sm text-white/90 break-all leading-relaxed">{didData.did}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 border text-xs">W3C DID v1.0</Badge>
                  <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 border text-xs">Self-Sovereign</Badge>
                  <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 border text-xs">Blockchain-Anchored</Badge>
                </div>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 bg-white/10 border-white/20 text-white hover:bg-white/20"
                    onClick={() => { navigator.clipboard.writeText(didData.did); toast({ title: "Copied!", description: "DID copied to clipboard" }); }}
                  >
                    <Copy className="h-3.5 w-3.5" /> Copy DID
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 bg-white/10 border-white/20 text-white hover:bg-white/20"
                    onClick={() => setDidQrOpen(true)}
                  >
                    <QrCode className="h-3.5 w-3.5" /> Show QR
                  </Button>
                </div>
              </div>
              <div className="p-3 bg-white rounded-xl shadow-md shrink-0">
                <QRCode value={didData.did} size={100} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>Manage your preferences and platform settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input value={profile?.phone} readOnly disabled />
              <p className="text-xs text-muted-foreground">Linked to your Aadhaar.</p>
            </div>

            <div className="space-y-2">
              <Label>Preferred Language</Label>
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
                  <SelectItem value="kn">ಕನ್ನಡ (Kannada)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2 text-base">
                  <MonitorSmartphone className="w-4 h-4" /> Kiosk Mode
                </Label>
                <p className="text-sm text-muted-foreground">Large UI for public terminals.</p>
              </div>
              <Switch checked={isKioskMode} onCheckedChange={handleKioskToggle} data-testid="kiosk-mode-switch" />
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2 text-base">
                  <Contrast className="w-4 h-4" /> High Contrast
                </Label>
                <p className="text-sm text-muted-foreground">Improved visibility for low-vision users.</p>
              </div>
              <Switch checked={isHighContrast} onCheckedChange={setHighContrast} />
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2 text-base">
                  <Fingerprint className="w-4 h-4" /> Quick PIN
                </Label>
                <p className="text-sm text-muted-foreground">{pinSet ? "PIN is set. Tap to change." : "Set a 4-digit PIN for quick access."}</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => { setPinAction("verify"); setPinModalOpen(true); }}
              >
                <Lock className="h-4 w-4 mr-1.5" />
                {pinSet ? "Change" : "Set PIN"}
              </Button>
            </div>

            <Button variant="destructive" className="w-full gap-2">
              <LogOut className="w-4 h-4" /> Sign Out
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" /> Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activitiesLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : (
                <div className="relative border-l ml-3 space-y-5 pb-4">
                  {activities?.slice(0, 5).map((log) => (
                    <div key={log.id} className="pl-6 relative">
                      <div className="absolute w-3 h-3 bg-primary rounded-full -left-1.5 top-1.5 ring-4 ring-background" />
                      <p className="text-sm font-medium">{log.action}</p>
                      <p className="text-sm text-muted-foreground">{log.description}</p>
                      <p className="text-xs text-muted-foreground/70 mt-0.5">
                        {format(new Date(log.createdAt), "MMM d, h:mm a")}
                      </p>
                    </div>
                  ))}
                  {(activities?.length ?? 0) === 0 && (
                    <div className="pl-6 text-muted-foreground text-sm">No recent activity.</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" /> Family Accounts
                </CardTitle>
                <Button size="sm" variant="outline" className="gap-1.5">
                  <Plus className="h-4 w-4" /> Link
                </Button>
              </div>
              <CardDescription>Multiple profiles under your account.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {FAMILY_MEMBERS.map((member) => (
                <div key={member.ssiId} className="flex items-center gap-4 p-3 bg-muted/40 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.relation} · {member.ssiId}</p>
                  </div>
                  {member.verified && (
                    <Badge variant="default" className="shrink-0 text-xs bg-emerald-600">Verified</Badge>
                  )}
                </div>
              ))}
              <p className="text-xs text-muted-foreground pt-1">
                Family members can access their own services under your household.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <PinAuthModal
        open={pinModalOpen}
        title={pinAction === "verify" ? "Verify PIN" : "Set New PIN"}
        description={pinAction === "verify" ? "Enter your 4-digit PIN to confirm." : "Enter a new 4-digit PIN."}
        onSuccess={() => {
          setPinModalOpen(false);
          setPinSet(true);
        }}
        onCancel={() => setPinModalOpen(false)}
      />

      <Dialog open={didQrOpen} onOpenChange={setDidQrOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Your Decentralized Identity</DialogTitle>
          </DialogHeader>
          {didData && (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="p-4 bg-white rounded-2xl shadow-inner border">
                <QRCode value={didData.did} size={180} />
              </div>
              <div className="w-full bg-muted/50 rounded-xl p-3">
                <p className="text-xs text-muted-foreground font-mono break-all text-center">{didData.did}</p>
              </div>
              <Button variant="outline" className="w-full gap-2" onClick={() => { navigator.clipboard.writeText(didData.did); toast({ title: "Copied!" }); }}>
                <Copy className="h-4 w-4" /> Copy DID
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
