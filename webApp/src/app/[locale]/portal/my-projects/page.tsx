'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth.tsx';
import { useTranslations, useLocale } from 'next-intl';
import useSWR from 'swr';
import { Plus, Calendar, Users, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import { ProjectFormDialog } from '@/components/projects/project-form-dialog';
import { projectsApi } from '@/lib/api/projects';
import { ProjectStatus } from '@/lib/api/types';
import type { ProjectDetail } from '@/lib/api/types';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
    [ProjectStatus.PLANNING]: 'outline',
    [ProjectStatus.IN_PROGRESS]: 'default',
    [ProjectStatus.COMPLETED]: 'secondary',
    [ProjectStatus.SUSPENDED]: 'destructive',
    [ProjectStatus.CANCELLED]: 'destructive',
};

export default function MyProjectsPage() {
    const { user } = useAuth();
    const locale = useLocale();
    const t = useTranslations('ProjectManager');

    const [statusFilter, setStatusFilter] = useState('all');
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editProject, setEditProject] = useState<ProjectDetail | null>(null);
    const [deleteProjectId, setDeleteProjectId] = useState<number | null>(null);

    // Fetch PM's projects
    const { data: projects, isLoading, mutate } = useSWR(
        user?.id ? ['my-projects-page', user.id] : null,
        () => projectsApi.getProjects({ manager_id: user!.id })
    );

    // Filter projects client-side by status
    const filteredProjects = (projects || []).filter(project => {
        if (statusFilter === 'all') return true;
        if (statusFilter === 'active') return project.status === ProjectStatus.IN_PROGRESS || project.status === ProjectStatus.PLANNING;
        return project.status === statusFilter;
    });

    // Fetch full project detail when editing
    const handleEdit = async (projectId: number) => {
        try {
            const detail = await projectsApi.getProject(projectId);
            setEditProject(detail);
        } catch (error) {
            toast.error(t('myProjects.editError'));
            console.error('Failed to fetch project detail:', error);
        }
    };

    // Delete project
    const handleDelete = async () => {
        if (deleteProjectId === null) return;
        try {
            await projectsApi.deleteProject(deleteProjectId);
            toast.success(t('myProjects.deleteSuccess'));
            setDeleteProjectId(null);
            mutate();
        } catch (error) {
            toast.error(t('myProjects.deleteError'));
            console.error('Failed to delete project:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <Skeleton className="h-12 w-full" />
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-56" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <PageHeader
                title={t('myProjects.title')}
                description={t('myProjects.subtitle')}
                actions={
                    <Button onClick={() => setCreateDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        {t('myProjects.newProject')}
                    </Button>
                }
            />

            {/* Status Filter Tabs */}
            <Tabs value={statusFilter} onValueChange={setStatusFilter}>
                <TabsList className="grid w-full grid-cols-4 lg:w-auto">
                    <TabsTrigger value="all">{t('myProjects.filters.all')}</TabsTrigger>
                    <TabsTrigger value="active">{t('myProjects.filters.active')}</TabsTrigger>
                    <TabsTrigger value={ProjectStatus.COMPLETED}>{t('myProjects.filters.completed')}</TabsTrigger>
                    <TabsTrigger value={ProjectStatus.SUSPENDED}>{t('myProjects.filters.onHold')}</TabsTrigger>
                </TabsList>

                <TabsContent value={statusFilter} className="mt-4">
                    {filteredProjects.length === 0 ? (
                        <Card>
                            <CardContent className="pt-6">
                                <Empty>
                                    <EmptyHeader>
                                        <EmptyTitle>{t('myProjects.noProjects')}</EmptyTitle>
                                        <EmptyDescription>{t('myProjects.noProjectsDesc')}</EmptyDescription>
                                    </EmptyHeader>
                                </Empty>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {filteredProjects.map((project) => (
                                <Card key={project.id} className={cn(
                                    project.status === ProjectStatus.COMPLETED && 'border-emerald-500',
                                    project.status === ProjectStatus.SUSPENDED && 'border-amber-500',
                                )}>
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <CardTitle className="text-base truncate mr-2">
                                                {project.name}
                                            </CardTitle>
                                            <Badge variant={STATUS_VARIANT[project.status] || 'outline'}>
                                                {t(`myProjects.status.${project.status}`)}
                                            </Badge>
                                        </div>
                                        {project.location_name && (
                                            <CardDescription className="text-xs mt-1">
                                                {project.location_name}
                                            </CardDescription>
                                        )}
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {/* Progress bar */}
                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-muted-foreground">{t('myProjects.progress')}</span>
                                                <span className="font-medium">{project.progress_percentage || 0}%</span>
                                            </div>
                                            <Progress value={project.progress_percentage || 0} />
                                        </div>

                                        {/* Stats row */}
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                                <Users className="h-3.5 w-3.5" />
                                                <span>{project.team_size} {t('myProjects.members')}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                                <Users className="h-3.5 w-3.5" />
                                                <span>{project.volunteers_count} {t('myProjects.volunteers')}</span>
                                            </div>
                                        </div>

                                        {/* Dates */}
                                        {project.end_date && (
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <Calendar className="h-3.5 w-3.5" />
                                                <span>{t('myProjects.dueDate')}: {format(parseISO(project.end_date), 'MMM dd, yyyy')}</span>
                                            </div>
                                        )}
                                    </CardContent>
                                    <CardFooter className="flex gap-2 pt-0">
                                        <Link href={`/${locale}/portal/projects/${project.id}`} className="flex-1">
                                            <Button variant="outline" size="sm" className="w-full">
                                                {t('myProjects.view')}
                                            </Button>
                                        </Link>
                                        <Button variant="outline" size="sm" onClick={() => handleEdit(project.id)}>
                                            {t('myProjects.edit')}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                                            onClick={() => setDeleteProjectId(project.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Create Project Dialog */}
            <ProjectFormDialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
                onSuccess={() => mutate()}
            />

            {/* Edit Project Dialog */}
            {editProject && (
                <ProjectFormDialog
                    open={!!editProject}
                    onOpenChange={(open) => !open && setEditProject(null)}
                    project={editProject}
                    onSuccess={() => {
                        setEditProject(null);
                        mutate();
                    }}
                />
            )}

            {/* Delete Confirmation */}
            {deleteProjectId !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setDeleteProjectId(null)} />
                    <Card className="relative z-10 w-full max-w-md mx-4">
                        <CardHeader>
                            <CardTitle>{t('myProjects.deleteConfirmTitle')}</CardTitle>
                            <CardDescription>{t('myProjects.deleteConfirmDesc')}</CardDescription>
                        </CardHeader>
                        <CardFooter className="justify-end gap-2">
                            <Button variant="outline" onClick={() => setDeleteProjectId(null)}>
                                {t('myProjects.cancel')}
                            </Button>
                            <Button variant="destructive" onClick={handleDelete}>
                                {t('myProjects.delete')}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            )}
        </div>
    );
}
