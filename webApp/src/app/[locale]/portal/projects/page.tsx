'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import useSWR from 'swr';
import { Plus, Search, Filter, MapPin, Users } from 'lucide-react';
import { projectsApi } from '@/lib/api';
import type { ProjectQueryParams, ProjectStatus, ProjectCategory } from '@/lib/api/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProjectFormDialog } from '@/components/projects/project-form-dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardAction, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { useLocale } from 'next-intl';

const PROJECT_STATUSES = ['planning', 'in_progress', 'suspended', 'completed', 'cancelled'] as const;
const PROJECT_CATEGORIES = [
    'reforestation',
    'environmental_education',
    'waste_management',
    'conservation',
    'research',
    'community_engagement',
    'climate_action',
    'biodiversity',
    'other',
] as const;

export default function ProjectsPage() {
    const t = useTranslations('Projects');
    const locale = useLocale();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<(typeof PROJECT_STATUSES)[number] | 'all'>('all');
    const [categoryFilter, setCategoryFilter] = useState<(typeof PROJECT_CATEGORIES)[number] | 'all'>('all');
    const [isFormOpen, setIsFormOpen] = useState(false);

    // Build query params
    const params: ProjectQueryParams = {
        ...(searchQuery && { search: searchQuery }),
        ...(statusFilter !== 'all' && { status: statusFilter as ProjectStatus }),
        ...(categoryFilter !== 'all' && { category: categoryFilter as ProjectCategory }),
    };

    // Fetch projects with SWR
    const { data: projects, error, isLoading, mutate } = useSWR(
        ['projects', params],
        () => projectsApi.getProjects(params)
    );

    const getStatusColor = (status: ProjectStatus) => {
        switch (status) {
            case 'planning':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            case 'in_progress':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'suspended':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            case 'completed':
                return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300';
            case 'cancelled':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'critical':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            case 'high':
                return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
            case 'medium':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            case 'low':
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
        }
    };

    return (
        <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-col gap-4 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold md:text-3xl">{t('title')}</h1>
                        <p className="text-muted-foreground">{t('subtitle')}</p>
                    </div>
                    <Button onClick={() => setIsFormOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        {t('newProject')}
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
                    <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as (typeof PROJECT_STATUSES)[number] | 'all')}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <Filter className="mr-2 h-4 w-4" />
                            <SelectValue placeholder={t('filterByStatus')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('allStatuses')}</SelectItem>
                            {PROJECT_STATUSES.map((status) => (
                                <SelectItem key={status} value={status}>
                                    {t(`statuses.${status}`)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as (typeof PROJECT_CATEGORIES)[number] | 'all')}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <Filter className="mr-2 h-4 w-4" />
                            <SelectValue placeholder={t('filterByCategory')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('allCategories')}</SelectItem>
                            {PROJECT_CATEGORIES.map((category) => (
                                <SelectItem key={category} value={category}>
                                    {t(`categories.${category}`)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Projects Grid */}
                <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
                    {isLoading ? (
                        // Loading skeleton
                        Array.from({ length: 6 }).map((_, i) => (
                            <Card key={i} className="@container/card">
                                <CardHeader>
                                    <Skeleton className="h-4 w-32 mb-2" />
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
                    ) : !projects || projects.length === 0 ? (
                        <div className="col-span-full text-center py-12">
                            <p className="text-muted-foreground">{t('noProjects')}</p>
                        </div>
                    ) : (
                        projects.map((project) => (
                            <Link
                                key={project.id}
                                href={`/${locale}/portal/projects/${project.id}`}
                                className="block"
                            >
                                <Card className="@container/card hover:shadow-lg transition-shadow cursor-pointer h-full">
                                    <CardHeader>
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                <CardDescription className="mb-1">
                                                    {t(`categories.${project.category}`)}
                                                </CardDescription>
                                                <CardTitle className="text-lg @[250px]/card:text-xl line-clamp-2">
                                                    {project.name}
                                                </CardTitle>
                                            </div>
                                            <CardAction>
                                                <Badge className={getPriorityColor(project.priority)} variant="secondary">
                                                    {t(`priorities.${project.priority}`)}
                                                </Badge>
                                            </CardAction>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {/* Status Badge */}
                                        <Badge className={getStatusColor(project.status)} variant="secondary">
                                            {t(`statuses.${project.status}`)}
                                        </Badge>

                                        {/* Location */}
                                        {project.location_name && (
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <MapPin className="h-4 w-4" />
                                                <span className="line-clamp-1">{project.location_name}</span>
                                            </div>
                                        )}

                                        {/* Stats Grid */}
                                        <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                                            <div>
                                                <div className="text-xs text-muted-foreground">{t('table.team')}</div>
                                                <div className="text-sm font-semibold">{project.team_size}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-muted-foreground">{t('table.progress')}</div>
                                                <div className="text-sm font-semibold">
                                                    {project.progress_percentage !== null && project.progress_percentage !== undefined
                                                        ? `${Math.round(project.progress_percentage)}%`
                                                        : '-'}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-muted-foreground">Budget</div>
                                                <div className="text-sm font-semibold">
                                                    {project.budget ? `$${(project.budget / 1000).toFixed(0)}k` : '-'}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                    {(project.project_manager_name || project.requires_volunteers) && (
                                        <CardFooter className="flex-col items-start gap-1.5 text-sm">
                                            {project.project_manager_name && (
                                                <div className="text-muted-foreground">
                                                    {t('table.manager')}: <span className="font-medium text-foreground">{project.project_manager_name}</span>
                                                </div>
                                            )}
                                            {project.requires_volunteers && (
                                                <div className="flex items-center gap-1 text-muted-foreground">
                                                    <Users className="h-3 w-3" />
                                                    <span>Volunteers needed</span>
                                                </div>
                                            )}
                                        </CardFooter>
                                    )}
                                </Card>
                            </Link>
                        ))
                    )}
                </div>

                {/* Legacy Table View - Hidden */}
                <div className="hidden rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('table.name')}</TableHead>
                                <TableHead>{t('table.category')}</TableHead>
                                <TableHead>{t('table.status')}</TableHead>
                                <TableHead>{t('table.priority')}</TableHead>
                                <TableHead>{t('table.manager')}</TableHead>
                                <TableHead className="text-right">{t('table.team')}</TableHead>
                                <TableHead className="text-right">{t('table.progress')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                // Loading skeleton
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                                    </TableRow>
                                ))
                            ) : error ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                        {t('errorLoading')}
                                    </TableCell>
                                </TableRow>
                            ) : !projects || projects.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                        {t('noProjects')}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                projects.map((project) => (
                                    <TableRow key={project.id} className="cursor-pointer hover:bg-muted/50">
                                        <TableCell>
                                            <Link
                                                href={`/${locale}/portal/projects/${project.id}`}
                                                className="font-medium hover:underline"
                                            >
                                                {project.name}
                                            </Link>
                                            {project.location_name && (
                                                <div className="text-xs text-muted-foreground">
                                                    {project.location_name}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm">{t(`categories.${project.category}`)}</span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getStatusColor(project.status)} variant="secondary">
                                                {t(`statuses.${project.status}`)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getPriorityColor(project.priority)} variant="secondary">
                                                {t(`priorities.${project.priority}`)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {project.project_manager_name || '-'}
                                        </TableCell>
                                        <TableCell className="text-right text-sm">
                                            {project.team_size} {t('table.members')}
                                        </TableCell>
                                        <TableCell className="text-right text-sm font-medium">
                                            {project.progress_percentage !== null && project.progress_percentage !== undefined
                                                ? `${Math.round(project.progress_percentage)}%`
                                                : '-'}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Project Form Dialog */}
                <ProjectFormDialog
                    open={isFormOpen}
                    onOpenChange={setIsFormOpen}
                    onSuccess={() => mutate()}
                />
            </div>
        </div>
    );
}
