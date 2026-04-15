'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { volunteersApi } from '@/lib/api/volunteers';
import type { VolunteerOnboardingUpdate } from '@/lib/api/types';
import { toast } from 'sonner';
import { CheckCircle2, ChevronLeft, ChevronRight, Clock, CalendarIcon, Leaf } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const CITIES = [
    'Maputo', 'Matola', 'Beira', 'Nampula', 'Chimoio',
    'Quelimane', 'Tete', 'Maxixe', 'Xai-Xai', 'Gurué',
    'Johannesburg', 'Cape Town', 'Durban', 'Nairobi', 'Lagos',
    'Accra', 'Dakar', 'Addis Ababa', 'Kigali', 'Dar es Salaam',
    'Other',
];

const TOTAL_STEPS = 6;
const COOLDOWN_HOURS = 24;

function onboardingCooldownKey(volunteerId: number) {
    return `onboarding_snoozed_${volunteerId}`;
}

export function isOnboardingCoolingDown(volunteerId: number): boolean {
    try {
        const raw = localStorage.getItem(onboardingCooldownKey(volunteerId));
        if (!raw) return false;
        const snoozedAt = parseInt(raw, 10);
        const elapsed = Date.now() - snoozedAt;
        return elapsed < COOLDOWN_HOURS * 60 * 60 * 1000;
    } catch {
        return false;
    }
}

function setOnboardingCooldown(volunteerId: number) {
    try {
        localStorage.setItem(onboardingCooldownKey(volunteerId), String(Date.now()));
    } catch {
        // localStorage unavailable — ignore
    }
}

interface OnboardingWizardProps {
    open: boolean;
    volunteerId: number;
    onDismiss: () => void;   // X or "Do this later" — sets cooldown, doesn't complete
    onComplete: () => void;  // Final finish — marks onboarding_completed = true
}

