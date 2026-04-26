'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import useSWR from 'swr';
import {
    TrendingUp, Users, CheckCircle, Clock, DollarSign, BarChart3,
    CircleHelp, AlertTriangle, Zap,
} from 'lucide-react';
import { useTour } from '@/lib/hooks/useTour';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { analyticsApi } from '@/lib/api';
import { Granularity } from '@/lib/api/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { format, subDays, subMonths } from 'date-fns';
import { Area, AreaChart, BarChart, Bar, CartesianGrid, XAxis, YAxis } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

type DateRange = '7days' | '30days' | '3months' | '6months' | '1year';

export default function AnalyticsPage() {
    const t = useTranslations('Analytics');
    const tTour = useTranslations('Tour.analytics');
    const tTourCommon = useTranslations('Tour');
    const { startTour } = useTour({
        tourId: 'analytics',
        tSteps: tTour,
        nextBtnText: tTourCommon('next'),
        prevBtnText: tTourCommon('prev'),
        doneBtnText: tTourCommon('done'),
    });
    const [dateRange, setDateRange] = useState<DateRange>('30days');

    const getDateRange = () => {
        const endDate = new Date();
        let startDate: Date;
        switch (dateRange) {
            case '7days':   startDate = subDays(endDate, 7); break;
            case '30days':  startDate = subDays(endDate, 30); break;
            case '3months': startDate = subMonths(endDate, 3); break;
            case '6months': startDate = subMonths(endDate, 6); break;
            case '1year':   startDate = subMonths(endDate, 12); break;
            default:        startDate = subDays(endDate, 30);
        }
        return {
            start_date: format(startDate, 'yyyy-MM-dd'),
            end_date: format(endDate, 'yyyy-MM-dd'),
        };
    };

    const dateParams = getDateRange();
    const granularity = dateRange === '7days' ? Granularity.DAILY : Granularity.MONTHLY;

    const { data: overview, isLoading } = useSWR(
        ['analytics-overview', dateParams],
        () => analyticsApi.getAnalyticsOverview(dateParams)
    );

    const { data: volunteerTrends } = useSWR(
        ['volunteer-trends', dateParams, granularity],
        () => analyticsApi.getVolunteerHoursTrends({ ...dateParams, granularity })
    );

    const { data: taskTrends } = useSWR(
        ['task-completion-trends', dateParams, granularity],
        () => analyticsApi.getTaskCompletionTrends({ ...dateParams, granularity })
    );

    const hoursChartData = useMemo(() => {
        if (!volunteerTrends?.trends?.length) return [];
        return volunteerTrends.trends.map(tr => ({
            period: tr.period,
            hours: tr.total_hours || 0,
        }));
    }, [volunteerTrends]);

    const taskChartData = useMemo(() => {
        if (!taskTrends?.trends?.length) return [];
        return taskTrends.trends.map(tr => ({
            period: tr.period,
            completed: tr.completed_count,
            cancelled: tr.cancelled_count,
        }));
    }, [taskTrends]);

    const hoursChartConfig: ChartConfig = {
        hours: { label: t('hours'), color: 'hsl(var(--chart-1))' },
    };

    const taskChartConfig: ChartConfig = {
        completed: { label: t('tasks.completed'), color: 'hsl(var(--chart-2))' },
        cancelled: { label: t('tasks.cancelled'), color: 'hsl(var(--chart-4))' },
    };

    return (
        <div className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8">
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
                    <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7days">{t('dateRanges.7days')}</SelectItem>
                            <SelectItem value="30days">{t('dateRanges.30days')}</SelectItem>
                            <SelectItem value="3months">{t('dateRanges.3months')}</SelectItem>
                            <SelectItem value="6months">{t('dateRanges.6months')}</SelectItem>
                            <SelectItem value="1year">{t('dateRanges.1year')}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {isLoading ? (
                <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Card key={i}>
                                <CardHeader><Skeleton className="h-4 w-24" /></CardHeader>
                                <CardContent><Skeleton className="h-8 w-16" /></CardContent>
                            </Card>
                        ))}
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card><CardContent className="pt-6"><Skeleton className="h-52 w-full" /></CardContent></Card>
                        <Card><CardContent className="pt-6"><Skeleton className="h-52 w-full" /></CardContent></Card>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <Card key={i}>
                                <CardHeader><Skeleton className="h-4 w-24" /></CardHeader>
                                <CardContent><Skeleton className="h-8 w-16" /></CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            ) : !overview ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <BarChart3 className="mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="text-lg font-medium">{t('noData')}</p>
                    <p className="text-muted-foreground">{t('noDataDesc')}</p>
                </div>
            ) : (
                <div className="space-y-8">

                    {/* Executive Pulse */}
                    <div data-tour="analytics-pulse">
                        <h2 className="text-xl font-semibold mb-4">{t('overview.title')}</h2>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Card className={overview.projects.at_risk > 0 ? 'border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/20' : ''}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">{t('overview.atRisk')}</CardTitle>
                                    <AlertTriangle className={`h-4 w-4 ${overview.projects.at_risk > 0 ? 'text-orange-500' : 'text-muted-foreground'}`} />
                                </CardHeader>
                                <CardContent>
                                    <div className={`text-2xl font-bold ${overview.projects.at_risk > 0 ? 'text-orange-600 dark:text-orange-400' : ''}`}>
                                        {overview.projects.at_risk}
                                    </div>
                                    <p className="text-xs text-muted-foreground">{t('overview.atRiskDesc')}</p>
                                </CardContent>
                            </Card>

                            <Card className={overview.tasks.overdue > 0 ? 'border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20' : ''}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">{t('overview.overdue')}</CardTitle>
                                    <Clock className={`h-4 w-4 ${overview.tasks.overdue > 0 ? 'text-red-500' : 'text-muted-foreground'}`} />
                                </CardHeader>
                                <CardContent>
                                    <div className={`text-2xl font-bold ${overview.tasks.overdue > 0 ? 'text-red-600 dark:text-red-400' : ''}`}>
                                        {overview.tasks.overdue}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {overview.tasks.completion_rate.toFixed(0)}% {t('overview.overdueDesc')}
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">{t('overview.velocity')}</CardTitle>
                                    <Zap className="h-4 w-4 text-blue-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{overview.tasks.velocity_per_week}</div>
                                    <p className="text-xs text-muted-foreground">{t('overview.velocityDesc')}</p>
                                </CardContent>
                            </Card>

                            <Card className={overview.budget.utilization_rate > 90 ? 'border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20' : ''}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">{t('overview.budgetUtil')}</CardTitle>
                                    <DollarSign className={`h-4 w-4 ${overview.budget.utilization_rate > 90 ? 'text-amber-500' : 'text-green-500'}`} />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{overview.budget.utilization_rate}%</div>
                                    <p className="text-xs text-muted-foreground">
                                        {overview.budget.over_budget_projects > 0
                                            ? `${overview.budget.over_budget_projects} ${t('financial.overBudget')}`
                                            : t('overview.budgetUtilDesc')}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* At-Risk Projects Alert */}
                    {overview.projects.at_risk_names?.length > 0 && (
                        <Card className="border-orange-200 dark:border-orange-800">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                                    {t('atRisk.title')}
                                </CardTitle>
                                <CardDescription>{t('atRisk.desc')}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {overview.projects.at_risk_names.map((name: string) => (
                                        <Badge key={name} variant="outline" className="border-orange-300 text-orange-700 dark:border-orange-700 dark:text-orange-400">
                                            {name}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Charts */}
                    <div className="grid gap-6 md:grid-cols-2" data-tour="analytics-charts">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('trends.volunteerHours')}</CardTitle>
                                <CardDescription>{t('trends.volunteerHoursDesc')}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {hoursChartData.length > 0 ? (
                                    <ChartContainer config={hoursChartConfig} className="h-52 w-full">
                                        <AreaChart data={hoursChartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="period" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                                            <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={40} />
                                            <ChartTooltip content={<ChartTooltipContent />} />
                                            <Area
                                                type="monotone"
                                                dataKey="hours"
                                                stroke="var(--color-hours)"
                                                fill="var(--color-hours)"
                                                fillOpacity={0.15}
                                                strokeWidth={2}
                                            />
                                        </AreaChart>
                                    </ChartContainer>
                                ) : (
                                    <div className="flex h-52 items-center justify-center text-sm text-muted-foreground">{t('noData')}</div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>{t('trends.taskCompletion')}</CardTitle>
                                <CardDescription>{t('trends.taskCompletionDesc')}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {taskChartData.length > 0 ? (
                                    <ChartContainer config={taskChartConfig} className="h-52 w-full">
                                        <BarChart data={taskChartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="period" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                                            <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={30} />
                                            <ChartTooltip content={<ChartTooltipContent />} />
                                            <Bar dataKey="completed" stackId="a" fill="var(--color-completed)" radius={[0, 0, 0, 0]} />
                                            <Bar dataKey="cancelled" stackId="a" fill="var(--color-cancelled)" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ChartContainer>
                                ) : (
                                    <div className="flex h-52 items-center justify-center text-sm text-muted-foreground">{t('noData')}</div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Projects & Volunteers Detail */}
                    <div className="grid gap-6 md:grid-cols-2" data-tour="analytics-stats">
                        <div>
                            <h2 className="text-xl font-semibold mb-4">{t('projects.title')}</h2>
                            <div className="grid gap-3 sm:grid-cols-2">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">{t('projects.total')}</CardTitle>
                                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{overview.projects.total}</div>
                                        <p className="text-xs text-muted-foreground">{overview.projects.active} {t('projects.active')}</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">{t('projects.completed')}</CardTitle>
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{overview.projects.completed}</div>
                                        <p className="text-xs text-muted-foreground">{overview.projects.planning} {t('projects.planning')}</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">{t('tasks.completion')}</CardTitle>
                                        <TrendingUp className="h-4 w-4 text-blue-600" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{overview.tasks.completion_rate.toFixed(1)}%</div>
                                        <p className="text-xs text-muted-foreground">{overview.tasks.completed} / {overview.tasks.total} {t('tasks.completed')}</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">{t('tasks.inProgress')}</CardTitle>
                                        <Clock className="h-4 w-4 text-orange-600" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{overview.tasks.in_progress}</div>
                                        <p className="text-xs text-muted-foreground">{overview.tasks.not_started} {t('tasks.notStarted')}</p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold mb-4">{t('volunteers.title')}</h2>
                            <div className="grid gap-3 sm:grid-cols-2">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">{t('volunteers.active')}</CardTitle>
                                        <Users className="h-4 w-4 text-purple-600" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{overview.volunteers.active}</div>
                                        <p className="text-xs text-muted-foreground">{t('volunteers.activeDesc')}</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">{t('volunteers.newThisPeriod')}</CardTitle>
                                        <TrendingUp className="h-4 w-4 text-green-600" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{overview.volunteers.new_this_period}</div>
                                        <p className="text-xs text-muted-foreground">{t('volunteers.newThisPeriodDesc')}</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">{t('volunteers.totalHours')}</CardTitle>
                                        <Clock className="h-4 w-4 text-blue-600" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{overview.volunteers.total_hours_this_period.toLocaleString()}</div>
                                        <p className="text-xs text-muted-foreground">{t('volunteers.totalHoursDesc')}</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">{t('volunteers.avgHours')}</CardTitle>
                                        <CheckCircle className="h-4 w-4 text-teal-600" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{overview.volunteers.avg_hours_per_active_volunteer.toFixed(1)}</div>
                                        <p className="text-xs text-muted-foreground">{t('volunteers.avgHoursDesc')}</p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>

                    {/* Financial Overview */}
                    {overview.budget.projects_with_budget > 0 && (
                        <div data-tour="analytics-financial">
                            <h2 className="text-xl font-semibold mb-4">{t('financial.title')}</h2>
                            <div className="grid gap-4 md:grid-cols-3 mb-4">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">{t('financial.totalBudget')}</CardTitle>
                                        <DollarSign className="h-4 w-4 text-green-600" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">${overview.budget.total_budget.toLocaleString()}</div>
                                        <p className="text-xs text-muted-foreground">{overview.budget.projects_with_budget} {t('financial.projectsWithBudget')}</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">{t('financial.totalSpent')}</CardTitle>
                                        <DollarSign className="h-4 w-4 text-orange-600" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">${overview.budget.total_spent.toLocaleString()}</div>
                                        <p className="text-xs text-muted-foreground">{overview.budget.utilization_rate}% {t('financial.utilized')}</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">{t('financial.remaining')}</CardTitle>
                                        <TrendingUp className="h-4 w-4 text-blue-600" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">${overview.budget.remaining_budget.toLocaleString()}</div>
                                        {overview.budget.over_budget_projects > 0 && (
                                            <p className="text-xs text-red-600">{overview.budget.over_budget_projects} {t('financial.overBudget')}</p>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            {overview.budget.per_project?.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">{t('financial.perProject')}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {overview.budget.per_project.slice(0, 8).map((p: any) => (
                                            <div key={p.id} className="space-y-1">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="font-medium truncate max-w-[200px]">{p.name}</span>
                                                    <div className="flex items-center gap-2 ml-2 shrink-0">
                                                        {p.over_budget && (
                                                            <Badge variant="destructive" className="px-1.5 py-0 text-xs">{t('financial.overBudget')}</Badge>
                                                        )}
                                                        <span className="text-muted-foreground">{p.utilization_rate}%</span>
                                                    </div>
                                                </div>
                                                <Progress
                                                    value={Math.min(p.utilization_rate, 100)}
                                                    className={`h-2 ${p.over_budget ? '[&>div]:bg-red-500' : ''}`}
                                                />
                                                <div className="flex justify-between text-xs text-muted-foreground">
                                                    <span>${p.spent.toLocaleString()} {t('financial.spent')}</span>
                                                    <span>${p.budget.toLocaleString()} {t('financial.budgeted')}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
