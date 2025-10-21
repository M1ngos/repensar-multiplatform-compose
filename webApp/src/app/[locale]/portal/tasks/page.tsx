'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import useSWR from 'swr';
import { Plus, Search, Filter, LayoutGrid, List } from 'lucide-react';
import { tasksApi } from '@/lib/api';
import type { TaskSummary, TaskQueryParams, TaskStatus, TaskPriority } from '@/lib/api/types';
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

const TASK_STATUSES: TaskStatus[] = ['not_started', 'in_progress', 'completed', 'cancelled'];
const TASK_PRIORITIES: TaskPriority[] = ['low', 'medium', 'high', 'critical'];

type ViewMode = 'kanban' | 'table';

export default function TasksPage() {
    const t = useTranslations('Tasks');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
    const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
    const [viewMode, setViewMode] = useState<ViewMode>('kanban');
    const [isFormOpen, setIsFormOpen] = useState(false);

    // Build query params
    const params: TaskQueryParams = {
        ...(searchQuery && { search: searchQuery }),
        ...(statusFilter !== 'all' && { status: statusFilter as TaskStatus }),
        ...(priorityFilter !== 'all' && { priority: priorityFilter as TaskPriority }),
    };

    // Fetch tasks with SWR
    const { data: tasks, error, isLoading, mutate } = useSWR(
        ['tasks', params],
        () => tasksApi.getTasks(params)
    );

    return (
        <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-col gap-4 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold md:text-3xl">{t('title')}</h1>
                        <p className="text-muted-foreground">{t('subtitle')}</p>
                    </div>
                    <Button onClick={() => setIsFormOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        {t('newTask')}
                    </Button>
                </div>

                {/* View Toggle and Filters */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
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
                    </div>

                    <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
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
                {viewMode === 'kanban' ? (
                    <TasksKanbanView
                        tasks={tasks}
                        isLoading={isLoading}
                        error={error}
                        onRefresh={() => mutate()}
                    />
                ) : (
                    <TasksTableView
                        tasks={tasks}
                        isLoading={isLoading}
                        error={error}
                    />
                )}

                {/* Task Form Dialog */}
                <TaskFormDialog
                    open={isFormOpen}
                    onOpenChange={setIsFormOpen}
                    onSuccess={() => mutate()}
                />
            </div>
        </div>
    );
}
