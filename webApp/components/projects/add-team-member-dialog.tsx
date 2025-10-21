'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { projectsApi } from '@/lib/api';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AddTeamMemberDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    projectId: number;
    onSuccess?: () => void;
}

export function AddTeamMemberDialog({ open, onOpenChange, projectId, onSuccess }: AddTeamMemberDialogProps) {
    const t = useTranslations('Projects.teamDialog');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [userId, setUserId] = useState('');
    const [role, setRole] = useState('');
    const [isVolunteer, setIsVolunteer] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!userId) {
            toast.error(t('userIdRequired'));
            return;
        }

        setIsSubmitting(true);

        try {
            await projectsApi.addTeamMember(projectId, {
                user_id: parseInt(userId),
                role: role || undefined,
                is_volunteer: isVolunteer,
            });

            toast.success(t('success'));
            onOpenChange(false);
            setUserId('');
            setRole('');
            setIsVolunteer(false);
            onSuccess?.();
        } catch (error: any) {
            console.error('Error adding team member:', error);
            toast.error(error.detail || t('error'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('title')}</DialogTitle>
                    <DialogDescription>{t('description')}</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="userId">{t('userId')} *</Label>
                        <Input
                            id="userId"
                            type="number"
                            value={userId}
                            onChange={(e) => setUserId(e.target.value)}
                            placeholder={t('userIdPlaceholder')}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="role">{t('role')}</Label>
                        <Input
                            id="role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            placeholder={t('rolePlaceholder')}
                        />
                    </div>

                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="isVolunteer"
                            checked={isVolunteer}
                            onChange={(e) => setIsVolunteer(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300"
                        />
                        <Label htmlFor="isVolunteer" className="cursor-pointer">
                            {t('isVolunteer')}
                        </Label>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            {t('cancel')}
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t('addButton')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
