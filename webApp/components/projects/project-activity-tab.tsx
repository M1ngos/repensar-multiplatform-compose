'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import useSWR from 'swr';
import { projectsApi } from '@/lib/api';
import type { ActivityLog } from '@/lib/api/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import { format } from 'date-fns';
import { Activity, User, Clock } from 'lucide-react';

interface ProjectActivityTabProps {
    projectId: number;
}

const PAGE_SIZE = 20;

export function ProjectActivityTab({ projectId }: ProjectActivityTabProps) {
    const t = useTranslations('Projects');
    const [page, setPage] = useState(1);
    const [allActivities, setAllActivities] = useState<ActivityLog[]>([]);
    const [total, setTotal] = useState(0);

    const { data, isLoading } = useSWR(
        ['project-activity', projectId, page],
        () => projectsApi.getProjectActivity(projectId, { page, page_size: PAGE_SIZE })
    );

    useEffect(() => {
        if (data) {
            setTotal(data.metadata.total);
            if (page === 1) {
                setAllActivities(data.data);
            } else {
                setAllActivities(prev => [...prev, ...data.data]);
            }
        }
    }, [data, page]);

    const hasMore = allActivities.length < total;

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('detail.tabs.activity')}</CardTitle>
                <CardDescription>{t('detail.activityDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading && page === 1 ? (
                    <div className="space-y-6">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex gap-3">
                                <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                                <div className="space-y-1.5 flex-1 pt-1">
                                    <Skeleton className="h-4 w-48" />
                                    <Skeleton className="h-3 w-64" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : allActivities.length === 0 ? (
                    <Empty>
                        <EmptyHeader>
                            <EmptyMedia variant="icon"><Activity /></EmptyMedia>
                            <EmptyTitle>{t('detail.noActivity')}</EmptyTitle>
                            <EmptyDescription>{t('detail.noActivityDesc')}</EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                ) : (
                    <div className="relative">
                        <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
                        <div className="space-y-6">
                            {allActivities.map((entry) => (
                                <div key={entry.id} className="flex gap-4 relative">
                                    <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-background">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div className="flex-1 space-y-1 pt-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-medium text-sm">
                                                {entry.user_name ?? t('detail.systemAction')}
                                            </span>
                                            <span className="text-xs text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">
                                                {entry.action}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{entry.description}</p>
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Clock className="h-3 w-3" />
                                            <span>{format(new Date(entry.created_at), 'PPp')}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {hasMore && (
                            <div className="mt-6 text-center">
                                <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={isLoading}>
                                    {t('detail.loadMore')}
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
