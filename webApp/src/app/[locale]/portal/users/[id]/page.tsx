'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import useSWR from 'swr';
import { ArrowLeft, Shield, Mail, Phone, Building, Calendar, Save } from 'lucide-react';
import { usersApi } from '@/lib/api';
import { useAuth } from '@/lib/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import Link from 'next/link';
import { format } from 'date-fns';

export default function UserDetailPage() {
    const params = useParams();
    const userId = parseInt(params.id as string);
    const t = useTranslations('Users');
    const locale = useLocale();
    const { user: currentUser } = useAuth();

    const isAdmin = currentUser?.user_type === 'admin';
    const canActivate = isAdmin;
    const canChangeRole = isAdmin && currentUser?.id !== userId;

    const [selectedRole, setSelectedRole] = useState<string>('');
    const [isChangingRole, setIsChangingRole] = useState(false);

    // Fetch user
    const { data: user, error, isLoading, mutate } = useSWR(
        userId ? `user-${userId}` : null,
        () => usersApi.getUser(userId)
    );

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'admin':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
            case 'project_manager':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            case 'staff_member':
                return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300';
            case 'volunteer':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
        }
    };

    const getStatusBadgeColor = (isActive: boolean) => {
        return isActive
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase())
            .join('');
    };

    const handleActivate = async () => {
        try {
            await usersApi.activateUser(userId);
            mutate();
        } catch (err) {
            console.error('Failed to activate user:', err);
        }
    };

    const handleDeactivate = async () => {
        try {
            await usersApi.deactivateUser(userId);
            mutate();
        } catch (err) {
            console.error('Failed to deactivate user:', err);
        }
    };

    const handleRoleChange = async () => {
        if (!selectedRole || selectedRole === user?.user_type.name) return;
        
        setIsChangingRole(true);
        try {
            await usersApi.changeUserRole(userId, selectedRole);
            toast.success(t('roleChanged'));
            mutate();
            setSelectedRole('');
        } catch (err: any) {
            console.error('Failed to change role:', err);
            toast.error(err?.detail || err?.message || t('roleChangeError'));
        } finally {
            setIsChangingRole(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <Skeleton className="h-8 w-64" />
                <div className="grid gap-4 md:grid-cols-2">
                    <Skeleton className="h-64" />
                    <Skeleton className="h-64" />
                </div>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <Link href={`/${locale}/portal/users`}>
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        {t('backToUsers')}
                    </Button>
                </Link>
                <div className="text-center py-12">
                    <p className="text-muted-foreground">{t('errorLoading')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            {/* Back button and header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <Link href={`/${locale}/portal/users`}>
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{user.name}</h1>
                        <p className="text-muted-foreground">{t('subtitle')}</p>
                    </div>
                </div>

                {/* Action buttons for admin */}
                {canActivate && currentUser?.id !== userId && (
                    <div className="flex flex-col gap-2">
                        {/* Role Change */}
                        {canChangeRole && (
                            <div className="flex gap-2 items-center">
                                <Select
                                    value={selectedRole || user.user_type.name}
                                    onValueChange={(value) => setSelectedRole(value)}
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <Shield className="mr-2 h-4 w-4" />
                                        <SelectValue placeholder={t('changeRole')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="volunteer">{t('roles.volunteer')}</SelectItem>
                                        <SelectItem value="staff_member">{t('roles.staff_member')}</SelectItem>
                                        <SelectItem value="project_manager">{t('roles.project_manager')}</SelectItem>
                                        <SelectItem value="admin">{t('roles.admin')}</SelectItem>
                                    </SelectContent>
                                </Select>
                                {selectedRole && selectedRole !== user.user_type.name && (
                                    <Button 
                                        size="sm" 
                                        onClick={handleRoleChange}
                                        disabled={isChangingRole}
                                    >
                                        <Save className="mr-1 h-4 w-4" />
                                        {t('save')}
                                    </Button>
                                )}
                            </div>
                        )}

                        {/* Activate/Deactivate */}
                        <div className="flex gap-2">
                            {user.is_active ? (
                                <Button variant="destructive" onClick={handleDeactivate}>
                                    {t('deactivate')}
                                </Button>
                            ) : (
                                <Button onClick={handleActivate}>
                                    {t('activate')}
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Main content grid */}
            <div className="grid gap-6 md:grid-cols-3">
                {/* Profile Card */}
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>{t('profile')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Avatar */}
                        <div className="flex justify-center">
                            <div className="relative h-24 w-24 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                                {user.profile_picture ? (
                                    <img
                                        src={user.profile_picture}
                                        alt={user.name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-gray-700 dark:text-gray-200">
                                        {getInitials(user.name)}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Name and Role */}
                        <div className="text-center space-y-2">
                            <h2 className="text-xl font-semibold">{user.name}</h2>
                            <div className="flex justify-center gap-2">
                                <Badge className={getRoleBadgeColor(user.user_type.name)} variant="secondary">
                                    <Shield className="mr-1 h-3 w-3" />
                                    {t(`roles.${user.user_type.name}`)}
                                </Badge>
                                <Badge className={getStatusBadgeColor(user.is_active)} variant="secondary">
                                    {user.is_active ? t('active') : t('inactive')}
                                </Badge>
                            </div>
                        </div>

                        {/* Quick Info */}
                        <div className="space-y-3 pt-4 border-t">
                            <div className="flex items-center gap-3 text-sm">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span className="truncate">{user.email}</span>
                            </div>
                            {user.phone && (
                                <div className="flex items-center gap-3 text-sm">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <span>{user.phone}</span>
                                </div>
                            )}
                            {user.department && (
                                <div className="flex items-center gap-3 text-sm">
                                    <Building className="h-4 w-4 text-muted-foreground" />
                                    <span>{user.department}</span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Details Card */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>{t('details')}</CardTitle>
                        <CardDescription>{t('detailsDescription')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Account Info */}
                        <div>
                            <h3 className="font-semibold mb-3">{t('accountInfo')}</h3>
                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">{t('email')}</p>
                                    <p className="text-sm">{user.email}</p>
                                </div>
                                {user.employee_id && (
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">{t('employeeId')}</p>
                                        <p className="text-sm">{user.employee_id}</p>
                                    </div>
                                )}
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">{t('status')}</p>
                                    <Badge className={getStatusBadgeColor(user.is_active)} variant="secondary">
                                        {user.is_active ? t('active') : t('inactive')}
                                    </Badge>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">{t('role')}</p>
                                    <Badge className={getRoleBadgeColor(user.user_type.name)} variant="secondary">
                                        {t(`roles.${user.user_type.name}`)}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        {/* Dates */}
                        <div className="pt-4 border-t">
                            <h3 className="font-semibold mb-3">{t('dates')}</h3>
                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">{t('createdAt')}</p>
                                        <p className="text-sm">{format(new Date(user.created_at), 'PP')}</p>
                                    </div>
                                </div>
                                {user.last_login && (
                                    <div className="flex items-center gap-3">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">{t('lastLogin')}</p>
                                            <p className="text-sm">{format(new Date(user.last_login), 'PP')}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Additional Info */}
                        {user.department && (
                            <div className="pt-4 border-t">
                                <h3 className="font-semibold mb-3">{t('additionalInfo')}</h3>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">{t('department')}</p>
                                        <p className="text-sm">{user.department}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
