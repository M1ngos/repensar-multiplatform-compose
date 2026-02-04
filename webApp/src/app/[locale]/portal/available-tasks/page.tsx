'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth.tsx';
import { useTranslations } from 'next-intl';
import useSWR from 'swr';
import { tasksApi, projectsApi } from '@/lib/api';
import { PageHeader } from '@/components/shared/page-header';
import { FilterBar } from '@/components/shared/filter-bar';
import { AvailableTaskCard } from '@/components/volunteers/available-task-card';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import { TaskStatus } from '@/lib/api/types';
import { toast } from 'sonner';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function AvailableTasksPage() {
    const { user } = useAuth();
    const t = useTranslations('Volunteer.availableTasks');

    // State for filters
    const [searchQuery, setSearchQuery] = useState('');
    const [projectFilter, setProjectFilter] = useState<string>('all');

    // State for sign-up confirmation dialog
    const [signUpDialogOpen, setSignUpDialogOpen] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
    const [isSigningUp, setIsSigningUp] = useState(false);

    // Fetch available tasks (suitable for volunteers, not completed/cancelled)
    const { data: tasks, isLoading: tasksLoading, mutate } = useSWR(
        'available-tasks',
        () => tasksApi.getTasks({
            suitable_for_volunteers: true,
            status: TaskStatus.NOT_STARTED,
        })
    );

    // Fetch projects for filter dropdown
    const { isLoading: projectsLoading } = useSWR(
        'projects-list',
        () => projectsApi.getProjects()
    );

    // Fetch volunteer's current assignments to check if already signed up
    const { data: myAssignments } = useSWR(
        user?.id ? ['my-assignments', user.id] : null,
        () => tasksApi.getVolunteerAssignments(user!.id)
    );

    // Filter tasks
    const filteredTasks = tasks?.filter((task) => {
        // Search filter
        if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
        }

        // Project filter
        if (projectFilter !== 'all' && task.project_name !== projectFilter) {
            return false;
        }

        return true;
    }) || [];

    // Check if user is already signed up for a task
    const isSignedUp = (taskId: number) => {
        return myAssignments?.some(assignment => assignment.task_id === taskId);
    };

    // Handle sign-up button click
    const handleSignUpClick = async (taskId: number) => {
        setSelectedTaskId(taskId);
        setSignUpDialogOpen(true);
    };

    // Handle sign-up confirmation
    const handleSignUpConfirm = async () => {
        if (!selectedTaskId || !user?.id) return;

        setIsSigningUp(true);
        try {
            await tasksApi.assignVolunteer(selectedTaskId, {
                volunteer_id: user.id,
            });
            toast.success(t('signUp.success'));
            setSignUpDialogOpen(false);
            mutate(); // Refresh available tasks
        } catch (error) {
            toast.error(t('signUp.error'));
            console.error('Failed to sign up for task:', error);
        } finally {
            setIsSigningUp(false);
        }
    };

    // Loading state
    if (tasksLoading || projectsLoading) {
        return (
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <Skeleton className="h-16 w-full" />
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-80" />
                    ))}
                </div>
            </div>
        );
    }

    // Get unique project names for filter
    const uniqueProjects = Array.from(new Set(tasks?.map(t => t.project_name) || []));

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <PageHeader
                title={t('title')}
                description={t('subtitle')}
            />

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <FilterBar
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        searchPlaceholder={t('search')}
                    >
                        <Select value={projectFilter} onValueChange={setProjectFilter}>
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder={t('filters.project')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('filters.allProjects')}</SelectItem>
                                {uniqueProjects.map((projectName) => (
                                    <SelectItem key={projectName} value={projectName}>
                                        {projectName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FilterBar>
                </CardContent>
            </Card>

            {/* Task Cards Grid */}
            {filteredTasks.length === 0 ? (
                <Card>
                    <CardContent className="pt-6">
                        <Empty>
                            <EmptyHeader>
                                <EmptyTitle>
                                    {tasks && tasks.length > 0 ? t('noResults') : t('noTasks')}
                                </EmptyTitle>
                                <EmptyDescription>
                                    {tasks && tasks.length > 0 ? t('noResultsDesc') : t('noTasksDesc')}
                                </EmptyDescription>
                            </EmptyHeader>
                        </Empty>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredTasks.map((task) => (
                        <AvailableTaskCard
                            key={task.id}
                            task={task}
                            onSignUp={handleSignUpClick}
                            isSignedUp={isSignedUp(task.id)}
                        />
                    ))}
                </div>
            )}

            {/* Sign-up Confirmation Dialog */}
            <Dialog open={signUpDialogOpen} onOpenChange={setSignUpDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('signUp.confirmTitle')}</DialogTitle>
                        <DialogDescription>
                            {t('signUp.confirmDescription')}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setSignUpDialogOpen(false)}
                            disabled={isSigningUp}
                        >
                            {t('signUp.cancel')}
                        </Button>
                        <Button
                            onClick={handleSignUpConfirm}
                            disabled={isSigningUp}
                        >
                            {isSigningUp ? 'Signing up...' : t('signUp.confirm')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
