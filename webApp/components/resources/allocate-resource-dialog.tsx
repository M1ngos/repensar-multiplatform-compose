'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import useSWR from 'swr';
import { resourcesApi, projectsApi } from '@/lib/api';
import { Resource } from '@/lib/api/types';
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
import { Input } from '@/components/ui/input';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface AllocateResourceDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    resource: Resource;
    onSuccess?: () => void;
}

export function AllocateResourceDialog({ open, onOpenChange, resource, onSuccess }: AllocateResourceDialogProps) {
    const t = useTranslations('Resources');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
    const [quantity, setQuantity] = useState('');
    const [allocationDate, setAllocationDate] = useState<Date>(new Date());
    const [projectSearchOpen, setProjectSearchOpen] = useState(false);

    // Fetch projects for selection
    const { data: projects } = useSWR(
        'projects-list',
        () => projectsApi.getProjects({ limit: 100 })
    );

    const selectedProject = projects?.find((p) => p.id === selectedProjectId);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedProjectId) {
            alert(t('allocate.selectProject'));
            return;
        }

        if (!quantity || parseFloat(quantity) <= 0) {
            alert(t('allocate.quantityRequired'));
            return;
        }

        const quantityNum = parseFloat(quantity);
        const available = resource.available_quantity || 0;

        if (quantityNum > available) {
            alert(t('allocate.exceedsAvailable', { available, unit: resource.unit || t('units') }));
            return;
        }

        setIsSubmitting(true);

        try {
            await resourcesApi.allocateResource(resource.id, {
                project_id: selectedProjectId,
                quantity_allocated: quantityNum,
                allocation_date: format(allocationDate, 'yyyy-MM-dd'),
            });

            console.log(t('allocate.success'));
            onSuccess?.();
            onOpenChange(false);

            // Reset form
            setSelectedProjectId(null);
            setQuantity('');
            setAllocationDate(new Date());
        } catch (error) {
            console.error('Allocation error:', error);
            alert(t('allocate.error'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{t('allocate.title')}</DialogTitle>
                    <DialogDescription>
                        {t('allocate.description', { resource: resource.name })}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Project Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="project">{t('allocate.project')}</Label>
                        <Popover open={projectSearchOpen} onOpenChange={setProjectSearchOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    id="project"
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={projectSearchOpen}
                                    className="w-full justify-between"
                                >
                                    {selectedProject
                                        ? selectedProject.name
                                        : t('allocate.selectProjectPlaceholder')}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                                <Command>
                                    <CommandInput placeholder={t('allocate.searchProjects')} />
                                    <CommandEmpty>{t('allocate.noProjects')}</CommandEmpty>
                                    <CommandGroup>
                                        {projects?.map((project) => (
                                            <CommandItem
                                                key={project.id}
                                                value={project.name}
                                                onSelect={() => {
                                                    setSelectedProjectId(project.id);
                                                    setProjectSearchOpen(false);
                                                }}
                                            >
                                                <Check
                                                    className={cn(
                                                        'mr-2 h-4 w-4',
                                                        selectedProjectId === project.id ? 'opacity-100' : 'opacity-0'
                                                    )}
                                                />
                                                {project.name}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Quantity */}
                    <div className="space-y-2">
                        <Label htmlFor="quantity">
                            {t('allocate.quantity')}
                            {resource.unit && ` (${resource.unit})`}
                        </Label>
                        <Input
                            id="quantity"
                            type="number"
                            step="0.01"
                            min="0"
                            max={resource.available_quantity || undefined}
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            placeholder="0"
                            required
                        />
                        {resource.available_quantity !== undefined && (
                            <p className="text-sm text-muted-foreground">
                                {t('allocate.available')}: {resource.available_quantity} {resource.unit || t('units')}
                            </p>
                        )}
                    </div>

                    {/* Allocation Date */}
                    <div className="space-y-2">
                        <Label>{t('allocate.date')}</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        'w-full justify-start text-left font-normal',
                                        !allocationDate && 'text-muted-foreground'
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {allocationDate ? format(allocationDate, 'PPP') : t('allocate.pickDate')}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={allocationDate}
                                    onSelect={(date) => date && setAllocationDate(date)}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            {t('allocate.cancel')}
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t('allocate.allocateButton')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
