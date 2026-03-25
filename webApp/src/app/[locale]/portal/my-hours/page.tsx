'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth.tsx';
import { useTranslations } from 'next-intl';
import { useTour } from '@/lib/hooks/useTour';
import useSWR from 'swr';
import { volunteersApi } from '@/lib/api';
import { PageHeader } from '@/components/shared/page-header';
import { StatCard } from '@/components/shared/stat-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import { Clock, CheckCircle, AlertCircle, Plus, Pencil, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import { LogHoursDialog } from '@/components/volunteers/log-hours-dialog';
import { canManuallyLogHours } from '@/lib/permissions/timeTracking';
import { EditTimeLogDialog } from '@/components/volunteers/edit-time-log-dialog';
import { DeleteTimeLogDialog } from '@/components/volunteers/delete-time-log-dialog';
import { VolunteerTimeLog } from '@/lib/api/types';
import { format, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export default function MyHoursPage() {
    const { user } = useAuth();
    const t = useTranslations('Volunteer.myHours');
    const tTour = useTranslations('Tour.my-hours');
    const tTourCommon = useTranslations('Tour');
    const { startTour } = useTour({
        tourId: 'my-hours',
        tSteps: tTour,
        nextBtnText: tTourCommon('next'),
        prevBtnText: tTourCommon('prev'),
        doneBtnText: tTourCommon('done'),
    });

    // State for dialogs
    const [logHoursOpen, setLogHoursOpen] = useState(false);
    const [editTimeLogOpen, setEditTimeLogOpen] = useState(false);
    const [deleteTimeLogOpen, setDeleteTimeLogOpen] = useState(false);
    const [selectedTimeLog, setSelectedTimeLog] = useState<VolunteerTimeLog | null>(null);

    // State for filters
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
    const [dateTo, setDateTo] = useState<Date | undefined>(undefined);

    // Resolve volunteers.id (DB PK) from users.id — required for all volunteer API calls
    const { data: volunteerProfile } = useSWR(
        user?.id ? 'my-volunteer-profile' : null,
        () => volunteersApi.getMyVolunteerProfile()
    );

    // Fetch hours summary
    const { data: summary, isLoading: summaryLoading } = useSWR(
        volunteerProfile?.id ? ['hours-summary', volunteerProfile.id] : null,
        () => volunteersApi.getVolunteerHoursSummary(volunteerProfile!.id)
    );

    // Fetch time logs — include date range in SWR key so it refetches when dates change
    const { data: timeLogs, isLoading: logsLoading, mutate } = useSWR(
        volunteerProfile?.id ? ['time-logs', volunteerProfile.id, dateFrom?.toISOString(), dateTo?.toISOString()] : null,
        () => volunteersApi.getVolunteerHours(volunteerProfile!.id, {
            start_date: dateFrom ? format(dateFrom, 'yyyy-MM-dd') : undefined,
            end_date: dateTo ? format(dateTo, 'yyyy-MM-dd') : undefined,
        })
    );

    // Filter time logs by status (pending = not approved, approved = approved)
    // Note: rejected status is handled in approval system - currently shows as pending
    const filteredTimeLogs = timeLogs?.filter((log) => {
        if (statusFilter === 'all') return true;
        if (statusFilter === 'pending') return !log.approved;
        if (statusFilter === 'approved') return log.approved;
        return true;
    }) || [];

    // Calculate current month hours
    const currentMonthHours = timeLogs?.filter((log) => {
        const logDate = parseISO(log.date);
        const now = new Date();
        return logDate >= startOfMonth(now) && logDate <= endOfMonth(now);
    }).reduce((sum, log) => sum + log.hours, 0) || 0;

    // Handle dialog callbacks
    const handleSuccess = () => {
        mutate(); // Refresh the time logs list
    };

    const handleEdit = (timeLog: VolunteerTimeLog) => {
        setSelectedTimeLog(timeLog);
        setEditTimeLogOpen(true);
    };

    const handleDelete = (timeLog: VolunteerTimeLog) => {
        setSelectedTimeLog(timeLog);
        setDeleteTimeLogOpen(true);
    };



    // Loading state — wait for volunteer profile resolution before fetching hours
    if (!volunteerProfile || summaryLoading || logsLoading) {
        return (
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-32" />
                    ))}
                </div>
                <Skeleton className="h-96 w-full" />
            </div>
        );
    }

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <PageHeader
                title={t('title')}
                description={t('subtitle')}
                actions={
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={startTour}>
                            {tTourCommon('takeTour')}
                        </Button>
                        {canManuallyLogHours(user) && (
                            <Button onClick={() => setLogHoursOpen(true)} data-tour="log-hours-btn">
                                <Plus className="mr-2 h-4 w-4" />
                                {t('logHours')}
                            </Button>
                        )}
                    </div>
                }
            />

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3" data-tour="hours-summary">
                <StatCard
                    title={t('summary.totalHours')}
                    value={summary?.total_hours?.toFixed(1) || '0'}
                    icon={Clock}
                    variant="emerald"
                    description={`${summary?.approved_hours?.toFixed(1) || '0'} ${t('summary.approved')}`}
                />
                <StatCard
                    title={t('summary.thisMonth')}
                    value={currentMonthHours.toFixed(1)}
                    icon={CheckCircle}
                    variant="blue"
                />
                <StatCard
                    title={t('summary.pendingApproval')}
                    value={summary?.pending_hours?.toFixed(1) ?? '0.0'}
                    icon={AlertCircle}
                    variant={
                        (summary?.pending_hours ?? 0) > 0 ? 'orange' : 'default'
                    }
                    description={
                        (summary?.pending_hours ?? 0) > 0
                            ? t('summary.awaitingReview')
                            : t('summary.allApproved')
                    }
                />
            </div>

            {/* Time Logs Table */}
            <Card data-tour="hours-table">
                <CardHeader>
                    <div className="flex flex-wrap items-end gap-4">
                        <div className="flex-1 min-w-0">
                            <CardTitle>{t('timeLogs')}</CardTitle>
                        </div>
                        {/* Date From */}
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">{t('filters.from')}</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className={cn(
                                            'w-[150px] justify-start text-left font-normal',
                                            !dateFrom && 'text-muted-foreground'
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {dateFrom ? format(dateFrom, 'PP') : t('datePicker.pickDate')}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={dateFrom}
                                        onSelect={setDateFrom}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        {/* Date To */}
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">{t('filters.to')}</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className={cn(
                                            'w-[150px] justify-start text-left font-normal',
                                            !dateTo && 'text-muted-foreground'
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {dateTo ? format(dateTo, 'PP') : t('datePicker.pickDate')}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={dateTo}
                                        onSelect={setDateTo}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        {/* Status Filter */}
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[160px]">
                                <SelectValue placeholder={t('filters.status')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('filters.all')}</SelectItem>
                                <SelectItem value="pending">{t('filters.pending')}</SelectItem>
                                <SelectItem value="approved">{t('filters.approved')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    {filteredTimeLogs.length === 0 ? (
                        <Empty>
                            <EmptyHeader>
                                <EmptyTitle>{t('noHours')}</EmptyTitle>
                                <EmptyDescription>{t('noHoursDesc')}</EmptyDescription>
                            </EmptyHeader>
                        </Empty>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t('table.date')}</TableHead>
                                        <TableHead>{t('table.hours')}</TableHead>
                                        <TableHead>{t('table.project')}</TableHead>
                                        <TableHead>{t('table.task')}</TableHead>
                                        <TableHead>{t('table.activity')}</TableHead>
                                        <TableHead>{t('table.status')}</TableHead>
                                        <TableHead className="text-right">{t('table.actions')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredTimeLogs.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell className="font-medium">
                                                {format(parseISO(log.date), 'MMM dd, yyyy')}
                                            </TableCell>
                                            <TableCell>{log.hours.toFixed(1)}</TableCell>
                                            <TableCell className="max-w-[200px] truncate">
                                                {log.project_name || t('table.noProject')}
                                            </TableCell>
                                            <TableCell className="max-w-[200px] truncate">
                                                {log.task_title || '-'}
                                            </TableCell>
                                            <TableCell className="max-w-[300px] truncate">
                                                {log.activity_description || t('table.noActivity')}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={cn(
                                                        "text-xs",
                                                        log.approved
                                                            ? "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 hover:bg-emerald-100"
                                                            : "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 hover:bg-amber-100"
                                                    )}
                                                    variant="outline"
                                                >
                                                    {log.approved ? t('status.approved') : t('status.pending')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {!log.approved && (
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleEdit(log)}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleDelete(log)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Dialogs */}
            <LogHoursDialog
                open={logHoursOpen}
                onOpenChange={setLogHoursOpen}
                volunteerId={volunteerProfile!.id}
                onSuccess={handleSuccess}
            />

            <EditTimeLogDialog
                open={editTimeLogOpen}
                onOpenChange={setEditTimeLogOpen}
                timeLog={selectedTimeLog}
                onSuccess={handleSuccess}
            />

            <DeleteTimeLogDialog
                open={deleteTimeLogOpen}
                onOpenChange={setDeleteTimeLogOpen}
                timeLog={selectedTimeLog}
                onSuccess={handleSuccess}
            />
        </div>
    );
}
