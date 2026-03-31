import React from "react";
import { useGetUserProfile, useGetActivityLog, useUpdateUserProfile } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useKioskMode } from "../contexts/KioskModeContext";
import { useLanguage } from "../contexts/LanguageContext";
import { User, Shield, LogOut, Activity, MonitorSmartphone } from "lucide-react";
import { format } from "date-fns";

export default function Profile() {
  const { data: profile, isLoading: profileLoading } = useGetUserProfile();
  const { data: activities, isLoading: activitiesLoading } = useGetActivityLog();
  const updateUser = useUpdateUserProfile();
  
  const { isKioskMode, setKioskMode } = useKioskMode();
  const { language, setLanguage } = useLanguage();

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
    <div className="space-y-8 max-w-4xl mx-auto">
      <Card className="border-none shadow-md overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-primary to-indigo-600"></div>
        <CardContent className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-16 sm:-mt-12 mb-6 text-center sm:text-left">
            <div className="w-32 h-32 rounded-full border-4 border-background bg-muted flex items-center justify-center shadow-lg">
              <User className="w-16 h-16 text-muted-foreground" />
            </div>
            <div className="flex-1 pb-2">
              <h1 className="text-3xl font-bold">{profile?.name}</h1>
              <div className="flex items-center gap-2 justify-center sm:justify-start text-muted-foreground mt-1">
                <Shield className="w-4 h-4 text-emerald-500" />
                <span className="font-mono">SSI ID: {profile?.ssiId}</span>
              </div>
            </div>
            <Button variant="outline" className="mb-2">Edit Profile</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>Manage your preferences and platform settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
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
              <div className="space-y-1">
                <Label className="flex items-center gap-2 text-base">
                  <MonitorSmartphone className="w-4 h-4" /> Kiosk Mode
                </Label>
                <p className="text-sm text-muted-foreground">Large UI for public terminals or easy viewing.</p>
              </div>
              <Switch checked={isKioskMode} onCheckedChange={handleKioskToggle} />
            </div>
            
            <Button variant="destructive" className="w-full gap-2">
              <LogOut className="w-4 h-4" /> Sign Out
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" /> Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activitiesLoading ? (
              <div className="space-y-4">
                {[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : (
              <div className="relative border-l ml-3 space-y-6 pb-4">
                {activities?.slice(0, 5).map((log) => (
                  <div key={log.id} className="pl-6 relative">
                    <div className="absolute w-3 h-3 bg-primary rounded-full -left-1.5 top-1.5 ring-4 ring-background" />
                    <p className="text-sm font-medium">{log.action}</p>
                    <p className="text-sm text-muted-foreground">{log.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(log.createdAt), "MMM d, h:mm a")}
                    </p>
                  </div>
                ))}
                {activities?.length === 0 && (
                  <div className="pl-6 text-muted-foreground text-sm">No recent activity.</div>
                )}
              </div>
            )}
            <Button variant="ghost" className="w-full mt-4">View All History</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}