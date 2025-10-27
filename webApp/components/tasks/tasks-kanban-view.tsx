'use client';

import { useTranslations, useLocale } from 'next-intl';
import type { TaskSummary, TaskStatus } from '@/lib/api/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardAction, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, Users, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

interface TasksKanbanViewProps {
    tasks?: TaskSummary[];
    isLoading: boolean;
    error: any;
    onRefresh: () => void;
}

const TASK_STATUSES: TaskStatus[] = ['not_started', 'in_progress', 'completed', 'cancelled'];

export function TasksKanbanView({ tasks, isLoading, error, onRefresh }: TasksKanbanViewProps) {
    const t = useTranslations('Tasks');
    const locale = useLocale();

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'critical':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            case 'high':
                return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
            case 'medium':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            case 'low':
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
        }
    };

    const getTasksByStatus = (status: TaskStatus) => {
        return tasks?.filter((task) => task.status === status) || [];
    };


    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">{t('errorLoading')}</p>
            </div>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {TASK_STATUSES.map((status) => {
                const statusTasks = getTasksByStatus(status);

                return (
                    <div key={status} className="rounded-lg border bg-card p-4">
                        {/* Column Header */}
                        <div className="mb-4">
                            <h3 className="font-semibold">{t(`statuses.${status}`)}</h3>
                            <p className="text-xs text-muted-foreground">
                                {statusTasks.length} {t('tasks')}
                            </p>
                        </div>

                        {/* Tasks */}
                        <div className="space-y-3">
                            {isLoading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <Skeleton key={i} className="h-32 w-full" />
                                ))
                            ) : statusTasks.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-8">
                                    {t('noTasksInStatus')}
                                </p>
                            ) : (
                                statusTasks.map((task) => (
                                    <Link
                                        key={task.id}
                                        href={`/${locale}/portal/tasks/${task.id}`}
                                        className="block"
                                    >
                                        <Card className="hover:bg-accent/50 transition-colors">
                                            <CardHeader>
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        <CardDescription className="text-xs mb-1">
                                                            {task.project_name}
                                                        </CardDescription>
                                                        <CardTitle className="text-sm @[250px]/card:text-base line-clamp-2">
                                                            {task.title}
                                                        </CardTitle>
                                                    </div>
                                                    <CardAction>
                                                        <Badge
                                                            className={`${getPriorityColor(task.priority)} text-xs`}
                                                            variant="secondary"
                                                        >
                                                            {t(`priorities.${task.priority}`)}
                                                        </Badge>
                                                    </CardAction>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                                {/* Progress Bar */}
                                                <div className="space-y-1.5">
                                                    <div className="flex justify-between text-xs">
                                                        <span className="text-muted-foreground">{t('progress')}</span>
                                                        <span className="font-semibold tabular-nums">
                                                            {Math.round(task.progress_percentage)}%
                                                        </span>
                                                    </div>
                                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-primary transition-all rounded-full"
                                                            style={{ width: `${task.progress_percentage}%` }}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Meta Info */}
                                                {(task.end_date || task.volunteers_assigned > 0) && (
                                                    <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
                                                        {task.end_date && (
                                                            <div className="flex items-center gap-1.5">
                                                                <Clock className="h-3.5 w-3.5" />
                                                                <span className="tabular-nums">
                                                                    {format(new Date(task.end_date), 'MMM d')}
                                                                </span>
                                                                {task.is_overdue && (
                                                                    <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                                                                )}
                                                            </div>
                                                        )}
                                                        {task.volunteers_assigned > 0 && (
                                                            <div className="flex items-center gap-1.5">
                                                                <Users className="h-3.5 w-3.5" />
                                                                <span className="tabular-nums">{task.volunteers_assigned}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </CardContent>
                                            {task.assigned_to_name && (
                                                <CardFooter className="text-xs text-muted-foreground">
                                                    <span>{t('table.assignedTo')}: <span className="font-medium text-foreground">{task.assigned_to_name}</span></span>
                                                </CardFooter>
                                            )}
                                        </Card>
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
