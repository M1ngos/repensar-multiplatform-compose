'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/lib/hooks/useAuth.tsx';
import { useTranslations } from 'next-intl';
import useSWR, { mutate as globalMutate } from 'swr';
import { volunteersApi, tasksApi } from '@/lib/api';
import { PageHeader } from '@/components/shared/page-header';
import { TaskCard } from '@/components/volunteers/task-card';
import { ConfirmCompleteDialog } from '@/components/volunteers/confirm-complete-dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import { TaskStatus } from '@/lib/api/types';
import { toast } from 'sonner';
import {
    startSession,
    pauseSession,
    autoPauseSession,
    resumeSession,
    stopSession,
    getSession,
    AUTO_PAUSE_MS,
} from '@/lib/hooks/useTaskTimer';

export default function MyTasksPage() {
    const { user } = useAuth();
    const t = useTranslations('Volunteer.myTasks');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    // ─── Confirm-complete dialog state ────────────────────────────────────────
    const [confirmTaskId, setConfirmTaskId] = useState<number | null>(null);
    const [confirmTaskTitle, setConfirmTaskTitle] = useState('');
    const [confirmElapsed, setConfirmElapsed] = useState<string | null>(null);

    // ─── Auto-pause watchdog ──────────────────────────────────────────────────
    // We keep a ref to which tasks are in_progress so the interval can check them
    const inProgressTaskIdsRef = useRef<number[]>([]);

    // ─── Data fetching ────────────────────────────────────────────────────────

    const { data: volunteerProfile } = useSWR(
        user?.id ? 'my-volunteer-profile' : null,
        () => volunteersApi.getMyVolunteerProfile()
    );

    const { data: tasksData, isLoading, mutate } = useSWR(
        volunteerProfile?.id ? ['volunteer-tasks', volunteerProfile.id, statusFilter] : null,
        () => volunteersApi.getVolunteerTasks(volunteerProfile!.id, {
            page: 1,
            page_size: 50,
            status: statusFilter !== 'all' ? statusFilter : undefined,
        })
    );

    const filteredTasks = tasksData?.data || [];

    // Keep in-progress task ids in ref for the watchdog
    useEffect(() => {
        inProgressTaskIdsRef.current = filteredTasks
            .filter((t) => t.status === TaskStatus.IN_PROGRESS)
            .map((t) => t.id);
    }, [filteredTasks]);

    // ─── Auto-pause watchdog (polls every 10 s) ───────────────────────────────
    const handleAutoPause = useCallback((taskId: number) => {
        const paused = autoPauseSession(taskId);
        if (paused) {
            toast.warning(t('timer.autoPaused'), {
                description: t('timer.autoPausedDesc'),
                duration: 8000,
            });
        }
    }, [t]);

    useEffect(() => {
        const interval = setInterval(() => {
            for (const taskId of inProgressTaskIdsRef.current) {
                const session = getSession(taskId);
                if (!session || session.state !== 'running') continue;

                const last = session.segments[session.segments.length - 1];
                const segMs = Date.now() - new Date(last.startedAt).getTime();

                if (segMs >= AUTO_PAUSE_MS) {
                    handleAutoPause(taskId);
                }
            }
        }, 10_000); // check every 10 seconds

        return () => clearInterval(interval);
    }, [handleAutoPause]);

    // ─── Timer event handlers ─────────────────────────────────────────────────

    const handlePause = (taskId: number) => {
        pauseSession(taskId);
        // Force card re-render via a lightweight state nudge — the useTaskTimer hook
        // will pick up the localStorage change on its next tick automatically.
    };

    const handleResume = (taskId: number) => {
        resumeSession(taskId);
    };

    /** Opens the confirm-complete dialog instead of completing immediately */
    const handleRequestComplete = (taskId: number) => {
        const task = filteredTasks.find((t) => t.id === taskId);
        const session = getSession(taskId);

        // Snapshot elapsed for the dialog (total ms → "H h M min" text)
        let elapsedText: string | null = null;
        if (session) {
            let totalMs = session.accumulatedMs;
            const last = session.segments[session.segments.length - 1];
            if (!last.pausedAt) totalMs += Date.now() - new Date(last.startedAt).getTime();
            const totalMin = Math.round(totalMs / 60000);
            const h = Math.floor(totalMin / 60);
            const m = totalMin % 60;
            elapsedText = h > 0 ? `${h}h ${m}min` : `${m}min`;
        }

        setConfirmTaskId(taskId);
        setConfirmTaskTitle(task?.title ?? '');
        setConfirmElapsed(elapsedText);
    };

    /** Called when user confirms the complete dialog */
    const handleConfirmComplete = async () => {
        if (confirmTaskId === null) return;
        const taskId = confirmTaskId;
        setConfirmTaskId(null);

        await doCompleteTask(taskId);
    };

    // ─── Task status actions ──────────────────────────────────────────────────

    const handleStatusChange = async (taskId: number, newStatus: TaskStatus) => {
        if (newStatus === TaskStatus.IN_PROGRESS) {
            startSession(taskId, undefined);
            try {
                await tasksApi.updateTask(taskId, { status: newStatus });
                toast.success(t('statusUpdate.started'));
                mutate();
            } catch (error) {
                stopSession(taskId); // rollback session on API failure
                toast.error(t('statusUpdate.error'));
                console.error('Failed to start task:', error);
            }
        }
    };

    const doCompleteTask = async (taskId: number) => {
        const session = stopSession(taskId);

        // Auto-submit time log
        if (session && volunteerProfile?.id) {
            try {
                await volunteersApi.logVolunteerHours(volunteerProfile.id, {
                    date: session.date,
                    hours: session.hours,
                    start_time: session.start_time,
                    end_time: session.end_time,
                    task_id: session.taskId,
                    project_id: session.projectId,
                });
                globalMutate(
                    (key: unknown) =>
                        Array.isArray(key) &&
                        (key[0] === 'time-logs' || key[0] === 'hours-summary'),
                    undefined,
                    { revalidate: true }
                );
                toast.success(t('timer.hoursLogged', { hours: session.hours }));
            } catch (logError) {
                toast.warning(t('timer.logFailed'));
                console.error('Failed to auto-log hours:', logError);
            }
        } else if (!session) {
            toast.info(t('timer.noSession'));
        }

        try {
            await tasksApi.updateTask(taskId, { status: TaskStatus.COMPLETED });
            toast.success(t('statusUpdate.success'));
            mutate();
        } catch (error) {
            toast.error(t('statusUpdate.error'));
            console.error('Failed to complete task:', error);
        }
    };

    // ─── Loading state ────────────────────────────────────────────────────────

    if (isLoading) {
        return (
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <Skeleton className="h-20 w-full" />
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-64" />
                    ))}
                </div>
            </div>
        );
    }

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <PageHeader
                title={t('title')}
                description={t('subtitle')}
            />

            {/* Status Filter Tabs */}
            <Card>
                <CardContent className="pt-6">
                    <Tabs value={statusFilter} onValueChange={setStatusFilter}>
                        <TabsList className="grid w-full grid-cols-4 lg:w-auto">
                            <TabsTrigger value="all">{t('filters.all')}</TabsTrigger>
                            <TabsTrigger value="not_started">{t('filters.notStarted')}</TabsTrigger>
                            <TabsTrigger value="in_progress">{t('filters.inProgress')}</TabsTrigger>
                            <TabsTrigger value="completed">{t('filters.completed')}</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </CardContent>
            </Card>

            {/* Task Cards Grid */}
            {filteredTasks.length === 0 ? (
                <Card>
                    <CardContent className="pt-6">
                        <Empty>
                            <EmptyHeader>
                                <EmptyTitle>{t('noTasks')}</EmptyTitle>
                                <EmptyDescription>{t('noTasksDesc')}</EmptyDescription>
                            </EmptyHeader>
                        </Empty>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredTasks.map((task) => (
                        <TaskCard
                            key={task.id}
                            task={{ ...task, task_id: task.id }}
                            onStatusChange={handleStatusChange}
                            onPause={handlePause}
                            onResume={handleResume}
                            onRequestComplete={handleRequestComplete}
                        />
                    ))}
                </div>
            )}

            {/* Confirm Complete Dialog */}
            <ConfirmCompleteDialog
                open={confirmTaskId !== null}
                onOpenChange={(open) => { if (!open) setConfirmTaskId(null); }}
                taskTitle={confirmTaskTitle}
                elapsed={confirmElapsed}
                onConfirm={handleConfirmComplete}
            />
        </div>
    );
}
