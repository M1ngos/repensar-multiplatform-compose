'use client';

import React from 'react';
import { useAuth } from '@/lib/hooks/useAuth.tsx';
import { useTranslations, useLocale } from 'next-intl';
import useSWR from 'swr';
import { Folder, Users, CheckSquare, ArrowRight } from 'lucide-react';
import { StatCard } from '@/components/shared/stat-card';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Empty, EmptyHeader, EmptyTitle } from '@/components/ui/empty';
import { projectsApi } from '@/lib/api/projects';
import { tasksApi } from '@/lib/api/tasks';
import { analyticsApi } from '@/lib/api/analytics';
import { usersApi } from '@/lib/api/users';
import Link from 'next/link';

export function AdminDashboard() {
    const { user } = useAuth();
    const locale = useLocale();
    const t = useTranslations('Dashboard');
    const tAdmin = useTranslations('Admin');

    const { data: analytics, isLoading: analyticsLoading } = useSWR(
        'admin-analytics-dashboard',
        () => analyticsApi.getAnalyticsDashboard()
    );

    const { data: projectsDashboard, isLoading: projectsLoading } = useSWR(
        'admin-projects-dashboard',
        () => projectsApi.getProjectsDashboard()
    );

    const { data: usersData, isLoading: usersLoading } = useSWR(
        'admin-users',
        () => usersApi.getUsers({ page_size: 100 })
    );

    const { data: taskStats, isLoading: tasksLoading } = useSWR(
        'admin-task-stats',
        () => tasksApi.getTasksStats()
    );

    const isLoading = analyticsLoading || projectsLoading || usersLoading || tasksLoading;

    const recentProjects = (projectsDashboard || []).slice(0, 5);

    const usersByType = React.useMemo(() => {
        if (!usersData?.data) return {};
        const map: Record<string, number> = {};
        usersData.data.forEach(u => {
            const type = u.user_type_name || 'Unknown';
            map[type] = (map[type] || 0) + 1;
        });
        return map;
    }, [usersData]);

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
                <div className="grid gap-4 md:grid-cols-3">
                    <Skeleton className="h-72" />
                    <Skeleton className="h-72" />
                    <Skeleton className="h-72" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <PageHeader
                title={`${t('welcome')}, ${user?.name?.split(' ')[0] || 'Admin'}!`}
                description={tAdmin('dashboard.subtitle')}
            />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title={tAdmin('dashboard.stats.totalUsers')}
                    value={usersData?.metadata.total || 0}
                    icon={Users}
                    variant="emerald"
                />
                <StatCard
                    title={tAdmin('dashboard.stats.activeProjects')}
                    value={analytics?.summary.projects.active_projects || 0}
                    icon={Folder}
                    variant="blue"
                />
                <StatCard
                    title={tAdmin('dashboard.stats.totalVolunteers')}
                    value={analytics?.summary.volunteers.active_volunteers || 0}
                    icon={Users}
                    variant="purple"
                />
                <StatCard
                    title={tAdmin('dashboard.stats.tasksCompleted')}
                    value={analytics?.summary.tasks.completed_tasks || 0}
                    icon={CheckSquare}
                    variant="orange"
                />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                {/* Recent Projects */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div>
                            <CardTitle>{tAdmin('dashboard.projectsTitle')}</CardTitle>
                            <CardDescription>{tAdmin('dashboard.projectsDesc')}</CardDescription>
                        </div>
                        <Link href={`/${locale}/portal/projects`}>
                            <Button variant="ghost" size="sm">
                                {t('viewAll')}
                                <ArrowRight className="ml-1 h-4 w-4" />
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {recentProjects.length === 0 ? (
                            <Empty>
                                <EmptyHeader>
                                    <EmptyTitle>{tAdmin('dashboard.noProjects')}</EmptyTitle>
                                </EmptyHeader>
                            </Empty>
                        ) : (
                            <div className="space-y-3">
                                {recentProjects.map(project => (
                                    <Link
                                        key={project.id}
                                        href={`/${locale}/portal/projects/${project.id}`}
                                        className="block"
                                    >
                                        <div className="flex items-center justify-between rounded-lg border p-2.5 transition-colors hover:bg-muted/50">
                                            <div className="flex-1 min-w-0 mr-3">
                                                <p className="font-medium text-sm truncate">{project.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {project.volunteers_count} {tAdmin('dashboard.volunteersLabel')} · {project.team_size} {tAdmin('dashboard.membersLabel')}
                                                </p>
                                            </div>
                                            <Progress value={project.progress_percentage || 0} className="w-20" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Users Overview */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div>
                            <CardTitle>{tAdmin('dashboard.usersTitle')}</CardTitle>
                            <CardDescription>{tAdmin('dashboard.usersDesc')}</CardDescription>
                        </div>
                        <Link href={`/${locale}/portal/users`}>
                            <Button variant="ghost" size="sm">
                                {t('viewAll')}
                                <ArrowRight className="ml-1 h-4 w-4" />
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">{tAdmin('dashboard.totalUsers')}</span>
                                    <span className="font-medium">{usersData?.metadata.total || 0}</span>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs text-muted-foreground mb-2">{tAdmin('dashboard.usersByRole')}</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {Object.entries(usersByType).map(([type, count]) => (
                                        <Badge key={type} variant="outline" className="text-xs capitalize">
                                            {type}: {count}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            {analytics?.summary.budget && (
                                <div className="pt-3 border-t space-y-2">
                                    <p className="text-xs text-muted-foreground">{tAdmin('dashboard.budgetOverview')}</p>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">{tAdmin('dashboard.budgetSpent')}</span>
                                        <span className="font-medium">
                                            ${analytics.summary.budget.total_spent.toLocaleString()}
                                            <span className="text-xs text-muted-foreground ml-1">/ ${analytics.summary.budget.total_budget.toLocaleString()}</span>
                                        </span>
                                    </div>
                                    <Progress value={analytics.summary.budget.utilization_rate || 0} className="h-2" />
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Tasks Overview */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div>
                            <CardTitle>{tAdmin('dashboard.tasksTitle')}</CardTitle>
                            <CardDescription>{tAdmin('dashboard.tasksDesc')}</CardDescription>
                        </div>
                        <Link href={`/${locale}/portal/tasks`}>
                            <Button variant="ghost" size="sm">
                                {t('viewAll')}
                                <ArrowRight className="ml-1 h-4 w-4" />
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {taskStats && taskStats.total_tasks > 0 ? (
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">{tAdmin('dashboard.tasksNotStarted')}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-sm">{taskStats.not_started}</span>
                                        <Progress value={(taskStats.not_started / taskStats.total_tasks) * 100} className="w-20 h-2" />
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">{tAdmin('dashboard.tasksInProgress')}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-sm">{taskStats.in_progress}</span>
                                        <Progress value={(taskStats.in_progress / taskStats.total_tasks) * 100} className="w-20 h-2" />
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">{tAdmin('dashboard.tasksCompleted')}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-sm">{taskStats.completed}</span>
                                        <Progress value={(taskStats.completed / taskStats.total_tasks) * 100} className="w-20 h-2" />
                                    </div>
                                </div>
                                {taskStats.overdue_tasks > 0 && (
                                    <div className="flex justify-between items-center pt-2 border-t">
                                        <span className="text-sm text-red-500 font-medium">{tAdmin('dashboard.tasksOverdue')}</span>
                                        <span className="font-medium text-sm text-red-500">{taskStats.overdue_tasks}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center pt-2 border-t">
                                    <span className="text-sm text-muted-foreground">{tAdmin('dashboard.tasksTotal')}</span>
                                    <span className="font-bold text-sm">{taskStats.total_tasks}</span>
                                </div>
                            </div>
                        ) : (
                            <Empty>
                                <EmptyHeader>
                                    <EmptyTitle>{tAdmin('dashboard.noTasks')}</EmptyTitle>
                                </EmptyHeader>
                            </Empty>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
