'use client';

import { Bell, Check, CheckCheck, Trash2, X, Leaf, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { useNotifications } from '@/lib/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatDistanceToNow } from 'date-fns';
import { NotificationType } from '@/lib/api/types';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

export function NotificationCenter() {
  const t = useTranslations('Notifications');
  const {
    notifications = [],
    unreadCount = 0,
    isLoading,
    isConnected,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.SUCCESS:
        return <Leaf className="h-4 w-4 text-growth" />;
      case NotificationType.ERROR:
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case NotificationType.WARNING:
        return <AlertTriangle className="h-4 w-4 text-sunset" />;
      default:
        return <Info className="h-4 w-4 text-sky" />;
    }
  };

  const getNotificationColor = (type: NotificationType) => {
    switch (type) {
      case NotificationType.SUCCESS:
        return 'bg-growth/10 border-growth/20';
      case NotificationType.ERROR:
        return 'bg-destructive/10 border-destructive/20';
      case NotificationType.WARNING:
        return 'bg-sunset/10 border-sunset/20';
      default:
        return 'bg-sky/10 border-sky/20';
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] animate-grow"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
          {isConnected && (
            <span className="absolute bottom-1 right-1 h-2 w-2 rounded-full bg-growth animate-pulse-soft" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 sm:w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b bg-gradient-nature/5">
          <div>
            <h3 className="font-semibold">{t('title')}</h3>
            <p className="text-xs text-muted-foreground">
              {unreadCount > 0 ? t('unread', { count: unreadCount }) : t('allCaughtUp')}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs"
            >
              <CheckCheck className="h-3.5 w-3.5 mr-1" />
              {t('markAllRead')}
            </Button>
          )}
        </div>

        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-pulse text-muted-foreground">{t('loading')}</div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <Bell className="h-8 w-8 mb-2 opacity-20" />
              <p className="text-sm">{t('noNotifications')}</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    'p-4 hover:bg-accent/50 transition-colors group relative',
                    !notification.is_read && 'bg-primary/5'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      'p-2 rounded-lg border',
                      getNotificationColor(notification.type)
                    )}>
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-medium truncate">
                          {notification.title}
                        </h4>
                        {!notification.is_read && (
                          <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatDistanceToNow(new Date(notification.created_at), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>

                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!notification.is_read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => markAsRead(notification.id)}
                          title={t('actions.markAsRead')}
                        >
                          <Check className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => deleteNotification(notification.id)}
                        title={t('actions.delete')}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <>
            <Separator />
            <div className="p-2">
              <Button
                variant="ghost"
                className="w-full text-xs"
                onClick={() => window.location.href = '/portal/notifications'}
              >
                {t('viewAll')}
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
