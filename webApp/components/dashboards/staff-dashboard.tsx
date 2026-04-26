'use client';

import React from 'react';
import { useAuth } from '@/lib/hooks/useAuth.tsx';
import { useTranslations, useLocale } from 'next-intl';
import useSWR from 'swr';
import { Folder, Users, Clock, CheckSquare, ArrowRight, ClipboardCheck, Mail, Trophy, Award } from 'lucide-react';
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
import { contactApi } from '@/lib/api/contact';
import { pointsApi } from '@/lib/api/gamification';
import { format, subMonths, eachMonthOfInterval, startOfMonth } from 'date-fns';
import Link from 'next/link';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

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

    const { data: hoursTrends } = useSWR(
        'staff-hours-trends',
        () => analyticsApi.getVolunteerHoursTrends({
            start_date: format(subMonths(new Date(), 6), 'yyyy-MM-dd'),
            end_date: format(new Date(), 'yyyy-MM-dd'),
            granularity: 'monthly',
        })
    );

    // Fetch pending time approvals
    const { data: pendingApprovals } = useSWR(
        'staff-pending-approvals',
        async () => {
            try {
                // Get all volunteers and their pending time logs
                const volunteersData = await volunteersApi.getVolunteers({ limit: 100 });
                if (!volunteersData) return [];

                const pendingLogs = [];
                for (const volunteer of volunteersData) {
                    try {
                        const hours = await volunteersApi.getVolunteerHours(volunteer.id, {});
                        const pending = hours.filter(log => !log.approved);
                        pendingLogs.push(...pending);
                    } catch (_error) {
                        // Skip if error
                    }
                }
                return pendingLogs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            } catch (_error) {
                return [];
            }
        }
    );

    // Fetch recent contact submissions
    const { data: recentContacts } = useSWR(
        'staff-recent-contacts',
        async () => {
            try {
                const data = await contactApi.listSubmissions({ limit: 10, unread_only: false });
                return data.items.filter(s => !s.is_read).slice(0, 3);
            } catch (_error) {
                return [];
            }
        }
    );

    // Fetch recent gamification awards
    const { data: recentAwards } = useSWR(
        'staff-recent-awards',
        async () => {
            try {
                const volunteersData = await volunteersApi.getVolunteers({ limit: 10 });
                if (!volunteersData) return [];

                const allHistory: Array<any> = [];
                for (const volunteer of volunteersData) {
                    try {
                        const history = await pointsApi.getHistory(volunteer.id, { limit: 2 });
                        allHistory.push(...history.map(h => ({ ...h, volunteer_name: volunteer.name })));
                    } catch (_error) {
                        // Skip if error
                    }
                }
                return allHistory.sort((a, b) =>
                    new Date(b.awarded_at).getTime() - new Date(a.awarded_at).getTime()
                ).slice(0, 5);
            } catch (_error) {
                return [];
            }
        }
    );

    const isLoading = analyticsLoading || projectsLoading || volunteersLoading || tasksLoading;

    const hoursChartData = React.useMemo(() => {
        return eachMonthOfInterval({ start: subMonths(new Date(), 5), end: new Date() }).map(month => {
            const monthStr = format(startOfMonth(month), 'yyyy-MM');
            const point = hoursTrends?.trends.find(t => (t.period || t.date || '').startsWith(monthStr));
            return { month: format(month, 'MMM yyyy'), hours: point?.total_hours || 0 };
        });
    }, [hoursTrends]);

    const hoursChartConfig = {
        hours: { label: 'Hours', color: 'hsl(var(--chart-1))' },
    } satisfies ChartConfig;

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
                <Skeleton className="h-72" />
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

            {/* New Staff-Specific Widgets */}
            <div className="grid gap-4 md:grid-cols-3">
                {/* Pending Time Approvals Widget */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div>
                            <CardTitle className="text-base">{tStaff('dashboard.pendingApprovals')}</CardTitle>
                            <CardDescription>{tStaff('dashboard.pendingApprovalsDesc')}</CardDescription>
                        </div>
                        <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {!pendingApprovals ? (
                            <Skeleton className="h-20" />
                        ) : pendingApprovals.length === 0 ? (
                            <div className="text-center py-4">
                                <CheckSquare className="h-8 w-8 mx-auto text-green-500 mb-2" />
                                <p className="text-sm text-muted-foreground">{tStaff('dashboard.noPendingApprovals')}</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-2xl font-bold">{pendingApprovals.length}</span>
                                    <Badge variant="secondary">Pending</Badge>
                                </div>
                                {pendingApprovals[0] && (
                                    <p className="text-xs text-muted-foreground">
                                        Oldest: {format(new Date(pendingApprovals[0].date), 'MMM dd, yyyy')}
                                    </p>
                                )}
                                <Link href={`/${locale}/portal/approvals/time-logs`}>
                                    <Button variant="outline" size="sm" className="w-full mt-2">
                                        {tStaff('dashboard.viewOldest')}
                                        <ArrowRight className="ml-1 h-3 w-3" />
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Contact Submissions Widget */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div>
                            <CardTitle className="text-base">{tStaff('dashboard.recentContacts')}</CardTitle>
                            <CardDescription>{tStaff('dashboard.recentContactsDesc')}</CardDescription>
                        </div>
                        <Mail className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {!recentContacts ? (
                            <Skeleton className="h-20" />
                        ) : recentContacts.length === 0 ? (
                            <div className="text-center py-4">
                                <Mail className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                                <p className="text-sm text-muted-foreground">{tStaff('dashboard.noRecentContacts')}</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-2xl font-bold">{recentContacts.length}</span>
                                    <Badge variant="default">Unread</Badge>
                                </div>
                                {recentContacts.slice(0, 2).map((contact) => (
                                    <div key={contact.id} className="border-t pt-2">
                                        <p className="text-sm font-medium truncate">{contact.name}</p>
                                        <p className="text-xs text-muted-foreground truncate">{contact.message}</p>
                                    </div>
                                ))}
                                <Link href={`/${locale}/portal/contact`}>
                                    <Button variant="outline" size="sm" className="w-full mt-2">
                                        {tStaff('dashboard.viewAll')}
                                        <ArrowRight className="ml-1 h-3 w-3" />
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Gamification Awards Widget */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div>
                            <CardTitle className="text-base">{tStaff('dashboard.recentAwards')}</CardTitle>
                            <CardDescription>{tStaff('dashboard.recentAwardsDesc')}</CardDescription>
                        </div>
                        <Trophy className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {!recentAwards ? (
                            <Skeleton className="h-20" />
                        ) : recentAwards.length === 0 ? (
                            <div className="text-center py-4">
                                <Award className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                                <p className="text-sm text-muted-foreground">{tStaff('dashboard.noRecentAwards')}</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {recentAwards.slice(0, 3).map((award, index) => (
                                    <div key={index} className="flex items-center justify-between border-b pb-2 last:border-0">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{award.volunteer_name}</p>
                                            <p className="text-xs text-muted-foreground">{award.description || 'Points awarded'}</p>
                                        </div>
                                        <Badge variant="secondary" className="ml-2">+{award.points_change}</Badge>
                                    </div>
                                ))}
                                <Link href={`/${locale}/portal/gamification`}>
                                    <Button variant="outline" size="sm" className="w-full mt-2">
                                        {tStaff('dashboard.viewAll')}
                                        <ArrowRight className="ml-1 h-3 w-3" />
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>
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

            {/* Volunteer Hours Trend */}
            <Card>
                <CardHeader>
                    <CardTitle>{tStaff('dashboard.charts.volunteerHoursTrend')}</CardTitle>
                    <CardDescription>{tStaff('dashboard.charts.volunteerHoursTrendDesc')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={hoursChartConfig}>
                        <AreaChart
                            accessibilityLayer
                            data={hoursChartData}
                            margin={{ left: 12, right: 12, top: 12 }}
                        >
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="month"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                tickFormatter={(v) => v.split(' ')[0]}
                            />
                            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                            <Area
                                dataKey="hours"
                                type="natural"
                                fill="var(--color-hours)"
                                fillOpacity={0.4}
                                stroke="var(--color-hours)"
                            />
                        </AreaChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
    );
}
