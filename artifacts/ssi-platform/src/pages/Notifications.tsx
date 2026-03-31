import React from "react";
import { useListNotifications, useMarkNotificationRead } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Heart, Wallet, FileText, Check } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function Notifications() {
  const { data: notifications, isLoading } = useListNotifications();
  const markRead = useMarkNotificationRead();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Notifications</h2>
        <div className="space-y-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      </div>
    );
  }

  const getModuleIcon = (module?: string) => {
    switch(module?.toLowerCase()) {
      case 'health': return <Heart className="w-5 h-5 text-rose-500" />;
      case 'payments': return <Wallet className="w-5 h-5 text-orange-500" />;
      case 'documents': return <FileText className="w-5 h-5 text-indigo-500" />;
      default: return <Bell className="w-5 h-5 text-primary" />;
    }
  };

  const handleMarkRead = (id: number) => {
    markRead.mutate({ data: { id } });
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Notifications</h2>
        <Button variant="ghost" className="text-primary">Mark all as read</Button>
      </div>

      <div className="space-y-3">
        {notifications?.map((notif) => (
          <Card key={notif.id} className={`transition-colors ${!notif.isRead ? 'bg-primary/5 border-primary/20' : 'opacity-70'}`}>
            <CardContent className="p-4 flex gap-4">
              <div className="mt-1 shrink-0 bg-background p-2 rounded-full shadow-sm">
                {getModuleIcon(notif.module)}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <h4 className={`font-semibold ${!notif.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {notif.title}
                  </h4>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{notif.message}</p>
                {notif.module && (
                  <div className="mt-2">
                    <Badge variant="outline" className="text-xs capitalize">{notif.module}</Badge>
                  </div>
                )}
              </div>
              {!notif.isRead && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="shrink-0 text-muted-foreground hover:text-primary"
                  onClick={() => handleMarkRead(notif.id)}
                  disabled={markRead.isPending}
                >
                  <Check className="w-4 h-4" />
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
        {notifications?.length === 0 && (
          <div className="text-center py-16 text-muted-foreground bg-card rounded-xl border border-dashed">
            <Bell className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>You're all caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
}