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
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface AddMilestoneDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    projectId: number;
    onSuccess?: () => void;
}

const MILESTONE_STATUSES = ['pending', 'achieved', 'missed', 'cancelled'] as const;

export function AddMilestoneDialog({ open, onOpenChange, projectId, onSuccess }: AddMilestoneDialogProps) {
    const t = useTranslations('Projects.milestoneDialog');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [targetDate, setTargetDate] = useState<Date | undefined>();
    const [status, setStatus] = useState<(typeof MILESTONE_STATUSES)[number]>('pending');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !targetDate) {
            toast.error(t('requiredFields'));
            return;
        }

        setIsSubmitting(true);

        try {
            await projectsApi.createMilestone({
                project_id: projectId,
                name,
                description: description || undefined,
                target_date: format(targetDate, 'yyyy-MM-dd'),
                status: status as any,
            });

            toast.success(t('success'));
            onOpenChange(false);
            setName('');
            setDescription('');
            setTargetDate(undefined);
            setStatus('pending');
            onSuccess?.();
        } catch (error: any) {
            console.error('Error adding milestone:', error);
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
                        <Label htmlFor="name">{t('name')} *</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={t('namePlaceholder')}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">{t('description')}</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={t('descriptionPlaceholder')}
                            rows={2}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>{t('targetDate')} *</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        'w-full justify-start text-left font-normal',
                                        !targetDate && 'text-muted-foreground'
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {targetDate ? format(targetDate, 'PPP') : t('pickDate')}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={targetDate}
                                    onSelect={setTargetDate}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="status">{t('status')}</Label>
                        <Select value={status} onValueChange={(value) => setStatus(value as (typeof MILESTONE_STATUSES)[number])}>
                            <SelectTrigger id="status">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {MILESTONE_STATUSES.map((stat) => (
                                    <SelectItem key={stat} value={stat}>
                                        {t(`statuses.${stat}`)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
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
