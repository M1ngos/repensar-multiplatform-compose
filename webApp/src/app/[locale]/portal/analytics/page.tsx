'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import useSWR from 'swr';
import { TrendingUp, Users, CheckCircle, Clock, DollarSign, BarChart3 } from 'lucide-react';
import { analyticsApi } from '@/lib/api';
import { Granularity } from '@/lib/api/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { format, subDays, subMonths } from 'date-fns';

type DateRange = '7days' | '30days' | '3months' | '6months' | '1year';

export default function AnalyticsPage() {
    const t = useTranslations('Analytics');
    const [dateRange, setDateRange] = useState<DateRange>('30days');

    // Calculate date range
    const getDateRange = () => {
        const endDate = new Date();
        let startDate: Date;

        switch (dateRange) {
            case '7days':
                startDate = subDays(endDate, 7);
                break;
            case '30days':
                startDate = subDays(endDate, 30);
                break;
            case '3months':
                startDate = subMonths(endDate, 3);
                break;
            case '6months':
                startDate = subMonths(endDate, 6);
                break;
            case '1year':
                startDate = subMonths(endDate, 12);
                break;
            default:
                startDate = subDays(endDate, 30);
        }

        return {
            start_date: format(startDate, 'yyyy-MM-dd'),
            end_date: format(endDate, 'yyyy-MM-dd'),
        };
    };

    const dateParams = getDateRange();

    // Fetch analytics dashboard
    const { data: dashboard, isLoading } = useSWR(
        ['analytics-dashboard', dateParams],
        () => analyticsApi.getAnalyticsDashboard(dateParams)
    );

    // Fetch volunteer hours trends
    const { data: volunteerTrends } = useSWR(
        ['volunteer-trends', dateParams],
        () => analyticsApi.getVolunteerHoursTrends({
            ...dateParams,
            granularity: dateRange === '7days' ? Granularity.DAILY : Granularity.MONTHLY,
        })
    );

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            {/* Header */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
                    <p className="text-muted-foreground">{t('subtitle')}</p>
                </div>
                <Select value={dateRange} onValueChange={(value) => setDateRange(value as DateRange)}>
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

            {isLoading ? (
                <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Card key={i}>
                                <CardHeader>
                                    <Skeleton className="h-4 w-24" />
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-8 w-16" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            ) : !dashboard ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <BarChart3 className="mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="text-lg font-medium">{t('noData')}</p>
                    <p className="text-muted-foreground">{t('noDataDesc')}</p>
                </div>
            ) : (
                <>
                    {/* Project Metrics */}
                    <div>
                        <h2 className="text-xl font-semibold mb-4">{t('projects.title')}</h2>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        {t('projects.total')}
                                    </CardTitle>
                                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {dashboard.summary.projects.total_projects}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {dashboard.summary.projects.active_projects} {t('projects.active')}
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        {t('projects.completed')}
                                    </CardTitle>
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {dashboard.summary.projects.completed_projects}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {dashboard.summary.projects.planning_projects} {t('projects.planning')}
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        {t('tasks.completion')}
                                    </CardTitle>
                                    <TrendingUp className="h-4 w-4 text-blue-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {dashboard.summary.tasks.completion_rate.toFixed(1)}%
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {dashboard.summary.tasks.completed_tasks} / {dashboard.summary.tasks.total_tasks} {t('tasks.completed')}
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        {t('tasks.inProgress')}
                                    </CardTitle>
                                    <Clock className="h-4 w-4 text-orange-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {dashboard.summary.tasks.in_progress_tasks}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {dashboard.summary.tasks.not_started_tasks} {t('tasks.notStarted')}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Volunteer Metrics */}
                    <div>
                        <h2 className="text-xl font-semibold mb-4">{t('volunteers.title')}</h2>
                        <div className="grid gap-4 md:grid-cols-3">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        {t('volunteers.active')}
                                    </CardTitle>
                                    <Users className="h-4 w-4 text-purple-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {dashboard.summary.volunteers.active_volunteers}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {t('volunteers.activeDesc')}
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        {t('volunteers.totalHours')}
                                    </CardTitle>
                                    <Clock className="h-4 w-4 text-blue-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {dashboard.summary.volunteers.total_hours_logged.toLocaleString()}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {t('volunteers.totalHoursDesc')}
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        {t('volunteers.avgHours')}
                                    </CardTitle>
                                    <TrendingUp className="h-4 w-4 text-green-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {dashboard.summary.volunteers.avg_hours_per_volunteer.toFixed(1)}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {t('volunteers.avgHoursDesc')}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Budget Metrics (if available) */}
                    {dashboard.summary.budget && (
                        <div>
                            <h2 className="text-xl font-semibold mb-4">{t('budget.title')}</h2>
                            <div className="grid gap-4 md:grid-cols-3">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">
                                            {t('budget.total')}
                                        </CardTitle>
                                        <DollarSign className="h-4 w-4 text-green-600" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">
                                            ${dashboard.summary.budget.total_budget.toLocaleString()}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {t('budget.totalDesc')}
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">
                                            {t('budget.spent')}
                                        </CardTitle>
                                        <DollarSign className="h-4 w-4 text-orange-600" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">
                                            ${dashboard.summary.budget.total_spent.toLocaleString()}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {t('budget.spentDesc')}
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">
                                            {t('budget.utilization')}
                                        </CardTitle>
                                        <TrendingUp className="h-4 w-4 text-blue-600" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">
                                            {dashboard.summary.budget.utilization_rate.toFixed(1)}%
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {t('budget.utilizationDesc')}
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}

                    {/* Volunteer Hours Trend */}
                    {volunteerTrends && volunteerTrends.trends.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('trends.volunteerHours')}</CardTitle>
                                <CardDescription>
                                    {format(new Date(dateParams.start_date), 'MMM d, yyyy')} - {format(new Date(dateParams.end_date), 'MMM d, yyyy')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {volunteerTrends.trends.map((trend, index) => (
                                        <div key={index} className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">{trend.period}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{trend.total_hours?.toFixed(1) || 0} {t('hours')}</span>
                                                <span className="text-muted-foreground">({trend.log_count} {t('logs')})</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}
        </div>
    );
}
