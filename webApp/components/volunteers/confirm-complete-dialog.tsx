'use client';

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
import { CheckCircle, Clock } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ConfirmCompleteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    taskTitle: string;
    /** Formatted elapsed time to display, e.g. "01:23:45" */
    elapsed: string | null;
    onConfirm: () => void;
}

export function ConfirmCompleteDialog({
    open,
    onOpenChange,
    taskTitle,
    elapsed,
    onConfirm,
}: ConfirmCompleteDialogProps) {
    const t = useTranslations('Volunteer.myTasks');

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        {t('confirmComplete.title')}
                    </AlertDialogTitle>
                    <AlertDialogDescription asChild>
                        <div className="space-y-3">
                            <p>{t('confirmComplete.description', { task: taskTitle })}</p>
                            {elapsed && (
                                <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-sm font-medium">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">{t('confirmComplete.timeLogged')}:</span>
                                    <span className="font-mono">{elapsed}</span>
                                </div>
                            )}
                            <p className="text-xs text-muted-foreground">{t('confirmComplete.approvalNote')}</p>
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{t('confirmComplete.cancel')}</AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        {t('confirmComplete.confirm')}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