export function OnboardingWizard({ open, volunteerId, onDismiss, onComplete }: OnboardingWizardProps) {
    const t = useTranslations('Onboarding');
    const [step, setStep] = useState(0);
    const [saving, setSaving] = useState(false);
    const [completed, setCompleted] = useState(false);

    // Step-local state
    const [gender, setGender] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>();
    const [city, setCity] = useState('');
    const [address, setAddress] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [ecName, setEcName] = useState('');
    const [ecPhone, setEcPhone] = useState('');
    const [ecRelationship, setEcRelationship] = useState('');
    const [motivation, setMotivation] = useState('');

    const progress = step === 0 ? 0 : Math.round((step / TOTAL_STEPS) * 100);

    const collectStepData = (): VolunteerOnboardingUpdate => {
        switch (step) {
            case 1: return gender ? { gender } : {};
            case 2: return dateOfBirth ? { date_of_birth: format(dateOfBirth, 'yyyy-MM-dd') } : {};
            case 3: return city ? { city } : {};
            case 4: return (address || postalCode) ? { address: address || undefined, postal_code: postalCode || undefined } : {};
            case 5: return (ecName || ecPhone || ecRelationship)
                ? {
                    emergency_contact_name: ecName || undefined,
                    emergency_contact_phone: ecPhone || undefined,
                    emergency_contact_relationship: ecRelationship || undefined,
                }
                : {};
            case 6: return motivation ? { motivation } : {};
            default: return {};
        }
    };

    const handleNext = async () => {
        const stepData = collectStepData();

        // Save this step's data to the backend immediately (per-step persistence)
        if (Object.keys(stepData).length > 0) {
            setSaving(true);
            try {
                await volunteersApi.updateOnboarding(volunteerId, stepData);
            } catch {
                // Non-blocking — show a soft warning but allow progression
                toast.warning(t('saveError'));
            } finally {
                setSaving(false);
            }
        }

        if (step < TOTAL_STEPS) {
            setStep(s => s + 1);
        } else {
            await handleFinish();
        }
    };

    // "Do this later" — sets cooldown and dismisses, does NOT mark onboarding_completed
    const handleDoLater = () => {
        setOnboardingCooldown(volunteerId);
        onDismiss();
    };

    // X button — same behaviour as "Do this later"
    const handleDialogOpenChange = (isOpen: boolean) => {
        if (!isOpen && !completed) {
            setOnboardingCooldown(volunteerId);
            onDismiss();
        }
    };

    const handleFinish = async () => {
        setSaving(true);
        try {
            // All step data is already saved; just mark onboarding as complete
            await volunteersApi.updateOnboarding(volunteerId, { onboarding_completed: true });
            setCompleted(true);
        } catch {
            toast.error(t('saveError'));
        } finally {
            setSaving(false);
        }
    };

    const stepTitle = () => {
        switch (step) {
            case 1: return t('steps.gender.title');
            case 2: return t('steps.dateOfBirth.title');
            case 3: return t('steps.city.title');
            case 4: return t('steps.address.title');
            case 5: return t('steps.emergencyContact.title');
            case 6: return t('steps.motivation.title');
            default: return '';
        }
    };

    const stepDescription = () => {
        switch (step) {
            case 1: return t('steps.gender.description');
            case 2: return t('steps.dateOfBirth.description');
            case 3: return t('steps.city.description');
            case 4: return t('steps.address.description');
            case 5: return t('steps.emergencyContact.description');
            case 6: return t('steps.motivation.description');
            default: return '';
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleDialogOpenChange}>
            <DialogContent className="sm:max-w-lg">
                {completed ? (
                    <div className="flex flex-col items-center gap-4 py-6 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                            <CheckCircle2 className="h-8 w-8 text-green-600" />
                        </div>
                        <DialogHeader>
                            <DialogTitle className="text-xl">{t('success.title')}</DialogTitle>
                            <DialogDescription>{t('success.description')}</DialogDescription>
                        </DialogHeader>
                        <Button onClick={onComplete} className="mt-2 w-full">
                            {t('finish')}
                        </Button>
                    </div>
                ) : (
                    <>
                        {step === 0 && (
                            <div className="space-y-6 py-4 text-center">
                                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-teal-50 dark:bg-teal-950/30">
                                    <Leaf className="h-10 w-10 text-teal-600 dark:text-teal-400" />
                                </div>
                                <div className="space-y-2">
                                    <DialogTitle className="text-xl font-semibold">{t('welcome.title')}</DialogTitle>
                                    <p className="text-sm text-muted-foreground">{t('welcome.description')}</p>
                                </div>
                                <div className="flex flex-col gap-2 pt-2">
                                    <Button onClick={() => setStep(1)} className="w-full gap-2">
                                        {t('welcome.getStarted')}
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={handleDoLater} className="gap-1 text-muted-foreground">
                                        <Clock className="h-3.5 w-3.5" />
                                        {t('skip')}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {step > 0 && (
                        <>
                        <DialogHeader>
                            <div className="mb-1 text-xs font-medium text-muted-foreground">
                                {t('step', { current: step, total: TOTAL_STEPS })}
                            </div>
                            <DialogTitle>{stepTitle()}</DialogTitle>
                            <DialogDescription>{stepDescription()}</DialogDescription>
                        </DialogHeader>

                        <Progress value={progress} className="h-1.5" />

                        <div className="py-4">
                            {step === 1 && (
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { value: 'male', label: t('steps.gender.male') },
                                        { value: 'female', label: t('steps.gender.female') },
                                        { value: 'other', label: t('steps.gender.other') },
                                        { value: 'prefer_not_to_say', label: t('steps.gender.preferNotToSay') },
                                    ].map(option => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => setGender(option.value)}
                                            className={cn(
                                                'rounded-lg border-2 p-3 text-sm font-medium transition-colors',
                                                gender === option.value
                                                    ? 'border-primary bg-primary/10 text-primary'
                                                    : 'border-border hover:border-primary/50'
                                            )}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-2">
                                    <Label>{t('steps.dateOfBirth.label')}</Label>
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
                                                {dateOfBirth ? format(dateOfBirth, 'PPP') : t('steps.dateOfBirth.placeholder')}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={dateOfBirth}
                                                onSelect={setDateOfBirth}
                                                disabled={(date) => date > new Date()}
                                                captionLayout="dropdown"
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="space-y-2">
                                    <Label>{t('steps.city.label')}</Label>
                                    <Select value={city} onValueChange={setCity}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('steps.city.placeholder')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {CITIES.map(c => (
                                                <SelectItem key={c} value={c}>{c}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {step === 4 && (
                                <div className="space-y-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="address">{t('steps.address.addressLabel')}</Label>
                                        <Input
                                            id="address"
                                            placeholder={t('steps.address.addressPlaceholder')}
                                            value={address}
                                            onChange={e => setAddress(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="postal">{t('steps.address.postalCodeLabel')}</Label>
                                        <Input
                                            id="postal"
                                            placeholder={t('steps.address.postalCodePlaceholder')}
                                            value={postalCode}
                                            onChange={e => setPostalCode(e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}

                            {step === 5 && (
                                <div className="space-y-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="ec-name">{t('steps.emergencyContact.nameLabel')}</Label>
                                        <Input
                                            id="ec-name"
                                            placeholder={t('steps.emergencyContact.namePlaceholder')}
                                            value={ecName}
                                            onChange={e => setEcName(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="ec-phone">{t('steps.emergencyContact.phoneLabel')}</Label>
                                        <Input
                                            id="ec-phone"
                                            placeholder={t('steps.emergencyContact.phonePlaceholder')}
                                            value={ecPhone}
                                            onChange={e => setEcPhone(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="ec-rel">{t('steps.emergencyContact.relationshipLabel')}</Label>
                                        <Input
                                            id="ec-rel"
                                            placeholder={t('steps.emergencyContact.relationshipPlaceholder')}
                                            value={ecRelationship}
                                            onChange={e => setEcRelationship(e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}

                            {step === 6 && (
                                <div className="space-y-2">
                                    <Label htmlFor="motivation">{t('steps.motivation.label')}</Label>
                                    <Textarea
                                        id="motivation"
                                        rows={4}
                                        placeholder={t('steps.motivation.placeholder')}
                                        value={motivation}
                                        onChange={e => setMotivation(e.target.value)}
                                        className="resize-none"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-between gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                disabled={step === 1}
                                onClick={() => setStep(s => s - 1)}
                                className="gap-1"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                {t('back')}
                            </Button>

                            <div className="flex gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleDoLater}
                                    disabled={saving}
                                    className="gap-1 text-muted-foreground"
                                >
                                    <Clock className="h-4 w-4" />
                                    {t('skip')}
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleNext}
                                    disabled={saving}
                                    className="gap-1"
                                >
                                    {saving
                                        ? t('saving')
                                        : step === TOTAL_STEPS
                                            ? t('finish')
                                            : t('next')
                                    }
                                    {!saving && step < TOTAL_STEPS && <ChevronRight className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>
                        </>
                        )}
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
