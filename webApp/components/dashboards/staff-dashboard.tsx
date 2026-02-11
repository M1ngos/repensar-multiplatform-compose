'use client';

import React from 'react';
import { useAuth } from '@/lib/hooks/useAuth.tsx';
import { useTranslations, useLocale } from 'next-intl';
import useSWR from 'swr';
import { Folder, Users, Clock, CheckSquare, ArrowRight } from 'lucide-react';
import { StatCard } from '@/components/shared/stat-card';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Empty, EmptyHeader, EmptyTitle } from '@/components/ui/empty';
import { projectsApi } from '@/lib/api/projects';
import { volunteersApi } from '@/lib/api/volunteers';
import { tasksApi } from '@/lib/api/tasks';
import { analyticsApi } from '@/lib/api/analytics';
import Link from 'next/link';

export function StaffMemberDashboard() {
    const { user } = useAuth();
    const locale = useLocale();
    const t = useTranslations('Dashboard');
    const tStaff = useTranslations('StaffMember');

    const { data: analytics, isLoading: analyticsLoading } = useSWR(
        'staff-analytics-dashboard',
        () => analyticsApi.getAnalyticsDashboard()
    );

    const { data: projectsDashboard, isLoading: projectsLoading } = useSWR(
        'staff-projects-dashboard',
        () => projectsApi.getProjectsDashboard()
    );

    const { data: volunteerStats, isLoading: volunteersLoading } = useSWR(
        'staff-volunteer-stats',
        () => volunteersApi.getVolunteerStats()
    );

    const { data: taskStats, isLoading: tasksLoading } = useSWR(
        'staff-task-stats',
        () => tasksApi.getTasksStats()
    );

    const isLoading = analyticsLoading || projectsLoading || volunteersLoading || tasksLoading;

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

    const recentProjects = (projectsDashboard || []).slice(0, 5);

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <PageHeader
                title={`${t('welcome')}, ${user?.name?.split(' ')[0] || 'Staff'}!`}
                description={tStaff('dashboard.subtitle')}
            />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title={tStaff('dashboard.stats.activeProjects')}
                    value={analytics?.summary.projects.active_projects || 0}
                    icon={Folder}
                    variant="emerald"
                />
                <StatCard
                    title={tStaff('dashboard.stats.activeVolunteers')}
                    value={analytics?.summary.volunteers.active_volunteers || 0}
                    icon={Users}
                    variant="blue"
                />
                <StatCard
                    title={tStaff('dashboard.stats.hoursLogged')}
                    value={(analytics?.summary.volunteers.total_hours_logged || 0).toFixed(1)}
                    icon={Clock}
                    variant="purple"
                />
                <StatCard
                    title={tStaff('dashboard.stats.completionRate')}
                    value={`${(analytics?.summary.tasks.completion_rate || 0).toFixed(0)}%`}
                    icon={CheckSquare}
                    variant="orange"
                />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                {/* Recent Projects */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div>
                            <CardTitle>{tStaff('dashboard.projectsTitle')}</CardTitle>
                            <CardDescription>{tStaff('dashboard.projectsDesc')}</CardDescription>
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
                                    <EmptyTitle>{tStaff('dashboard.noProjects')}</EmptyTitle>
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
                                                    {project.volunteers_count} {tStaff('dashboard.volunteersLabel')} · {project.team_size} {tStaff('dashboard.membersLabel')}
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

                {/* Volunteers Overview */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div>
                            <CardTitle>{tStaff('dashboard.volunteersTitle')}</CardTitle>
                            <CardDescription>{tStaff('dashboard.volunteersDesc')}</CardDescription>
                        </div>
                        <Link href={`/${locale}/portal/volunteers`}>
                            <Button variant="ghost" size="sm">
                                {t('viewAll')}
                                <ArrowRight className="ml-1 h-4 w-4" />
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-1.5">
                                    <span className="text-muted-foreground">{tStaff('dashboard.activeVolunteers')}</span>
                                    <span className="font-medium">
                                        {volunteerStats?.active_volunteers || 0} / {volunteerStats?.total_volunteers || 0}
                                    </span>
                                </div>
                                <Progress
                                    value={volunteerStats?.total_volunteers
                                        ? (volunteerStats.active_volunteers / volunteerStats.total_volunteers) * 100
                                        : 0
                                    }
                                    className="h-2"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">{tStaff('dashboard.totalVolunteers')}</span>
                                    <span className="font-medium">{volunteerStats?.total_volunteers || 0}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">{tStaff('dashboard.totalHours')}</span>
                                    <span className="font-medium">{(volunteerStats?.total_hours || 0).toFixed(1)}h</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">{tStaff('dashboard.recentRegistrations')}</span>
                                    <span className="font-medium">{volunteerStats?.recent_registrations || 0}</span>
                                </div>
                            </div>

                            {volunteerStats?.volunteers_by_status && (
                                <div className="flex flex-wrap gap-1.5 pt-2 border-t">
                                    {Object.entries(volunteerStats.volunteers_by_status).map(([status, count]) => (
                                        <Badge key={status} variant="outline" className="text-xs capitalize">
                                            {status}: {count}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Tasks Overview */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div>
                            <CardTitle>{tStaff('dashboard.tasksTitle')}</CardTitle>
                            <CardDescription>{tStaff('dashboard.tasksDesc')}</CardDescription>
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
                                    <span className="text-sm text-muted-foreground">{tStaff('dashboard.tasksNotStarted')}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-sm">{taskStats.not_started}</span>
                                        <Progress value={(taskStats.not_started / taskStats.total_tasks) * 100} className="w-20 h-2" />
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">{tStaff('dashboard.tasksInProgress')}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-sm">{taskStats.in_progress}</span>
                                        <Progress value={(taskStats.in_progress / taskStats.total_tasks) * 100} className="w-20 h-2" />
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">{tStaff('dashboard.tasksCompleted')}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-sm">{taskStats.completed}</span>
                                        <Progress value={(taskStats.completed / taskStats.total_tasks) * 100} className="w-20 h-2" />
                                    </div>
                                </div>
                                {taskStats.overdue_tasks > 0 && (
                                    <div className="flex justify-between items-center pt-2 border-t">
                                        <span className="text-sm text-red-500 font-medium">{tStaff('dashboard.tasksOverdue')}</span>
                                        <span className="font-medium text-sm text-red-500">{taskStats.overdue_tasks}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center pt-2 border-t">
                                    <span className="text-sm text-muted-foreground">{tStaff('dashboard.tasksTotal')}</span>
                                    <span className="font-bold text-sm">{taskStats.total_tasks}</span>
                                </div>
                            </div>
                        ) : (
                            <Empty>
                                <EmptyHeader>
                                    <EmptyTitle>{tStaff('dashboard.noTasks')}</EmptyTitle>
                                </EmptyHeader>
                            </Empty>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
