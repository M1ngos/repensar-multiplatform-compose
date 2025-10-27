'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import useSWR from 'swr';
import { Plus, Search, Filter, Clock, Award } from 'lucide-react';
import { volunteersApi } from '@/lib/api';
import type { VolunteerSummary, VolunteerQueryParams } from '@/lib/api/types';
import { VolunteerStatus } from '@/lib/api/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardAction, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { format } from 'date-fns';

const VOLUNTEER_STATUSES: VolunteerStatus[] = [
    VolunteerStatus.ACTIVE,
    VolunteerStatus.INACTIVE,
    VolunteerStatus.SUSPENDED,
];

export default function VolunteersPage() {
    const t = useTranslations('Volunteers');
    const locale = useLocale();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<VolunteerStatus | 'all'>('all');

    // Build query params
    const params: VolunteerQueryParams = {
        ...(searchQuery && { search: searchQuery }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
    };

    // Fetch volunteers with SWR
    const { data: volunteers, error, isLoading, mutate } = useSWR(
        ['volunteers', params],
        () => volunteersApi.getVolunteers(params)
    );

    const getStatusColor = (status: VolunteerStatus) => {
        switch (status) {
            case VolunteerStatus.ACTIVE:
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case VolunteerStatus.INACTIVE:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
            case VolunteerStatus.SUSPENDED:
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
        }
    };

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            {/* Header */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
                    <p className="text-muted-foreground">{t('subtitle')}</p>
                </div>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        {t('newVolunteer')}
                    </Button>
                </div>

                {/* Filters */}
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
                    <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as VolunteerStatus | 'all')}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <Filter className="mr-2 h-4 w-4" />
                            <SelectValue placeholder={t('filterByStatus')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('allStatuses')}</SelectItem>
                            {VOLUNTEER_STATUSES.map((status) => (
                                <SelectItem key={status} value={status}>
                                    {t(`statuses.${status}`)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Volunteers Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {isLoading ? (
                        // Loading skeleton
                        Array.from({ length: 6 }).map((_, i) => (
                            <Card key={i} className="@container/card">
                                <CardHeader>
                                    <Skeleton className="h-4 w-24 mb-2" />
                                    <Skeleton className="h-6 w-48" />
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-20 w-full" />
                                </CardContent>
                            </Card>
                        ))
                    ) : error ? (
                        <div className="col-span-full text-center py-12">
                            <p className="text-muted-foreground">{t('errorLoading')}</p>
                        </div>
                    ) : !volunteers || volunteers.length === 0 ? (
                        <div className="col-span-full text-center py-12">
                            <p className="text-muted-foreground">{t('noVolunteers')}</p>
                        </div>
                    ) : (
                        volunteers.map((volunteer) => (
                            <Link
                                key={volunteer.id}
                                href={`/${locale}/portal/volunteers/${volunteer.id}`}
                                className="block"
                            >
                                <Card className="@container/card hover:bg-accent/50 transition-colors cursor-pointer h-full">
                                    <CardHeader>
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                <CardDescription className="mb-1">
                                                    {volunteer.volunteer_id}
                                                </CardDescription>
                                                <CardTitle className="text-lg @[250px]/card:text-xl line-clamp-2">
                                                    {volunteer.name}
                                                </CardTitle>
                                            </div>
                                            <CardAction>
                                                <Badge className={getStatusColor(volunteer.volunteer_status)} variant="secondary">
                                                    {t(`statuses.${volunteer.volunteer_status}`)}
                                                </Badge>
                                            </CardAction>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {/* Email */}
                                        <div className="text-sm text-muted-foreground line-clamp-1">
                                            {volunteer.email}
                                        </div>

                                        {/* Stats Grid */}
                                        <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                                            <div>
                                                <div className="text-xs text-muted-foreground">{t('table.hours')}</div>
                                                <div className="text-sm font-semibold tabular-nums">
                                                    {volunteer.total_hours_contributed}h
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-muted-foreground">{t('table.skills')}</div>
                                                <div className="text-sm font-semibold tabular-nums">
                                                    {volunteer.skills_count}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-muted-foreground">{t('table.joined')}</div>
                                                <div className="text-sm font-semibold">
                                                    {format(new Date(volunteer.joined_date), 'MMM yy')}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                    {volunteer.recent_activity && (
                                        <CardFooter className="text-sm text-muted-foreground">
                                            <Clock className="h-3 w-3 mr-1" />
                                            <span className="line-clamp-1">{volunteer.recent_activity}</span>
                                        </CardFooter>
                                    )}
                                </Card>
                            </Link>
                        ))
                    )}
                </div>
        </div>
    );
}
