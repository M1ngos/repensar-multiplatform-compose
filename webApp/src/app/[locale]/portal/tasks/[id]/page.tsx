'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import useSWR from 'swr';
import { tasksApi } from '@/lib/api';
import { TaskStatus, TaskPriority, DependencyType } from '@/lib/api/types';
import type { TaskDetail, TaskDependency, TaskVolunteerAssignment } from '@/lib/api/types';
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
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isAddDependencyOpen, setIsAddDependencyOpen] = useState(false);
    const [isAssignVolunteerOpen, setIsAssignVolunteerOpen] = useState(false);

    // Fetch task detail
    const { data: task, error, isLoading, mutate } = useSWR(
        `task-${taskId}`,
        () => tasksApi.getTask(taskId)
    );

    const getStatusColor = (status: TaskStatus) => {
        switch (status) {
            case 'not_started':
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
            case 'in_progress':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            case 'completed':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'cancelled':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
        }
    };

    const getPriorityColor = (priority: TaskPriority) => {
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

    const handleDeleteTask = async () => {
        setIsDeleting(true);
        try {
            await tasksApi.deleteTask(taskId);
            toast.success(t('detail.deleteSuccess'));
            router.push(`/${locale}/portal/tasks`);
        } catch (error) {
            toast.error(t('detail.deleteError'));
            setIsDeleting(false);
        }
    };

    const handleRemoveDependency = async (dependencyId: number) => {
        try {
            await tasksApi.removeTaskDependency(dependencyId);
            toast.success(t('detail.dependencyRemoved'));
            mutate();
        } catch (error) {
            toast.error(t('detail.dependencyRemoveError'));
        }
    };

    const handleRemoveVolunteer = async (volunteerId: number) => {
        try {
            await tasksApi.removeVolunteer(taskId, volunteerId);
            toast.success(t('detail.volunteerRemoved'));
            mutate();
        } catch (error) {
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
                    <Link href={`/${locale}/portal/tasks`}>
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
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
                                <Edit className="mr-2 h-4 w-4" />
                                {t('detail.editTask')}
                            </Button>
                            <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                {t('detail.deleteTask')}
                            </Button>
                        </div>
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
                                    {task.requires_volunteers && (
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
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
                                                                <CheckCircle2 className={`h-3 w-3 ${subtask.status === 'completed' ? 'text-green-500' : 'text-gray-300'}`} />
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
                            <Button onClick={() => setIsAddDependencyOpen(true)}>
                                <Plus className="mr-2 h-4 w-4" />
                                {t('detail.addDependency')}
                            </Button>
                        </div>

                        <div className="rounded-lg border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t('detail.dependenciesTable.task')}</TableHead>
                                        <TableHead>{t('detail.dependenciesTable.type')}</TableHead>
                                        <TableHead>{t('detail.dependenciesTable.direction')}</TableHead>
                                        <TableHead className="text-right">{t('detail.dependenciesTable.actions')}</TableHead>
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
                                                    <TableCell className="text-right">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleRemoveDependency(dep.id)}
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
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
                            <Button onClick={() => setIsAssignVolunteerOpen(true)}>
                                <Plus className="mr-2 h-4 w-4" />
                                {t('detail.assignVolunteer')}
                            </Button>
                        </div>

                        <div className="rounded-lg border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t('detail.volunteersTable.name')}</TableHead>
                                        <TableHead>{t('detail.volunteersTable.assignedAt')}</TableHead>
                                        <TableHead>{t('detail.volunteersTable.hoursContributed')}</TableHead>
                                        <TableHead className="text-right">{t('detail.volunteersTable.actions')}</TableHead>
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
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleRemoveVolunteer(assignment.volunteer_id)}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                                {t('detail.noVolunteers')}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </TabsContent>
                </Tabs>

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
            </div>
        </div>
    );
}
