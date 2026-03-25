'use client';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
    Calendar,
    FolderKanban,
    AlertCircle,
    ArrowRight,
    Play,
    CheckCircle,
    Pause,
    Timer,
    AlertTriangle,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { TaskStatus, TaskPriority } from '@/lib/api/types';
import { cn } from '@/lib/utils';
import { format, parseISO, differenceInDays } from 'date-fns';
import { useTaskTimer } from '@/lib/hooks/useTaskTimer';

interface TaskCardProps {
    task: {
        id: number;
        task_id: number;
        title: string;
        status: TaskStatus;
        priority: TaskPriority;
        project_name: string;
        project_id?: number;
        end_date?: string;
        progress_percentage: number;
        is_overdue?: boolean;
        days_remaining?: number;
    };
    onStatusChange?: (taskId: number, newStatus: TaskStatus) => Promise<void>;
    onPause?: (taskId: number) => void;
    onResume?: (taskId: number) => void;
    onRequestComplete?: (taskId: number) => void;
}

export function TaskCard({ task, onStatusChange, onPause, onResume, onRequestComplete }: TaskCardProps) {
    const t = useTranslations('Volunteer.myTasks');
    const tTasks = useTranslations('Tasks');
    const locale = useLocale();

    const { elapsed, timerState, shouldAutoPause } = useTaskTimer(task.task_id);

    const isRunning = timerState === 'running';
    const isPaused = timerState === 'paused';
    const isAutoPaused = timerState === 'auto_paused';
    const hasSession = timerState !== null;

    // ─── Styling helpers ──────────────────────────────────────────────────────

    const getStatusVariant = (status: TaskStatus): 'default' | 'secondary' | 'outline' => {
        switch (status) {
            case TaskStatus.NOT_STARTED: return 'secondary';
            case TaskStatus.IN_PROGRESS: return 'default';
            case TaskStatus.COMPLETED:   return 'outline';
            default:                     return 'secondary';
        }
    };

    const getPriorityColor = (priority: TaskPriority) => {
        switch (priority) {
            case TaskPriority.LOW:      return 'text-gray-600';
            case TaskPriority.MEDIUM:   return 'text-blue-600';
            case TaskPriority.HIGH:     return 'text-orange-600';
            case TaskPriority.CRITICAL: return 'text-red-600';
            default:                    return 'text-gray-600';
        }
    };

    // ─── Due date display ─────────────────────────────────────────────────────

    const formatDueDate = () => {
        if (!task.end_date) return t('card.noDueDate');
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

    // ─── Action buttons ───────────────────────────────────────────────────────

    const renderActionButtons = () => {
        // NOT_STARTED → Start Task
        if (task.status === TaskStatus.NOT_STARTED) {
            return (
                <Button
                    size="sm"
                    onClick={() => onStatusChange?.(task.task_id, TaskStatus.IN_PROGRESS)}
                    className="w-full"
                >
                    <Play className="h-3 w-3 mr-2" />
                    {t('card.startTask')}
                </Button>
            );
        }

        if (task.status === TaskStatus.IN_PROGRESS) {
            return (
                <div className="flex flex-col gap-2 w-full">
                    {/* Pause / Resume row */}
                    {isRunning && (
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => onPause?.(task.task_id)}
                            className="w-full"
                        >
                            <Pause className="h-3 w-3 mr-2" />
                            {t('card.pauseTask')}
                        </Button>
                    )}

                    {(isPaused || isAutoPaused) && (
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => onResume?.(task.task_id)}
                            className="w-full"
                        >
                            <Play className="h-3 w-3 mr-2" />
                            {t('card.resumeTask')}
                        </Button>
                    )}

                    {/* Mark Complete — always available while in_progress */}
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onRequestComplete?.(task.task_id)}
                        className="w-full"
                    >
                        <CheckCircle className="h-3 w-3 mr-2" />
                        {t('card.markComplete')}
                    </Button>
                </div>
            );
        }

        return null;
    };

    // ─── Timer badge ──────────────────────────────────────────────────────────

    const renderTimerBadge = () => {
        if (!hasSession || !elapsed) return null;

        if (isAutoPaused) {
            return (
                <div className="flex items-start gap-2 rounded-md bg-orange-50 border border-orange-200 px-3 py-2 text-sm">
                    <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 shrink-0" />
                    <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-orange-700">{t('card.autoPaused')}</span>
                        <span className="text-xs text-orange-600 font-mono">{elapsed}</span>
                        <span className="text-xs text-orange-600">{t('card.autoPausedHint')}</span>
                    </div>
                </div>
            );
        }

        if (isPaused) {
            return (
                <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-sm">
                    <Pause className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">{t('card.paused')}</span>
                    <span className="ml-auto font-mono font-medium">{elapsed}</span>
                </div>
            );
        }

        // Running
        return (
            <div className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium",
                shouldAutoPause
                    ? "bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-900"
                    : "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900 shadow-sm shadow-blue-100 dark:shadow-none animate-[pulse_3s_ease-in-out_infinite]"
            )}>
                <Timer className={cn("h-3.5 w-3.5 shrink-0", !shouldAutoPause && "animate-pulse")} />
                <span className="font-mono tabular-nums flex-1">{elapsed}</span>
                {shouldAutoPause && (
                    <span className="text-orange-600 dark:text-orange-400">{t('card.almostAutoPause')}</span>
                )}
            </div>
        );
    };

    // ─── Card border style ────────────────────────────────────────────────────

    const cardBorderClass = cn(
        'hover:shadow-md transition-shadow',
        task.priority === TaskPriority.CRITICAL && !task.is_overdue && 'border-l-red-500 border-l-2',
        task.priority === TaskPriority.HIGH && !task.is_overdue && 'border-l-orange-500 border-l-2',
        task.is_overdue && 'border-red-200',
        isRunning && !shouldAutoPause && 'border-blue-300 ring-1 ring-blue-200',
        (isAutoPaused || shouldAutoPause) && 'border-orange-300 ring-1 ring-orange-200',
        isPaused && 'border-muted-foreground/30',
    );

    return (
        <Card className={cardBorderClass}>
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base line-clamp-2">{task.title}</CardTitle>
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
                    <span className={cn('font-medium capitalize', getPriorityColor(task.priority))}>
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
                        <Progress
                            value={task.progress_percentage}
                            className={cn(
                                "h-1.5",
                                task.progress_percentage >= 100 ? "[&>div]:bg-emerald-500" :
                                task.progress_percentage >= 60 ? "[&>div]:bg-teal-500" :
                                task.progress_percentage >= 30 ? "[&>div]:bg-blue-500" :
                                "[&>div]:bg-muted-foreground/50"
                            )}
                        />
                    </div>
                )}

                {/* Timer badge */}
                {renderTimerBadge()}
            </CardContent>

            <CardFooter className="flex flex-col gap-2 pt-3">
                {renderActionButtons()}

                <Button variant="ghost" size="sm" asChild className="w-full">
                    <Link href={`/${locale}/portal/tasks/${task.task_id}`}>
                        {t('card.viewDetails')}
                        <ArrowRight className="h-3 w-3 ml-2" />
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
