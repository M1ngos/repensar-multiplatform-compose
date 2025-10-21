'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { projectsApi } from '@/lib/api';
import type { ProjectCreate, ProjectUpdate, ProjectDetail, ProjectCategory, ProjectStatus, ProjectPriority } from '@/lib/api/types';
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

interface ProjectFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    project?: ProjectDetail;
    onSuccess?: () => void;
}

const PROJECT_CATEGORIES: ProjectCategory[] = [
    'reforestation',
    'environmental_education',
    'waste_management',
    'conservation',
    'research',
    'community_engagement',
    'climate_action',
    'biodiversity',
    'other',
];

const PROJECT_STATUSES: ProjectStatus[] = [
    'planning',
    'in_progress',
    'suspended',
    'completed',
    'cancelled',
];

const PROJECT_PRIORITIES: ProjectPriority[] = [
    'low',
    'medium',
    'high',
    'critical',
];

export function ProjectFormDialog({ open, onOpenChange, project, onSuccess }: ProjectFormDialogProps) {
    const t = useTranslations('Projects.form');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<ProjectCategory>('reforestation');
    const [status, setStatus] = useState<ProjectStatus>('planning');
    const [priority, setPriority] = useState<ProjectPriority>('medium');
    const [startDate, setStartDate] = useState<Date | undefined>();
    const [endDate, setEndDate] = useState<Date | undefined>();
    const [budget, setBudget] = useState('');
    const [locationName, setLocationName] = useState('');
    const [requiresVolunteers, setRequiresVolunteers] = useState(false);
    const [minVolunteers, setMinVolunteers] = useState('0');
    const [maxVolunteers, setMaxVolunteers] = useState('');
    const [volunteerRequirements, setVolunteerRequirements] = useState('');

    // Load project data if editing
    useEffect(() => {
        if (project) {
            setName(project.name);
            setDescription(project.description || '');
            setCategory(project.category);
            setStatus(project.status);
            setPriority(project.priority);
            setStartDate(project.start_date ? new Date(project.start_date) : undefined);
            setEndDate(project.end_date ? new Date(project.end_date) : undefined);
            setBudget(project.budget?.toString() || '');
            setLocationName(project.location_name || '');
            setRequiresVolunteers(project.requires_volunteers);
            setMinVolunteers(project.min_volunteers.toString());
            setMaxVolunteers(project.max_volunteers?.toString() || '');
            setVolunteerRequirements(project.volunteer_requirements || '');
        } else {
            // Reset form for new project
            resetForm();
        }
    }, [project, open]);

    const resetForm = () => {
        setName('');
        setDescription('');
        setCategory('reforestation');
        setStatus('planning');
        setPriority('medium');
        setStartDate(undefined);
        setEndDate(undefined);
        setBudget('');
        setLocationName('');
        setRequiresVolunteers(false);
        setMinVolunteers('0');
        setMaxVolunteers('');
        setVolunteerRequirements('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const projectData: ProjectCreate | ProjectUpdate = {
                name,
                description: description || undefined,
                category,
                status,
                priority,
                start_date: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
                end_date: endDate ? format(endDate, 'yyyy-MM-dd') : undefined,
                budget: budget ? parseFloat(budget) : undefined,
                location_name: locationName || undefined,
                requires_volunteers: requiresVolunteers,
                min_volunteers: parseInt(minVolunteers) || 0,
                max_volunteers: maxVolunteers ? parseInt(maxVolunteers) : undefined,
                volunteer_requirements: volunteerRequirements || undefined,
            };

            if (project) {
                // Update existing project
                await projectsApi.updateProject(project.id, projectData as ProjectUpdate);
                toast.success(t('updateSuccess'));
            } else {
                // Create new project
                await projectsApi.createProject(projectData as ProjectCreate);
                toast.success(t('createSuccess'));
            }

            onOpenChange(false);
            onSuccess?.();
        } catch (error: any) {
            console.error('Error saving project:', error);
            toast.error(error.detail || t('saveError'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{project ? t('editTitle') : t('createTitle')}</DialogTitle>
                    <DialogDescription>
                        {project ? t('editDescription') : t('createDescription')}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">{t('name')} *</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder={t('namePlaceholder')}
                                required
                                maxLength={200}
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

                        <div className="grid gap-4 sm:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="category">{t('category')} *</Label>
                                <Select value={category} onValueChange={(value) => setCategory(value as ProjectCategory)}>
                                    <SelectTrigger id="category">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PROJECT_CATEGORIES.map((cat) => (
                                            <SelectItem key={cat} value={cat}>
                                                {t(`categories.${cat}`)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status">{t('status')}</Label>
                                <Select value={status} onValueChange={(value) => setStatus(value as ProjectStatus)}>
                                    <SelectTrigger id="status">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PROJECT_STATUSES.map((stat) => (
                                            <SelectItem key={stat} value={stat}>
                                                {t(`statuses.${stat}`)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="priority">{t('priority')}</Label>
                                <Select value={priority} onValueChange={(value) => setPriority(value as ProjectPriority)}>
                                    <SelectTrigger id="priority">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PROJECT_PRIORITIES.map((prio) => (
                                            <SelectItem key={prio} value={prio}>
                                                {t(`priorities.${prio}`)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
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

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="budget">{t('budget')}</Label>
                                <Input
                                    id="budget"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={budget}
                                    onChange={(e) => setBudget(e.target.value)}
                                    placeholder="0.00"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="location">{t('location')}</Label>
                                <Input
                                    id="location"
                                    value={locationName}
                                    onChange={(e) => setLocationName(e.target.value)}
                                    placeholder={t('locationPlaceholder')}
                                    maxLength={100}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Volunteer Section */}
                    <div className="space-y-4 pt-4 border-t">
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="requiresVolunteers"
                                checked={requiresVolunteers}
                                onChange={(e) => setRequiresVolunteers(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300"
                            />
                            <Label htmlFor="requiresVolunteers" className="cursor-pointer">
                                {t('requiresVolunteers')}
                            </Label>
                        </div>

                        {requiresVolunteers && (
                            <>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="minVolunteers">{t('minVolunteers')}</Label>
                                        <Input
                                            id="minVolunteers"
                                            type="number"
                                            min="0"
                                            value={minVolunteers}
                                            onChange={(e) => setMinVolunteers(e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="maxVolunteers">{t('maxVolunteers')}</Label>
                                        <Input
                                            id="maxVolunteers"
                                            type="number"
                                            min="0"
                                            value={maxVolunteers}
                                            onChange={(e) => setMaxVolunteers(e.target.value)}
                                            placeholder={t('unlimited')}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="volunteerRequirements">{t('volunteerRequirements')}</Label>
                                    <Textarea
                                        id="volunteerRequirements"
                                        value={volunteerRequirements}
                                        onChange={(e) => setVolunteerRequirements(e.target.value)}
                                        placeholder={t('volunteerRequirementsPlaceholder')}
                                        rows={2}
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            {t('cancel')}
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {project ? t('updateButton') : t('createButton')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
