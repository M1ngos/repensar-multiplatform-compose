'use client';

import React from 'react';
import { useAuth } from '@/lib/hooks/useAuth.tsx';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import useSWR from 'swr';
import { Folder, CheckSquare, Users, ClipboardCheck, ArrowRight } from 'lucide-react';
import { StatCard } from '@/components/shared/stat-card';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import { projectsApi } from '@/lib/api/projects';
import { volunteersApi } from '@/lib/api/volunteers';
import Link from 'next/link';
import { toast } from 'sonner';

export function ProjectManagerDashboard() {
    const { user } = useAuth();
    const locale = useLocale();
    const t = useTranslations('Dashboard');
    const tPM = useTranslations('ProjectManager');

    // Fetch PM dashboard stats
    const { data: stats, isLoading: statsLoading } = useSWR(
        user?.id ? ['pm-dashboard-stats', user.id] : null,
        async () => {
            // Get projects managed by this PM
            const projects = await projectsApi.getProjects({ project_manager_id: user!.id });

            // Get pending time approvals for PM's projects
            const projectIds = projects.data?.map(p => p.id) || [];
            let pendingCount = 0;

            if (projectIds.length > 0) {
                // Fetch hours for each project and count pending
                const hoursPromises = projectIds.map(projectId =>
                    volunteersApi.getVolunteerHours(undefined as any, {
                        project_id: projectId,
                        status: 'pending'
                    }).catch(() => ({ time_logs: [] }))
                );
                const hoursResults = await Promise.all(hoursPromises);
                pendingCount = hoursResults.reduce((sum, result) =>
                    sum + (result.time_logs?.length || 0), 0
                );
            }

            // Calculate stats
            const activeProjects = projects.data?.filter(p => p.status === 'active').length || 0;
            const totalTasks = projects.data?.reduce((sum, p) => sum + (p.tasks?.length || 0), 0) || 0;

            // Count unique volunteers across all projects
            const uniqueVolunteers = new Set(
                projects.data?.flatMap(p =>
                    p.volunteers?.map(v => v.id) || []
                ) || []
            );

            return {
                active_projects: activeProjects,
                total_tasks: totalTasks,
                team_members: uniqueVolunteers.size,
                pending_approvals: pendingCount
            };
        }
    );

    // Fetch PM's projects (for overview widget)
    const { data: projectsData, isLoading: projectsLoading } = useSWR(
        user?.id ? ['pm-projects', user.id] : null,
        () => projectsApi.getProjects({ project_manager_id: user!.id })
    );

    // Fetch pending time approvals (for approvals widget)
    const { data: pendingApprovals, isLoading: approvalsLoading, mutate: mutateApprovals } = useSWR(
        user?.id && projectsData?.data ? ['pm-pending-approvals', user.id] : null,
        async () => {
            if (!projectsData?.data) return [];

            const projectIds = projectsData.data.map(p => p.id);

            if (projectIds.length === 0) return [];

            // Fetch pending hours for all PM's projects
            const hoursPromises = projectIds.map(projectId =>
                volunteersApi.getVolunteerHours(undefined as any, {
                    project_id: projectId,
                    status: 'pending',
                    limit: 10
                }).catch(() => ({ time_logs: [] }))
            );

            const hoursResults = await Promise.all(hoursPromises);

            // Flatten and combine all pending time logs
            const allPendingLogs = hoursResults.flatMap(result => result.time_logs || []);

            // Sort by date (most recent first) and take top 5
            return allPendingLogs
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 5);
        }
    );

    // Approve hours handler
    const handleApproveHours = async (timeLogId: number) => {
        try {
            await volunteersApi.updateVolunteerHourStatus(timeLogId, { status: 'approved' });
            toast.success(tPM('timeApprovals.approveSuccess'));
            mutateApprovals(); // Refresh approvals
        } catch (error) {
            toast.error(tPM('timeApprovals.approveError'));
            console.error('Failed to approve hours:', error);
        }
    };

    const isLoading = statsLoading || projectsLoading || approvalsLoading;

    if (isLoading) {
        return (
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-32" />
                    ))}
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    <Skeleton className="h-96" />
                    <Skeleton className="h-96" />
                </div>
            </div>
        );
    }

    // Get top 5 projects
    const topProjects = projectsData?.data?.slice(0, 5) || [];

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <PageHeader
                title={`${t('welcome')}, ${user?.name?.split(' ')[0] || 'Manager'}!`}
                description={tPM('dashboard.subtitle')}
            />

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title={tPM('dashboard.stats.activeProjects')}
                    value={stats?.active_projects || 0}
                    icon={Folder}
                    variant="emerald"
                />
                <StatCard
                    title={tPM('dashboard.stats.totalTasks')}
                    value={stats?.total_tasks || 0}
                    icon={CheckSquare}
                    variant="blue"
                />
                <StatCard
                    title={tPM('dashboard.stats.teamMembers')}
                    value={stats?.team_members || 0}
                    icon={Users}
                    variant="purple"
                />
                <StatCard
                    title={tPM('dashboard.stats.pendingApprovals')}
                    value={stats?.pending_approvals || 0}
                    icon={ClipboardCheck}
                    variant="orange"
                />
            </div>

            {/* Projects Overview & Pending Approvals */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* Projects Overview Widget */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div>
                            <CardTitle>{tPM('myProjects.title')}</CardTitle>
                            <CardDescription>{tPM('dashboard.projectsDesc')}</CardDescription>
                        </div>
                        <Link href={`/${locale}/portal/my-projects`}>
                            <Button variant="ghost" size="sm">
                                {t('viewAll')}
                                <ArrowRight className="ml-1 h-4 w-4" />
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {topProjects.length === 0 ? (
                            <Empty>
                                <EmptyHeader>
                                    <EmptyTitle>{tPM('myProjects.noProjects')}</EmptyTitle>
                                    <EmptyDescription>{tPM('myProjects.noProjectsDesc')}</EmptyDescription>
                                </EmptyHeader>
                            </Empty>
                        ) : (
                            <div className="space-y-4">
                                {topProjects.map((project) => {
                                    const tasksCompleted = project.tasks?.filter(t => t.status === 'completed').length || 0;
                                    const tasksTotal = project.tasks?.length || 0;
                                    const progress = tasksTotal > 0 ? (tasksCompleted / tasksTotal) * 100 : 0;

                                    return (
                                        <Link
                                            key={project.id}
                                            href={`/${locale}/portal/projects/${project.id}`}
                                            className="block"
                                        >
                                            <div className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50">
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium truncate">{project.name}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {tasksCompleted}/{tasksTotal} {tPM('dashboard.tasks')}
                                                    </p>
                                                </div>
                                                <Progress value={progress} className="w-24 ml-4" />
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Pending Time Approvals Widget */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div>
                            <CardTitle>{tPM('timeApprovals.title')}</CardTitle>
                            <CardDescription>{tPM('dashboard.approvalsDesc')}</CardDescription>
                        </div>
                        <Link href={`/${locale}/portal/time-approvals`}>
                            <Button variant="ghost" size="sm">
                                {t('viewAll')}
                                <ArrowRight className="ml-1 h-4 w-4" />
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {!pendingApprovals || pendingApprovals.length === 0 ? (
                            <Empty>
                                <EmptyHeader>
                                    <EmptyTitle>{tPM('timeApprovals.noPending')}</EmptyTitle>
                                    <EmptyDescription>{tPM('timeApprovals.noPendingDesc')}</EmptyDescription>
                                </EmptyHeader>
                            </Empty>
                        ) : (
                            <div className="space-y-3">
                                {pendingApprovals.map((log) => (
                                    <div
                                        key={log.id}
                                        className="flex items-start justify-between rounded-lg border p-3"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">
                                                {log.volunteer?.name || tPM('timeApprovals.unknownVolunteer')}
                                            </p>
                                            <p className="text-sm text-muted-foreground truncate">
                                                {log.hours_worked}h {tPM('timeApprovals.on')} {log.project?.name || tPM('timeApprovals.noProject')}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(log.date).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleApproveHours(log.id)}
                                        >
                                            {tPM('timeApprovals.approve')}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
