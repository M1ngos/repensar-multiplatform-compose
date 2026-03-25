'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/lib/hooks/useAuth.tsx';
import { useTranslations } from 'next-intl';
import { useTour } from '@/lib/hooks/useTour';
import useSWR from 'swr';
import { tasksApi, volunteersApi } from '@/lib/api';
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
    const tTour = useTranslations('Tour.available-tasks');
    const tTourCommon = useTranslations('Tour');
    const { startTour } = useTour({
        tourId: 'available-tasks',
        tSteps: tTour,
        nextBtnText: tTourCommon('next'),
        prevBtnText: tTourCommon('prev'),
        doneBtnText: tTourCommon('done'),
    });

    // State for filters
    const [searchQuery, setSearchQuery] = useState('');
    const [projectFilter, setProjectFilter] = useState<string>('all');
    const [skillFilter, setSkillFilter] = useState<string>('all');

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

    // Fetch the volunteer profile to get the volunteer PK (different from user.id)
    const { data: volunteerProfile } = useSWR(
        user?.id ? 'my-volunteer-profile' : null,
        () => volunteersApi.getMyVolunteerProfile()
    );

    // Fetch volunteer's current assignments to check if already signed up
    const { data: myAssignments, mutate: mutateAssignments } = useSWR(
        user?.id ? 'my-task-assignments' : null,
        () => tasksApi.getMyAssignments()
    );

    // Compute unique skills across all available tasks
    const allSkills = useMemo(() => {
        if (!tasks) return [];
        const skillSet = new Set<string>();
        tasks.forEach(task => {
            if (task.required_skills) {
                Object.keys(task.required_skills).forEach(s => skillSet.add(s));
            }
        });
        return Array.from(skillSet).sort();
    }, [tasks]);

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

        // Skill filter
        if (skillFilter !== 'all') {
            const hasSkill = task.required_skills && skillFilter in task.required_skills;
            if (!hasSkill) return false;
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
        if (!selectedTaskId || !volunteerProfile?.id) return;

        setIsSigningUp(true);
        try {
            await tasksApi.assignVolunteer(selectedTaskId, {
                volunteer_id: volunteerProfile.id,
            });
            toast.success(t('signUp.success'));
            setSignUpDialogOpen(false);
            mutate(); // Refresh available tasks
            mutateAssignments(); // Refresh signed-up status
        } catch (error) {
            toast.error(t('signUp.error'));
            console.error('Failed to sign up for task:', error);
        } finally {
            setIsSigningUp(false);
        }
    };

    // Loading state
    if (tasksLoading) {
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
                actions={
                    <Button variant="outline" size="sm" onClick={startTour}>
                        {tTourCommon('takeTour')}
                    </Button>
                }
            />

            {/* Filters */}
            <Card data-tour="available-filters">
                <CardContent className="pt-6">
                    <FilterBar
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        searchPlaceholder={t('search')}
                        data-tour="search-bar"
                    >
                        <Select value={projectFilter} onValueChange={setProjectFilter}>
                            <SelectTrigger className="w-[180px]">
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
                        {allSkills.length > 0 && (
                            <Select value={skillFilter} onValueChange={setSkillFilter}>
                                <SelectTrigger className="w-[180px]" data-tour="skill-filter">
                                    <SelectValue placeholder={t('filters.allSkills')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('filters.allSkills')}</SelectItem>
                                    {allSkills.map((skill) => (
                                        <SelectItem key={skill} value={skill}>
                                            {skill}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </FilterBar>
                </CardContent>
            </Card>

            {/* Task Cards Grid */}
            {filteredTasks.length === 0 ? (
                <Card>
                    <CardContent className="pt-6">
                        {tasks && tasks.length > 0 ? (
                            <Empty>
                                <EmptyHeader>
                                    <EmptyTitle>{t('noResults')}</EmptyTitle>
                                    <EmptyDescription>{t('noResultsDesc')}</EmptyDescription>
                                </EmptyHeader>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => { setSearchQuery(''); setProjectFilter('all'); setSkillFilter('all'); }}
                                >
                                    {t('clearFilters')}
                                </Button>
                            </Empty>
                        ) : (
                            <Empty>
                                <EmptyHeader>
                                    <EmptyTitle>{t('noTasks')}</EmptyTitle>
                                    <EmptyDescription>{t('noTasksDesc')}</EmptyDescription>
                                </EmptyHeader>
                            </Empty>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" data-tour="available-grid">
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
                            disabled={isSigningUp || !volunteerProfile?.id}
                        >
                            {isSigningUp ? t('signUp.loading') : t('signUp.confirm')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
