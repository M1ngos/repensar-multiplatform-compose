'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import useSWR from 'swr';
import { Lock, Loader2, Shield, Bell, Globe, Palette, Moon, Sun, Monitor } from 'lucide-react';
import { authApi, preferencesApi } from '@/lib/api';
import type { UserPreferences } from '@/lib/api/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { LanguageSwitcher } from '@/components/language-switcher';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { PasswordInput } from '@/components/ui/password-input';
import { PasswordRequirements } from '@/components/settings/password-requirements';
import { Progress } from '@/components/ui/progress';

export default function SettingsPage() {
  const t = useTranslations('Settings');
  const { setTheme, resolvedTheme } = useTheme();
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    if (!newPassword) return { score: 0, level: 'empty' as const, label: '' };

    let score = 0;

    // Length checks
    if (newPassword.length >= 8) score += 1;
    if (newPassword.length >= 12) score += 1;

    // Character type checks
    if (/[a-z]/.test(newPassword)) score += 1;
    if (/[A-Z]/.test(newPassword)) score += 1;
    if (/[0-9]/.test(newPassword)) score += 1;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) score += 1;

    const levels = [
      { threshold: 0, level: 'empty' as const, label: '' },
      { threshold: 2, level: 'weak' as const, label: t('security.strengthWeak') },
      { threshold: 3, level: 'fair' as const, label: t('security.strengthFair') },
      { threshold: 5, level: 'good' as const, label: t('security.strengthGood') },
      { threshold: 7, level: 'strong' as const, label: t('security.strengthStrong') },
    ];

    const { level, label } = [...levels].reverse().find((l) => newPassword.length > 0 && score >= l.threshold) || levels[0];

    return {
      score: Math.min((score / 7) * 100, 100),
      level,
      label,
    };
  }, [newPassword, t]);

  // Check if passwords match
  const passwordsMatch = useMemo(() => {
    if (!confirmPassword) return null;
    return newPassword === confirmPassword;
  }, [newPassword, confirmPassword]);

  // Check if all requirements are met
  const requirementsMet = useMemo(() => {
    if (!newPassword) return false;
    return (
      newPassword.length >= 8 &&
      /[A-Z]/.test(newPassword) &&
      /[a-z]/.test(newPassword) &&
      /[0-9]/.test(newPassword) &&
      /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)
    );
  }, [newPassword]);

  // Fetch preferences using SWR
  const { data: preferences, isLoading, mutate } = useSWR<UserPreferences>(
    'preferences',
    () => preferencesApi.getPreferences(),
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );

  // Local state for form handling
  const [notifications, setNotifications] = useState({
    email_task_assigned: true,
    email_task_completed: true,
    email_project_updates: true,
    email_weekly_digest: false,
    in_app_all: true,
    in_app_task_updates: true,
    in_app_project_updates: true,
    in_app_gamification: true,
  });

  const [preferencesState, setPreferencesState] = useState({
    theme: 'system' as 'light' | 'dark' | 'system',
    language: 'en',
    compact_mode: false,
    show_tutorials: true,
  });

  // Sync theme from next-themes (when changed from sidebar)
  useEffect(() => {
    if (resolvedTheme) {
      setPreferencesState(prev => ({ ...prev, theme: resolvedTheme as 'light' | 'dark' | 'system' }));
    }
  }, [resolvedTheme]);

  // Update local state when preferences are loaded
  useEffect(() => {
    if (preferences) {
      setNotifications({
        email_task_assigned: preferences.email_task_assigned,
        email_task_completed: preferences.email_task_completed,
        email_project_updates: preferences.email_project_updates,
        email_weekly_digest: preferences.email_weekly_digest,
        in_app_all: preferences.in_app_all,
        in_app_task_updates: preferences.in_app_task_updates,
        in_app_project_updates: preferences.in_app_project_updates,
        in_app_gamification: preferences.in_app_gamification,
      });

      setPreferencesState({
        theme: preferences.theme,
        language: preferences.language,
        compact_mode: preferences.compact_mode,
        show_tutorials: preferences.show_tutorials,
      });
    }
  }, [preferences]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!requirementsMet) {
      toast.error(t('security.passwordRequirementsNotMet'));
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error(t('security.passwordMismatch'));
      return;
    }

    setIsPasswordLoading(true);
    try {
      await authApi.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      toast.success(t('security.passwordChangeSuccess'));
    } catch (_error: any) {
      console.error('Password change error:', _error);
      toast.error(_error.detail || t('security.passwordChangeError'));
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handleNotificationChange = async (key: keyof typeof notifications, value: boolean) => {
    const previous = notifications[key];
    setNotifications(prev => ({ ...prev, [key]: value }));

    try {
      await preferencesApi.patchPreferences({ [key]: value });
      mutate(); // Revalidate cache
      toast.success(t('notifications.saveSuccess'));
    } catch (_error) {
      setNotifications(prev => ({ ...prev, [key]: previous }));
      toast.error(t('notifications.saveError'));
    }
  };

  const handlePreferenceChange = async (key: keyof typeof preferencesState, value: string | boolean) => {
    const previous = preferencesState[key];
    setPreferencesState(prev => ({ ...prev, [key]: value }));

    if (key === 'theme' && typeof value === 'string') {
      setTheme(value);
    }

    try {
      await preferencesApi.patchPreferences({ [key]: value });
      mutate(); // Revalidate cache
      toast.success(t('preferences.saveSuccess'));
    } catch (_error) {
      setPreferencesState(prev => ({ ...prev, [key]: previous }));
      if (key === 'theme' && typeof previous === 'string') {
        setTheme(previous);
      }
      toast.error(t('preferences.saveError'));
    }
  };

  const themes = [
    { value: 'light', label: t('preferences.themeLight'), icon: Sun },
    { value: 'dark', label: t('preferences.themeDark'), icon: Moon },
    { value: 'system', label: t('preferences.themeSystem'), icon: Monitor },
  ] as const;

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div>
          <Skeleton className="h-10 w-64" />
          <Skeleton className="mt-2 h-5 w-96" />
        </div>
        <div className="grid gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-96" />
          <Skeleton className="h-48" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
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
            <div>
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <Lock className="h-5 w-5" />
                {t('security.changePassword')}
              </h3>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">{t('security.currentPassword')}</Label>
                  <PasswordInput
                    id="current-password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder={t('security.currentPasswordPlaceholder')}
                    required
                    showToggle
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">{t('security.newPassword')}</Label>
                  <PasswordInput
                    id="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={t('security.newPasswordPlaceholder')}
                    required
                  />
                  {newPassword && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{t('security.strengthLabel')}</span>
                        <span
                          className={cn(
                            'font-medium',
                            passwordStrength.level === 'weak' && 'text-red-500',
                            passwordStrength.level === 'fair' && 'text-yellow-500',
                            passwordStrength.level === 'good' && 'text-blue-500',
                            passwordStrength.level === 'strong' && 'text-green-500'
                          )}
                        >
                          {passwordStrength.label}
                        </span>
                      </div>
                      <Progress
                        value={passwordStrength.score}
                        className="h-2"
                        indicatorClassName={cn(
                          passwordStrength.level === 'weak' && 'bg-red-500',
                          passwordStrength.level === 'fair' && 'bg-yellow-500',
                          passwordStrength.level === 'good' && 'bg-blue-500',
                          passwordStrength.level === 'strong' && 'bg-green-500'
                        )}
                      />
                      <PasswordRequirements password={newPassword} />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">{t('security.confirmPassword')}</Label>
                  <PasswordInput
                    id="confirm-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t('security.confirmPasswordPlaceholder')}
                    required
                  />
                  {confirmPassword && passwordsMatch !== null && (
                    <p
                      className={cn(
                        'text-sm',
                        passwordsMatch ? 'text-green-500' : 'text-red-500'
                      )}
                    >
                      {passwordsMatch
                        ? t('security.passwordsMatch')
                        : t('security.passwordMismatch')}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={
                    isPasswordLoading ||
                    !currentPassword ||
                    !newPassword ||
                    !confirmPassword ||
                    !requirementsMet ||
                    passwordsMatch === false
                  }
                >
                  {isPasswordLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t('security.changePasswordButton')}
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>

        {/* Notifications Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                <CardTitle>{t('notifications.title')}</CardTitle>
              </div>
            </div>
            <CardDescription>{t('notifications.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Email Notifications */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Globe className="h-4 w-4" />
                {t('notifications.email')}
              </h4>
              <div className="space-y-3 pl-6">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-task-assigned" className="cursor-pointer">
                    {t('notifications.emailTaskAssigned')}
                  </Label>
                  <Switch
                    id="email-task-assigned"
                    checked={notifications.email_task_assigned}
                    onCheckedChange={(checked) => handleNotificationChange('email_task_assigned', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-task-completed" className="cursor-pointer">
                    {t('notifications.emailTaskCompleted')}
                  </Label>
                  <Switch
                    id="email-task-completed"
                    checked={notifications.email_task_completed}
                    onCheckedChange={(checked) => handleNotificationChange('email_task_completed', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-project-updates" className="cursor-pointer">
                    {t('notifications.emailProjectUpdates')}
                  </Label>
                  <Switch
                    id="email-project-updates"
                    checked={notifications.email_project_updates}
                    onCheckedChange={(checked) => handleNotificationChange('email_project_updates', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-weekly-digest" className="cursor-pointer">
                    {t('notifications.emailWeeklyDigest')}
                  </Label>
                  <Switch
                    id="email-weekly-digest"
                    checked={notifications.email_weekly_digest}
                    onCheckedChange={(checked) => handleNotificationChange('email_weekly_digest', checked)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* In-App Notifications */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Bell className="h-4 w-4" />
                {t('notifications.inApp')}
              </h4>
              <div className="space-y-3 pl-6">
                <div className="flex items-center justify-between">
                  <Label htmlFor="in-app-all" className="cursor-pointer">
                    {t('notifications.inAppAll')}
                  </Label>
                  <Switch
                    id="in-app-all"
                    checked={notifications.in_app_all}
                    onCheckedChange={(checked) => handleNotificationChange('in_app_all', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="in-app-task-updates" className="cursor-pointer">
                    {t('notifications.inAppTaskUpdates')}
                  </Label>
                  <Switch
                    id="in-app-task-updates"
                    checked={notifications.in_app_task_updates}
                    onCheckedChange={(checked) => handleNotificationChange('in_app_task_updates', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="in-app-project-updates" className="cursor-pointer">
                    {t('notifications.inAppProjectUpdates')}
                  </Label>
                  <Switch
                    id="in-app-project-updates"
                    checked={notifications.in_app_project_updates}
                    onCheckedChange={(checked) => handleNotificationChange('in_app_project_updates', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="in-app-gamification" className="cursor-pointer">
                    {t('notifications.inAppGamification')}
                  </Label>
                  <Switch
                    id="in-app-gamification"
                    checked={notifications.in_app_gamification}
                    onCheckedChange={(checked) => handleNotificationChange('in_app_gamification', checked)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preferences Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                <CardTitle>{t('preferences.title')}</CardTitle>
              </div>
            </div>
            <CardDescription>{t('preferences.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Theme */}
            <div className="space-y-3">
              <Label>{t('preferences.appearance')}</Label>
              <div className="flex gap-2">
                {themes.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => handlePreferenceChange('theme', item.value)}
                      className={cn(
                        'flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors',
                        preferencesState.theme === item.value
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:bg-accent'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <Separator />

            {/* Display Preferences */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="cursor-pointer">{t('preferences.compactMode')}</Label>
                  <p className="text-sm text-muted-foreground">{t('preferences.compactModeDesc')}</p>
                </div>
                <Switch
                  checked={preferencesState.compact_mode}
                  onCheckedChange={(checked) => handlePreferenceChange('compact_mode', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="cursor-pointer">{t('preferences.showTutorials')}</Label>
                  <p className="text-sm text-muted-foreground">{t('preferences.showTutorialsDesc')}</p>
                </div>
                <Switch
                  checked={preferencesState.show_tutorials}
                  onCheckedChange={(checked) => handlePreferenceChange('show_tutorials', checked)}
                />
              </div>
            </div>
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
