'use client';

import React from 'react';
import { useAuth } from '@/lib/hooks/useAuth.tsx';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import useSWR from 'swr';
import { Star, Clock, Award, CheckSquare, Calendar, ArrowRight, AlertCircle } from 'lucide-react';
import { StatCard } from '@/components/shared/stat-card';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import { gamificationApi } from '@/lib/api/gamification';
import { volunteersApi } from '@/lib/api/volunteers';
import { TaskStatus } from '@/lib/api/types';
import { format, parseISO, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";

export function VolunteerDashboard() {
    const { user } = useAuth();
    const locale = useLocale();
    const t = useTranslations('Dashboard');
    const tVolunteer = useTranslations('Volunteer');

    // Fetch gamification stats
    const { data: stats, isLoading: statsLoading } = useSWR(
        user?.id ? ['gamification-summary', user.id] : null,
        () => gamificationApi.stats.getVolunteerSummary(user!.id)
    );

    // Fetch current tasks (v2.0 paginated)
    const { data: tasks, isLoading: tasksLoading } = useSWR(
        user?.id ? ['volunteer-tasks-dashboard', user.id] : null,
        () => volunteersApi.getVolunteerTasks(user!.id, {
            status: 'in_progress',
            page_size: 5
        })
    );

    // Fetch hours summary for this-month stat card
    const { data: hoursSummary, isLoading: summaryLoading } = useSWR(
        user?.id ? ['volunteer-hours-summary-dash', user.id] : null,
        () => volunteersApi.getVolunteerHoursSummary(user!.id)
    );

    // Fetch recent badges
    const { data: badgesData, isLoading: badgesLoading } = useSWR(
        user?.id ? ['volunteer-badges-dashboard', user.id] : null,
        () => gamificationApi.badges.getVolunteerBadges(user!.id)
    );

    // Fetch hours for chart (last 6 months)
    const { data: hoursData, isLoading: hoursLoading } = useSWR(
        user?.id ? ['volunteer-hours-chart', user.id] : null,
        async () => {
            const sixMonthsAgo = subMonths(new Date(), 6);
            const hours = await volunteersApi.getVolunteerHours(user!.id, {
                start_date: format(sixMonthsAgo, 'yyyy-MM-dd'),
                end_date: format(new Date(), 'yyyy-MM-dd'),
                approval_status: 'approved'
            });
            return hours;
        }
    );

    // Process hours data for chart — hoursData is VolunteerTimeLog[] directly
    const chartData = React.useMemo(() => {
        if (!hoursData || hoursData.length === 0) return [];

        const sixMonthsAgo = subMonths(new Date(), 6);
        const months = eachMonthOfInterval({
            start: startOfMonth(sixMonthsAgo),
            end: endOfMonth(new Date())
        });

        return months.map(month => {
            const monthStart = startOfMonth(month);
            const monthEnd = endOfMonth(month);

            const monthHours = hoursData
                .filter(log => {
                    const logDate = parseISO(log.date);
                    return logDate >= monthStart && logDate <= monthEnd;
                })
                .reduce((sum, log) => sum + log.hours, 0);

            return {
                month: format(month, 'MMM yyyy'),
                hours: monthHours
            };
        });
    }, [hoursData]);

    const chartConfig = {
        hours: {
            label: tVolunteer('myHours.title'),
            color: "hsl(var(--chart-1))",
        },
    } satisfies ChartConfig;

    const isLoading = statsLoading || tasksLoading || badgesLoading || hoursLoading || summaryLoading;

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
                <Skeleton className="h-96" />
            </div>
        );
    }

    // Get recent badges (last 6)
    const recentBadges = badgesData?.badges?.slice(0, 6) || [];

    // Get active tasks from paginated response (max 5)
    const activeTasks = tasks?.data?.slice(0, 5) || [];

    // Derive hours this month from summary's hours_by_month map
    const currentMonthKey = format(new Date(), 'yyyy-MM');
    const hoursThisMonth = hoursSummary?.hours_by_month?.[currentMonthKey] || 0;

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <PageHeader
                title={`${t('welcome')}, ${user?.name?.split(' ')[0] || 'Volunteer'}!`}
                description={tVolunteer('dashboard.subtitle')}
            />

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title={tVolunteer('achievements.summary.totalPoints')}
                    value={stats?.points?.total_points || 0}
                    icon={Star}
                    variant="emerald"
                />
                <StatCard
                    title={tVolunteer('myHours.summary.thisMonth')}
                    value={hoursThisMonth.toFixed(1)}
                    icon={Clock}
                    variant="blue"
                />
                <StatCard
                    title={tVolunteer('achievements.summary.badgesEarned')}
                    value={stats?.badges_earned || 0}
                    icon={Award}
                    variant="purple"
                />
                <StatCard
                    title={tVolunteer('myTasks.stats.active')}
                    value={tasks?.metadata?.total || 0}
                    icon={CheckSquare}
                    variant="orange"
                />
            </div>

            {/* Current Tasks & Recent Badges Widgets */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* Current Tasks Widget */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div>
                            <CardTitle>{tVolunteer('myTasks.title')}</CardTitle>
                            <CardDescription>{tVolunteer('dashboard.currentTasksDesc')}</CardDescription>
                        </div>
                        <Link href={`/${locale}/portal/my-tasks`}>
                            <Button variant="ghost" size="sm">
                                {t('viewAll')}
                                <ArrowRight className="ml-1 h-4 w-4" />
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {activeTasks.length === 0 ? (
                            <Empty>
                                <EmptyHeader>
                                    <EmptyTitle>{tVolunteer('myTasks.noTasks')}</EmptyTitle>
                                    <EmptyDescription>{tVolunteer('myTasks.noTasksDesc')}</EmptyDescription>
                                </EmptyHeader>
                            </Empty>
                        ) : (
                            <div className="space-y-3">
                                {activeTasks.map((task) => (
                                    <Link
                                        key={task.id}
                                        href={`/${locale}/portal/tasks/${task.id}`}
                                        className="block"
                                    >
                                        <div className={cn(
                                            "rounded-lg border p-3 transition-colors hover:bg-muted/50",
                                            task.is_overdue && "border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20"
                                        )}>
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-sm truncate">{task.title}</p>
                                                    <p className="text-xs text-muted-foreground truncate">
                                                        {task.project_name || tVolunteer('myTasks.noProject')}
                                                    </p>
                                                    {task.end_date && (
                                                        <div className={cn(
                                                            "flex items-center gap-1 text-xs mt-1",
                                                            task.is_overdue ? "text-red-600 dark:text-red-400" : "text-muted-foreground"
                                                        )}>
                                                            {task.is_overdue && <AlertCircle className="h-3 w-3" />}
                                                            <Calendar className="h-3 w-3" />
                                                            <span>{format(parseISO(task.end_date), 'MMM dd, yyyy')}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <Badge variant={
                                                    task.status === TaskStatus.COMPLETED ? 'default' :
                                                    task.status === TaskStatus.IN_PROGRESS ? 'secondary' :
                                                    'outline'
                                                }>
                                                    {tVolunteer(`myTasks.status.${task.status}`)}
                                                </Badge>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Badges Widget */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div>
                            <CardTitle>{tVolunteer('achievements.tabs.badges')}</CardTitle>
                            <CardDescription>{tVolunteer('dashboard.recentBadgesDesc')}</CardDescription>
                        </div>
                        <Link href={`/${locale}/portal/achievements`}>
                            <Button variant="ghost" size="sm">
                                {t('viewAll')}
                                <ArrowRight className="ml-1 h-4 w-4" />
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {recentBadges.length === 0 ? (
                            <Empty>
                                <EmptyHeader>
                                    <EmptyTitle>{tVolunteer('achievements.badges.noBadges')}</EmptyTitle>
                                    <EmptyDescription>{tVolunteer('achievements.badges.noBadgesDesc')}</EmptyDescription>
                                </EmptyHeader>
                            </Empty>
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
                                {recentBadges.map((badge) => (
                                    <Link
                                        key={badge.id}
                                        href={`/${locale}/portal/achievements`}
                                        className="block"
                                    >
                                        <div className="rounded-lg border p-3 transition-colors hover:bg-muted/50">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                                                    <Award className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-sm truncate">
                                                        {badge.badge.name}
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                {format(parseISO(badge.earned_at), 'MMM dd, yyyy')}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Hours Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>{tVolunteer('dashboard.hoursChart')}</CardTitle>
                    <CardDescription>{tVolunteer('dashboard.hoursChartDesc')}</CardDescription>
                </CardHeader>
                <CardContent>
                    {chartData.length === 0 ? (
                        <Empty>
                            <EmptyHeader>
                                <EmptyTitle>{tVolunteer('myHours.noData')}</EmptyTitle>
                                <EmptyDescription>{tVolunteer('myHours.noDataDesc')}</EmptyDescription>
                            </EmptyHeader>
                        </Empty>
                    ) : (
                        <ChartContainer config={chartConfig}>
                            <AreaChart
                                accessibilityLayer
                                data={chartData}
                                margin={{
                                    left: 12,
                                    right: 12,
                                    top: 12,
                                }}
                            >
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="month"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    tickFormatter={(value) => value.split(' ')[0]}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                />
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent indicator="line" />}
                                />
                                <Area
                                    dataKey="hours"
                                    type="natural"
                                    fill="var(--color-hours)"
                                    fillOpacity={0.4}
                                    stroke="var(--color-hours)"
                                />
                            </AreaChart>
                        </ChartContainer>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
