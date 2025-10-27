'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import useSWR from 'swr';
import { Plus, Search, Filter, Package, Wrench, DollarSign, Users as UsersIcon } from 'lucide-react';
import { resourcesApi } from '@/lib/api';
import { ResourceType } from '@/lib/api/types';
import type { ResourceQueryParams } from '@/lib/api/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { ResourceFormDialog } from '@/components/resources/resource-form-dialog';

const RESOURCE_TYPES: ResourceType[] = [
    ResourceType.HUMAN,
    ResourceType.EQUIPMENT,
    ResourceType.MATERIAL,
    ResourceType.FINANCIAL
];

export default function ResourcesPage() {
    const t = useTranslations('Resources');
    const locale = useLocale();
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<ResourceType | 'all'>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);

    // Build query params
    const params: ResourceQueryParams = {
        ...(searchQuery && { search: searchQuery }),
        ...(typeFilter !== 'all' && { type: typeFilter }),
        ...(statusFilter !== 'all' && { is_active: statusFilter === 'active' }),
    };

    // Fetch resources with SWR
    const { data: resources, error, isLoading, mutate } = useSWR(
        ['resources', params],
        () => resourcesApi.getResources(params)
    );

    const getTypeIcon = (type: ResourceType) => {
        switch (type) {
            case ResourceType.HUMAN:
                return <UsersIcon className="h-4 w-4" />;
            case ResourceType.EQUIPMENT:
                return <Wrench className="h-4 w-4" />;
            case ResourceType.MATERIAL:
                return <Package className="h-4 w-4" />;
            case ResourceType.FINANCIAL:
                return <DollarSign className="h-4 w-4" />;
            default:
                return <Package className="h-4 w-4" />;
        }
    };

    const getTypeColor = (type: ResourceType) => {
        switch (type) {
            case ResourceType.HUMAN:
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            case ResourceType.EQUIPMENT:
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
            case ResourceType.MATERIAL:
                return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
            case ResourceType.FINANCIAL:
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
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
                <Button onClick={() => setIsFormDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    {t('newResource')}
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
                <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as ResourceType | 'all')}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <Filter className="mr-2 h-4 w-4" />
                        <SelectValue placeholder={t('filterByType')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t('allTypes')}</SelectItem>
                        {RESOURCE_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                                {t(`types.${type}`)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as 'all' | 'active' | 'inactive')}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <Filter className="mr-2 h-4 w-4" />
                        <SelectValue placeholder={t('filterByStatus')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t('allStatuses')}</SelectItem>
                        <SelectItem value="active">{t('active')}</SelectItem>
                        <SelectItem value="inactive">{t('inactive')}</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Resources Grid */}
            {isLoading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-20 w-full" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <p className="text-destructive">{t('errorLoading')}</p>
                </div>
            ) : !resources || resources.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <Package className="mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="text-lg font-medium">{t('noResources')}</p>
                    <p className="text-muted-foreground">{t('noResourcesDesc')}</p>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {resources.map((resource) => (
                        <Link key={resource.id} href={`/${locale}/portal/resources/${resource.id}`}>
                            <Card className="h-full transition-all hover:shadow-md">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-2">
                                            {getTypeIcon(resource.type)}
                                            <CardTitle className="text-lg">{resource.name}</CardTitle>
                                        </div>
                                        <Badge className={getTypeColor(resource.type)}>
                                            {t(`types.${resource.type}`)}
                                        </Badge>
                                    </div>
                                    {resource.description && (
                                        <CardDescription className="line-clamp-2">
                                            {resource.description}
                                        </CardDescription>
                                    )}
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 text-sm">
                                        {resource.unit_cost && (
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">{t('unitCost')}:</span>
                                                <span className="font-medium">
                                                    ${resource.unit_cost.toFixed(2)} {resource.unit && `/ ${resource.unit}`}
                                                </span>
                                            </div>
                                        )}
                                        {resource.available_quantity !== undefined && (
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">{t('available')}:</span>
                                                <span className="font-medium">
                                                    {resource.available_quantity} {resource.unit || t('units')}
                                                </span>
                                            </div>
                                        )}
                                        {resource.location && (
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">{t('location')}:</span>
                                                <span className="font-medium truncate">{resource.location}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between pt-2 border-t">
                                            <Badge variant={resource.is_active ? 'default' : 'secondary'}>
                                                {resource.is_active ? t('active') : t('inactive')}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}

            {/* Create/Edit Resource Dialog */}
            <ResourceFormDialog
                open={isFormDialogOpen}
                onOpenChange={setIsFormDialogOpen}
                onSuccess={() => mutate()}
            />
        </div>
    );
}
