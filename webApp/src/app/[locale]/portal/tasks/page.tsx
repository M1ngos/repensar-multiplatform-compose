'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import useSWR from 'swr';
import { Plus, Search, Filter, LayoutGrid, List, CircleHelp } from 'lucide-react';
import { useTour } from '@/lib/hooks/useTour';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { tasksApi, projectsApi } from '@/lib/api';
import type { TaskSummary, TaskDetail, TaskQueryParams } from '@/lib/api/types';
import { TaskStatus, TaskPriority } from '@/lib/api/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TasksKanbanView } from '@/components/tasks/tasks-kanban-view';
import { TasksTableView } from '@/components/tasks/tasks-table-view';
import { TaskFormDialog } from '@/components/tasks/task-form-dialog';
import { AssignVolunteerDialog } from '@/components/tasks/assign-volunteer-dialog';

const TASK_STATUSES: TaskStatus[] = [TaskStatus.NOT_STARTED, TaskStatus.IN_PROGRESS, TaskStatus.COMPLETED, TaskStatus.CANCELLED];
const TASK_PRIORITIES: TaskPriority[] = [TaskPriority.LOW, TaskPriority.MEDIUM, TaskPriority.HIGH, TaskPriority.CRITICAL];

type ViewMode = 'kanban' | 'table';

export default function TasksPage() {
    const t = useTranslations('Tasks');
    const tTour = useTranslations('Tour.tasks');
    const tTourCommon = useTranslations('Tour');
    const { startTour } = useTour({
        tourId: 'tasks',
        tSteps: tTour,
        nextBtnText: tTourCommon('next'),
        prevBtnText: tTourCommon('prev'),
        doneBtnText: tTourCommon('done'),
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
    const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
    const [projectFilter, setProjectFilter] = useState<string>('all');
    const [viewMode, setViewMode] = useState<ViewMode>('kanban');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editTask, setEditTask] = useState<TaskSummary | null>(null);
    const [assignTaskId, setAssignTaskId] = useState<number | null>(null);
    const [createForStatus, setCreateForStatus] = useState<TaskStatus | null>(null);

    // Fetch projects list for filter
    const { data: projects } = useSWR('projects-list-tasks', () => projectsApi.getProjects({}));

    // Build query params
    const params: TaskQueryParams = {
        ...(searchQuery && { search: searchQuery }),
        ...(statusFilter !== 'all' && { status: statusFilter as TaskStatus }),
        ...(priorityFilter !== 'all' && { priority: priorityFilter as TaskPriority }),
        ...(projectFilter !== 'all' && { project_id: Number(projectFilter) }),
    };

    // Fetch tasks with SWR
    const { data: tasks, error, isLoading, mutate } = useSWR(
        ['tasks', params],
        () => tasksApi.getTasks(params)
    );

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            {/* Header */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
                    <p className="text-muted-foreground">{t('subtitle')}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={startTour} className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                <CircleHelp className="h-4 w-4" />
                                <span className="sr-only">{tTourCommon('takeTour')}</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>{tTourCommon('takeTour')}</TooltipContent>
                    </Tooltip>
                    <Button onClick={() => setIsFormOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        {t('newTask')}
                    </Button>
                </div>
            </div>

            {/* View Toggle and Filters */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between" data-tour="tasks-filters">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center flex-1">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder={t('searchPlaceholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as TaskStatus | 'all')}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <Filter className="mr-2 h-4 w-4" />
                            <SelectValue placeholder={t('filterByStatus')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('allStatuses')}</SelectItem>
                            {TASK_STATUSES.map((status) => (
                                <SelectItem key={status} value={status}>
                                    {t(`statuses.${status}`)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as TaskPriority | 'all')}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <Filter className="mr-2 h-4 w-4" />
                            <SelectValue placeholder={t('filterByPriority')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('allPriorities')}</SelectItem>
                            {TASK_PRIORITIES.map((priority) => (
                                <SelectItem key={priority} value={priority}>
                                    {t(`priorities.${priority}`)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={projectFilter} onValueChange={setProjectFilter}>
                        <SelectTrigger className="w-full sm:w-[200px]">
                            <Filter className="mr-2 h-4 w-4" />
                            <SelectValue placeholder={t('filterByProject')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('allProjects')}</SelectItem>
                            {projects?.map((p) => (
                                <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)} data-tour="tasks-view-toggle">
                    <TabsList>
                        <TabsTrigger value="kanban">
                            <LayoutGrid className="mr-2 h-4 w-4" />
                            {t('kanbanView')}
                        </TabsTrigger>
                        <TabsTrigger value="table">
                            <List className="mr-2 h-4 w-4" />
                            {t('tableView')}
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* Views */}
            <div data-tour="tasks-board">
            {viewMode === 'kanban' ? (
                <TasksKanbanView
                    tasks={tasks}
                    isLoading={isLoading}
                    error={error}
                    onRefresh={() => mutate()}
                    onCreateInStatus={(status) => { setCreateForStatus(status); setIsFormOpen(true); }}
                />
            ) : (
                <TasksTableView
                    tasks={tasks}
                    isLoading={isLoading}
                    error={error}
                    onEdit={(task) => { setEditTask(task); setIsFormOpen(true); }}
                    onRefresh={() => mutate()}
                    onAssignVolunteer={(taskId) => setAssignTaskId(taskId)}
                />
            )}

            {/* Task Form Dialog */}
            <TaskFormDialog
                open={isFormOpen}
                onOpenChange={(open) => {
                    setIsFormOpen(open);
                    if (!open) { setEditTask(null); setCreateForStatus(null); }
                }}
                task={editTask ? (editTask as unknown as TaskDetail) : undefined}
                defaultStatus={createForStatus ?? undefined}
                onSuccess={() => mutate()}
            />

            {/* Assign Volunteer Dialog */}
            <AssignVolunteerDialog
                open={assignTaskId !== null}
                onOpenChange={(open) => { if (!open) setAssignTaskId(null); }}
                taskId={assignTaskId ?? 0}
                onSuccess={() => mutate()}
            />
            </div>
        </div>
    );
}
