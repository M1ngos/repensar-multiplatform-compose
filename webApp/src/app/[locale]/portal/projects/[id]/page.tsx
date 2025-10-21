'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import useSWR from 'swr';
import {ArrowLeft, Edit, Trash2, Users, Target, BarChart3, Calendar, MapPin, DollarSign, Loader2} from 'lucide-react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { projectsApi } from '@/lib/api';
import type { ProjectDetail } from '@/lib/api/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProjectFormDialog } from '@/components/projects/project-form-dialog';
import { AddTeamMemberDialog } from '@/components/projects/add-team-member-dialog';
import { AddMilestoneDialog } from '@/components/projects/add-milestone-dialog';
import { AddMetricDialog } from '@/components/projects/add-metric-dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardAction } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function ProjectDetailPage() {
    const params = useParams();
    const projectId = parseInt(params.id as string);
    const locale = useLocale();
    const router = useRouter();
    const t = useTranslations('Projects');
    const [isEditFormOpen, setIsEditFormOpen] = useState(false);
    const [isAddTeamMemberOpen, setIsAddTeamMemberOpen] = useState(false);
    const [isAddMilestoneOpen, setIsAddMilestoneOpen] = useState(false);
    const [isAddMetricOpen, setIsAddMetricOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Fetch project details
    const { data: project, error, isLoading, mutate } = useSWR(
        projectId ? ['project', projectId] : null,
        () => projectsApi.getProject(projectId)
    );

    const getStatusColor = (status: string) => {
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

    const handleDeleteProject = async () => {
        setIsDeleting(true);
        try {
            await projectsApi.deleteProject(projectId);
            toast.success(t('detail.deleteSuccess'));
            router.push(`/${locale}/portal/projects`);
        } catch (error: any) {
            console.error('Error deleting project:', error);
            toast.error(error.detail || t('detail.deleteError'));
            setIsDeleting(false);
            setIsDeleteDialogOpen(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-1 flex-col p-4 md:p-6">
                <Skeleton className="h-8 w-64 mb-4" />
                <Skeleton className="h-96 w-full" />
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="flex flex-1 flex-col p-4 md:p-6">
                <div className="text-center py-12">
                    <p className="text-muted-foreground">{t('detail.errorLoading')}</p>
                    <Link href={`/${locale}/portal/projects`}>
                        <Button variant="outline" className="mt-4">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            {t('detail.backToProjects')}
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-1 flex-col">
            <div className="flex flex-col gap-4 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                        <Link href={`/${locale}/portal/projects`}>
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold md:text-3xl">{project.name}</h1>
                            <p className="text-sm text-muted-foreground">
                                {t(`categories.${project.category}`)}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => setIsEditFormOpen(true)}>
                                <Edit className="mr-2 h-4 w-4" />
                                {t('detail.edit')}
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setIsDeleteDialogOpen(true)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Status Badges */}
                    <div className="flex flex-wrap gap-2">
                        <Badge className={getStatusColor(project.status)} variant="secondary">
                            {t(`statuses.${project.status}`)}
                        </Badge>
                        <Badge className={getPriorityColor(project.priority)} variant="secondary">
                            {t(`priorities.${project.priority}`)}
                        </Badge>
                        {project.requires_volunteers && (
                            <Badge variant="outline">
                                <Users className="mr-1 h-3 w-3" />
                                {t('detail.requiresVolunteers')}
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="overview" className="w-full">
                    <TabsList>
                        <TabsTrigger value="overview">{t('detail.tabs.overview')}</TabsTrigger>
                        <TabsTrigger value="team">{t('detail.tabs.team')}</TabsTrigger>
                        <TabsTrigger value="milestones">{t('detail.tabs.milestones')}</TabsTrigger>
                        <TabsTrigger value="metrics">{t('detail.tabs.metrics')}</TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Card className="@container/card">
                                <CardHeader>
                                    <CardDescription>{t('detail.progress')}</CardDescription>
                                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                                        {Math.round(project.progress_percentage)}%
                                    </CardTitle>
                                    <CardAction>
                                        <BarChart3 className="h-5 w-5 text-muted-foreground" />
                                    </CardAction>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        {project.completed_tasks} / {project.total_tasks} {t('detail.tasksCompleted')}
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="@container/card">
                                <CardHeader>
                                    <CardDescription>{t('detail.teamSize')}</CardDescription>
                                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                                        {project.team_members.length}
                                    </CardTitle>
                                    <CardAction>
                                        <Users className="h-5 w-5 text-muted-foreground" />
                                    </CardAction>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">{t('detail.activeMembers')}</p>
                                </CardContent>
                            </Card>

                            <Card className="@container/card">
                                <CardHeader>
                                    <CardDescription>{t('detail.volunteerHours')}</CardDescription>
                                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                                        {Math.round(project.volunteer_hours)}
                                    </CardTitle>
                                    <CardAction>
                                        <Calendar className="h-5 w-5 text-muted-foreground" />
                                    </CardAction>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">{t('detail.totalHours')}</p>
                                </CardContent>
                            </Card>

                            <Card className="@container/card">
                                <CardHeader>
                                    <CardDescription>{t('detail.budget')}</CardDescription>
                                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                                        {project.budget ? `$${project.budget.toLocaleString()}` : '-'}
                                    </CardTitle>
                                    <CardAction>
                                        <DollarSign className="h-5 w-5 text-muted-foreground" />
                                    </CardAction>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        {t('detail.spent')}: ${project.actual_cost.toLocaleString()}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>{t('detail.description')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                    {project.description || t('detail.noDescription')}
                                </p>
                            </CardContent>
                        </Card>

                        <div className="grid gap-4 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        {t('detail.timeline')}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">{t('detail.startDate')}</span>
                                        <span className="font-medium">
                                            {project.start_date ? format(new Date(project.start_date), 'PPP') : '-'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">{t('detail.endDate')}</span>
                                        <span className="font-medium">
                                            {project.end_date ? format(new Date(project.end_date), 'PPP') : '-'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">{t('detail.createdAt')}</span>
                                        <span className="font-medium">
                                            {format(new Date(project.created_at), 'PPP')}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        {t('detail.location')}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="text-sm">
                                        <span className="font-medium">{project.location_name || '-'}</span>
                                    </div>
                                    {project.latitude && project.longitude && (
                                        <p className="text-xs text-muted-foreground">
                                            {project.latitude.toFixed(4)}, {project.longitude.toFixed(4)}
                                        </p>
                                    )}
                                    <div className="pt-2">
                                        <p className="text-xs text-muted-foreground">{t('detail.manager')}</p>
                                        <p className="text-sm font-medium">{project.project_manager_name || '-'}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Team Tab */}
                    <TabsContent value="team" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>{t('detail.teamMembers')}</CardTitle>
                                        <CardDescription>
                                            {project.team_members.length} {t('detail.activeMembers')}
                                        </CardDescription>
                                    </div>
                                    <Button size="sm" onClick={() => setIsAddTeamMemberOpen(true)}>
                                        <Users className="mr-2 h-4 w-4" />
                                        {t('detail.addMember')}
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>{t('detail.name')}</TableHead>
                                            <TableHead>{t('detail.role')}</TableHead>
                                            <TableHead>{t('detail.type')}</TableHead>
                                            <TableHead>{t('detail.joinedDate')}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {project.team_members.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center text-muted-foreground">
                                                    {t('detail.noTeamMembers')}
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            project.team_members.map((member) => (
                                                <TableRow key={member.id}>
                                                    <TableCell className="font-medium">
                                                        {member.user_name || '-'}
                                                    </TableCell>
                                                    <TableCell>{member.role || '-'}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">
                                                            {member.is_volunteer ? t('detail.volunteer') : t('detail.staff')}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {format(new Date(member.assigned_at), 'PP')}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Milestones Tab */}
                    <TabsContent value="milestones" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>{t('detail.projectMilestones')}</CardTitle>
                                        <CardDescription>
                                            {project.milestones.length} {t('detail.milestones')}
                                        </CardDescription>
                                    </div>
                                    <Button size="sm" onClick={() => setIsAddMilestoneOpen(true)}>
                                        <Target className="mr-2 h-4 w-4" />
                                        {t('detail.addMilestone')}
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>{t('detail.milestoneName')}</TableHead>
                                            <TableHead>{t('detail.targetDate')}</TableHead>
                                            <TableHead>{t('detail.status')}</TableHead>
                                            <TableHead>{t('detail.actualDate')}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {project.milestones.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center text-muted-foreground">
                                                    {t('detail.noMilestones')}
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            project.milestones.map((milestone) => (
                                                <TableRow key={milestone.id}>
                                                    <TableCell className="font-medium">{milestone.name}</TableCell>
                                                    <TableCell>
                                                        {format(new Date(milestone.target_date), 'PP')}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant={
                                                                milestone.status === 'achieved'
                                                                    ? 'default'
                                                                    : milestone.status === 'pending'
                                                                    ? 'secondary'
                                                                    : 'destructive'
                                                            }
                                                        >
                                                            {t(`milestoneStatuses.${milestone.status}`)}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {milestone.actual_date
                                                            ? format(new Date(milestone.actual_date), 'PP')
                                                            : '-'}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Metrics Tab */}
                    <TabsContent value="metrics" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>{t('detail.environmentalMetrics')}</CardTitle>
                                        <CardDescription>
                                            {project.environmental_metrics.length} {t('detail.metrics')}
                                        </CardDescription>
                                    </div>
                                    <Button size="sm" onClick={() => setIsAddMetricOpen(true)}>
                                        <BarChart3 className="mr-2 h-4 w-4" />
                                        {t('detail.addMetric')}
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>{t('detail.metricName')}</TableHead>
                                            <TableHead>{t('detail.type')}</TableHead>
                                            <TableHead className="text-right">{t('detail.currentValue')}</TableHead>
                                            <TableHead className="text-right">{t('detail.targetValue')}</TableHead>
                                            <TableHead>{t('detail.unit')}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {project.environmental_metrics.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center text-muted-foreground">
                                                    {t('detail.noMetrics')}
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            project.environmental_metrics.map((metric) => (
                                                <TableRow key={metric.id}>
                                                    <TableCell className="font-medium">{metric.metric_name}</TableCell>
                                                    <TableCell>{metric.metric_type || '-'}</TableCell>
                                                    <TableCell className="text-right">
                                                        {metric.current_value.toLocaleString()}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {metric.target_value?.toLocaleString() || '-'}
                                                    </TableCell>
                                                    <TableCell>{metric.unit || '-'}</TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Edit Project Dialog */}
                <ProjectFormDialog
                    open={isEditFormOpen}
                    onOpenChange={setIsEditFormOpen}
                    project={project}
                    onSuccess={() => mutate()}
                />

                {/* Add Team Member Dialog */}
                <AddTeamMemberDialog
                    open={isAddTeamMemberOpen}
                    onOpenChange={setIsAddTeamMemberOpen}
                    projectId={projectId}
                    onSuccess={() => mutate()}
                />

                {/* Add Milestone Dialog */}
                <AddMilestoneDialog
                    open={isAddMilestoneOpen}
                    onOpenChange={setIsAddMilestoneOpen}
                    projectId={projectId}
                    onSuccess={() => mutate()}
                />

                {/* Add Metric Dialog */}
                <AddMetricDialog
                    open={isAddMetricOpen}
                    onOpenChange={setIsAddMetricOpen}
                    projectId={projectId}
                    onSuccess={() => mutate()}
                />

                {/* Delete Confirmation Dialog */}
                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>{t('detail.deleteTitle')}</AlertDialogTitle>
                            <AlertDialogDescription>
                                {t('detail.deleteDescription')}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={isDeleting}>
                                {t('detail.deleteCancel')}
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDeleteProject}
                                disabled={isDeleting}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {t('detail.deleteConfirm')}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
}
