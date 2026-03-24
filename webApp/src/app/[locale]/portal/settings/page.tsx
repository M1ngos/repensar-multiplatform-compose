'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { Lock, Loader2, Shield, Bell, Globe, Palette, Moon, Sun, Monitor } from 'lucide-react';
import { authApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { LanguageSwitcher } from '@/components/language-switcher';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface NotificationSettings {
  email_task_assigned: boolean;
  email_task_completed: boolean;
  email_project_updates: boolean;
  email_weekly_digest: boolean;
  push_task_reminders: boolean;
  push_volunteer_hours: boolean;
  in_app_all: boolean;
  in_app_task_updates: boolean;
  in_app_project_updates: boolean;
  in_app_gamification: boolean;
}

interface PreferenceSettings {
  theme: 'light' | 'dark' | 'system';
  timezone: string;
  language: string;
  compact_mode: boolean;
  show_tutorials: boolean;
}

export default function SettingsPage() {
  const t = useTranslations('Settings');
  const { theme, setTheme } = useTheme();
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [isNotificationSaving, setIsNotificationSaving] = useState(false);
  const [isPreferenceSaving, setIsPreferenceSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [notifications, setNotifications] = useState<NotificationSettings>({
    email_task_assigned: true,
    email_task_completed: true,
    email_project_updates: true,
    email_weekly_digest: false,
    push_task_reminders: true,
    push_volunteer_hours: true,
    in_app_all: true,
    in_app_task_updates: true,
    in_app_project_updates: true,
    in_app_gamification: true,
  });

  const [preferences, setPreferences] = useState<PreferenceSettings>({
    theme: 'system',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: 'en',
    compact_mode: false,
    show_tutorials: true,
  });

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error(t('security.passwordMismatch'));
      return;
    }

    if (newPassword.length < 8) {
      toast.error(t('security.passwordTooShort'));
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
    } catch (error: any) {
      console.error('Password change error:', error);
      toast.error(error.detail || t('security.passwordChangeError'));
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handleNotificationChange = async (key: keyof NotificationSettings, value: boolean) => {
    const previous = notifications[key];
    setNotifications(prev => ({ ...prev, [key]: value }));

    setIsNotificationSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success(t('notifications.saveSuccess'));
    } catch (error) {
      setNotifications(prev => ({ ...prev, [key]: previous }));
      toast.error(t('notifications.saveError'));
    } finally {
      setIsNotificationSaving(false);
    }
  };

  const handlePreferenceChange = async (key: keyof PreferenceSettings, value: string | boolean) => {
    const previous = preferences[key];
    setPreferences(prev => ({ ...prev, [key]: value }));

    if (key === 'theme' && typeof value === 'string') {
      setTheme(value);
    }

    setIsPreferenceSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success(t('preferences.saveSuccess'));
    } catch (error) {
      setPreferences(prev => ({ ...prev, [key]: previous }));
      toast.error(t('preferences.saveError'));
    } finally {
      setIsPreferenceSaving(false);
    }
  };

  const themes = [
    { value: 'light', label: t('preferences.themeLight'), icon: Sun },
    { value: 'dark', label: t('preferences.themeDark'), icon: Moon },
    { value: 'system', label: t('preferences.themeSystem'), icon: Monitor },
  ] as const;

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

                <Button type="submit" disabled={isPasswordLoading}>
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
              {isNotificationSaving && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
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
              {isPreferenceSaving && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
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
                        theme === item.value
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
                  checked={preferences.compact_mode}
                  onCheckedChange={(checked) => handlePreferenceChange('compact_mode', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="cursor-pointer">{t('preferences.showTutorials')}</Label>
                  <p className="text-sm text-muted-foreground">{t('preferences.showTutorialsDesc')}</p>
                </div>
                <Switch
                  checked={preferences.show_tutorials}
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
