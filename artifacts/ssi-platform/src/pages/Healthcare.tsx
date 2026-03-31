import React from "react";
import { useGetHealthProfile, useListHealthRecords } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Activity, FileText, Pill, Stethoscope, Sparkles } from "lucide-react";
import { useKioskMode } from "../contexts/KioskModeContext";

export default function Healthcare() {
  const { data: profile, isLoading: profileLoading } = useGetHealthProfile();
  const { data: records, isLoading: recordsLoading } = useListHealthRecords();
  const { isKioskMode } = useKioskMode();

  if (profileLoading || recordsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-32 w-full" />
        <div className="space-y-4 mt-8">
          {[1,2,3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      </div>
    );
  }

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'prescription': return <Pill className="text-blue-500 w-5 h-5" />;
      case 'lab-report': return <FileText className="text-purple-500 w-5 h-5" />;
      default: return <Stethoscope className="text-emerald-500 w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">ABHA Health ID</h2>
        <p className="text-muted-foreground">Manage your health records securely.</p>
      </div>

      <Card className="bg-gradient-to-br from-rose-50 to-orange-50 dark:from-rose-950/20 dark:to-orange-950/20 border-rose-100 dark:border-rose-900 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-rose-900 dark:text-rose-100">Health Profile</h3>
              <p className="text-sm text-rose-600 dark:text-rose-300">Last checkup: {profile?.lastCheckup || 'Unknown'}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/60 dark:bg-black/20 p-4 rounded-xl">
              <p className="text-sm text-muted-foreground">Blood Group</p>
              <p className="text-2xl font-bold text-rose-600">{profile?.bloodGroup || '-'}</p>
            </div>
            <div className="bg-white/60 dark:bg-black/20 p-4 rounded-xl">
              <p className="text-sm text-muted-foreground">Height</p>
              <p className="text-2xl font-bold">{profile?.height ? `${profile.height}cm` : '-'}</p>
            </div>
            <div className="bg-white/60 dark:bg-black/20 p-4 rounded-xl">
              <p className="text-sm text-muted-foreground">Weight</p>
              <p className="text-2xl font-bold">{profile?.weight ? `${profile.weight}kg` : '-'}</p>
            </div>
            <div className="bg-white/60 dark:bg-black/20 p-4 rounded-xl">
              <p className="text-sm text-muted-foreground">Vitals</p>
              <div className="flex items-center gap-1 mt-1 text-emerald-600">
                <Activity className="w-5 h-5" />
                <span className="font-semibold">Normal</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Medical Records</h3>
          <Button variant="outline">Sync New Records</Button>
        </div>

        <div className="space-y-4">
          {records?.map((record) => (
            <Card key={record.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="p-3 bg-muted rounded-xl shrink-0">
                  {getTypeIcon(record.type)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-lg">{record.title}</h4>
                    <span className="text-sm text-muted-foreground">{record.date}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {record.doctor && `Dr. ${record.doctor} • `} 
                    {record.hospital}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary" className="capitalize">{record.type}</Badge>
                  </div>
                </div>
                <div className="w-full sm:w-auto mt-4 sm:mt-0 flex gap-2">
                  <Button variant="outline" className="w-full sm:w-auto">View</Button>
                  <Button variant="secondary" className="w-full sm:w-auto bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200">
                    <Sparkles className="w-4 h-4 mr-2" /> Explain
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {records?.length === 0 && (
            <div className="text-center py-12 text-muted-foreground bg-card rounded-xl border border-dashed">
              No health records found. Link your hospital to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}