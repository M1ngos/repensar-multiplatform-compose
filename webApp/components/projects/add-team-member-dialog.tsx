'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import useSWR from 'swr';
import { projectsApi, usersApi, volunteersApi } from '@/lib/api';
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

interface AddTeamMemberDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    projectId: number;
    onSuccess?: () => void;
}

export function AddTeamMemberDialog({ open, onOpenChange, projectId, onSuccess }: AddTeamMemberDialogProps) {
    const t = useTranslations('Projects.teamDialog');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [role, setRole] = useState('');
    const [isVolunteer, setIsVolunteer] = useState(false);
    const [openCombobox, setOpenCombobox] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch users or volunteers based on selection
    const { data: users } = useSWR(
        open && !isVolunteer ? ['users', searchQuery] : null,
        () => usersApi.getUsers({ search: searchQuery, page_size: 50 })
    );

    const { data: volunteers } = useSWR(
        open && isVolunteer ? ['volunteers', searchQuery] : null,
        () => volunteersApi.getVolunteers({ search: searchQuery, limit: 50 })
    );

    const availableOptions = isVolunteer
        ? volunteers?.map(v => ({
            // Use volunteer's id (not user_id) since the list endpoint doesn't return user_id
            // We'll fetch the user_id later when submitting
            id: v.id,
            name: v.name,
            email: v.email
          }))
        : users?.data?.map(u => ({ id: u.id, name: u.name, email: u.email }));

    const selectedUser = availableOptions?.find(u => u.id === selectedUserId);

    // Reset selection when switching between volunteer/staff
    useEffect(() => {
        setSelectedUserId(null);
        setSearchQuery('');
    }, [isVolunteer]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedUserId) {
            toast.error(t('selectUser'));
            return;
        }

        setIsSubmitting(true);

        try {
            let userIdToAdd = selectedUserId;

            // If adding a volunteer, we need to fetch their full profile to get user_id
            // because the volunteers list endpoint doesn't return user_id
            if (isVolunteer) {
                const volunteerProfile = await volunteersApi.getVolunteer(selectedUserId);
                userIdToAdd = volunteerProfile.user_id;
            }

            await projectsApi.addTeamMember(projectId, {
                user_id: userIdToAdd,
                role: role || undefined,
                is_volunteer: isVolunteer,
            });

            toast.success(t('success'));
            onOpenChange(false);
            setSelectedUserId(null);
            setRole('');
            setIsVolunteer(false);
            setSearchQuery('');
            onSuccess?.();
        } catch (error: any) {
            console.error('Error adding team member:', error);
            toast.error(error.detail || error.message || t('error'));
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
                    <div className="flex items-center space-x-2 mb-4">
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

                    <div className="space-y-2">
                        <Label>{t('selectLabel')} {isVolunteer ? t('volunteer') : t('user')} *</Label>
                        <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={openCombobox}
                                    className="w-full justify-between"
                                >
                                    {selectedUser ? (
                                        <span className="truncate">{selectedUser.name} ({selectedUser.email})</span>
                                    ) : (
                                        <span className="text-muted-foreground">{t('searchPlaceholder')}</span>
                                    )}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0" align="start">
                                <Command>
                                    <CommandInput
                                        placeholder={isVolunteer ? t('searchVolunteers') : t('searchUsers')}
                                        value={searchQuery}
                                        onValueChange={setSearchQuery}
                                    />
                                    <CommandList>
                                        <CommandEmpty>{isVolunteer ? t('noVolunteersFound') : t('noUsersFound')}</CommandEmpty>
                                        <CommandGroup>
                                            {availableOptions?.map((option) => (
                                                <CommandItem
                                                    key={option.id}
                                                    value={`${option.name} ${option.email}`}
                                                    onSelect={() => {
                                                        setSelectedUserId(option.id);
                                                        setOpenCombobox(false);
                                                    }}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            selectedUserId === option.id ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{option.name}</span>
                                                        <span className="text-xs text-muted-foreground">{option.email}</span>
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
                        <Label htmlFor="role">{t('role')}</Label>
                        <Input
                            id="role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            placeholder={t('rolePlaceholder')}
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
