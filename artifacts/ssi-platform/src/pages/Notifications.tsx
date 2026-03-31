import React, { useState } from "react";
import { useListNotifications, useMarkNotificationRead, getListNotificationsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Heart, Wallet, FileText, Check, CheckCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function Notifications() {
  const { data: notifications, isLoading } = useListNotifications();
  const markRead = useMarkNotificationRead();
  const queryClient = useQueryClient();
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const unreadCount = notifications?.filter((n) => !n.isRead).length ?? 0;

  const handleMarkAllRead = async () => {
    setIsMarkingAll(true);
    try {
      await fetch("/api/notifications/mark-all-read", { method: "POST" });
      await queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() });
    } finally {
      setIsMarkingAll(false);
    }
  };

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
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Notifications</h2>
          {unreadCount > 0 && (
            <p className="text-sm text-muted-foreground mt-0.5">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            className="text-primary gap-2"
            onClick={handleMarkAllRead}
            disabled={isMarkingAll}
          >
            <CheckCheck className="h-4 w-4" />
            {isMarkingAll ? "Marking..." : "Mark all as read"}
          </Button>
        )}
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