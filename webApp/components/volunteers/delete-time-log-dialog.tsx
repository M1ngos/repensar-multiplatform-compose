'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { volunteersApi } from '@/lib/api';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import type { VolunteerTimeLog } from '@/lib/api/types';

interface DeleteTimeLogDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    timeLog: VolunteerTimeLog | null;
    onSuccess?: () => void;
}

export function DeleteTimeLogDialog({
    open,
    onOpenChange,
    timeLog,
    onSuccess
}: DeleteTimeLogDialogProps) {
    const t = useTranslations('Volunteers');
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!timeLog) return;

        setIsDeleting(true);

        try {
            await volunteersApi.deleteTimeLog(timeLog.id);
            toast.success(t('detail.timeLogDeleted') || 'Time log deleted successfully');
            onOpenChange(false);
            onSuccess?.();
        } catch (error: any) {
            console.error('Error deleting time log:', error);
            toast.error(
                error.detail ||
                error.message ||
                t('detail.timeLogDeleteError') ||
                'Failed to delete time log'
            );
        } finally {
            setIsDeleting(false);
        }
    };

    if (!timeLog) return null;

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        <AlertDialogTitle>
                            {t('detail.deleteTimeLog') || 'Delete Time Log'}
                        </AlertDialogTitle>
                    </div>
                    <AlertDialogDescription>
                        {t('detail.deleteTimeLogConfirmation') ||
                        'Are you sure you want to delete this time log? This action cannot be undone.'}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                {/* Time Log Summary */}
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                            <span className="text-muted-foreground">Date:</span>{' '}
                            <span className="font-medium">
                                {format(new Date(timeLog.date), 'PPP')}
                            </span>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Hours:</span>{' '}
                            <span className="font-medium">{timeLog.hours}</span>
                        </div>
                    </div>
                    {timeLog.project_name && (
                        <div className="text-sm">
                            <span className="text-muted-foreground">Project:</span>{' '}
                            <span className="font-medium">{timeLog.project_name}</span>
                        </div>
                    )}
                    {timeLog.task_title && (
                        <div className="text-sm">
                            <span className="text-muted-foreground">Task:</span>{' '}
                            <span className="font-medium">{timeLog.task_title}</span>
                        </div>
                    )}
                </div>

                {timeLog.approved && (
                    <div className="text-sm text-orange-600 dark:text-orange-400 flex items-center gap-2 bg-orange-50 dark:bg-orange-950/20 p-3 rounded-md">
                        <AlertTriangle className="h-4 w-4" />
                        <span>
                            This time log has been approved. Deleting it will adjust the volunteer's total hours.
                        </span>
                    </div>
                )}

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>
                        {t('detail.cancel') || 'Cancel'}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                    >
                        {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t('detail.delete') || 'Delete'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
