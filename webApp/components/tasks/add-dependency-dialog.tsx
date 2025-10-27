'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import useSWR from 'swr';
import { tasksApi } from '@/lib/api';
import type { DependencyType } from '@/lib/api/types';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Loader2, Check, ChevronsUpDown } from 'lucide-react';
import { toast } from 'sonner';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface AddDependencyDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    taskId: number;
    onSuccess?: () => void;
}

const DEPENDENCY_TYPES: DependencyType[] = [
    'finish_to_start',
    'start_to_start',
    'finish_to_finish',
    'start_to_finish',
];

export function AddDependencyDialog({ open, onOpenChange, taskId, onSuccess }: AddDependencyDialogProps) {
    const t = useTranslations('Tasks');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
    const [dependencyType, setDependencyType] = useState<DependencyType>('finish_to_start');
    const [direction, setDirection] = useState<'predecessor' | 'successor'>('predecessor');
    const [openCombobox, setOpenCombobox] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch available tasks
    const { data: tasks } = useSWR(
        open ? ['tasks', searchQuery] : null,
        () => tasksApi.getTasks({ search: searchQuery, limit: 50 })
    );

    // Filter out the current task
    const availableTasks = tasks?.filter(t => t.id !== taskId);
    const selectedTask = availableTasks?.find(t => t.id === selectedTaskId);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedTaskId) {
            toast.error(t('detail.selectTaskRequired') || 'Please select a task');
            return;
        }

        setIsSubmitting(true);

        try {
            // Determine predecessor and successor based on direction
            const predecessor_task_id = direction === 'predecessor' ? selectedTaskId : taskId;
            const successor_task_id = direction === 'successor' ? selectedTaskId : taskId;

            await tasksApi.addTaskDependency(taskId, {
                predecessor_task_id,
                successor_task_id,
                dependency_type: dependencyType,
            });

            toast.success(t('detail.dependencyAdded') || 'Dependency added successfully!');
            onOpenChange(false);
            setSelectedTaskId(null);
            setDependencyType('finish_to_start');
            setDirection('predecessor');
            setSearchQuery('');
            onSuccess?.();
        } catch (error: any) {
            console.error('Error adding dependency:', error);
            toast.error(error.detail || error.message || t('detail.dependencyAddError') || 'Failed to add dependency');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('detail.addDependency')}</DialogTitle>
                    <DialogDescription>
                        {t('detail.addDependencyDescription') || 'Add a dependency relationship between tasks'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>{t('detail.selectTask') || 'Select Task'} *</Label>
                        <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={openCombobox}
                                    className="w-full justify-between"
                                >
                                    {selectedTask ? (
                                        <span className="truncate">{selectedTask.title}</span>
                                    ) : (
                                        <span className="text-muted-foreground">
                                            {t('detail.searchTask') || 'Search and select a task...'}
                                        </span>
                                    )}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0" align="start">
                                <Command>
                                    <CommandInput
                                        placeholder={t('detail.searchTaskPlaceholder') || 'Search tasks...'}
                                        value={searchQuery}
                                        onValueChange={setSearchQuery}
                                    />
                                    <CommandList>
                                        <CommandEmpty>{t('detail.noTasksFound') || 'No tasks found.'}</CommandEmpty>
                                        <CommandGroup>
                                            {availableTasks?.map((task) => (
                                                <CommandItem
                                                    key={task.id}
                                                    value={task.title}
                                                    onSelect={() => {
                                                        setSelectedTaskId(task.id);
                                                        setOpenCombobox(false);
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
                                                        <span className="text-xs text-muted-foreground">
                                                            {task.project_name} • {t(`statuses.${task.status}`)}
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
                        <Label htmlFor="direction">{t('detail.direction') || 'Direction'}</Label>
                        <Select value={direction} onValueChange={(value) => setDirection(value as 'predecessor' | 'successor')}>
                            <SelectTrigger id="direction">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="predecessor">{t('detail.predecessor')}</SelectItem>
                                <SelectItem value="successor">{t('detail.successor')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="dependencyType">{t('detail.dependencyType') || 'Dependency Type'}</Label>
                        <Select value={dependencyType} onValueChange={(value) => setDependencyType(value as DependencyType)}>
                            <SelectTrigger id="dependencyType">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {DEPENDENCY_TYPES.map((type) => (
                                    <SelectItem key={type} value={type}>
                                        {t(`dependencyTypes.${type}`)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            {t('detail.cancel')}
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t('detail.addButton') || 'Add Dependency'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
