'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { tasksApi } from '@/lib/api';
import type { TaskCreate, TaskUpdate, TaskDetail, TaskStatus, TaskPriority } from '@/lib/api/types';
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

interface TaskFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    task?: TaskDetail;
    projectId?: number;
    onSuccess?: () => void;
}

const TASK_STATUSES: TaskStatus[] = ['not_started', 'in_progress', 'completed', 'cancelled'];
const TASK_PRIORITIES: TaskPriority[] = ['low', 'medium', 'high', 'critical'];

export function TaskFormDialog({ open, onOpenChange, task, projectId, onSuccess }: TaskFormDialogProps) {
    const t = useTranslations('Tasks.form');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedProjectId, setSelectedProjectId] = useState('');
    const [status, setStatus] = useState<TaskStatus>('not_started');
    const [priority, setPriority] = useState<TaskPriority>('medium');
    const [startDate, setStartDate] = useState<Date | undefined>();
    const [endDate, setEndDate] = useState<Date | undefined>();
    const [estimatedHours, setEstimatedHours] = useState('');
    const [progress, setProgress] = useState('0');
    const [suitableForVolunteers, setSuitableForVolunteers] = useState(false);
    const [volunteerSpots, setVolunteerSpots] = useState('0');

    // Load task data if editing
    useEffect(() => {
        if (task) {
            setTitle(task.title);
            setDescription(task.description || '');
            setSelectedProjectId(task.project_id.toString());
            setStatus(task.status);
            setPriority(task.priority);
            setStartDate(task.start_date ? new Date(task.start_date) : undefined);
            setEndDate(task.end_date ? new Date(task.end_date) : undefined);
            setEstimatedHours(task.estimated_hours?.toString() || '');
            setProgress(task.progress_percentage.toString());
            setSuitableForVolunteers(task.suitable_for_volunteers);
            setVolunteerSpots(task.volunteer_spots.toString());
        } else {
            resetForm();
            if (projectId) {
                setSelectedProjectId(projectId.toString());
            }
        }
    }, [task, projectId, open]);

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setSelectedProjectId('');
        setStatus('not_started');
        setPriority('medium');
        setStartDate(undefined);
        setEndDate(undefined);
        setEstimatedHours('');
        setProgress('0');
        setSuitableForVolunteers(false);
        setVolunteerSpots('0');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedProjectId) {
            toast.error(t('projectRequired'));
            return;
        }

        setIsSubmitting(true);

        try {
            const taskData: TaskCreate | TaskUpdate = {
                title,
                description: description || undefined,
                project_id: parseInt(selectedProjectId),
                status,
                priority,
                start_date: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
                end_date: endDate ? format(endDate, 'yyyy-MM-dd') : undefined,
                estimated_hours: estimatedHours ? parseFloat(estimatedHours) : undefined,
                progress_percentage: parseFloat(progress) || 0,
                suitable_for_volunteers: suitableForVolunteers,
                volunteer_spots: parseInt(volunteerSpots) || 0,
            };

            if (task) {
                await tasksApi.updateTask(task.id, taskData as TaskUpdate);
                toast.success(t('updateSuccess'));
            } else {
                await tasksApi.createTask(taskData as TaskCreate);
                toast.success(t('createSuccess'));
            }

            onOpenChange(false);
            onSuccess?.();
        } catch (error: any) {
            console.error('Error saving task:', error);
            toast.error(error.detail || t('saveError'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{task ? t('editTitle') : t('createTitle')}</DialogTitle>
                    <DialogDescription>
                        {task ? t('editDescription') : t('createDescription')}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">{t('title')} *</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder={t('titlePlaceholder')}
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
                            rows={3}
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="projectId">{t('project')} *</Label>
                            <Input
                                id="projectId"
                                type="number"
                                value={selectedProjectId}
                                onChange={(e) => setSelectedProjectId(e.target.value)}
                                placeholder={t('projectIdPlaceholder')}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">{t('status')}</Label>
                            <Select value={status} onValueChange={(value) => setStatus(value as TaskStatus)}>
                                <SelectTrigger id="status">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {TASK_STATUSES.map((stat) => (
                                        <SelectItem key={stat} value={stat}>
                                            {t(`statuses.${stat}`)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="priority">{t('priority')}</Label>
                            <Select value={priority} onValueChange={(value) => setPriority(value as TaskPriority)}>
                                <SelectTrigger id="priority">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {TASK_PRIORITIES.map((prio) => (
                                        <SelectItem key={prio} value={prio}>
                                            {t(`priorities.${prio}`)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="progress">{t('progress')} (%)</Label>
                            <Input
                                id="progress"
                                type="number"
                                min="0"
                                max="100"
                                value={progress}
                                onChange={(e) => setProgress(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label>{t('startDate')}</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            'w-full justify-start text-left font-normal',
                                            !startDate && 'text-muted-foreground'
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {startDate ? format(startDate, 'PPP') : t('pickDate')}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={startDate}
                                        onSelect={setStartDate}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="space-y-2">
                            <Label>{t('endDate')}</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            'w-full justify-start text-left font-normal',
                                            !endDate && 'text-muted-foreground'
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {endDate ? format(endDate, 'PPP') : t('pickDate')}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={endDate}
                                        onSelect={setEndDate}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="estimatedHours">{t('estimatedHours')}</Label>
                        <Input
                            id="estimatedHours"
                            type="number"
                            min="0"
                            step="0.5"
                            value={estimatedHours}
                            onChange={(e) => setEstimatedHours(e.target.value)}
                            placeholder="0"
                        />
                    </div>

                    <div className="space-y-4 pt-4 border-t">
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="suitableForVolunteers"
                                checked={suitableForVolunteers}
                                onChange={(e) => setSuitableForVolunteers(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300"
                            />
                            <Label htmlFor="suitableForVolunteers" className="cursor-pointer">
                                {t('suitableForVolunteers')}
                            </Label>
                        </div>

                        {suitableForVolunteers && (
                            <div className="space-y-2">
                                <Label htmlFor="volunteerSpots">{t('volunteerSpots')}</Label>
                                <Input
                                    id="volunteerSpots"
                                    type="number"
                                    min="0"
                                    value={volunteerSpots}
                                    onChange={(e) => setVolunteerSpots(e.target.value)}
                                />
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            {t('cancel')}
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {task ? t('updateButton') : t('createButton')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
