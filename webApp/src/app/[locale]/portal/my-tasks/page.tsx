'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth.tsx';
import { useTranslations } from 'next-intl';
import useSWR from 'swr';
import { tasksApi } from '@/lib/api';
import { PageHeader } from '@/components/shared/page-header';
import { TaskCard } from '@/components/volunteers/task-card';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import { TaskStatus, TaskPriority } from '@/lib/api/types';
import { toast } from 'sonner';

// Extended type for volunteer task assignments with full task details
interface VolunteerTaskAssignment {
    id: number;
    task_id: number;
    volunteer_id: number;
    assigned_at: string;
    hours_contributed: number;
    // Task details (from joined query or separate fetch)
    title: string;
    status: TaskStatus;
    priority: TaskPriority;
    project_name: string;
    end_date?: string;
    progress_percentage: number;
    is_overdue?: boolean;
    days_remaining?: number;
}

export default function MyTasksPage() {
    const { user } = useAuth();
    const t = useTranslations('Volunteer.myTasks');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    // Fetch volunteer's task assignments
    const { data: assignments, isLoading, mutate } = useSWR(
        user?.id ? ['volunteer-tasks', user.id] : null,
        async () => {
            // TODO: This endpoint needs to return extended task data
            // For now, this will return basic assignment data
            // Backend should be modified to join task details
            const response = await tasksApi.getVolunteerAssignments(user!.id);
            return response as unknown as VolunteerTaskAssignment[];
        }
    );

    // Filter tasks by status
    const filteredTasks = assignments?.filter((task) => {
        if (statusFilter === 'all') return true;
        if (statusFilter === 'not_started') return task.status === TaskStatus.NOT_STARTED;
        if (statusFilter === 'in_progress') return task.status === TaskStatus.IN_PROGRESS;
        if (statusFilter === 'completed') return task.status === TaskStatus.COMPLETED;
        return true;
    }) || [];

    // Handle task status update
    const handleStatusChange = async (taskId: number, newStatus: TaskStatus) => {
        try {
            await tasksApi.updateTask(taskId, { status: newStatus });
            toast.success(t('statusUpdate.success'));
            mutate(); // Refresh the task list
        } catch (error) {
            toast.error(t('statusUpdate.error'));
            console.error('Failed to update task status:', error);
        }
    };

    // Loading state
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
                            <TabsTrigger value="all">
                                {t('filters.all')}
                            </TabsTrigger>
                            <TabsTrigger value="not_started">
                                {t('filters.notStarted')}
                            </TabsTrigger>
                            <TabsTrigger value="in_progress">
                                {t('filters.inProgress')}
                            </TabsTrigger>
                            <TabsTrigger value="completed">
                                {t('filters.completed')}
                            </TabsTrigger>
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
                            task={task}
                            onStatusChange={handleStatusChange}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
