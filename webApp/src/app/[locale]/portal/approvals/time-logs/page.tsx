'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import useSWR from 'swr';
import { volunteersApi, projectsApi } from '@/lib/api';
import { useAuth } from '@/lib/hooks/useAuth';
import { canAccessApprovalQueue } from '@/lib/permissions/timeTracking';
import { Unauthorized } from '@/components/unauthorized';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Clock, Filter, CheckCircle2, XCircle, Eye, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { ApprovalModal } from '@/components/volunteers/approval-modal';
import { TimeLogDetailDialog } from '@/components/volunteers/time-log-detail-dialog';
import type { VolunteerTimeLog } from '@/lib/api/types';

export default function TimeLogsApprovalPage() {
    const t = useTranslations('Approvals');
    const { user, isAuthLoading } = useAuth();

    // Filters state (must declare all hooks before conditional returns)
    const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
    const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
    const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
    const [searchQuery, setSearchQuery] = useState('');

    // Selection state
    const [selectedTimeLogIds, setSelectedTimeLogIds] = useState<Set<number>>(new Set());

    // Modal state
    const [approvalModalOpen, setApprovalModalOpen] = useState(false);
    const [selectedTimeLog, setSelectedTimeLog] = useState<VolunteerTimeLog | null>(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);

    // Batch processing
    const [isBatchProcessing, setIsBatchProcessing] = useState(false);

    // Fetch pending time logs (simplified - in reality you'd need a dedicated endpoint)
    const { data: volunteers } = useSWR('volunteers', () =>
        volunteersApi.getVolunteers({ limit: 100 })
    );

    // Fetch projects for filter
    const { data: projects } = useSWR('projects', () =>
        projectsApi.getProjects({ limit: 100 })
    );

    // Fetch all pending time logs for all volunteers
    const pendingTimeLogsPromises = volunteers?.items?.map(v =>
        volunteersApi.getVolunteerHours(v.id, {
            approved_only: false,
            start_date: dateFrom ? format(dateFrom, 'yyyy-MM-dd') : undefined,
            end_date: dateTo ? format(dateTo, 'yyyy-MM-dd') : undefined,
        })
    ) || [];

    const { data: allPendingTimeLogs, mutate: refreshTimeLogs } = useSWR(
        volunteers ? ['pending-time-logs', dateFrom, dateTo] : null,
        async () => {
            const results = await Promise.all(pendingTimeLogsPromises);
            return results.flat().filter(log => !log.approved);
        }
    );

    // Filter time logs
    const filteredTimeLogs = allPendingTimeLogs?.filter(log => {
        if (selectedProjectId && log.project_id !== selectedProjectId) return false;
        if (searchQuery && !log.project_name?.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !log.task_title?.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !log.activity_description?.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
        }
        return true;
    }) || [];

    // Permission check - show loading or unauthorized AFTER all hooks
    if (isAuthLoading) {
        return (
            <div className="container mx-auto p-6 flex items-center justify-center min-h-[50vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    if (!canAccessApprovalQueue(user)) {
        return (
            <Unauthorized
                title="Approval Queue Access Required"
                description="This page is only accessible to supervisors, project managers, and administrators. Volunteers cannot access the approval queue."
            />
        );
    }

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedTimeLogIds(new Set(filteredTimeLogs.map(log => log.id)));
        } else {
            setSelectedTimeLogIds(new Set());
        }
    };

    const handleSelectTimeLog = (timeLogId: number, checked: boolean) => {
        const newSelection = new Set(selectedTimeLogIds);
        if (checked) {
            newSelection.add(timeLogId);
        } else {
            newSelection.delete(timeLogId);
        }
        setSelectedTimeLogIds(newSelection);
    };

    const handleBatchApprove = async () => {
        if (selectedTimeLogIds.size === 0) {
            toast.error('Please select time logs to approve');
            return;
        }

        setIsBatchProcessing(true);

        try {
            const promises = Array.from(selectedTimeLogIds).map(id =>
                volunteersApi.approveTimeLog(id, { approved: true })
            );
            await Promise.all(promises);

            toast.success(`${selectedTimeLogIds.size} time log(s) approved successfully`);
            setSelectedTimeLogIds(new Set());
            refreshTimeLogs();
        } catch (error: any) {
            console.error('Error batch approving:', error);
            toast.error(error.detail || error.message || 'Failed to approve time logs');
        } finally {
            setIsBatchProcessing(false);
        }
    };

    const handleViewDetails = (timeLog: VolunteerTimeLog) => {
        setSelectedTimeLog(timeLog);
        setDetailModalOpen(true);
    };

    const handleApproveReject = (timeLog: VolunteerTimeLog) => {
        setSelectedTimeLog(timeLog);
        setApprovalModalOpen(true);
    };

    const handleApprovalSuccess = () => {
        refreshTimeLogs();
        setSelectedTimeLog(null);
    };

    const clearFilters = () => {
        setSelectedProjectId(null);
        setDateFrom(undefined);
        setDateTo(undefined);
        setSearchQuery('');
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Time Log Approvals</h1>
                    <p className="text-muted-foreground">
                        Review and approve volunteer time logs
                    </p>
                </div>
                <Badge variant="outline" className="text-lg px-4 py-2">
                    <Clock className="w-4 h-4 mr-2" />
                    {filteredTimeLogs.length} Pending
                </Badge>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="w-5 h-5" />
                        Filters
                    </CardTitle>
                    <CardDescription>Filter time logs by project and date range</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Project Filter */}
                        <div className="space-y-2">
                            <Label>Project</Label>
                            <Select
                                value={selectedProjectId?.toString() || 'all'}
                                onValueChange={(value) => setSelectedProjectId(value === 'all' ? null : parseInt(value))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All Projects" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Projects</SelectItem>
                                    {projects?.map((project) => (
                                        <SelectItem key={project.id} value={project.id.toString()}>
                                            {project.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Date From */}
                        <div className="space-y-2">
                            <Label>From Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            'w-full justify-start text-left font-normal',
                                            !dateFrom && 'text-muted-foreground'
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {dateFrom ? format(dateFrom, 'PP') : 'Pick a date'}
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
                        <div className="space-y-2">
                            <Label>To Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            'w-full justify-start text-left font-normal',
                                            !dateTo && 'text-muted-foreground'
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {dateTo ? format(dateTo, 'PP') : 'Pick a date'}
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

                        {/* Search */}
                        <div className="space-y-2">
                            <Label>Search</Label>
                            <Input
                                placeholder="Search description..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button variant="outline" onClick={clearFilters}>
                            Clear Filters
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Batch Actions */}
            {selectedTimeLogIds.size > 0 && (
                <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                    <span className="font-medium">
                        {selectedTimeLogIds.size} selected
                    </span>
                    <Button
                        onClick={handleBatchApprove}
                        disabled={isBatchProcessing}
                        size="sm"
                    >
                        {isBatchProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Approve Selected
                    </Button>
                </div>
            )}

            {/* Time Logs Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Pending Time Logs</CardTitle>
                    <CardDescription>
                        {filteredTimeLogs.length} time log(s) awaiting approval
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {filteredTimeLogs.length === 0 ? (
                        <div className="text-center py-12">
                            <CheckCircle2 className="w-12 h-12 mx-auto text-green-500 mb-4" />
                            <h3 className="text-lg font-medium mb-2">All Caught Up!</h3>
                            <p className="text-muted-foreground">
                                No pending time logs to review
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">
                                            <Checkbox
                                                checked={selectedTimeLogIds.size === filteredTimeLogs.length && filteredTimeLogs.length > 0}
                                                onCheckedChange={handleSelectAll}
                                            />
                                        </TableHead>
                                        <TableHead>Volunteer</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Hours</TableHead>
                                        <TableHead>Project</TableHead>
                                        <TableHead>Task</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredTimeLogs.map((timeLog) => (
                                        <TableRow key={timeLog.id}>
                                            <TableCell>
                                                <Checkbox
                                                    checked={selectedTimeLogIds.has(timeLog.id)}
                                                    onCheckedChange={(checked) => handleSelectTimeLog(timeLog.id, checked as boolean)}
                                                />
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                Volunteer #{timeLog.volunteer_id}
                                            </TableCell>
                                            <TableCell>
                                                {format(new Date(timeLog.date), 'PP')}
                                            </TableCell>
                                            <TableCell>{timeLog.hours}h</TableCell>
                                            <TableCell>
                                                {timeLog.project_name || '-'}
                                            </TableCell>
                                            <TableCell>
                                                {timeLog.task_title || '-'}
                                            </TableCell>
                                            <TableCell className="max-w-xs truncate">
                                                {timeLog.activity_description || '-'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleViewDetails(timeLog)}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleApproveReject(timeLog)}
                                                    >
                                                        Review
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Modals */}
            {selectedTimeLog && (
                <>
                    <TimeLogDetailDialog
                        open={detailModalOpen}
                        onOpenChange={setDetailModalOpen}
                        timeLog={selectedTimeLog}
                    />
                    <ApprovalModal
                        open={approvalModalOpen}
                        onOpenChange={setApprovalModalOpen}
                        timeLog={selectedTimeLog}
                        onSuccess={handleApprovalSuccess}
                    />
                </>
            )}
        </div>
    );
}
