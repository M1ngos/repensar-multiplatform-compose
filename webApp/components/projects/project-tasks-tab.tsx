'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import useSWR from 'swr';
import { tasksApi } from '@/lib/api';
import type { TaskSummary, TaskStatus } from '@/lib/api/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { TaskFormDialog } from '@/components/tasks/task-form-dialog';
import {
    Empty,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
    EmptyDescription,
    EmptyContent,
} from '@/components/ui/empty';
import { Plus, CheckSquare } from 'lucide-react';
import { format } from 'date-fns';

interface ProjectTasksTabProps {
    projectId: number;
    locale: string;
}

const TASK_STATUSES = ['not_started', 'in_progress', 'completed', 'cancelled'] as const;

export function ProjectTasksTab({ projectId, locale }: ProjectTasksTabProps) {
    const t = useTranslations('Projects');
    const tTasks = useTranslations('Tasks');
    const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const { data: tasks, isLoading, mutate } = useSWR(
        ['project-tasks', projectId, statusFilter],
        () => tasksApi.getTasks({
            project_id: projectId,
            ...(statusFilter !== 'all' && { status: statusFilter }),
        })
    );

    const getStatusColor = (status: string) => {
        const map: Record<string, string> = {
            planning: 'bg-sky/10 text-sky border-sky/20',
            in_progress: 'bg-leaf/10 text-leaf border-leaf/20',
            suspended: 'bg-sunset/10 text-sunset border-sunset/20',
            completed: 'bg-growth/10 text-growth border-growth/20',
            cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
            not_started: 'bg-muted text-muted-foreground border-border',
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

    // Type guard to ensure task has expected shape
    const renderTaskRow = (task: TaskSummary) => (
        <TableRow key={task.id} className="cursor-pointer hover:bg-muted/50">
            <TableCell>
                <Link
                    href={`/${locale}/portal/tasks/${task.id}`}
                    className="font-medium hover:underline"
                >
                    {task.title}
                </Link>
            </TableCell>
            <TableCell>
                <Badge variant="secondary" className={getStatusColor(task.status)}>
                    {tTasks(`statuses.${task.status}`)}
                </Badge>
            </TableCell>
            <TableCell>
                <Badge variant="secondary" className={getPriorityColor(task.priority)}>
                    {tTasks(`priorities.${task.priority}`)}
                </Badge>
            </TableCell>
            <TableCell className="text-sm">
                {task.end_date ? format(new Date(task.end_date), 'PP') : '-'}
            </TableCell>
            <TableCell className="tabular-nums text-sm">
                {task.volunteers_assigned ?? 0}
            </TableCell>
        </TableRow>
    );

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>{t('detail.tabs.tasks')}</CardTitle>
                        <CardDescription>
                            {tasks?.length ?? 0} {t('detail.taskCount')}
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Select
                            value={statusFilter}
                            onValueChange={(v) => setStatusFilter(v as TaskStatus | 'all')}
                        >
                            <SelectTrigger className="w-[160px]">
                                <SelectValue placeholder={t('detail.allStatuses')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('detail.allStatuses')}</SelectItem>
                                {TASK_STATUSES.map((s) => (
                                    <SelectItem key={s} value={s}>
                                        {tTasks(`statuses.${s}`)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button size="sm" onClick={() => setIsCreateOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            {t('detail.addTask')}
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="space-y-2">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="h-12 w-full" />
                        ))}
                    </div>
                ) : !tasks || tasks.length === 0 ? (
                    <Empty>
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <CheckSquare />
                            </EmptyMedia>
                            <EmptyTitle>{t('detail.noProjectTasks')}</EmptyTitle>
                            <EmptyDescription>{t('detail.noProjectTasksDesc')}</EmptyDescription>
                        </EmptyHeader>
                        <EmptyContent>
                            <Button size="sm" onClick={() => setIsCreateOpen(true)}>
                                <Plus className="mr-2 h-4 w-4" />
                                {t('detail.addTask')}
                            </Button>
                        </EmptyContent>
                    </Empty>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{tTasks('table.title')}</TableHead>
                                <TableHead>{tTasks('table.status')}</TableHead>
                                <TableHead>{tTasks('table.priority')}</TableHead>
                                <TableHead>{tTasks('table.dueDate')}</TableHead>
                                <TableHead>{tTasks('detail.volunteers')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tasks.map(renderTaskRow)}
                        </TableBody>
                    </Table>
                )}
            </CardContent>

            <TaskFormDialog
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                projectId={projectId}
                onSuccess={() => mutate()}
            />
        </Card>
    );
}
