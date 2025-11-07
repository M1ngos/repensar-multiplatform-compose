'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Lock, Loader2, Shield, Bell, Globe, Palette } from 'lucide-react';
import { authApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { LanguageSwitcher } from '@/components/language-switcher';

export default function SettingsPage() {
    const t = useTranslations('Settings');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Password change form state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            alert(t('passwordMismatch'));
            return;
        }

        if (newPassword.length < 8) {
            alert(t('passwordTooShort'));
            return;
        }

        setIsSubmitting(true);
        try {
            await authApi.changePassword({
                current_password: currentPassword,
                new_password: newPassword,
            });

            // Reset form
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');

            alert(t('passwordChangeSuccess'));
        } catch (error: any) {
            console.error('Password change error:', error);
            alert(error.detail || t('passwordChangeError'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
                <p className="text-muted-foreground">{t('subtitle')}</p>
            </div>

            <div className="grid gap-6">
                {/* Security Settings */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            <CardTitle>{t('security.title')}</CardTitle>
                        </div>
                        <CardDescription>{t('security.description')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Change Password */}
                        <div>
                            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                                <Lock className="h-5 w-5" />
                                {t('security.changePassword')}
                            </h3>
                            <form onSubmit={handleChangePassword} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="current-password">{t('security.currentPassword')}</Label>
                                    <Input
                                        id="current-password"
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        placeholder={t('security.currentPasswordPlaceholder')}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="new-password">{t('security.newPassword')}</Label>
                                    <Input
                                        id="new-password"
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder={t('security.newPasswordPlaceholder')}
                                        required
                                        minLength={8}
                                    />
                                    <p className="text-sm text-muted-foreground">
                                        {t('security.passwordRequirements')}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirm-password">{t('security.confirmPassword')}</Label>
                                    <Input
                                        id="confirm-password"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder={t('security.confirmPasswordPlaceholder')}
                                        required
                                        minLength={8}
                                    />
                                </div>

                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {t('security.changePasswordButton')}
                                </Button>
                            </form>
                        </div>
                    </CardContent>
                </Card>

                {/* Notifications Settings (Placeholder) */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Bell className="h-5 w-5" />
                            <CardTitle>{t('notifications.title')}</CardTitle>
                        </div>
                        <CardDescription>{t('notifications.description')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">{t('notifications.comingSoon')}</p>
                    </CardContent>
                </Card>

                {/* Preferences Settings (Placeholder) */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Palette className="h-5 w-5" />
                            <CardTitle>{t('preferences.title')}</CardTitle>
                        </div>
                        <CardDescription>{t('preferences.description')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">{t('preferences.comingSoon')}</p>
                    </CardContent>
                </Card>

                {/* Language Settings */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Globe className="h-5 w-5" />
                            <CardTitle>{t('language.title')}</CardTitle>
                        </div>
                        <CardDescription>{t('language.description')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>{t('language.selectLanguage')}</Label>
                            <LanguageSwitcher />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
