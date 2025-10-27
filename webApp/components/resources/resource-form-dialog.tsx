'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { resourcesApi } from '@/lib/api';
import { Resource, ResourceType } from '@/lib/api/types';
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
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';

interface ResourceFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    resource?: Resource;
    onSuccess?: () => void;
}

const RESOURCE_TYPES: ResourceType[] = [
    ResourceType.HUMAN,
    ResourceType.EQUIPMENT,
    ResourceType.MATERIAL,
    ResourceType.FINANCIAL
];

export function ResourceFormDialog({ open, onOpenChange, resource, onSuccess }: ResourceFormDialogProps) {
    const t = useTranslations('Resources');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [resourceType, setResourceType] = useState<ResourceType>(ResourceType.MATERIAL);
    const [unit, setUnit] = useState('');
    const [unitCost, setUnitCost] = useState('');
    const [availableQuantity, setAvailableQuantity] = useState('');
    const [location, setLocation] = useState('');
    const [isAvailable, setIsAvailable] = useState(true);

    // Reset form
    const resetForm = () => {
        setName('');
        setDescription('');
        setResourceType(ResourceType.MATERIAL);
        setUnit('');
        setUnitCost('');
        setAvailableQuantity('');
        setLocation('');
        setIsAvailable(true);
    };

    // Load resource data if editing
    useEffect(() => {
        if (resource && open) {
            setName(resource.name);
            setDescription(resource.description || '');
            setResourceType(resource.type);
            setUnit(resource.unit || '');
            setUnitCost(resource.unit_cost?.toString() || '');
            setAvailableQuantity(resource.available_quantity?.toString() || '');
            setLocation(resource.location || '');
            setIsAvailable(resource.is_active);
        } else if (open && !resource) {
            resetForm();
        }
    }, [resource, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            alert(t('form.nameRequired'));
            return;
        }

        setIsSubmitting(true);

        try {
            const resourceData = {
                name: name.trim(),
                type: resourceType,
                ...(description.trim() && { description: description.trim() }),
                ...(unit.trim() && { unit: unit.trim() }),
                ...(unitCost && { unit_cost: parseFloat(unitCost) }),
                ...(availableQuantity && { available_quantity: parseFloat(availableQuantity) }),
                ...(location.trim() && { location: location.trim() }),
            };

            if (resource) {
                // Backend doesn't support update yet - show error
                alert(t('form.updateNotSupported'));
                return;
            } else {
                // Create new resource
                await resourcesApi.createResource(resourceData);
                console.log(t('form.createSuccess'));
            }

            onSuccess?.();
            onOpenChange(false);
            resetForm();
        } catch (error) {
            console.error('Save error:', error);
            alert(t('form.saveError'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {resource ? t('form.editTitle') : t('form.createTitle')}
                    </DialogTitle>
                    <DialogDescription>
                        {resource ? t('form.editDescription') : t('form.createDescription')}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name">{t('form.name')}</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={t('form.namePlaceholder')}
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">{t('form.description')}</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={t('form.descriptionPlaceholder')}
                            rows={3}
                        />
                    </div>

                    {/* Resource Type */}
                    <div className="space-y-2">
                        <Label htmlFor="resource-type">{t('form.type')}</Label>
                        <Select
                            value={resourceType}
                            onValueChange={(value) => setResourceType(value as ResourceType)}
                        >
                            <SelectTrigger id="resource-type">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {RESOURCE_TYPES.map((type) => (
                                    <SelectItem key={type} value={type}>
                                        {t(`types.${type}`)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Unit and Unit Cost */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="unit">{t('form.unit')}</Label>
                            <Input
                                id="unit"
                                value={unit}
                                onChange={(e) => setUnit(e.target.value)}
                                placeholder={t('form.unitPlaceholder')}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="unit-cost">{t('form.unitCost')}</Label>
                            <Input
                                id="unit-cost"
                                type="number"
                                step="0.01"
                                min="0"
                                value={unitCost}
                                onChange={(e) => setUnitCost(e.target.value)}
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    {/* Available Quantity */}
                    <div className="space-y-2">
                        <Label htmlFor="quantity">{t('form.availableQuantity')}</Label>
                        <Input
                            id="quantity"
                            type="number"
                            step="0.01"
                            min="0"
                            value={availableQuantity}
                            onChange={(e) => setAvailableQuantity(e.target.value)}
                            placeholder="0"
                        />
                    </div>

                    {/* Location */}
                    <div className="space-y-2">
                        <Label htmlFor="location">{t('form.location')}</Label>
                        <Input
                            id="location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder={t('form.locationPlaceholder')}
                        />
                    </div>

                    {/* Is Available (only for edit) */}
                    {resource && (
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="is-available">{t('form.isAvailable')}</Label>
                                <p className="text-sm text-muted-foreground">
                                    {t('form.isAvailableDesc')}
                                </p>
                            </div>
                            <Switch
                                id="is-available"
                                checked={isAvailable}
                                onCheckedChange={setIsAvailable}
                            />
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            {t('form.cancel')}
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {resource ? t('form.updateButton') : t('form.createButton')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
