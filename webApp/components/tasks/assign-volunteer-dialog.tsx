'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import useSWR from 'swr';
import { tasksApi, volunteersApi } from '@/lib/api';
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

interface AssignVolunteerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    taskId: number;
    onSuccess?: () => void;
}

export function AssignVolunteerDialog({ open, onOpenChange, taskId, onSuccess }: AssignVolunteerDialogProps) {
    const t = useTranslations('Tasks');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedVolunteerId, setSelectedVolunteerId] = useState<number | null>(null);
    const [openCombobox, setOpenCombobox] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch volunteers
    const { data: volunteers } = useSWR(
        open ? ['volunteers', searchQuery] : null,
        () => volunteersApi.getVolunteers({ search: searchQuery, limit: 50, status: 'active' })
    );

    const selectedVolunteer = volunteers?.find(v => v.id === selectedVolunteerId);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedVolunteerId) {
            toast.error(t('detail.selectVolunteerRequired') || 'Please select a volunteer');
            return;
        }

        setIsSubmitting(true);

        try {
            // Fetch volunteer profile to get user_id (same pattern as add-team-member-dialog)
            const volunteerProfile = await volunteersApi.getVolunteer(selectedVolunteerId);

            await tasksApi.assignVolunteer(taskId, {
                volunteer_id: volunteerProfile.user_id,
            });

            toast.success(t('detail.volunteerAssigned') || 'Volunteer assigned successfully!');
            onOpenChange(false);
            setSelectedVolunteerId(null);
            setSearchQuery('');
            onSuccess?.();
        } catch (error: any) {
            console.error('Error assigning volunteer:', error);
            toast.error(error.detail || error.message || t('detail.volunteerAssignError') || 'Failed to assign volunteer');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('detail.assignVolunteer')}</DialogTitle>
                    <DialogDescription>
                        {t('detail.assignVolunteerDescription') || 'Assign a volunteer to this task'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>{t('detail.selectVolunteer') || 'Select Volunteer'} *</Label>
                        <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={openCombobox}
                                    className="w-full justify-between"
                                >
                                    {selectedVolunteer ? (
                                        <span className="truncate">{selectedVolunteer.name} ({selectedVolunteer.email})</span>
                                    ) : (
                                        <span className="text-muted-foreground">
                                            {t('detail.searchVolunteer') || 'Search and select a volunteer...'}
                                        </span>
                                    )}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0" align="start">
                                <Command>
                                    <CommandInput
                                        placeholder={t('detail.searchVolunteerPlaceholder') || 'Search volunteers...'}
                                        value={searchQuery}
                                        onValueChange={setSearchQuery}
                                    />
                                    <CommandList>
                                        <CommandEmpty>{t('detail.noVolunteersFound') || 'No volunteers found.'}</CommandEmpty>
                                        <CommandGroup>
                                            {volunteers?.map((volunteer) => (
                                                <CommandItem
                                                    key={volunteer.id}
                                                    value={`${volunteer.name} ${volunteer.email}`}
                                                    onSelect={() => {
                                                        setSelectedVolunteerId(volunteer.id);
                                                        setOpenCombobox(false);
                                                    }}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            selectedVolunteerId === volunteer.id ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{volunteer.name}</span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {volunteer.email} • {volunteer.total_hours_contributed}h contributed
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

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            {t('detail.cancel')}
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t('detail.assignButton') || 'Assign Volunteer'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
