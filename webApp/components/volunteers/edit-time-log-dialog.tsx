'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import useSWR from 'swr';
import { volunteersApi, projectsApi, tasksApi, usersApi } from '@/lib/api';
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
import { Calendar as CalendarIcon, Loader2, Check, ChevronsUpDown, Clock } from 'lucide-react';
import { format, isFuture, parse, differenceInMinutes } from 'date-fns';
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
import type { VolunteerTimeLog } from '@/lib/api/types';

interface EditTimeLogDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    timeLog: VolunteerTimeLog | null;
    onSuccess?: () => void;
}

export function EditTimeLogDialog({ open, onOpenChange, timeLog, onSuccess }: EditTimeLogDialogProps) {
    const t = useTranslations('Volunteers');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [date, setDate] = useState<Date>(new Date());
    const [hours, setHours] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [activityDescription, setActivityDescription] = useState('');
    const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
    const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
    const [selectedSupervisorId, setSelectedSupervisorId] = useState<number | null>(null);
    const [openProjectCombobox, setOpenProjectCombobox] = useState(false);
    const [openTaskCombobox, setOpenTaskCombobox] = useState(false);
    const [openSupervisorCombobox, setOpenSupervisorCombobox] = useState(false);
    const [projectSearchQuery, setProjectSearchQuery] = useState('');
    const [taskSearchQuery, setTaskSearchQuery] = useState('');
    const [supervisorSearchQuery, setSupervisorSearchQuery] = useState('');
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    // Pre-fill form when timeLog changes
    useEffect(() => {
        if (timeLog && open) {
            setDate(new Date(timeLog.date));
            setHours(timeLog.hours.toString());
            setStartTime(timeLog.start_time?.substring(0, 5) || ''); // HH:MM format
            setEndTime(timeLog.end_time?.substring(0, 5) || '');
            setActivityDescription(timeLog.activity_description || '');
            setSelectedProjectId(timeLog.project_id || null);
            setSelectedTaskId(timeLog.task_id || null);
            setSelectedSupervisorId(timeLog.supervisor_id || null);
        }
    }, [timeLog, open]);

    // Fetch projects for selection
    const { data: projects } = useSWR(
        open ? ['projects', projectSearchQuery] : null,
        () => projectsApi.getProjects({ search: projectSearchQuery, limit: 50 })
    );

    // Fetch tasks filtered by selected project
    const { data: tasks } = useSWR(
        open && selectedProjectId ? ['tasks', selectedProjectId, taskSearchQuery] : null,
        () => tasksApi.getTasks({
            project_id: selectedProjectId!,
            search: taskSearchQuery,
            limit: 50
        })
    );

    // Fetch users for supervisor selection
    const { data: supervisorsData } = useSWR(
        open ? ['supervisors', supervisorSearchQuery] : null,
        () => usersApi.getUsers({
            search: supervisorSearchQuery,
            page_size: 50
        })
    );

    const selectedProject = projects?.find(p => p.id === selectedProjectId);
    const selectedTask = tasks?.find(t => t.id === selectedTaskId);
    const selectedSupervisor = supervisorsData?.items?.find(u => u.id === selectedSupervisorId);

    // Reset task selection when project changes
    useEffect(() => {
        if (selectedTaskId && !selectedProjectId) {
            setSelectedTaskId(null);
        }
    }, [selectedProjectId, selectedTaskId]);

    // Auto-calculate hours from start and end time
    useEffect(() => {
        if (startTime && endTime) {
            try {
                const start = parse(startTime, 'HH:mm', new Date());
                const end = parse(endTime, 'HH:mm', new Date());
                const minutes = differenceInMinutes(end, start);
                if (minutes > 0) {
                    const calculatedHours = (minutes / 60).toFixed(2);
                    setHours(calculatedHours);
                }
            } catch (error) {
                // Invalid time format, ignore
            }
        }
    }, [startTime, endTime]);

    // Validation function
    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        // Date validation
        if (isFuture(date)) {
            errors.date = 'Date cannot be in the future';
        }

        // Hours validation
        const hoursValue = parseFloat(hours);
        if (!hours || isNaN(hoursValue)) {
            errors.hours = 'Hours is required';
        } else if (hoursValue <= 0) {
            errors.hours = 'Hours must be greater than 0';
        } else if (hoursValue > 24) {
            errors.hours = 'Hours cannot exceed 24';
        } else if (hoursValue < 0.25) {
            errors.hours = 'Minimum hours is 0.25 (15 minutes)';
        }

        // Time validation
        if (startTime && endTime) {
            try {
                const start = parse(startTime, 'HH:mm', new Date());
                const end = parse(endTime, 'HH:mm', new Date());
                if (end <= start) {
                    errors.endTime = 'End time must be after start time';
                }
            } catch (error) {
                errors.endTime = 'Invalid time format';
            }
        }

        // Activity description length validation
        if (activityDescription && activityDescription.length > 1000) {
            errors.activityDescription = 'Description too long (max 1000 characters)';
        }

        // Task requires project
        if (selectedTaskId && !selectedProjectId) {
            errors.task = 'Please select a project first';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!timeLog) return;

        // Validate form
        if (!validateForm()) {
            toast.error('Please fix the errors in the form');
            return;
        }

        setIsSubmitting(true);

        try {
            await volunteersApi.updateTimeLog(timeLog.id, {
                date: format(date, 'yyyy-MM-dd'),
                hours: parseFloat(hours),
                start_time: startTime || undefined,
                end_time: endTime || undefined,
                activity_description: activityDescription || undefined,
                project_id: selectedProjectId || undefined,
                task_id: selectedTaskId || undefined,
                supervisor_id: selectedSupervisorId || undefined,
            });

            toast.success(t('detail.timeLogUpdated') || 'Time log updated successfully!');
            onOpenChange(false);
            onSuccess?.();
        } catch (error: any) {
            console.error('Error updating time log:', error);
            toast.error(error.detail || error.message || t('detail.timeLogUpdateError') || 'Failed to update time log');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!timeLog) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{t('detail.editTimeLog') || 'Edit Time Log'}</DialogTitle>
                    <DialogDescription>
                        {t('detail.editTimeLogDescription') || 'Update the details of this time log entry'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Date Field */}
                    <div className="space-y-2">
                        <Label>{t('detail.date') || 'Date'} *</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        'w-full justify-start text-left font-normal',
                                        !date && 'text-muted-foreground',
                                        validationErrors.date && 'border-red-500'
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
                                    disabled={(date) => isFuture(date)}
                                />
                            </PopoverContent>
                        </Popover>
                        {validationErrors.date && (
                            <p className="text-sm text-red-500">{validationErrors.date}</p>
                        )}
                    </div>

                    {/* Hours Field */}
                    <div className="space-y-2">
                        <Label htmlFor="hours">{t('detail.hours') || 'Hours'} *</Label>
                        <Input
                            id="hours"
                            type="number"
                            min="0.25"
                            max="24"
                            step="0.25"
                            value={hours}
                            onChange={(e) => {
                                setHours(e.target.value);
                                if (validationErrors.hours) {
                                    setValidationErrors(prev => ({ ...prev, hours: '' }));
                                }
                            }}
                            placeholder="8.0"
                            className={cn(validationErrors.hours && 'border-red-500')}
                            required
                        />
                        {validationErrors.hours && (
                            <p className="text-sm text-red-500">{validationErrors.hours}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                            Minimum: 0.25 hours (15 minutes), Maximum: 24 hours
                        </p>
                    </div>

                    {/* Start and End Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="startTime">
                                <Clock className="mr-1 h-3 w-3 inline" />
                                {t('detail.startTime') || 'Start Time'}
                            </Label>
                            <Input
                                id="startTime"
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                placeholder="09:00"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="endTime">
                                <Clock className="mr-1 h-3 w-3 inline" />
                                {t('detail.endTime') || 'End Time'}
                            </Label>
                            <Input
                                id="endTime"
                                type="time"
                                value={endTime}
                                onChange={(e) => {
                                    setEndTime(e.target.value);
                                    if (validationErrors.endTime) {
                                        setValidationErrors(prev => ({ ...prev, endTime: '' }));
                                    }
                                }}
                                placeholder="17:00"
                                className={cn(validationErrors.endTime && 'border-red-500')}
                            />
                        </div>
                    </div>
                    {validationErrors.endTime && (
                        <p className="text-sm text-red-500">{validationErrors.endTime}</p>
                    )}
                    {startTime && endTime && !validationErrors.endTime && (
                        <p className="text-xs text-muted-foreground">
                            Hours will be auto-calculated from time range
                        </p>
                    )}

                    {/* Project Selector */}
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

                    {/* Task Selector (only show if project is selected) */}
                    {selectedProjectId && (
                        <div className="space-y-2">
                            <Label>{t('detail.task') || 'Task'}</Label>
                            <Popover open={openTaskCombobox} onOpenChange={setOpenTaskCombobox}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={openTaskCombobox}
                                        className={cn(
                                            "w-full justify-between",
                                            validationErrors.task && 'border-red-500'
                                        )}
                                    >
                                        {selectedTask ? (
                                            <span className="truncate">{selectedTask.title}</span>
                                        ) : (
                                            <span className="text-muted-foreground">
                                                {t('detail.searchTask') || 'Optional - select task...'}
                                            </span>
                                        )}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-full p-0" align="start">
                                    <Command>
                                        <CommandInput
                                            placeholder={t('detail.searchTaskPlaceholder') || 'Search tasks...'}
                                            value={taskSearchQuery}
                                            onValueChange={setTaskSearchQuery}
                                        />
                                        <CommandList>
                                            <CommandEmpty>{t('detail.noTasksFound') || 'No tasks found.'}</CommandEmpty>
                                            <CommandGroup>
                                                {tasks?.map((task) => (
                                                    <CommandItem
                                                        key={task.id}
                                                        value={task.title}
                                                        onSelect={() => {
                                                            setSelectedTaskId(task.id);
                                                            setOpenTaskCombobox(false);
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                selectedTaskId === task.id ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">{task.title}</span>
                                                            <span className="text-xs text-muted-foreground capitalize">
                                                                {task.status?.replace(/_/g, ' ')} • Priority: {task.priority}
                                                            </span>
                                                        </div>
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                            {validationErrors.task && (
                                <p className="text-sm text-red-500">{validationErrors.task}</p>
                            )}
                        </div>
                    )}

                    {/* Supervisor Selector */}
                    <div className="space-y-2">
                        <Label>{t('detail.supervisor') || 'Supervisor'}</Label>
                        <Popover open={openSupervisorCombobox} onOpenChange={setOpenSupervisorCombobox}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={openSupervisorCombobox}
                                    className="w-full justify-between"
                                >
                                    {selectedSupervisor ? (
                                        <span className="truncate">{selectedSupervisor.full_name || selectedSupervisor.username}</span>
                                    ) : (
                                        <span className="text-muted-foreground">
                                            {t('detail.searchSupervisor') || 'Optional - select supervisor...'}
                                        </span>
                                    )}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0" align="start">
                                <Command>
                                    <CommandInput
                                        placeholder={t('detail.searchSupervisorPlaceholder') || 'Search supervisors...'}
                                        value={supervisorSearchQuery}
                                        onValueChange={setSupervisorSearchQuery}
                                    />
                                    <CommandList>
                                        <CommandEmpty>{t('detail.noSupervisorsFound') || 'No supervisors found.'}</CommandEmpty>
                                        <CommandGroup>
                                            {supervisorsData?.items?.map((supervisor) => (
                                                <CommandItem
                                                    key={supervisor.id}
                                                    value={supervisor.full_name || supervisor.username}
                                                    onSelect={() => {
                                                        setSelectedSupervisorId(supervisor.id);
                                                        setOpenSupervisorCombobox(false);
                                                    }}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            selectedSupervisorId === supervisor.id ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{supervisor.full_name || supervisor.username}</span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {supervisor.email}
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

                    {/* Activity Description */}
                    <div className="space-y-2">
                        <Label htmlFor="activity">{t('detail.activity') || 'Activity Description'}</Label>
                        <Textarea
                            id="activity"
                            value={activityDescription}
                            onChange={(e) => {
                                setActivityDescription(e.target.value);
                                if (validationErrors.activityDescription) {
                                    setValidationErrors(prev => ({ ...prev, activityDescription: '' }));
                                }
                            }}
                            placeholder={t('detail.activityPlaceholder') || 'Describe what you worked on...'}
                            rows={3}
                            maxLength={1000}
                            className={cn(validationErrors.activityDescription && 'border-red-500')}
                        />
                        <div className="flex justify-between items-center">
                            {validationErrors.activityDescription ? (
                                <p className="text-sm text-red-500">{validationErrors.activityDescription}</p>
                            ) : (
                                <span></span>
                            )}
                            <p className={cn(
                                "text-xs",
                                activityDescription.length > 900 ? "text-orange-500" : "text-muted-foreground"
                            )}>
                                {activityDescription.length}/1000
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            {t('detail.cancel')}
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t('detail.updateTimeLog') || 'Update Time Log'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
