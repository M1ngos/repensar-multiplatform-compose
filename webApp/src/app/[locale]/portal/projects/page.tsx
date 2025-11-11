'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import useSWR from 'swr';
import { Plus, Search, Filter, MapPin, Users, FolderKanban } from 'lucide-react';
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
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardAction, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from '@/components/ui/empty';

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
                return 'bg-sky/10 text-sky border-sky/20';
            case 'in_progress':
                return 'bg-leaf/10 text-leaf border-leaf/20';
            case 'suspended':
                return 'bg-sunset/10 text-sunset border-sunset/20';
            case 'completed':
                return 'bg-growth/10 text-growth border-growth/20';
            case 'cancelled':
                return 'bg-destructive/10 text-destructive border-destructive/20';
            default:
                return 'bg-muted text-muted-foreground border-border';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'critical':
                return 'bg-destructive/10 text-destructive border-destructive/20';
            case 'high':
                return 'bg-sunset/10 text-sunset border-sunset/20';
            case 'medium':
                return 'bg-amber/10 text-amber border-amber/20';
            case 'low':
                return 'bg-moss/10 text-moss border-moss/20';
            default:
                return 'bg-muted text-muted-foreground border-border';
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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                        <div className="col-span-full">
                            <Empty>
                                <EmptyHeader>
                                    <EmptyMedia variant="icon">
                                        <FolderKanban />
                                    </EmptyMedia>
                                    <EmptyTitle>{t('noProjects')}</EmptyTitle>
                                    <EmptyDescription>{t('noProjectsDesc')}</EmptyDescription>
                                </EmptyHeader>
                                <EmptyContent>
                                    <Button onClick={() => setIsFormOpen(true)}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        {t('newProject')}
                                    </Button>
                                </EmptyContent>
                            </Empty>
                        </div>
                    ) : (
                        projects.map((project) => (
                            <Link
                                key={project.id}
                                href={`/${locale}/portal/projects/${project.id}`}
                                className="block"
                            >
                                <Card className="h-full hover:bg-accent/50 transition-colors">
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
                                                    <span>{t('detail.volunteers_needed')}</span>
                                                </div>
                                            )}
                                        </CardFooter>
                                    )}
                                </Card>
                            </Link>
                        ))
                    )}
            </div>

            {/* Project Form Dialog */}
            <ProjectFormDialog
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                onSuccess={() => mutate()}
            />
        </div>
    );
}
