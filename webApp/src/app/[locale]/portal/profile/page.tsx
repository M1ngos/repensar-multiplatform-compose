'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import useSWR from 'swr';
import { User, Mail, Phone, Building2, Briefcase, Calendar, Shield, Edit, Loader2 } from 'lucide-react';
import { usersApi } from '@/lib/api';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { format } from 'date-fns';

export default function ProfilePage() {
    const t = useTranslations('Profile');
    const { user: authUser } = useAuth();
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [department, setDepartment] = useState('');
    const [employeeId, setEmployeeId] = useState('');
    const [profilePicture, setProfilePicture] = useState('');

    // Fetch detailed user profile
    const { data: user, error, isLoading, mutate } = useSWR(
        authUser ? 'current-user-profile' : null,
        () => usersApi.getCurrentUser()
    );

    const openEditDialog = () => {
        if (user) {
            setName(user.name || '');
            setPhone(user.phone || '');
            setDepartment(user.department || '');
            setEmployeeId(user.employee_id || '');
            setProfilePicture(user.profile_picture || '');
        }
        setIsEditDialogOpen(true);
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsSubmitting(true);
        try {
            await usersApi.updateUser(user.id, {
                name: name.trim(),
                ...(phone.trim() && { phone: phone.trim() }),
                ...(department.trim() && { department: department.trim() }),
                ...(employeeId.trim() && { employee_id: employeeId.trim() }),
                ...(profilePicture.trim() && { profile_picture: profilePicture.trim() }),
            });

            await mutate();
            setIsEditDialogOpen(false);
            console.log(t('updateSuccess'));
        } catch (error) {
            console.error('Update error:', error);
            alert(t('updateError'));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-96 w-full" />
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <h1 className="text-2xl font-bold">{t('error')}</h1>
                <p className="text-muted-foreground">{t('errorDesc')}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            {/* Header */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
                    <p className="text-muted-foreground">{t('subtitle')}</p>
                </div>
                <Button onClick={openEditDialog}>
                    <Edit className="mr-2 h-4 w-4" />
                    {t('editProfile')}
                </Button>
            </div>

            {/* Profile Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            {user.profile_picture ? (
                                <img
                                    src={user.profile_picture}
                                    alt={user.name}
                                    className="h-16 w-16 rounded-full object-cover"
                                />
                            ) : (
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                    <User className="h-8 w-8 text-primary" />
                                </div>
                            )}
                            <div>
                                <CardTitle className="text-2xl">{user.name}</CardTitle>
                                <CardDescription className="text-base">
                                    {user.user_type.name}
                                </CardDescription>
                            </div>
                        </div>
                        <Badge variant={user.is_active ? 'default' : 'secondary'}>
                            {user.is_active ? t('active') : t('inactive')}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Contact Information */}
                    <div>
                        <h3 className="mb-3 text-lg font-semibold">{t('contactInfo')}</h3>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="flex items-center gap-3">
                                <Mail className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">{t('email')}</p>
                                    <p className="font-medium">{user.email}</p>
                                </div>
                            </div>
                            {user.phone && (
                                <div className="flex items-center gap-3">
                                    <Phone className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">{t('phone')}</p>
                                        <p className="font-medium">{user.phone}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Work Information */}
                    {(user.department || user.employee_id) && (
                        <div>
                            <h3 className="mb-3 text-lg font-semibold">{t('workInfo')}</h3>
                            <div className="grid gap-4 sm:grid-cols-2">
                                {user.department && (
                                    <div className="flex items-center gap-3">
                                        <Building2 className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">{t('department')}</p>
                                            <p className="font-medium">{user.department}</p>
                                        </div>
                                    </div>
                                )}
                                {user.employee_id && (
                                    <div className="flex items-center gap-3">
                                        <Briefcase className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">{t('employeeId')}</p>
                                            <p className="font-medium">{user.employee_id}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Account Information */}
                    <div>
                        <h3 className="mb-3 text-lg font-semibold">{t('accountInfo')}</h3>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="flex items-center gap-3">
                                <Shield className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">{t('userType')}</p>
                                    <p className="font-medium">{user.user_type.description || user.user_type.name}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Calendar className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">{t('memberSince')}</p>
                                    <p className="font-medium">{format(new Date(user.created_at), 'PPP')}</p>
                                </div>
                            </div>
                            {user.last_login && (
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">{t('lastLogin')}</p>
                                        <p className="font-medium">{format(new Date(user.last_login), 'PPP')}</p>
                                    </div>
                                </div>
                            )}
                            {user.oauth_provider && (
                                <div className="flex items-center gap-3">
                                    <Shield className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">{t('authProvider')}</p>
                                        <p className="font-medium capitalize">{user.oauth_provider}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Edit Profile Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{t('editProfileTitle')}</DialogTitle>
                        <DialogDescription>
                            {t('editProfileDesc')}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">{t('name')}</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder={t('namePlaceholder')}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">{t('phone')}</Label>
                            <Input
                                id="phone"
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder={t('phonePlaceholder')}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="department">{t('department')}</Label>
                            <Input
                                id="department"
                                value={department}
                                onChange={(e) => setDepartment(e.target.value)}
                                placeholder={t('departmentPlaceholder')}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="employee-id">{t('employeeId')}</Label>
                            <Input
                                id="employee-id"
                                value={employeeId}
                                onChange={(e) => setEmployeeId(e.target.value)}
                                placeholder={t('employeeIdPlaceholder')}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="profile-picture">{t('profilePicture')}</Label>
                            <Input
                                id="profile-picture"
                                type="url"
                                value={profilePicture}
                                onChange={(e) => setProfilePicture(e.target.value)}
                                placeholder={t('profilePicturePlaceholder')}
                            />
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsEditDialogOpen(false)}
                                disabled={isSubmitting}
                            >
                                {t('cancel')}
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {t('saveChanges')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
