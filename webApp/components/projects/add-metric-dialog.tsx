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
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AddMetricDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    projectId: number;
    onSuccess?: () => void;
}

export function AddMetricDialog({ open, onOpenChange, projectId, onSuccess }: AddMetricDialogProps) {
    const t = useTranslations('Projects.metricDialog');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [metricName, setMetricName] = useState('');
    const [metricType, setMetricType] = useState('');
    const [targetValue, setTargetValue] = useState('');
    const [currentValue, setCurrentValue] = useState('');
    const [unit, setUnit] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!metricName) {
            toast.error(t('requiredFields'));
            return;
        }

        setIsSubmitting(true);

        try {
            await projectsApi.createEnvironmentalMetric({
                project_id: projectId,
                metric_name: metricName,
                metric_type: metricType || undefined,
                target_value: targetValue ? parseFloat(targetValue) : undefined,
                current_value: currentValue ? parseFloat(currentValue) : 0,
                unit: unit || undefined,
                description: description || undefined,
            });

            toast.success(t('success'));
            onOpenChange(false);
            // Reset form
            setMetricName('');
            setMetricType('');
            setTargetValue('');
            setCurrentValue('');
            setUnit('');
            setDescription('');
            onSuccess?.();
        } catch (error: any) {
            console.error('Error adding metric:', error);
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
                        <Label htmlFor="metricName">{t('metricName')} *</Label>
                        <Input
                            id="metricName"
                            value={metricName}
                            onChange={(e) => setMetricName(e.target.value)}
                            placeholder={t('metricNamePlaceholder')}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="metricType">{t('metricType')}</Label>
                        <Input
                            id="metricType"
                            value={metricType}
                            onChange={(e) => setMetricType(e.target.value)}
                            placeholder={t('metricTypePlaceholder')}
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="space-y-2">
                            <Label htmlFor="currentValue">{t('currentValue')}</Label>
                            <Input
                                id="currentValue"
                                type="number"
                                step="0.01"
                                value={currentValue}
                                onChange={(e) => setCurrentValue(e.target.value)}
                                placeholder="0"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="targetValue">{t('targetValue')}</Label>
                            <Input
                                id="targetValue"
                                type="number"
                                step="0.01"
                                value={targetValue}
                                onChange={(e) => setTargetValue(e.target.value)}
                                placeholder="0"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="unit">{t('unit')}</Label>
                            <Input
                                id="unit"
                                value={unit}
                                onChange={(e) => setUnit(e.target.value)}
                                placeholder={t('unitPlaceholder')}
                            />
                        </div>
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
