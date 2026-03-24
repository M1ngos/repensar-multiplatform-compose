'use client';

import { useTranslations } from 'next-intl';
import { useNotifications } from '@/lib/hooks/useNotifications';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import { Bell, Check, CheckCheck, Trash2, Leaf, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { NotificationType } from '@/lib/api/types';
import { cn } from '@/lib/utils';

export default function NotificationsPage() {
  const t = useTranslations('Notifications');
  const {
    notifications,
    unreadCount,
    isLoading,
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
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <PageHeader
        title={t('title')}
        description={unreadCount > 0 ? t('unread', { count: unreadCount }) : t('allCaughtUp')}
        actions={
          unreadCount > 0 ? (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <CheckCheck className="mr-2 h-4 w-4" />
              {t('markAllRead')}
            </Button>
          ) : undefined
        }
      />

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="divide-y">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-start gap-4 p-4">
                  <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-72" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8">
              <Empty>
                <EmptyHeader>
                  <Bell className="h-10 w-10 mx-auto mb-2 text-muted-foreground/30" />
                  <EmptyTitle>{t('noNotifications')}</EmptyTitle>
                  <EmptyDescription>{t('allCaughtUp')}</EmptyDescription>
                </EmptyHeader>
              </Empty>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    'flex items-start gap-4 p-4 hover:bg-accent/50 transition-colors group',
                    !notification.is_read && 'bg-primary/5'
                  )}
                >
                  {/* Type icon */}
                  <div className={cn(
                    'p-2.5 rounded-lg border shrink-0',
                    getNotificationColor(notification.type)
                  )}>
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-medium">
                        {notification.title}
                      </h4>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {!notification.is_read && (
                          <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                            {t('types.info')}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {notification.message}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    {!notification.is_read && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => markAsRead(notification.id)}
                        title={t('actions.markAsRead')}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => deleteNotification(notification.id)}
                      title={t('actions.delete')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
