'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth.tsx';
import { useTranslations } from 'next-intl';
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
import { Clock, CheckCircle, AlertCircle, Plus, Pencil, Trash2 } from 'lucide-react';
import { LogHoursDialog } from '@/components/volunteers/log-hours-dialog';
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

export default function MyHoursPage() {
    const { user } = useAuth();
    const t = useTranslations('Volunteer.myHours');

    // State for dialogs
    const [logHoursOpen, setLogHoursOpen] = useState(false);
    const [editTimeLogOpen, setEditTimeLogOpen] = useState(false);
    const [deleteTimeLogOpen, setDeleteTimeLogOpen] = useState(false);
    const [selectedTimeLog, setSelectedTimeLog] = useState<VolunteerTimeLog | null>(null);

    // State for filters
    const [statusFilter, setStatusFilter] = useState<string>('all');

    // Fetch hours summary
    const { data: summary, isLoading: summaryLoading } = useSWR(
        user?.id ? ['hours-summary', user.id] : null,
        () => volunteersApi.getVolunteerHoursSummary(user!.id)
    );

    // Fetch time logs
    const { data: timeLogs, isLoading: logsLoading, mutate } = useSWR(
        user?.id ? ['time-logs', user.id, statusFilter] : null,
        () => volunteersApi.getVolunteerHours(user!.id)
    );

    // Filter time logs by status
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

    // Get status badge variant
    const getStatusVariant = (approved: boolean): 'default' | 'secondary' | 'destructive' => {
        return approved ? 'default' : 'secondary';
    };

    // Loading state
    if (summaryLoading || logsLoading) {
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
                    <Button onClick={() => setLogHoursOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        {t('logHours')}
                    </Button>
                }
            />

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
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
                    value={summary?.pending_hours?.toFixed(1) || '0'}
                    icon={AlertCircle}
                    variant="orange"
                />
            </div>

            {/* Time Logs Table */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Time Logs</CardTitle>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[180px]">
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
                                                {log.project_id ? `Project ${log.project_id}` : t('table.noProject')}
                                            </TableCell>
                                            <TableCell className="max-w-[300px] truncate">
                                                {log.activity_description || t('table.noActivity')}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={getStatusVariant(log.approved)}>
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
                volunteerId={user!.id}
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
