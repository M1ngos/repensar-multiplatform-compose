 'use client';

 import {useState} from 'react';
 import {useParams} from 'next/navigation';
 import {useTranslations} from 'next-intl';
 import useSWR from 'swr';
 import {volunteersApi} from '@/lib/api';
 import {useAuth} from '@/lib/hooks/useAuth';
 import {canEditTimeLog, canDeleteTimeLog, canLogHoursForOthers, canApproveTimeLogs} from '@/lib/permissions/timeTracking';
 import {Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
 import {Badge} from '@/components/ui/badge';
 import {Skeleton} from '@/components/ui/skeleton';
 import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
 import {Button} from '@/components/ui/button';
 import {AlertCircle, Award, Calendar, CheckCircle2, Clock, Edit, Mail, MapPin, Phone, Plus, User, Trophy, Eye, Trash2} from 'lucide-react';
 import {format} from 'date-fns';
 import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from '@/components/ui/table';
 import {VolunteerFormDialog} from '@/components/volunteers/volunteer-form-dialog';
 import {AddSkillDialog} from '@/components/volunteers/add-skill-dialog';
 import {LogHoursDialog} from '@/components/volunteers/log-hours-dialog';
 import {TimeLogDetailDialog} from '@/components/volunteers/time-log-detail-dialog';
 import {EditTimeLogDialog} from '@/components/volunteers/edit-time-log-dialog';
 import {DeleteTimeLogDialog} from '@/components/volunteers/delete-time-log-dialog';
 import {VolunteerGamificationTab} from '@/components/gamification/volunteer-gamification-tab';
 import type {VolunteerTimeLog} from '@/lib/api/types';

 export default function VolunteerDetailPage() {
    const params = useParams();
    const volunteerId = parseInt(params.id as string);
    const t = useTranslations('Volunteers');
    const {user} = useAuth();

    // Dialog state
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isAddSkillDialogOpen, setIsAddSkillDialogOpen] = useState(false);
    const [isLogHoursDialogOpen, setIsLogHoursDialogOpen] = useState(false);

    // Time log dialog state
    const [selectedTimeLog, setSelectedTimeLog] = useState<VolunteerTimeLog | null>(null);
    const [isTimeLogDetailOpen, setIsTimeLogDetailOpen] = useState(false);
    const [isEditTimeLogOpen, setIsEditTimeLogOpen] = useState(false);
    const [isDeleteTimeLogOpen, setIsDeleteTimeLogOpen] = useState(false);

    // Fetch volunteer profile
    const { data: volunteer, error, isLoading, mutate } = useSWR(
        `volunteer-${volunteerId}`,
        () => volunteersApi.getVolunteer(volunteerId)
    );

    // Fetch volunteer hours
    const { data: hours } = useSWR(
        `volunteer-${volunteerId}-hours`,
        () => volunteersApi.getVolunteerHours(volunteerId)
    );

    // Fetch hours summary
    const { data: hoursSummary } = useSWR(
        `volunteer-${volunteerId}-hours-summary`,
        () => volunteersApi.getVolunteerHoursSummary(volunteerId)
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'inactive':
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
            case 'suspended':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
        }
    };

    const getProficiencyColor = (level: string) => {
        switch (level) {
            case 'advanced':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
            case 'intermediate':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            case 'beginner':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
        }
    };

    // Time log action handlers
    const handleViewTimeLog = (log: VolunteerTimeLog) => {
        setSelectedTimeLog(log);
        setIsTimeLogDetailOpen(true);
    };

    const handleEditTimeLog = (log: VolunteerTimeLog) => {
        setSelectedTimeLog(log);
        setIsEditTimeLogOpen(true);
    };

    const handleDeleteTimeLog = (log: VolunteerTimeLog) => {
        setSelectedTimeLog(log);
        setIsDeleteTimeLogOpen(true);
    };

    const handleTimeLogSuccess = () => {
        // Refresh hours data after edit/delete
        mutate();
    };

    // Check if the "Log Hours" button should be shown
    const canLogHours = user?.id === volunteerId || canLogHoursForOthers(user);

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

    if (error || !volunteer) {
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
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            {/* Header */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <h1 className="text-3xl font-bold tracking-tight">{volunteer.name}</h1>
                            <Badge className={getStatusColor(volunteer.volunteer_status)} variant="secondary">
                                {t(`statuses.${volunteer.volunteer_status}`)}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground">{t('detail.subtitle', { id: volunteer.volunteer_id })}</p>
                    </div>
                    <Button onClick={() => setIsEditDialogOpen(true)}>
                        <Edit className="mr-2 h-4 w-4" />
                        {t('detail.editVolunteer')}
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="@container/card">
                        <CardHeader>
                            <CardDescription>{t('detail.totalHours')}</CardDescription>
                            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                                {volunteer.total_hours_contributed}h
                            </CardTitle>
                            <CardAction>
                                <Clock className="h-5 w-5 text-muted-foreground" />
                            </CardAction>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                {hoursSummary && (
                                    <>
                                        {hoursSummary.approved_hours}h {t('detail.approved')} • {hoursSummary.pending_hours}h {t('detail.pending')}
                                    </>
                                )}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="@container/card">
                        <CardHeader>
                            <CardDescription>{t('detail.skills')}</CardDescription>
                            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                                {volunteer.skills?.length || 0}
                            </CardTitle>
                            <CardAction>
                                <Award className="h-5 w-5 text-muted-foreground" />
                            </CardAction>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                {volunteer.skills?.filter(s => s.certified).length || 0} {t('detail.certified')}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="@container/card">
                        <CardHeader>
                            <CardDescription>{t('detail.memberSince')}</CardDescription>
                            <CardTitle className="text-2xl font-semibold @[250px]/card:text-3xl">
                                {format(new Date(volunteer.joined_date), 'MMM yyyy')}
                            </CardTitle>
                            <CardAction>
                                <Calendar className="h-5 w-5 text-muted-foreground" />
                            </CardAction>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                {volunteer.orientation_completed ? (
                                    <span className="flex items-center gap-1">
                                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                                        {t('detail.orientationCompleted')}
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3 text-amber-500" />
                                        {t('detail.orientationPending')}
                                    </span>
                                )}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="profile" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="profile">
                            <User className="mr-2 h-4 w-4" />
                            {t('detail.tabs.profile')}
                        </TabsTrigger>
                        <TabsTrigger value="skills">
                            <Award className="mr-2 h-4 w-4" />
                            {t('detail.tabs.skills')}
                        </TabsTrigger>
                        <TabsTrigger value="hours">
                            <Clock className="mr-2 h-4 w-4" />
                            {t('detail.tabs.hours')}
                        </TabsTrigger>
                        <TabsTrigger value="gamification">
                            <Trophy className="mr-2 h-4 w-4" />
                            Gamification
                        </TabsTrigger>
                    </TabsList>

                    {/* Profile Tab */}
                    <TabsContent value="profile" className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2">
                            {/* Personal Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>{t('detail.personalInfo')}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <span>{volunteer.email}</span>
                                    </div>
                                    {volunteer.phone && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            <span>{volunteer.phone}</span>
                                        </div>
                                    )}
                                    {(volunteer.address || volunteer.city) && (
                                        <div className="flex items-start gap-2 text-sm">
                                            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                            <div className="flex-1">
                                                {volunteer.address && <div>{volunteer.address}</div>}
                                                {volunteer.city && (
                                                    <div>
                                                        {volunteer.city}
                                                        {volunteer.postal_code && `, ${volunteer.postal_code}`}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    {volunteer.date_of_birth && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <span>{format(new Date(volunteer.date_of_birth), 'PP')}</span>
                                        </div>
                                    )}
                                    {volunteer.gender && (
                                        <div className="text-sm">
                                            <span className="text-muted-foreground">{t('detail.gender')}: </span>
                                            <span className="capitalize">{volunteer.gender}</span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Emergency Contact */}
                            {volunteer.emergency_contact_name && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>{t('detail.emergencyContact')}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <div className="text-sm">
                                            <span className="text-muted-foreground">{t('detail.name')}: </span>
                                            <span className="font-medium">{volunteer.emergency_contact_name}</span>
                                        </div>
                                        {volunteer.emergency_contact_phone && (
                                            <div className="text-sm">
                                                <span className="text-muted-foreground">{t('detail.phone')}: </span>
                                                <span className="font-medium">{volunteer.emergency_contact_phone}</span>
                                            </div>
                                        )}
                                        {volunteer.emergency_contact_relationship && (
                                            <div className="text-sm">
                                                <span className="text-muted-foreground">{t('detail.relationship')}: </span>
                                                <span className="capitalize">{volunteer.emergency_contact_relationship}</span>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Motivation */}
                            {volunteer.motivation && (
                                <Card className="@xl/main:col-span-2">
                                    <CardHeader>
                                        <CardTitle>{t('detail.motivation')}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground">{volunteer.motivation}</p>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Notes */}
                            {volunteer.notes && (
                                <Card className="@xl/main:col-span-2">
                                    <CardHeader>
                                        <CardTitle>{t('detail.notes')}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{volunteer.notes}</p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </TabsContent>

                    {/* Skills Tab */}
                    <TabsContent value="skills" className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">{t('detail.skillsList')}</h3>
                            <Button onClick={() => setIsAddSkillDialogOpen(true)}>
                                <Plus className="mr-2 h-4 w-4" />
                                {t('detail.addSkill')}
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2">
                            {volunteer.skills && volunteer.skills.length > 0 ? (
                                volunteer.skills.map((skillAssignment) => (
                                    <Card key={skillAssignment.id}>
                                        <CardHeader>
                                            <div className="flex items-start justify-between gap-2">
                                                <CardTitle className="text-base">{skillAssignment.skill.name}</CardTitle>
                                                <CardAction>
                                                    {skillAssignment.certified && (
                                                        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                                            <CheckCircle2 className="mr-1 h-3 w-3" />
                                                            {t('detail.certified')}
                                                        </Badge>
                                                    )}
                                                </CardAction>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <Badge className={getProficiencyColor(skillAssignment.proficiency_level)} variant="secondary">
                                                    {t(`proficiencyLevels.${skillAssignment.proficiency_level}`)}
                                                </Badge>
                                                <span className="text-sm text-muted-foreground">
                                                    {skillAssignment.years_experience} {t('detail.yearsExp')}
                                                </span>
                                            </div>
                                            {skillAssignment.notes && (
                                                <p className="text-sm text-muted-foreground">{skillAssignment.notes}</p>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))
                            ) : (
                                <div className="col-span-full text-center py-8 text-muted-foreground">
                                    {t('detail.noSkills')}
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    {/* Hours Tab */}
                    <TabsContent value="hours" className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">{t('detail.timeLog')}</h3>
                            {canLogHours && (
                                <Button onClick={() => setIsLogHoursDialogOpen(true)}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    {t('detail.logHours')}
                                </Button>
                            )}
                        </div>

                        <div className="rounded-lg border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t('detail.hoursTable.date')}</TableHead>
                                        <TableHead>{t('detail.hoursTable.hours')}</TableHead>
                                        <TableHead>{t('detail.hoursTable.project')}</TableHead>
                                        <TableHead>{t('detail.hoursTable.activity')}</TableHead>
                                        <TableHead>{t('detail.hoursTable.status')}</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {hours && hours.length > 0 ? (
                                        hours.map((log) => {
                                            const canEdit = canEditTimeLog(user, log);
                                            const canDelete = canDeleteTimeLog(user, log);

                                            return (
                                                <TableRow key={log.id}>
                                                    <TableCell className="text-sm">
                                                        {format(new Date(log.date), 'PP')}
                                                    </TableCell>
                                                    <TableCell className="text-sm font-semibold tabular-nums">
                                                        {log.hours}h
                                                    </TableCell>
                                                    <TableCell className="text-sm">
                                                        {log.project_name || log.task_title || '-'}
                                                    </TableCell>
                                                    <TableCell className="text-sm max-w-xs truncate">
                                                        {log.activity_description || '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        {log.approved ? (
                                                            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                                                <CheckCircle2 className="mr-1 h-3 w-3" />
                                                                {t('detail.approved')}
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                                                                <Clock className="mr-1 h-3 w-3" />
                                                                {t('detail.pending')}
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleViewTimeLog(log)}
                                                                title="View Details"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                            {canEdit && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleEditTimeLog(log)}
                                                                    title="Edit"
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                            {canDelete && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleDeleteTimeLog(log)}
                                                                    title="Delete"
                                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                {t('detail.noHours')}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </TabsContent>

                    {/* Gamification Tab */}
                    <TabsContent value="gamification">
                        <VolunteerGamificationTab volunteerId={volunteerId} />
                    </TabsContent>
                </Tabs>

                {/* Edit Volunteer Dialog */}
                <VolunteerFormDialog
                    open={isEditDialogOpen}
                    onOpenChange={setIsEditDialogOpen}
                    volunteer={volunteer}
                    onSuccess={() => mutate()}
                />

                {/* Add Skill Dialog */}
                <AddSkillDialog
                    open={isAddSkillDialogOpen}
                    onOpenChange={setIsAddSkillDialogOpen}
                    volunteerId={volunteerId}
                    onSuccess={() => mutate()}
                />

                {/* Log Hours Dialog */}
                <LogHoursDialog
                    open={isLogHoursDialogOpen}
                    onOpenChange={setIsLogHoursDialogOpen}
                    volunteerId={volunteerId}
                    onSuccess={() => mutate()}
                />

                {/* Time Log Dialogs */}
                <TimeLogDetailDialog
                    open={isTimeLogDetailOpen}
                    onOpenChange={setIsTimeLogDetailOpen}
                    timeLog={selectedTimeLog}
                />

                <EditTimeLogDialog
                    open={isEditTimeLogOpen}
                    onOpenChange={setIsEditTimeLogOpen}
                    timeLog={selectedTimeLog}
                    onSuccess={handleTimeLogSuccess}
                />

                <DeleteTimeLogDialog
                    open={isDeleteTimeLogOpen}
                    onOpenChange={setIsDeleteTimeLogOpen}
                    timeLog={selectedTimeLog}
                    onSuccess={handleTimeLogSuccess}
                />
            </div>
    );
}
