'use client';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Calendar, FolderKanban, AlertCircle, ArrowRight, Play, CheckCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { TaskStatus, TaskPriority } from '@/lib/api/types';
import { cn } from '@/lib/utils';
import { format, parseISO, differenceInDays } from 'date-fns';

interface TaskCardProps {
    task: {
        id: number;
        task_id: number;
        title: string;
        status: TaskStatus;
        priority: TaskPriority;
        project_name: string;
        end_date?: string;
        progress_percentage: number;
        is_overdue?: boolean;
        days_remaining?: number;
    };
    onStatusChange?: (taskId: number, newStatus: TaskStatus) => Promise<void>;
}

export function TaskCard({ task, onStatusChange }: TaskCardProps) {
    const t = useTranslations('Volunteer.myTasks');
    const tTasks = useTranslations('Tasks');
    const locale = useLocale();

    // Get status variant
    const getStatusVariant = (status: TaskStatus): 'default' | 'secondary' | 'outline' => {
        switch (status) {
            case TaskStatus.NOT_STARTED:
                return 'secondary';
            case TaskStatus.IN_PROGRESS:
                return 'default';
            case TaskStatus.COMPLETED:
                return 'outline';
            default:
                return 'secondary';
        }
    };

    // Get priority variant
    const getPriorityVariant = (priority: TaskPriority) => {
        switch (priority) {
            case TaskPriority.LOW:
                return 'text-gray-600';
            case TaskPriority.MEDIUM:
                return 'text-blue-600';
            case TaskPriority.HIGH:
                return 'text-orange-600';
            case TaskPriority.CRITICAL:
                return 'text-red-600';
            default:
                return 'text-gray-600';
        }
    };

    // Format due date
    const formatDueDate = () => {
        if (!task.end_date) {
            return t('card.noDueDate');
        }

        const dueDate = parseISO(task.end_date);
        const daysLeft = differenceInDays(dueDate, new Date());

        if (task.is_overdue) {
            return (
                <span className="text-red-600 font-medium flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {t('card.overdue')}
                </span>
            );
        }

        if (daysLeft <= 3 && daysLeft > 0) {
            return (
                <span className="text-orange-600 font-medium">
                    {t('card.daysRemaining', { days: daysLeft })}
                </span>
            );
        }

        return format(dueDate, 'MMM dd, yyyy');
    };

    // Handle status change
    const handleStatusChange = async (newStatus: TaskStatus) => {
        if (onStatusChange) {
            await onStatusChange(task.task_id, newStatus);
        }
    };

    // Get action button based on status
    const renderActionButton = () => {
        if (task.status === TaskStatus.NOT_STARTED) {
            return (
                <Button
                    size="sm"
                    onClick={() => handleStatusChange(TaskStatus.IN_PROGRESS)}
                    className="w-full"
                >
                    <Play className="h-3 w-3 mr-2" />
                    {t('card.startTask')}
                </Button>
            );
        }

        if (task.status === TaskStatus.IN_PROGRESS) {
            return (
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusChange(TaskStatus.COMPLETED)}
                    className="w-full"
                >
                    <CheckCircle className="h-3 w-3 mr-2" />
                    {t('card.markComplete')}
                </Button>
            );
        }

        return null;
    };

    return (
        <Card className={cn(
            'hover:shadow-md transition-shadow',
            task.is_overdue && 'border-red-200'
        )}>
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base line-clamp-2">
                        {task.title}
                    </CardTitle>
                    <Badge variant={getStatusVariant(task.status)} className="shrink-0">
                        {tTasks(`statuses.${task.status}`)}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-3">
                {/* Project */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FolderKanban className="h-4 w-4" />
                    <span className="truncate">{task.project_name}</span>
                </div>

                {/* Due Date */}
                <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDueDate()}</span>
                </div>

                {/* Priority */}
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t('card.priority')}:</span>
                    <span className={cn('font-medium capitalize', getPriorityVariant(task.priority))}>
                        {tTasks(`priorities.${task.priority}`)}
                    </span>
                </div>

                {/* Progress */}
                {task.status !== TaskStatus.NOT_STARTED && (
                    <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{t('card.progress')}</span>
                            <span className="font-medium">{task.progress_percentage}%</span>
                        </div>
                        <Progress value={task.progress_percentage} className="h-2" />
                    </div>
                )}
            </CardContent>

            <CardFooter className="flex flex-col gap-2 pt-3">
                {renderActionButton()}

                <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="w-full"
                >
                    <Link href={`/${locale}/portal/tasks/${task.task_id}`}>
                        {t('card.viewDetails')}
                        <ArrowRight className="h-3 w-3 ml-2" />
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
