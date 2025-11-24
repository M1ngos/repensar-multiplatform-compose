'use client';

import { useTranslations } from 'next-intl';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format, parse } from 'date-fns';
import { Calendar, Clock, Briefcase, CheckCircle2, XCircle, User, FileText } from 'lucide-react';
import type { VolunteerTimeLog } from '@/lib/api/types';

interface TimeLogDetailDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    timeLog: VolunteerTimeLog | null;
}

export function TimeLogDetailDialog({ open, onOpenChange, timeLog }: TimeLogDetailDialogProps) {
    const t = useTranslations('Volunteers');

    if (!timeLog) return null;

    const getStatusBadge = () => {
        if (timeLog.approved) {
            return (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Approved
                </Badge>
            );
        }
        return (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                <Clock className="w-3 h-3 mr-1" />
                Pending
            </Badge>
        );
    };

    const formatTime = (time?: string) => {
        if (!time) return 'Not specified';
        try {
            const parsed = parse(time, 'HH:mm:ss', new Date());
            return format(parsed, 'h:mm a');
        } catch {
            return time;
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle>{t('detail.timeLogDetails') || 'Time Log Details'}</DialogTitle>
                        {getStatusBadge()}
                    </div>
                    <DialogDescription>
                        {t('detail.viewTimeLogDetails') || 'View detailed information about this time log entry'}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Basic Information */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center text-sm text-muted-foreground">
                                <Calendar className="w-4 h-4 mr-2" />
                                Date
                            </div>
                            <p className="text-base font-medium">
                                {format(new Date(timeLog.date), 'PPP')}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center text-sm text-muted-foreground">
                                <Clock className="w-4 h-4 mr-2" />
                                Hours Logged
                            </div>
                            <p className="text-base font-medium">
                                {timeLog.hours} {timeLog.hours === 1 ? 'hour' : 'hours'}
                            </p>
                        </div>
                    </div>

                    {/* Time Range */}
                    {(timeLog.start_time || timeLog.end_time) && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Clock className="w-4 h-4 mr-2" />
                                    Start Time
                                </div>
                                <p className="text-base">{formatTime(timeLog.start_time)}</p>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Clock className="w-4 h-4 mr-2" />
                                    End Time
                                </div>
                                <p className="text-base">{formatTime(timeLog.end_time)}</p>
                            </div>
                        </div>
                    )}

                    <Separator />

                    {/* Project and Task */}
                    {(timeLog.project_name || timeLog.task_title) && (
                        <>
                            <div className="space-y-3">
                                {timeLog.project_name && (
                                    <div className="space-y-1">
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <Briefcase className="w-4 h-4 mr-2" />
                                            Project
                                        </div>
                                        <p className="text-base font-medium">{timeLog.project_name}</p>
                                    </div>
                                )}
                                {timeLog.task_title && (
                                    <div className="space-y-1">
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <FileText className="w-4 h-4 mr-2" />
                                            Task
                                        </div>
                                        <p className="text-base">{timeLog.task_title}</p>
                                    </div>
                                )}
                            </div>
                            <Separator />
                        </>
                    )}

                    {/* Activity Description */}
                    {timeLog.activity_description && (
                        <>
                            <div className="space-y-2">
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <FileText className="w-4 h-4 mr-2" />
                                    Activity Description
                                </div>
                                <p className="text-sm leading-relaxed text-foreground bg-muted/50 p-3 rounded-md">
                                    {timeLog.activity_description}
                                </p>
                            </div>
                            <Separator />
                        </>
                    )}

                    {/* Supervisor */}
                    {timeLog.supervisor_name && (
                        <>
                            <div className="space-y-1">
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <User className="w-4 h-4 mr-2" />
                                    Supervisor
                                </div>
                                <p className="text-base">{timeLog.supervisor_name}</p>
                            </div>
                            <Separator />
                        </>
                    )}

                    {/* Approval Information */}
                    {timeLog.approved && (
                        <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4 space-y-2">
                            <div className="flex items-center text-green-700 dark:text-green-400 font-medium">
                                <CheckCircle2 className="w-5 h-5 mr-2" />
                                Approved
                            </div>
                            {timeLog.approved_by_name && (
                                <p className="text-sm text-muted-foreground">
                                    Approved by: <span className="font-medium text-foreground">{timeLog.approved_by_name}</span>
                                </p>
                            )}
                            {timeLog.approved_at && (
                                <p className="text-sm text-muted-foreground">
                                    Approved on: {format(new Date(timeLog.approved_at), 'PPP')}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Metadata */}
                    <div className="border-t pt-4 space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground">Metadata</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                                <span className="text-muted-foreground">Created:</span>{' '}
                                <span className="text-foreground">
                                    {format(new Date(timeLog.created_at), 'PPP')}
                                </span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Last Updated:</span>{' '}
                                <span className="text-foreground">
                                    {format(new Date(timeLog.updated_at), 'PPP')}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
