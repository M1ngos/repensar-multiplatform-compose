'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import useSWR from 'swr';
import { volunteersApi, projectsApi } from '@/lib/api';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Loader2, Check, ChevronsUpDown } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';

interface LogHoursDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    volunteerId: number;
    onSuccess?: () => void;
}

export function LogHoursDialog({ open, onOpenChange, volunteerId, onSuccess }: LogHoursDialogProps) {
    const t = useTranslations('Volunteers');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [date, setDate] = useState<Date>(new Date());
    const [hours, setHours] = useState('');
    const [activityDescription, setActivityDescription] = useState('');
    const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
    const [openProjectCombobox, setOpenProjectCombobox] = useState(false);
    const [projectSearchQuery, setProjectSearchQuery] = useState('');

    // Fetch projects for selection
    const { data: projects } = useSWR(
        open ? ['projects', projectSearchQuery] : null,
        () => projectsApi.getProjects({ search: projectSearchQuery, limit: 50 })
    );

    const selectedProject = projects?.find(p => p.id === selectedProjectId);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!hours || parseFloat(hours) <= 0) {
            toast.error(t('detail.hoursRequired') || 'Please enter valid hours');
            return;
        }

        setIsSubmitting(true);

        try {
            await volunteersApi.logVolunteerHours(volunteerId, {
                date: format(date, 'yyyy-MM-dd'),
                hours: parseFloat(hours),
                activity_description: activityDescription || undefined,
                project_id: selectedProjectId || undefined,
                volunteer_id: volunteerId,
            });

            toast.success(t('detail.hoursLogged') || 'Hours logged successfully!');
            onOpenChange(false);
            setHours('');
            setActivityDescription('');
            setSelectedProjectId(null);
            setProjectSearchQuery('');
            setDate(new Date());
            onSuccess?.();
        } catch (error: any) {
            console.error('Error logging hours:', error);
            toast.error(error.detail || error.message || t('detail.hoursLogError') || 'Failed to log hours');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('detail.logHours')}</DialogTitle>
                    <DialogDescription>
                        {t('detail.logHoursDescription') || 'Log volunteer hours for this period'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>{t('detail.date') || 'Date'} *</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        'w-full justify-start text-left font-normal',
                                        !date && 'text-muted-foreground'
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date ? format(date, 'PPP') : t('detail.pickDate') || 'Pick a date'}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={(newDate) => newDate && setDate(newDate)}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="hours">{t('detail.hours') || 'Hours'} *</Label>
                        <Input
                            id="hours"
                            type="number"
                            min="0"
                            step="0.5"
                            value={hours}
                            onChange={(e) => setHours(e.target.value)}
                            placeholder="8.0"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>{t('detail.project') || 'Project'}</Label>
                        <Popover open={openProjectCombobox} onOpenChange={setOpenProjectCombobox}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={openProjectCombobox}
                                    className="w-full justify-between"
                                >
                                    {selectedProject ? (
                                        <span className="truncate">{selectedProject.name}</span>
                                    ) : (
                                        <span className="text-muted-foreground">
                                            {t('detail.searchProject') || 'Optional - select project...'}
                                        </span>
                                    )}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0" align="start">
                                <Command>
                                    <CommandInput
                                        placeholder={t('detail.searchProjectPlaceholder') || 'Search projects...'}
                                        value={projectSearchQuery}
                                        onValueChange={setProjectSearchQuery}
                                    />
                                    <CommandList>
                                        <CommandEmpty>{t('detail.noProjectsFound') || 'No projects found.'}</CommandEmpty>
                                        <CommandGroup>
                                            {projects?.map((project) => (
                                                <CommandItem
                                                    key={project.id}
                                                    value={project.name}
                                                    onSelect={() => {
                                                        setSelectedProjectId(project.id);
                                                        setOpenProjectCombobox(false);
                                                    }}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            selectedProjectId === project.id ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{project.name}</span>
                                                        <span className="text-xs text-muted-foreground capitalize">
                                                            {project.category.replace(/_/g, ' ')} • {project.status.replace(/_/g, ' ')}
                                                        </span>
                                                    </div>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="activity">{t('detail.activity') || 'Activity Description'}</Label>
                        <Textarea
                            id="activity"
                            value={activityDescription}
                            onChange={(e) => setActivityDescription(e.target.value)}
                            placeholder={t('detail.activityPlaceholder') || 'What did you work on...'}
                            rows={3}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            {t('detail.cancel')}
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t('detail.logHoursButton') || 'Log Hours'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
