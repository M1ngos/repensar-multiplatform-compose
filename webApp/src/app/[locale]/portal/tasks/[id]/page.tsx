'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import useSWR from 'swr';
import { tasksApi } from '@/lib/api';
import { useAuth } from '@/lib/hooks/useAuth';
import { TaskStatus, TaskPriority } from '@/lib/api/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardAction } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
    ArrowLeft,
    Edit,
    Trash2,
    CheckCircle2,
    Clock,
    Users,
    Target,
    Calendar,
    AlertCircle,
    Link as LinkIcon,
    User,
    Plus,
    X,
    Play,
    RotateCcw,
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
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
import { TaskFormDialog } from '@/components/tasks/task-form-dialog';
import { AddDependencyDialog } from '@/components/tasks/add-dependency-dialog';
import { AssignVolunteerDialog } from '@/components/tasks/assign-volunteer-dialog';

export default function TaskDetailPage() {
    const params = useParams();
    const router = useRouter();
    const locale = useLocale();
    const taskId = parseInt(params.id as string);
    const t = useTranslations('Tasks');
    const { user } = useAuth();
    const isVolunteer = user?.user_type === 'volunteer';
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [isAddDependencyOpen, setIsAddDependencyOpen] = useState(false);
    const [isAssignVolunteerOpen, setIsAssignVolunteerOpen] = useState(false);

    // Fetch task detail
    const { data: task, error, isLoading, mutate } = useSWR(
        `task-${taskId}`,
        () => tasksApi.getTask(taskId)
    );

    const getStatusColor = (status: TaskStatus) => {
        const map: Record<string, string> = {
            not_started: 'bg-muted text-muted-foreground border-border',
            in_progress: 'bg-leaf/10 text-leaf border-leaf/20',
            completed: 'bg-growth/10 text-growth border-growth/20',
            cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
        };
        return map[status] ?? 'bg-muted text-muted-foreground border-border';
    };

    const getPriorityColor = (priority: TaskPriority) => {
        const map: Record<string, string> = {
            critical: 'bg-destructive/10 text-destructive border-destructive/20',
            high: 'bg-sunset/10 text-sunset border-sunset/20',
            medium: 'bg-amber/10 text-amber border-amber/20',
            low: 'bg-moss/10 text-moss border-moss/20',
        };
        return map[priority] ?? 'bg-muted text-muted-foreground border-border';
    };

    const handleDeleteTask = async () => {
        setIsDeleting(true);
        try {
            await tasksApi.deleteTask(taskId);
            toast.success(t('detail.deleteSuccess'));
            router.push(`/${locale}/portal/tasks`);
        } catch (_error) {
            toast.error(t('detail.deleteError'));
            setIsDeleting(false);
        }
    };

    const handleQuickStatus = async (newStatus: TaskStatus) => {
        setIsUpdatingStatus(true);
        try {
            await tasksApi.updateTask(taskId, { status: newStatus });
            toast.success(t('detail.statusUpdated'));
            mutate();
        } catch {
            toast.error(t('detail.statusUpdateError'));
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const handleRemoveDependency = async (dependencyId: number) => {
        try {
            await tasksApi.removeTaskDependency(dependencyId);
            toast.success(t('detail.dependencyRemoved'));
            mutate();
        } catch (_error) {
            toast.error(t('detail.dependencyRemoveError'));
        }
    };

    const handleRemoveVolunteer = async (volunteerId: number) => {
        try {
            await tasksApi.removeVolunteer(taskId, volunteerId);
            toast.success(t('detail.volunteerRemoved'));
            mutate();
        } catch (_error) {
            toast.error(t('detail.volunteerRemoveError'));
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-col gap-4 p-4 md:p-6">
                    <Skeleton className="h-8 w-64" />
                    <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} className="h-32" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error || !task) {
        return (
            <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-col gap-4 p-4 md:p-6">
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">{t('detail.errorLoading')}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-col gap-4 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4">
                    <Link href={isVolunteer ? `/${locale}/portal/my-tasks` : `/${locale}/portal/tasks`}>
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            {t('detail.backToTasks')}
                        </Button>
                    </Link>

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <h1 className="text-2xl font-bold md:text-3xl">{task.title}</h1>
                                <Badge className={getStatusColor(task.status)} variant="secondary">
                                    {t(`statuses.${task.status}`)}
                                </Badge>
                                <Badge className={getPriorityColor(task.priority)} variant="secondary">
                                    {t(`priorities.${task.priority}`)}
                                </Badge>
                                {task.is_overdue && (
                                    <Badge variant="destructive">
                                        <AlertCircle className="mr-1 h-3 w-3" />
                                        {t('detail.overdue')}
                                    </Badge>
                                )}
                            </div>
                            <p className="text-muted-foreground">
                                <Link href={`/${locale}/portal/projects/${task.project_id}`} className="hover:underline">
                                    {task.project_name}
                                </Link>
                            </p>
                        </div>
                        {!isVolunteer && (
                            <div className="flex gap-2">
                                {task.status === TaskStatus.NOT_STARTED && (
                                    <Button size="sm" variant="outline" onClick={() => handleQuickStatus(TaskStatus.IN_PROGRESS)} disabled={isUpdatingStatus}>
                                        <Play className="mr-2 h-4 w-4" />
                                        {t('detail.startTask')}
                                    </Button>
                                )}
                                {task.status === TaskStatus.IN_PROGRESS && (
                                    <Button size="sm" variant="outline" onClick={() => handleQuickStatus(TaskStatus.COMPLETED)} disabled={isUpdatingStatus}>
                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                        {t('detail.markComplete')}
                                    </Button>
                                )}
                                {(task.status === TaskStatus.COMPLETED || task.status === TaskStatus.CANCELLED) && (
                                    <Button size="sm" variant="outline" onClick={() => handleQuickStatus(TaskStatus.NOT_STARTED)} disabled={isUpdatingStatus}>
                                        <RotateCcw className="mr-2 h-4 w-4" />
                                        {t('detail.reopen')}
                                    </Button>
                                )}
                                <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    {t('detail.editTask')}
                                </Button>
                                <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    {t('detail.deleteTask')}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-4">
                    <Card className="@container/card">
                        <CardHeader>
                            <CardDescription>{t('detail.progress')}</CardDescription>
                            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                                {Math.round(task.progress_percentage)}%
                            </CardTitle>
                            <CardAction>
                                <Target className="h-5 w-5 text-muted-foreground" />
                            </CardAction>
                        </CardHeader>
                        <CardContent>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary transition-all rounded-full"
                                    style={{ width: `${task.progress_percentage}%` }}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="@container/card">
                        <CardHeader>
                            <CardDescription>{t('detail.volunteers')}</CardDescription>
                            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                                {task.volunteer_assignments?.length || 0}
                            </CardTitle>
                            <CardAction>
                                <Users className="h-5 w-5 text-muted-foreground" />
                            </CardAction>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                {task.volunteer_hours}h {t('detail.contributed')}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="@container/card">
                        <CardHeader>
                            <CardDescription>{t('detail.dependencies')}</CardDescription>
                            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                                {task.dependencies?.length || 0}
                            </CardTitle>
                            <CardAction>
                                <LinkIcon className="h-5 w-5 text-muted-foreground" />
                            </CardAction>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                {t('detail.linkedTasks')}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="@container/card">
                        <CardHeader>
                            <CardDescription>{t('detail.dueDate')}</CardDescription>
                            <CardTitle className="text-xl font-semibold @[250px]/card:text-2xl">
                                {task.end_date ? format(new Date(task.end_date), 'MMM d, yyyy') : '-'}
                            </CardTitle>
                            <CardAction>
                                <Calendar className="h-5 w-5 text-muted-foreground" />
                            </CardAction>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                {task.days_remaining !== undefined && task.days_remaining !== null ? (
                                    task.days_remaining >= 0 ? (
                                        `${task.days_remaining} ${t('detail.daysRemaining')}`
                                    ) : (
                                        `${Math.abs(task.days_remaining)} ${t('detail.daysOverdue')}`
                                    )
                                ) : (
                                    '-'
                                )}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="overview" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="overview">
                            <Target className="mr-2 h-4 w-4" />
                            {t('detail.tabs.overview')}
                        </TabsTrigger>
                        <TabsTrigger value="dependencies">
                            <LinkIcon className="mr-2 h-4 w-4" />
                            {t('detail.tabs.dependencies')}
                        </TabsTrigger>
                        <TabsTrigger value="volunteers">
                            <Users className="mr-2 h-4 w-4" />
                            {t('detail.tabs.volunteers')}
                        </TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2">
                            {/* Task Details */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>{t('detail.taskDetails')}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {task.description && (
                                        <div>
                                            <span className="text-sm text-muted-foreground">{t('detail.description')}</span>
                                            <p className="text-sm mt-1">{task.description}</p>
                                        </div>
                                    )}
                                    {task.assigned_to_name && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-muted-foreground">{t('detail.assignedTo')}:</span>
                                            <span className="font-medium">{task.assigned_to_name}</span>
                                        </div>
                                    )}
                                    {task.start_date && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-muted-foreground">{t('detail.startDate')}:</span>
                                            <span className="font-medium">{format(new Date(task.start_date), 'PP')}</span>
                                        </div>
                                    )}
                                    {task.estimated_hours !== undefined && task.estimated_hours !== null && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-muted-foreground">{t('detail.estimatedHours')}:</span>
                                            <span className="font-medium tabular-nums">{task.estimated_hours}h</span>
                                        </div>
                                    )}
                                    {task.actual_hours !== undefined && task.actual_hours !== null && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-muted-foreground">{t('detail.actualHours')}:</span>
                                            <span className="font-medium tabular-nums">{task.actual_hours}h</span>
                                        </div>
                                    )}
                                    {task.suitable_for_volunteers && (
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary" className="bg-leaf/10 text-leaf border-leaf/20">
                                                <Users className="mr-1 h-3 w-3" />
                                                {t('detail.requiresVolunteers')}
                                            </Badge>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Parent Task / Subtasks */}
                            {(task.parent_task_title || (task.subtasks && task.subtasks.length > 0)) && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>{t('detail.hierarchy')}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {task.parent_task_title && (
                                            <div>
                                                <span className="text-sm text-muted-foreground">{t('detail.parentTask')}</span>
                                                <p className="text-sm font-medium mt-1">{task.parent_task_title}</p>
                                            </div>
                                        )}
                                        {task.subtasks && task.subtasks.length > 0 && (
                                            <div>
                                                <span className="text-sm text-muted-foreground">{t('detail.subtasks')} ({task.subtasks.length})</span>
                                                <ul className="mt-2 space-y-1">
                                                    {task.subtasks.map((subtask) => (
                                                        <li key={subtask.id} className="text-sm">
                                                            <Link
                                                                href={`/${locale}/portal/tasks/${subtask.id}`}
                                                                className="hover:underline flex items-center gap-2"
                                                            >
                                                                <CheckCircle2 className={`h-3 w-3 ${subtask.status === 'completed' ? 'text-growth' : 'text-muted-foreground'}`} />
                                                                {subtask.title}
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </TabsContent>

                    {/* Dependencies Tab */}
                    <TabsContent value="dependencies" className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">{t('detail.taskDependencies')}</h3>
                            {!isVolunteer && (
                                <Button onClick={() => setIsAddDependencyOpen(true)}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    {t('detail.addDependency')}
                                </Button>
                            )}
                        </div>

                        <div className="rounded-lg border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t('detail.dependenciesTable.task')}</TableHead>
                                        <TableHead>{t('detail.dependenciesTable.type')}</TableHead>
                                        <TableHead>{t('detail.dependenciesTable.direction')}</TableHead>
                                        {!isVolunteer && (
                                            <TableHead className="text-right">{t('detail.dependenciesTable.actions')}</TableHead>
                                        )}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {task.dependencies && task.dependencies.length > 0 ? (
                                        task.dependencies.map((dep) => {
                                            const isPredecessor = dep.successor_task_id === taskId;
                                            const relatedTaskTitle = isPredecessor ? dep.predecessor_title : dep.successor_title;
                                            return (
                                                <TableRow key={dep.id}>
                                                    <TableCell className="font-medium">
                                                        {relatedTaskTitle || '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="secondary">
                                                            {t(`dependencyTypes.${dep.dependency_type}`)}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {isPredecessor ? t('detail.predecessor') : t('detail.successor')}
                                                    </TableCell>
                                                    {!isVolunteer && (
                                                        <TableCell className="text-right">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleRemoveDependency(dep.id)}
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </TableCell>
                                                    )}
                                                </TableRow>
                                            );
                                        })
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={isVolunteer ? 3 : 4} className="text-center py-8 text-muted-foreground">
                                                {t('detail.noDependencies')}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </TabsContent>

                    {/* Volunteers Tab */}
                    <TabsContent value="volunteers" className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">{t('detail.assignedVolunteers')}</h3>
                            {!isVolunteer && (
                                <Button onClick={() => setIsAssignVolunteerOpen(true)}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    {t('detail.assignVolunteer')}
                                </Button>
                            )}
                        </div>

                        <div className="rounded-lg border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t('detail.volunteersTable.name')}</TableHead>
                                        <TableHead>{t('detail.volunteersTable.assignedAt')}</TableHead>
                                        <TableHead>{t('detail.volunteersTable.hoursContributed')}</TableHead>
                                        {!isVolunteer && (
                                            <TableHead className="text-right">{t('detail.volunteersTable.actions')}</TableHead>
                                        )}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {task.volunteer_assignments && task.volunteer_assignments.length > 0 ? (
                                        task.volunteer_assignments.map((assignment) => (
                                            <TableRow key={assignment.id}>
                                                <TableCell className="font-medium">
                                                    <Link
                                                        href={`/${locale}/portal/volunteers/${assignment.volunteer_id}`}
                                                        className="hover:underline"
                                                    >
                                                        {assignment.volunteer_name || t('detail.unknown')}
                                                    </Link>
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {format(new Date(assignment.assigned_at), 'PP')}
                                                </TableCell>
                                                <TableCell className="text-sm font-semibold tabular-nums">
                                                    {assignment.hours_contributed}h
                                                </TableCell>
                                                {!isVolunteer && (
                                                    <TableCell className="text-right">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleRemoveVolunteer(assignment.volunteer_id)}
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={isVolunteer ? 3 : 4} className="text-center py-8 text-muted-foreground">
                                                {t('detail.noVolunteers')}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Admin/Manager-only dialogs */}
                {!isVolunteer && (
                    <>
                        {/* Edit Task Dialog */}
                        <TaskFormDialog
                            open={isEditDialogOpen}
                            onOpenChange={setIsEditDialogOpen}
                            task={task}
                            projectId={task?.project_id}
                            onSuccess={() => mutate()}
                        />

                        {/* Add Dependency Dialog */}
                        <AddDependencyDialog
                            open={isAddDependencyOpen}
                            onOpenChange={setIsAddDependencyOpen}
                            taskId={taskId}
                            onSuccess={() => mutate()}
                        />

                        {/* Assign Volunteer Dialog */}
                        <AssignVolunteerDialog
                            open={isAssignVolunteerOpen}
                            onOpenChange={setIsAssignVolunteerOpen}
                            taskId={taskId}
                            onSuccess={() => mutate()}
                        />

                        {/* Delete Confirmation Dialog */}
                        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>{t('detail.deleteConfirmTitle')}</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        {t('detail.deleteConfirmDescription')}
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>{t('detail.cancel')}</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDeleteTask} disabled={isDeleting}>
                                        {isDeleting ? t('detail.deleting') : t('detail.delete')}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </>
                )}
            </div>
        </div>
    );
}
