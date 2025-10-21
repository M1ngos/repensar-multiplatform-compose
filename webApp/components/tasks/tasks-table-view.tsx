'use client';

import { useTranslations, useLocale } from 'next-intl';
import type { TaskSummary } from '@/lib/api/types';
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
import Link from 'next/link';
import { format } from 'date-fns';
import { AlertCircle } from 'lucide-react';

interface TasksTableViewProps {
    tasks?: TaskSummary[];
    isLoading: boolean;
    error: any;
}

export function TasksTableView({ tasks, isLoading, error }: TasksTableViewProps) {
    const t = useTranslations('Tasks');
    const locale = useLocale();

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'not_started':
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
            case 'in_progress':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            case 'completed':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'cancelled':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
        }
    };

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

    return (
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
                            </TableRow>
                        ))
                    ) : error ? (
                        <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                {t('errorLoading')}
                            </TableCell>
                        </TableRow>
                    ) : !tasks || tasks.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
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
                                                <AlertCircle className="h-4 w-4 text-red-500" />
                                            )}
                                        </div>
                                    ) : (
                                        '-'
                                    )}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
