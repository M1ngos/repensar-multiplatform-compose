'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { usersApi, type UserCreate } from '@/lib/api';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface CreateUserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function CreateUserDialog({ open, onOpenChange, onSuccess }: CreateUserDialogProps) {
    const t = useTranslations('Users');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [formData, setFormData] = useState<UserCreate>({
        name: '',
        email: '',
        password: '',
        user_type: 'volunteer',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.name || !formData.email || !formData.password) {
            toast.error(t('createUser.error'));
            return;
        }

        setIsSubmitting(true);

        try {
            await usersApi.createUser(formData);
            toast.success(t('createUser.success'));
            onOpenChange(false);
            setFormData({
                name: '',
                email: '',
                password: '',
                user_type: 'volunteer',
            });
            onSuccess?.();
        } catch (error: any) {
            console.error('Error creating user:', error);
            toast.error(error?.detail || error?.message || t('createUser.error'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOpenChange = (isOpen: boolean) => {
        if (!isOpen) {
            setFormData({
                name: '',
                email: '',
                password: '',
                user_type: 'volunteer',
            });
        }
        onOpenChange(isOpen);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{t('createUser.title')}</DialogTitle>
                    <DialogDescription>
                        {t('createUser.description')}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">{t('createUser.name')} *</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder={t('createUser.namePlaceholder')}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">{t('createUser.email')} *</Label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder={t('createUser.emailPlaceholder')}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">{t('createUser.password')} *</Label>
                        <Input
                            id="password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder={t('createUser.passwordPlaceholder')}
                            required
                            minLength={8}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="userType">{t('createUser.role')}</Label>
                        <Select
                            value={formData.user_type}
                            onValueChange={(value) => setFormData({ ...formData, user_type: value })}
                        >
                            <SelectTrigger id="userType">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="volunteer">{t('roles.volunteer')}</SelectItem>
                                <SelectItem value="staff_member">{t('roles.staff_member')}</SelectItem>
                                <SelectItem value="project_manager">{t('roles.project_manager')}</SelectItem>
                                <SelectItem value="admin">{t('roles.admin')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">{t('createUser.phone')}</Label>
                        <Input
                            id="phone"
                            type="tel"
                            value={formData.phone || ''}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value || undefined })}
                            placeholder={t('createUser.phonePlaceholder')}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="department">{t('createUser.department')}</Label>
                        <Input
                            id="department"
                            value={formData.department || ''}
                            onChange={(e) => setFormData({ ...formData, department: e.target.value || undefined })}
                            placeholder={t('createUser.departmentPlaceholder')}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            {t('createUser.cancel')}
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? t('createUser.creating') : t('createUser.create')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
