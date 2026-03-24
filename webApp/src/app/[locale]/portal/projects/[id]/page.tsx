'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import useSWR from 'swr';
import {ArrowLeft, Edit, Trash2, Users, Target, BarChart3, Calendar, MapPin, DollarSign, Loader2, MoreHorizontal} from 'lucide-react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { projectsApi } from '@/lib/api';
import type { ProjectTeamMember } from '@/lib/api/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProjectFormDialog } from '@/components/projects/project-form-dialog';
import { AddTeamMemberDialog } from '@/components/projects/add-team-member-dialog';
import { AddMilestoneDialog } from '@/components/projects/add-milestone-dialog';
import { AddMetricDialog } from '@/components/projects/add-metric-dialog';
import { ProjectTasksTab } from '@/components/projects/project-tasks-tab';
import { ProjectActivityTab } from '@/components/projects/project-activity-tab';
import { TaskFormDialog } from '@/components/tasks/task-form-dialog';
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
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
    const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
    const [memberToRemove, setMemberToRemove] = useState<ProjectTeamMember | null>(null);
    const [editRoleMember, setEditRoleMember] = useState<ProjectTeamMember | null>(null);
    const [newRole, setNewRole] = useState('');
    const [isTeamMutating, setIsTeamMutating] = useState(false);

    // Fetch project details
    const { data: project, error, isLoading, mutate } = useSWR(
        projectId ? ['project', projectId] : null,
        () => projectsApi.getProject(projectId)
    );

    // Fetch team members separately for reliable refresh after mutations
    const { data: teamMembers, mutate: mutateTeam } = useSWR(
        projectId ? ['project-team', projectId] : null,
        () => projectsApi.getProjectTeam(projectId)
    );

    const getStatusColor = (status: string) => {
        const map: Record<string, string> = {
            planning: 'bg-sky/10 text-sky border-sky/20',
            in_progress: 'bg-leaf/10 text-leaf border-leaf/20',
            suspended: 'bg-sunset/10 text-sunset border-sunset/20',
            completed: 'bg-growth/10 text-growth border-growth/20',
            cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
            not_started: 'bg-muted text-muted-foreground border-border',
        };
        return map[status] ?? 'bg-muted text-muted-foreground border-border';
    };

    const getPriorityColor = (priority: string) => {
        const map: Record<string, string> = {
            critical: 'bg-destructive/10 text-destructive border-destructive/20',
            high: 'bg-sunset/10 text-sunset border-sunset/20',
            medium: 'bg-amber/10 text-amber border-amber/20',
            low: 'bg-moss/10 text-moss border-moss/20',
        };
        return map[priority] ?? 'bg-muted text-muted-foreground border-border';
    };

    const handleDeleteProject = async () => {
        setIsDeleting(true);
        try {
            await projectsApi.deleteProject(projectId);
            toast.success(t('detail.deleteSuccess'));
            router.push(`/${locale}/portal/projects`);
        } catch (error: unknown) {
            console.error('Error deleting project:', error);
            const apiError = error as { detail?: string };
            toast.error(apiError.detail || t('detail.deleteError'));
            setIsDeleting(false);
            setIsDeleteDialogOpen(false);
        }
    };

    const handleRemoveMember = async () => {
        if (!memberToRemove) return;
        setIsTeamMutating(true);
        try {
            await projectsApi.removeTeamMember(projectId, memberToRemove.user_id);
            toast.success(t('detail.memberRemoved'));
            mutateTeam(); mutate();
        } catch {
            toast.error(t('detail.memberRemoveError'));
        } finally {
            setMemberToRemove(null);
            setIsTeamMutating(false);
        }
    };

    const handleUpdateRole = async () => {
        if (!editRoleMember) return;
        setIsTeamMutating(true);
        try {
            await projectsApi.updateTeamMember(projectId, editRoleMember.user_id, { role: newRole });
            toast.success(t('detail.roleUpdated'));
            mutateTeam(); mutate();
        } catch {
            toast.error(t('detail.roleUpdateError'));
        } finally {
            setEditRoleMember(null);
            setIsTeamMutating(false);
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
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                    <Link href={`/${locale}/portal/projects`}>
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
                        <p className="text-muted-foreground">
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
                        <TabsTrigger value="tasks">{t('detail.tabs.tasks')}</TabsTrigger>
                        <TabsTrigger value="activity">{t('detail.tabs.activity')}</TabsTrigger>
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
                                        {teamMembers?.length ?? project.team_members.length}
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
                                            {(teamMembers ?? project.team_members).length} {t('detail.activeMembers')}
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
                                            <TableHead>{t('detail.hoursContributed')}</TableHead>
                                            <TableHead>{t('detail.tasksAssigned')}</TableHead>
                                            <TableHead className="w-[50px]">{t('detail.actions')}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {(teamMembers ?? project.team_members).length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center text-muted-foreground">
                                                    {t('detail.noTeamMembers')}
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            (teamMembers ?? project.team_members).map((member) => (
                                                <TableRow key={member.id}>
                                                    <TableCell className="font-medium">
                                                        {member.name || member.user_name || '-'}
                                                    </TableCell>
                                                    <TableCell>{member.role || '-'}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">
                                                            {member.is_volunteer ? t('detail.volunteer') : t('detail.staff')}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {member.joined_date ? format(new Date(member.joined_date), 'PP')
                                                         : member.assigned_at ? format(new Date(member.assigned_at), 'PP')
                                                         : '-'}
                                                    </TableCell>
                                                    <TableCell className="tabular-nums">
                                                        {member.hours_contributed != null ? `${member.hours_contributed}h` : '-'}
                                                    </TableCell>
                                                    <TableCell className="tabular-nums">
                                                        {member.tasks_assigned ?? '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem onClick={() => { setEditRoleMember(member); setNewRole(member.role ?? ''); }}>
                                                                    {t('detail.editRole')}
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setMemberToRemove(member)}>
                                                                    {t('detail.removeMember')}
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
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

                    {/* Tasks Tab */}
                    <TabsContent value="tasks" className="space-y-4">
                        <ProjectTasksTab projectId={projectId} locale={locale} />
                    </TabsContent>

                    {/* Activity Tab */}
                    <TabsContent value="activity">
                        <ProjectActivityTab projectId={projectId} />
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
                    onSuccess={() => { mutateTeam(); mutate(); }}
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

                {/* Create Task Dialog (managed by ProjectTasksTab internally, but exposed here for future use) */}
                <TaskFormDialog
                    open={isCreateTaskOpen}
                    onOpenChange={setIsCreateTaskOpen}
                    projectId={projectId}
                    onSuccess={() => {}}
                />

                {/* Remove Team Member Dialog */}
                <AlertDialog open={!!memberToRemove} onOpenChange={(open) => { if (!open) setMemberToRemove(null); }}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>{t('detail.removeMemberTitle')}</AlertDialogTitle>
                            <AlertDialogDescription>{t('detail.removeMemberDesc')}</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={isTeamMutating}>{t('detail.deleteCancel')}</AlertDialogCancel>
                            <AlertDialogAction onClick={handleRemoveMember} disabled={isTeamMutating} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                {t('detail.removeMember')}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Edit Role Dialog */}
                <Dialog open={!!editRoleMember} onOpenChange={(open) => { if (!open) setEditRoleMember(null); }}>
                    <DialogContent className="max-w-sm">
                        <DialogHeader>
                            <DialogTitle>{t('detail.editRole')}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-2 py-2">
                            <Label htmlFor="newRole">{t('detail.newRole')}</Label>
                            <Input
                                id="newRole"
                                value={newRole}
                                onChange={(e) => setNewRole(e.target.value)}
                                placeholder={t('detail.newRolePlaceholder')}
                            />
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setEditRoleMember(null)}>{t('detail.deleteCancel')}</Button>
                            <Button onClick={handleUpdateRole} disabled={isTeamMutating}>{t('detail.save')}</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

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
                                className="bg-destructive hover:bg-destructive/90"
                            >
                                {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {t('detail.deleteConfirm')}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
    );
}
