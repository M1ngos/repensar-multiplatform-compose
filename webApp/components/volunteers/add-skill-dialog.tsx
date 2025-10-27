'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import useSWR from 'swr';
import { volunteersApi } from '@/lib/api';
import { ProficiencyLevel } from '@/lib/api/types';
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

interface AddSkillDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    volunteerId: number;
    onSuccess?: () => void;
}

const PROFICIENCY_LEVELS: ProficiencyLevel[] = [
    ProficiencyLevel.BEGINNER,
    ProficiencyLevel.INTERMEDIATE,
    ProficiencyLevel.ADVANCED,
    ProficiencyLevel.EXPERT,
];

export function AddSkillDialog({ open, onOpenChange, volunteerId, onSuccess }: AddSkillDialogProps) {
    const t = useTranslations('Volunteers');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedSkillId, setSelectedSkillId] = useState<number | null>(null);
    const [proficiencyLevel, setProficiencyLevel] = useState<ProficiencyLevel>(ProficiencyLevel.BEGINNER);
    const [yearsExperience, setYearsExperience] = useState('0');
    const [certified, setCertified] = useState(false);
    const [notes, setNotes] = useState('');
    const [openCombobox, setOpenCombobox] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch available skills
    const { data: skills } = useSWR(
        open ? 'available-skills' : null,
        () => volunteersApi.getAvailableSkills()
    );

    const selectedSkill = skills?.find(s => s.id === selectedSkillId);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedSkillId) {
            toast.error(t('detail.selectSkillRequired') || 'Please select a skill');
            return;
        }

        setIsSubmitting(true);

        try {
            await volunteersApi.addVolunteerSkill(volunteerId, {
                skill_id: selectedSkillId,
                proficiency_level: proficiencyLevel,
                years_experience: parseInt(yearsExperience) || 0,
                certified,
                notes: notes || undefined,
            });

            toast.success(t('detail.skillAdded') || 'Skill added successfully!');
            onOpenChange(false);
            setSelectedSkillId(null);
            setProficiencyLevel(ProficiencyLevel.BEGINNER);
            setYearsExperience('0');
            setCertified(false);
            setNotes('');
            setSearchQuery('');
            onSuccess?.();
        } catch (error: any) {
            console.error('Error adding skill:', error);
            toast.error(error.detail || error.message || t('detail.skillAddError') || 'Failed to add skill');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('detail.addSkill')}</DialogTitle>
                    <DialogDescription>
                        {t('detail.addSkillDescription') || 'Add a new skill to the volunteer profile'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>{t('detail.selectSkill') || 'Select Skill'} *</Label>
                        <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={openCombobox}
                                    className="w-full justify-between"
                                >
                                    {selectedSkill ? (
                                        <span className="truncate">{selectedSkill.name}</span>
                                    ) : (
                                        <span className="text-muted-foreground">
                                            {t('detail.searchSkill') || 'Search and select a skill...'}
                                        </span>
                                    )}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0" align="start">
                                <Command>
                                    <CommandInput
                                        placeholder={t('detail.searchSkillPlaceholder') || 'Search skills...'}
                                        value={searchQuery}
                                        onValueChange={setSearchQuery}
                                    />
                                    <CommandList>
                                        <CommandEmpty>{t('detail.noSkillsFound') || 'No skills found.'}</CommandEmpty>
                                        <CommandGroup>
                                            {skills?.map((skill) => (
                                                <CommandItem
                                                    key={skill.id}
                                                    value={skill.name}
                                                    onSelect={() => {
                                                        setSelectedSkillId(skill.id);
                                                        setOpenCombobox(false);
                                                    }}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            selectedSkillId === skill.id ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{skill.name}</span>
                                                        {skill.description && (
                                                            <span className="text-xs text-muted-foreground line-clamp-1">
                                                                {skill.description}
                                                            </span>
                                                        )}
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
                        <Label htmlFor="proficiency">{t('detail.proficiencyLevel') || 'Proficiency Level'}</Label>
                        <Select value={proficiencyLevel} onValueChange={(value) => setProficiencyLevel(value as ProficiencyLevel)}>
                            <SelectTrigger id="proficiency">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {PROFICIENCY_LEVELS.map((level) => (
                                    <SelectItem key={level} value={level}>
                                        {t(`proficiencyLevels.${level}`)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="yearsExperience">{t('detail.yearsExperience') || 'Years of Experience'}</Label>
                        <Input
                            id="yearsExperience"
                            type="number"
                            min="0"
                            value={yearsExperience}
                            onChange={(e) => setYearsExperience(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="certified"
                            checked={certified}
                            onChange={(e) => setCertified(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300"
                        />
                        <Label htmlFor="certified" className="cursor-pointer">
                            {t('detail.certified')}
                        </Label>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">{t('detail.notes')}</Label>
                        <Textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder={t('detail.notesPlaceholder') || 'Additional notes...'}
                            rows={3}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            {t('detail.cancel')}
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t('detail.addSkillButton') || 'Add Skill'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
