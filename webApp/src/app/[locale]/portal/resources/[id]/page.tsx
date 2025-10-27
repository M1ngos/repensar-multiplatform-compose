'use client';

import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import { ArrowLeft, Edit, Trash2, Package, MapPin, DollarSign } from 'lucide-react';
import { resourcesApi } from '@/lib/api';
import { ResourceType } from '@/lib/api/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

export default function ResourceDetailPage() {
    const t = useTranslations('Resources');
    const params = useParams();
    const router = useRouter();
    const resourceId = parseInt(params.id as string);
    // Note: Edit and delete functionality disabled until backend support added

    // Fetch resource details
    const { data: resource, error, isLoading } = useSWR(
        resourceId ? ['resource', resourceId] : null,
        () => resourcesApi.getResource(resourceId)
    );

    // Note: Backend doesn't support getting allocations per resource yet
    // Allocations would need to be fetched from the projects endpoint

    const getTypeIcon = (type: ResourceType) => {
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

    if (isLoading) {
        return (
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-96 w-full" />
            </div>
        );
    }

    if (error || !resource) {
        return (
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-2xl font-bold">{t('detail.error')}</h1>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{resource.name}</h1>
                        <p className="text-muted-foreground">
                            {t('detail.subtitle')} • {t(`types.${resource.type}`)}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" disabled title={t('detail.editNotSupported')}>
                        <Edit className="mr-2 h-4 w-4" />
                        {t('detail.edit')}
                    </Button>
                    <Button variant="destructive" disabled title={t('detail.deleteNotSupported')}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        {t('detail.delete')}
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('detail.available')}</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {resource.available_quantity || 0} {resource.unit || t('units')}
                        </div>
                    </CardContent>
                </Card>


                {resource.unit_cost && (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t('detail.unitCost')}</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                ${resource.unit_cost.toFixed(2)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {t('detail.perUnit', { unit: resource.unit || t('unit') })}
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Resource Details */}
            <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('detail.resourceDetails')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">{t('detail.type')}</p>
                                    <Badge className={getTypeIcon(resource.type)}>
                                        {t(`types.${resource.type}`)}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">{t('detail.status')}</p>
                                    <Badge variant={resource.is_active ? 'default' : 'secondary'}>
                                        {resource.is_active ? t('active') : t('inactive')}
                                    </Badge>
                                </div>
                            </div>

                            {resource.description && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">{t('detail.description')}</p>
                                    <p className="mt-1">{resource.description}</p>
                                </div>
                            )}

                            {resource.location && (
                                <div className="flex items-start gap-2">
                                    <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">{t('detail.location')}</p>
                                        <p className="mt-1">{resource.location}</p>
                                    </div>
                                </div>
                            )}

                            <div className="grid gap-4 sm:grid-cols-2 pt-4 border-t">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">{t('detail.createdAt')}</p>
                                    <p className="mt-1">{format(new Date(resource.created_at), 'PPP')}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">{t('detail.updatedAt')}</p>
                                    <p className="mt-1">{format(new Date(resource.updated_at), 'PPP')}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
            </div>
        </div>
    );
}
