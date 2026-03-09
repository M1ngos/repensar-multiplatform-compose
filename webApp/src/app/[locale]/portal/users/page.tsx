'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import useSWR from 'swr';
import { Search, Filter, User as UserIcon, Shield, Plus } from 'lucide-react';
import { usersApi } from '@/lib/api';
import { useAuth } from '@/lib/hooks/useAuth';
import type { UserSummary, UserQueryParams, UserCreate } from '@/lib/api/users';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import { CreateUserDialog } from './create-user-dialog';

export default function UsersPage() {
  const t = useTranslations('Users');
  const locale = useLocale();
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.user_type === 'admin';

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Build query params
  const params: UserQueryParams = {
    ...(searchQuery && { search: searchQuery }),
    ...(statusFilter !== 'all' && { is_active: statusFilter === 'true' }),
  };

  // Fetch users with SWR
  const { data: usersData, error, isLoading, mutate } = useSWR(
    ['users', params],
    () => usersApi.getUsers(params)
  );

  const users = usersData?.data || [];

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

  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false);
    mutate();
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t('newUser')}
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder={t('filterByStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allStatuses')}</SelectItem>
                <SelectItem value="true">{t('active')}</SelectItem>
                <SelectItem value="false">{t('inactive')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          // Loading skeleton
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-6 w-48" />
              </CardContent>
            </Card>
          ))
        ) : error ? (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">{t('errorLoading')}</p>
          </div>
        ) : users.length === 0 ? (
          <div className="col-span-full">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <UserIcon />
                </EmptyMedia>
                <EmptyTitle>{t('noUsers')}</EmptyTitle>
                <EmptyDescription>{t('noUsersDesc')}</EmptyDescription>
              </EmptyHeader>
            </Empty>
          </div>
        ) : (
          users.map((user) => (
            <Link
              key={user.id}
              href={`/${locale}/portal/users/${user.id}`}
              className="block"
            >
              <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-muted-foreground mb-1">
                        {user.email}
                      </p>
                      <h3 className="text-lg font-semibold line-clamp-2">
                        {user.name}
                      </h3>
                    </div>
                  </div>

                  {/* Role */}
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <Badge className={getRoleBadgeColor(user.user_type_name)} variant="secondary">
                      {t(`roles.${user.user_type_name}`)}
                    </Badge>
                  </div>

                  {/* Status and Department */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm text-muted-foreground">{t('status')}</span>
                    <Badge className={getStatusBadgeColor(user.is_active)} variant="secondary">
                      {user.is_active ? t('active') : t('inactive')}
                    </Badge>
                  </div>

                  {user.department && (
                    <div className="text-sm text-muted-foreground mt-2">
                      {t('department')}: {user.department}
                    </div>
                  )}

                  {/* Avatar */}
                  <div className="flex items-center gap-3 mt-3">
                    <div className="relative h-10 w-10 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                      {user.profile_picture ? (
                        <img
                          src={user.profile_picture}
                          alt={user.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-gray-700 dark:text-gray-200">
                          {getInitials(user.name)}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>

      {/* Pagination info */}
      {usersData?.metadata && users.length > 0 && (
        <div className="text-sm text-muted-foreground text-center">
          {t('showing')} {((usersData.metadata.page - 1) * usersData.metadata.page_size) + 1}-
          {Math.min(usersData.metadata.page * usersData.metadata.page_size, usersData.metadata.total)} {t('of')} {usersData.metadata.total} {t('users')}
        </div>
      )}

      {/* Create User Dialog */}
      <CreateUserDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}
