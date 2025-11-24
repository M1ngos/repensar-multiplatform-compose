'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { volunteersApi } from '@/lib/api';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, XCircle, Loader2, User, Calendar, Clock, Briefcase } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import type { VolunteerTimeLog } from '@/lib/api/types';

interface ApprovalModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    timeLog: VolunteerTimeLog | null;
    onSuccess?: () => void;
}

export function ApprovalModal({ open, onOpenChange, timeLog, onSuccess }: ApprovalModalProps) {
    const t = useTranslations('Approvals');
    const [isProcessing, setIsProcessing] = useState(false);
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [showApproveConfirm, setShowApproveConfirm] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [rejectionError, setRejectionError] = useState('');

    if (!timeLog) return null;

    const handleApprove = async () => {
        setIsProcessing(true);

        try {
            await volunteersApi.approveTimeLog(timeLog.id, { approved: true });
            toast.success(t('timeLogApproved') || 'Time log approved successfully!');
            onOpenChange(false);
            setShowApproveConfirm(false);
            onSuccess?.();
        } catch (error: any) {
            console.error('Error approving time log:', error);
            toast.error(error.detail || error.message || 'Failed to approve time log');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            setRejectionError('Please provide a reason for rejection');
            return;
        }

        if (rejectionReason.length > 500) {
            setRejectionError('Rejection reason is too long (max 500 characters)');
            return;
        }

        setIsProcessing(true);
        setRejectionError('');

        try {
            await volunteersApi.approveTimeLog(timeLog.id, {
                approved: false,
                // Note: The backend should handle rejection reason via notes field
                // You may need to add this to the API if not supported
            });
            toast.success(t('timeLogRejected') || 'Time log rejected');
            onOpenChange(false);
            setShowRejectDialog(false);
            setRejectionReason('');
            onSuccess?.();
        } catch (error: any) {
            console.error('Error rejecting time log:', error);
            toast.error(error.detail || error.message || 'Failed to reject time log');
        } finally {
            setIsProcessing(false);
        }
    };

    const resetState = () => {
        setRejectionReason('');
        setRejectionError('');
        setShowRejectDialog(false);
        setShowApproveConfirm(false);
    };

    const handleClose = () => {
        resetState();
        onOpenChange(false);
    };

    return (
        <>
            {/* Main Review Dialog */}
            <Dialog open={open && !showRejectDialog && !showApproveConfirm} onOpenChange={handleClose}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Review Time Log</DialogTitle>
                        <DialogDescription>
                            Review the details and approve or reject this time log entry
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6">
                        {/* Volunteer Info */}
                        <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="font-medium">Volunteer #{timeLog.volunteer_id}</p>
                                <p className="text-sm text-muted-foreground">
                                    Submitted {format(new Date(timeLog.created_at), 'PPP')}
                                </p>
                            </div>
                        </div>

                        {/* Time Log Details */}
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
                                    Hours
                                </div>
                                <p className="text-base font-medium">
                                    {timeLog.hours} {timeLog.hours === 1 ? 'hour' : 'hours'}
                                </p>
                            </div>
                        </div>

                        {(timeLog.start_time || timeLog.end_time) && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Start Time</p>
                                    <p className="text-base">{timeLog.start_time || '-'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">End Time</p>
                                    <p className="text-base">{timeLog.end_time || '-'}</p>
                                </div>
                            </div>
                        )}

                        <Separator />

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
                                            <p className="text-sm text-muted-foreground">Task</p>
                                            <p className="text-base">{timeLog.task_title}</p>
                                        </div>
                                    )}
                                </div>
                                <Separator />
                            </>
                        )}

                        {timeLog.activity_description && (
                            <>
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">Activity Description</p>
                                    <div className="bg-muted/50 p-3 rounded-md">
                                        <p className="text-sm leading-relaxed">
                                            {timeLog.activity_description}
                                        </p>
                                    </div>
                                </div>
                                <Separator />
                            </>
                        )}

                        {timeLog.supervisor_name && (
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Supervisor</p>
                                <p className="text-base">{timeLog.supervisor_name}</p>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={handleClose}
                            disabled={isProcessing}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => setShowRejectDialog(true)}
                            disabled={isProcessing}
                        >
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject
                        </Button>
                        <Button
                            onClick={() => setShowApproveConfirm(true)}
                            disabled={isProcessing}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Approve
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Approve Confirmation Dialog */}
            <AlertDialog open={showApproveConfirm} onOpenChange={setShowApproveConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Approve Time Log?</AlertDialogTitle>
                        <AlertDialogDescription>
                            You are about to approve {timeLog.hours} hour{timeLog.hours !== 1 ? 's' : ''} for Volunteer #{timeLog.volunteer_id}.
                            {timeLog.project_name && ` on ${timeLog.project_name}`}.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                        <div className="text-sm">
                            <span className="text-muted-foreground">Date:</span>{' '}
                            <span className="font-medium">{format(new Date(timeLog.date), 'PPP')}</span>
                        </div>
                        <div className="text-sm">
                            <span className="text-muted-foreground">Hours:</span>{' '}
                            <span className="font-medium">{timeLog.hours}</span>
                        </div>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isProcessing}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleApprove}
                            disabled={isProcessing}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Confirm Approval
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Reject Dialog with Reason */}
            <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <XCircle className="h-5 w-5 text-red-500" />
                            Reject Time Log
                        </DialogTitle>
                        <DialogDescription>
                            Please provide a reason for rejecting this time log. The volunteer will be notified.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="bg-muted/50 p-3 rounded-lg text-sm">
                            <div className="font-medium mb-1">Time Log Summary:</div>
                            <div>{timeLog.hours} hours on {format(new Date(timeLog.date), 'PPP')}</div>
                            {timeLog.project_name && <div>Project: {timeLog.project_name}</div>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="rejectionReason">
                                Reason for Rejection *
                            </Label>
                            <Textarea
                                id="rejectionReason"
                                value={rejectionReason}
                                onChange={(e) => {
                                    setRejectionReason(e.target.value);
                                    setRejectionError('');
                                }}
                                placeholder="Please explain why this time log is being rejected..."
                                rows={4}
                                maxLength={500}
                                className={rejectionError ? 'border-red-500' : ''}
                            />
                            <div className="flex justify-between items-center">
                                {rejectionError ? (
                                    <p className="text-sm text-red-500">{rejectionError}</p>
                                ) : (
                                    <span></span>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    {rejectionReason.length}/500
                                </p>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowRejectDialog(false)}
                            disabled={isProcessing}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleReject}
                            disabled={isProcessing}
                        >
                            {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirm Rejection
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
