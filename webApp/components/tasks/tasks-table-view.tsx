'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import type { TaskSummary } from '@/lib/api/types';
import { tasksApi } from '@/lib/api';
import { toast } from 'sonner';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import Link from 'next/link';
import { format } from 'date-fns';
import { AlertCircle, MoreHorizontal } from 'lucide-react';

interface TasksTableViewProps {
    tasks?: TaskSummary[];
    isLoading: boolean;
    error: unknown;
    onEdit?: (task: TaskSummary) => void;
    onRefresh?: () => void;
    onAssignVolunteer?: (taskId: number) => void;
}

export function TasksTableView({ tasks, isLoading, error, onEdit, onRefresh, onAssignVolunteer }: TasksTableViewProps) {
    const t = useTranslations('Tasks');
    const locale = useLocale();
    const [taskToCancel, setTaskToCancel] = useState<TaskSummary | null>(null);

    const getStatusColor = (status: string) => {
        const map: Record<string, string> = {
            not_started: 'bg-muted text-muted-foreground border-border',
            in_progress: 'bg-leaf/10 text-leaf border-leaf/20',
            completed: 'bg-growth/10 text-growth border-growth/20',
            cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
        };
        return map[status] ?? 'bg-muted text-muted-foreground border-border';
    };

    const getPriorityColor = (priority: string) => {
        const map: Record<string, string> = {
            critical: 'bg-destructive/10 text-destructive border-destructive/20',
            high: 'bg-sunset/10 text-sunset border-sunset/20',
            medium: 'bg-amber/10 text-amber border-amber/20',
            low: 'bg-moss/10 text-moss border-moss/20',
        };
        return map[priority] ?? 'bg-muted text-muted-foreground border-border';
    };

    const handleCancelConfirm = async () => {
        if (!taskToCancel) return;
        try {
            await tasksApi.deleteTask(taskToCancel.id);
            toast.success(t('detail.deleteSuccess'));
            onRefresh?.();
        } catch {
            toast.error(t('detail.deleteError'));
        } finally {
            setTaskToCancel(null);
        }
    };

    return (
        <>
            <div className="rounded-lg border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('table.title')}</TableHead>
                            <TableHead>{t('table.project')}</TableHead>
                            <TableHead>{t('table.status')}</TableHead>
                            <TableHead>{t('table.priority')}</TableHead>
                            <TableHead>{t('table.assignedTo')}</TableHead>
                            <TableHead className="text-right">{t('table.progress')}</TableHead>
                            <TableHead className="text-right">{t('table.dueDate')}</TableHead>
                            <TableHead className="w-[50px]">{t('actions')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                                    <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                </TableRow>
                            ))
                        ) : error ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                    {t('errorLoading')}
                                </TableCell>
                            </TableRow>
                        ) : !tasks || tasks.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                    {t('noTasks')}
                                </TableCell>
                            </TableRow>
                        ) : (
                            tasks.map((task) => (
                                <TableRow key={task.id} className="cursor-pointer hover:bg-muted/50">
                                    <TableCell>
                                        <Link
                                            href={`/${locale}/portal/tasks/${task.id}`}
                                            className="font-medium hover:underline"
                                        >
                                            {task.title}
                                        </Link>
                                    </TableCell>
                                    <TableCell className="text-sm">{task.project_name}</TableCell>
                                    <TableCell>
                                        <Badge className={getStatusColor(task.status)} variant="secondary">
                                            {t(`statuses.${task.status}`)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={getPriorityColor(task.priority)} variant="secondary">
                                            {t(`priorities.${task.priority}`)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {task.assigned_to_name || '-'}
                                    </TableCell>
                                    <TableCell className="text-right text-sm font-medium">
                                        {Math.round(task.progress_percentage)}%
                                    </TableCell>
                                    <TableCell className="text-right text-sm">
                                        {task.end_date ? (
                                            <div className="flex items-center justify-end gap-1">
                                                {format(new Date(task.end_date), 'PP')}
                                                {task.is_overdue && (
                                                    <AlertCircle className="h-4 w-4 text-destructive" />
                                                )}
                                            </div>
                                        ) : (
                                            '-'
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">{t('actions')}</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => onEdit?.(task)}>
                                                    {t('edit')}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => onAssignVolunteer?.(task.id)}>
                                                    {t('assignVolunteer')}
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-destructive focus:text-destructive"
                                                    onClick={() => setTaskToCancel(task)}
                                                >
                                                    {t('cancelTask')}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <AlertDialog open={!!taskToCancel} onOpenChange={(open) => { if (!open) setTaskToCancel(null); }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('cancelTaskConfirmTitle')}</AlertDialogTitle>
                        <AlertDialogDescription>{t('cancelTaskConfirmDesc')}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setTaskToCancel(null)}>{t('cancel')}</AlertDialogCancel>
                        <AlertDialogAction onClick={handleCancelConfirm}>{t('confirm')}</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
