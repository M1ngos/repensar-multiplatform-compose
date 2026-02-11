'use client';

import React from 'react';
import { useAuth } from '@/lib/hooks/useAuth.tsx';
import { useTranslations, useLocale } from 'next-intl';
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
import { ProjectStatus } from '@/lib/api/types';
import Link from 'next/link';
import { toast } from 'sonner';
import type { VolunteerTimeLog, VolunteerSummary } from '@/lib/api/types';

export function ProjectManagerDashboard() {
    const { user } = useAuth();
    const locale = useLocale();
    const t = useTranslations('Dashboard');
    const tPM = useTranslations('ProjectManager');

    // Fetch PM's projects (ProjectSummary[] — no .data wrapper)
    const { data: pmProjects, isLoading: projectsLoading } = useSWR(
        user?.id ? ['pm-projects', user.id] : null,
        () => projectsApi.getProjects({ manager_id: user!.id })
    );

    // Fetch dashboard metrics for PM's projects
    const { data: dashboardData, isLoading: dashLoading } = useSWR(
        user?.id ? ['pm-dashboard-data', user.id] : null,
        () => projectsApi.getProjectsDashboard()
    );

    // Derive stats by cross-referencing PM's project IDs with dashboard data
    const stats = React.useMemo(() => {
        if (!pmProjects || !dashboardData) return null;

        const pmIds = new Set(pmProjects.map(p => p.id));
        const pmDashProjects = dashboardData.filter(d => pmIds.has(d.id));

        return {
            active_projects: pmDashProjects.filter(
                p => p.status === ProjectStatus.IN_PROGRESS || p.status === ProjectStatus.PLANNING
            ).length,
            total_tasks: pmDashProjects.reduce((sum, p) => sum + p.total_tasks, 0),
            team_members: pmDashProjects.reduce((sum, p) => sum + p.team_size, 0),
        };
    }, [pmProjects, dashboardData]);

    // Fetch volunteers across PM's projects for the pending approvals widget
    const { data: pendingApprovals, isLoading: approvalsLoading, mutate: mutateApprovals } = useSWR(
        user?.id && pmProjects && pmProjects.length > 0 ? ['pm-pending-approvals', user.id] : null,
        async () => {
            // Get volunteers for up to 5 projects
            const projectIds = pmProjects!.slice(0, 5).map(p => p.id);

            const volunteerResults = await Promise.all(
                projectIds.map(pid =>
                    projectsApi.getProjectVolunteers(pid).catch(() => ({ data: [] as VolunteerSummary[], metadata: { total: 0, page: 1, page_size: 10, total_pages: 1, has_next: false, has_previous: false } }))
                )
            );

            // Deduplicate volunteer IDs (limit to 15 to bound API calls)
            const uniqueVolIds = [...new Set(
                volunteerResults.flatMap(r => r.data.map(v => v.id))
            )].slice(0, 15);

            if (uniqueVolIds.length === 0) return { logs: [], volunteerNames: new Map<number, string>() };

            // Build volunteer name map
            const volunteerNames = new Map<number, string>();
            volunteerResults.forEach(r => {
                r.data.forEach(v => volunteerNames.set(v.id, v.name));
            });

            // Fetch pending hours for each volunteer
            const hoursResults = await Promise.all(
                uniqueVolIds.map(vid =>
                    volunteersApi.getVolunteerHours(vid, { approval_status: 'pending' }).catch(() => [] as VolunteerTimeLog[])
                )
            );

            const allPending = hoursResults.flat()
                .filter(log => !log.approved)
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 5);

            return { logs: allPending, volunteerNames };
        }
    );

    // Approve a single time log from the dashboard widget
    const handleApproveHours = async (timeLogId: number) => {
        try {
            await volunteersApi.approveTimeLog(timeLogId, { approved: true });
            toast.success(tPM('timeApprovals.approveSuccess'));
            mutateApprovals();
        } catch (error) {
            toast.error(tPM('timeApprovals.approveError'));
            console.error('Failed to approve hours:', error);
        }
    };

    const isLoading = projectsLoading || dashLoading || approvalsLoading;

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
                    <Skeleton className="h-64" />
                    <Skeleton className="h-64" />
                </div>
            </div>
        );
    }

    const topProjects = pmProjects?.slice(0, 5) || [];
    const pendingLogs = pendingApprovals?.logs || [];
    const volunteerNames = pendingApprovals?.volunteerNames || new Map();

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <PageHeader
                title={`${t('welcome')}, ${user?.name?.split(' ')[0] || t('fallbackName')}!`}
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
                    value={pendingLogs.length}
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
                            <div className="space-y-3">
                                {topProjects.map((project) => (
                                    <Link
                                        key={project.id}
                                        href={`/${locale}/portal/projects/${project.id}`}
                                        className="block"
                                    >
                                        <div className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50">
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium truncate">{project.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {project.volunteers_count} {tPM('dashboard.volunteers')} · {project.team_size} {tPM('dashboard.teamMembers').toLowerCase()}
                                                </p>
                                            </div>
                                            <Progress value={project.progress_percentage || 0} className="w-24 ml-4" />
                                        </div>
                                    </Link>
                                ))}
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
                        <Link href={`/${locale}/portal/approvals/time-logs`}>
                            <Button variant="ghost" size="sm">
                                {t('viewAll')}
                                <ArrowRight className="ml-1 h-4 w-4" />
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {pendingLogs.length === 0 ? (
                            <Empty>
                                <EmptyHeader>
                                    <EmptyTitle>{tPM('timeApprovals.noPending')}</EmptyTitle>
                                    <EmptyDescription>{tPM('timeApprovals.noPendingDesc')}</EmptyDescription>
                                </EmptyHeader>
                            </Empty>
                        ) : (
                            <div className="space-y-3">
                                {pendingLogs.map((log) => (
                                    <div
                                        key={log.id}
                                        className="flex items-start justify-between rounded-lg border p-3"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">
                                                {volunteerNames.get(log.volunteer_id) || `#${log.volunteer_id}`}
                                            </p>
                                            <p className="text-sm text-muted-foreground truncate">
                                                {log.hours}h {tPM('timeApprovals.on')} {log.project_name || tPM('timeApprovals.noProject')}
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
