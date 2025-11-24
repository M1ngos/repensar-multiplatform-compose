'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { volunteersApi } from '@/lib/api';
import { VolunteerProfile, VolunteerStatus, BackgroundCheckStatus } from '@/lib/api/types';
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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface VolunteerFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    volunteer?: VolunteerProfile;
    onSuccess?: () => void;
}

const VOLUNTEER_STATUSES: VolunteerStatus[] = [
    VolunteerStatus.ACTIVE,
    VolunteerStatus.INACTIVE,
    VolunteerStatus.SUSPENDED,
];
const BACKGROUND_CHECK_STATUSES: BackgroundCheckStatus[] = [
    BackgroundCheckStatus.PENDING,
    BackgroundCheckStatus.APPROVED,
    BackgroundCheckStatus.REJECTED,
];

export function VolunteerFormDialog({ open, onOpenChange, volunteer, onSuccess }: VolunteerFormDialogProps) {
    const t = useTranslations('Volunteers');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [status, setStatus] = useState<VolunteerStatus>(VolunteerStatus.ACTIVE);
    const [backgroundCheckStatus, setBackgroundCheckStatus] = useState<BackgroundCheckStatus>(BackgroundCheckStatus.PENDING);
    const [orientationCompleted, setOrientationCompleted] = useState(false);
    const [orientationDate, setOrientationDate] = useState<Date | undefined>();
    const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>();
    const [gender, setGender] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [emergencyContactName, setEmergencyContactName] = useState('');
    const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
    const [emergencyContactRelationship, setEmergencyContactRelationship] = useState('');
    const [motivation, setMotivation] = useState('');
    const [notes, setNotes] = useState('');

    // Load volunteer data if editing
    useEffect(() => {
        if (volunteer && open) {
            setStatus(volunteer.volunteer_status);
            setBackgroundCheckStatus(volunteer.background_check_status || 'pending');
            setOrientationCompleted(volunteer.orientation_completed || false);
            setOrientationDate(volunteer.orientation_date ? new Date(volunteer.orientation_date) : undefined);
            setDateOfBirth(volunteer.date_of_birth ? new Date(volunteer.date_of_birth) : undefined);
            setGender(volunteer.gender || '');
            setAddress(volunteer.address || '');
            setCity(volunteer.city || '');
            setPostalCode(volunteer.postal_code || '');
            setEmergencyContactName(volunteer.emergency_contact_name || '');
            setEmergencyContactPhone(volunteer.emergency_contact_phone || '');
            setEmergencyContactRelationship(volunteer.emergency_contact_relationship || '');
            setMotivation(volunteer.motivation || '');
            setNotes(volunteer.notes || '');
        }
    }, [volunteer, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!volunteer) {
            toast.error(t('detail.dataNotFound'));
            return;
        }

        setIsSubmitting(true);

        try {
            await volunteersApi.updateVolunteer(volunteer.id, {
                volunteer_status: status,
                background_check_status: backgroundCheckStatus,
                orientation_completed: orientationCompleted,
                orientation_date: orientationDate ? format(orientationDate, 'yyyy-MM-dd') : undefined,
                date_of_birth: dateOfBirth ? format(dateOfBirth, 'yyyy-MM-dd') : undefined,
                gender: gender || undefined,
                address: address || undefined,
                city: city || undefined,
                postal_code: postalCode || undefined,
                emergency_contact_name: emergencyContactName || undefined,
                emergency_contact_phone: emergencyContactPhone || undefined,
                emergency_contact_relationship: emergencyContactRelationship || undefined,
                motivation: motivation || undefined,
                notes: notes || undefined,
            });

            toast.success(t('detail.updateSuccess') || 'Volunteer updated successfully!');
            onOpenChange(false);
            onSuccess?.();
        } catch (error: any) {
            console.error('Error updating volunteer:', error);
            toast.error(error.detail || error.message || t('detail.updateError') || 'Failed to update volunteer');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{t('detail.editVolunteer')}</DialogTitle>
                    <DialogDescription>
                        {t('detail.editVolunteerDescription') || 'Update volunteer information'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Status & Orientation */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="status">{t('detail.status') || 'Status'}</Label>
                            <Select value={status} onValueChange={(value) => setStatus(value as VolunteerStatus)}>
                                <SelectTrigger id="status">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {VOLUNTEER_STATUSES.map((stat) => (
                                        <SelectItem key={stat} value={stat}>
                                            {t(`statuses.${stat}`)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="backgroundCheck">{t('detail.backgroundCheck') || 'Background Check'}</Label>
                            <Select value={backgroundCheckStatus} onValueChange={(value) => setBackgroundCheckStatus(value as BackgroundCheckStatus)}>
                                <SelectTrigger id="backgroundCheck">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {BACKGROUND_CHECK_STATUSES.map((stat) => (
                                        <SelectItem key={stat} value={stat}>
                                            {t(`backgroundCheckStatuses.${stat}`) || stat}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="orientationCompleted"
                            checked={orientationCompleted}
                            onChange={(e) => setOrientationCompleted(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300"
                        />
                        <Label htmlFor="orientationCompleted" className="cursor-pointer">
                            {t('detail.orientationCompleted')}
                        </Label>
                    </div>

                    {orientationCompleted && (
                        <div className="space-y-2">
                            <Label>{t('detail.orientationDate') || 'Orientation Date'}</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            'w-full justify-start text-left font-normal',
                                            !orientationDate && 'text-muted-foreground'
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {orientationDate ? format(orientationDate, 'PPP') : t('detail.pickDate')}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={orientationDate}
                                        onSelect={setOrientationDate}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    )}

                    {/* Personal Information */}
                    <div className="space-y-4 pt-4 border-t">
                        <h4 className="font-semibold">{t('detail.personalInfo')}</h4>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label>{t('detail.dateOfBirth') || 'Date of Birth'}</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                'w-full justify-start text-left font-normal',
                                                !dateOfBirth && 'text-muted-foreground'
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {dateOfBirth ? format(dateOfBirth, 'PPP') : t('detail.pickDate')}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={dateOfBirth}
                                            onSelect={setDateOfBirth}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="gender">{t('detail.gender')}</Label>
                                <Input
                                    id="gender"
                                    value={gender}
                                    onChange={(e) => setGender(e.target.value)}
                                    placeholder={t('detail.genderPlaceholder') || 'e.g., Male, Female, Other'}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">{t('detail.address')}</Label>
                            <Input
                                id="address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder={t('detail.addressPlaceholder') || 'Street address'}
                            />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="city">{t('detail.city')}</Label>
                                <Input
                                    id="city"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="postalCode">{t('detail.postalCode')}</Label>
                                <Input
                                    id="postalCode"
                                    value={postalCode}
                                    onChange={(e) => setPostalCode(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Emergency Contact */}
                    <div className="space-y-4 pt-4 border-t">
                        <h4 className="font-semibold">{t('detail.emergencyContact')}</h4>

                        <div className="space-y-2">
                            <Label htmlFor="emergencyName">{t('detail.name')}</Label>
                            <Input
                                id="emergencyName"
                                value={emergencyContactName}
                                onChange={(e) => setEmergencyContactName(e.target.value)}
                            />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="emergencyPhone">{t('detail.phone')}</Label>
                                <Input
                                    id="emergencyPhone"
                                    value={emergencyContactPhone}
                                    onChange={(e) => setEmergencyContactPhone(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="emergencyRelationship">{t('detail.relationship')}</Label>
                                <Input
                                    id="emergencyRelationship"
                                    value={emergencyContactRelationship}
                                    onChange={(e) => setEmergencyContactRelationship(e.target.value)}
                                    placeholder={t('detail.relationshipPlaceholder') || 'e.g., Spouse, Parent'}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Motivation & Notes */}
                    <div className="space-y-4 pt-4 border-t">
                        <div className="space-y-2">
                            <Label htmlFor="motivation">{t('detail.motivation')}</Label>
                            <Textarea
                                id="motivation"
                                value={motivation}
                                onChange={(e) => setMotivation(e.target.value)}
                                placeholder={t('detail.motivationPlaceholder') || 'Why do you want to volunteer...'}
                                rows={3}
                            />
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
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            {t('detail.cancel')}
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t('detail.updateButton') || 'Update Volunteer'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
