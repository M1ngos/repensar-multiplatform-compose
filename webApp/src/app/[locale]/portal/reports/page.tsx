'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Download, FileText, FileJson, Users, FolderKanban, CheckSquare, Clock } from 'lucide-react';
import { reportsApi } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ProjectStatus, ProjectCategory } from '@/lib/api/types';

type ExportType = 'projects' | 'volunteers' | 'tasks' | 'time-logs';
type ExportFormat = 'csv' | 'json';

export default function ReportsPage() {
    const t = useTranslations('Reports');
    const [exporting, setExporting] = useState<string | null>(null);

    // Filters
    const [projectStatus, setProjectStatus] = useState<ProjectStatus | 'all'>('all');
    const [projectCategory, setProjectCategory] = useState<ProjectCategory | 'all'>('all');
    const [volunteerStatus, setVolunteerStatus] = useState<'active' | 'inactive' | 'suspended' | 'all'>('all');
    const [taskStatus, setTaskStatus] = useState<'not_started' | 'in_progress' | 'completed' | 'cancelled' | 'all'>('all');

    const handleExport = async (type: ExportType, format: ExportFormat) => {
        const exportKey = `${type}-${format}`;
        setExporting(exportKey);

        try {
            let blob: Blob;
            let filename: string;

            switch (type) {
                case 'projects':
                    if (format === 'csv') {
                        blob = await reportsApi.exportProjectsCSV({
                            ...(projectStatus !== 'all' && { status: projectStatus }),
                            ...(projectCategory !== 'all' && { category: projectCategory }),
                        });
                    } else {
                        blob = await reportsApi.exportProjectsJSON({
                            ...(projectStatus !== 'all' && { status: projectStatus }),
                            ...(projectCategory !== 'all' && { category: projectCategory }),
                        });
                    }
                    filename = reportsApi.generateFilename('projects', format);
                    break;

                case 'volunteers':
                    if (format === 'csv') {
                        blob = await reportsApi.exportVolunteersCSV({
                            ...(volunteerStatus !== 'all' && { volunteer_status: volunteerStatus }),
                        });
                    } else {
                        blob = await reportsApi.exportVolunteersJSON({
                            ...(volunteerStatus !== 'all' && { volunteer_status: volunteerStatus }),
                        });
                    }
                    filename = reportsApi.generateFilename('volunteers', format);
                    break;

                case 'tasks':
                    if (format === 'csv') {
                        blob = await reportsApi.exportTasksCSV({
                            ...(taskStatus !== 'all' && { status: taskStatus }),
                        });
                    } else {
                        blob = await reportsApi.exportTasksJSON({
                            ...(taskStatus !== 'all' && { status: taskStatus }),
                        });
                    }
                    filename = reportsApi.generateFilename('tasks', format);
                    break;

                case 'time-logs':
                    if (format === 'csv') {
                        blob = await reportsApi.exportTimeLogsCSV();
                    } else {
                        blob = await reportsApi.exportTimeLogsJSON();
                    }
                    filename = reportsApi.generateFilename('time-logs', format);
                    break;

                default:
                    throw new Error('Invalid export type');
            }

            reportsApi.downloadBlob(blob, filename);

            console.log('Export successful:', filename);
        } catch (error) {
            console.error('Export error:', error);
            alert(t('exportError') + ': ' + (error instanceof Error ? error.message : t('exportErrorDesc')));
        } finally {
            setExporting(null);
        }
    };

    const ExportCard = ({
        title,
        description,
        icon: Icon,
        type,
        filters,
    }: {
        title: string;
        description: string;
        icon: any;
        type: ExportType;
        filters?: React.ReactNode;
    }) => {
        const csvKey = `${type}-csv`;
        const jsonKey = `${type}-json`;

        return (
            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                <Icon className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle>{title}</CardTitle>
                                <CardDescription>{description}</CardDescription>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {filters}
                    <div className="flex gap-2">
                        <Button
                            onClick={() => handleExport(type, 'csv')}
                            disabled={exporting !== null}
                            variant="outline"
                            className="flex-1"
                        >
                            {exporting === csvKey ? (
                                <>
                                    <Download className="mr-2 h-4 w-4 animate-spin" />
                                    {t('exporting')}
                                </>
                            ) : (
                                <>
                                    <FileText className="mr-2 h-4 w-4" />
                                    {t('exportCSV')}
                                </>
                            )}
                        </Button>
                        <Button
                            onClick={() => handleExport(type, 'json')}
                            disabled={exporting !== null}
                            variant="outline"
                            className="flex-1"
                        >
                            {exporting === jsonKey ? (
                                <>
                                    <Download className="mr-2 h-4 w-4 animate-spin" />
                                    {t('exporting')}
                                </>
                            ) : (
                                <>
                                    <FileJson className="mr-2 h-4 w-4" />
                                    {t('exportJSON')}
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
                <p className="text-muted-foreground">{t('subtitle')}</p>
            </div>

            {/* Export Cards */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Projects Export */}
                <ExportCard
                    title={t('projects.title')}
                    description={t('projects.description')}
                    icon={FolderKanban}
                    type="projects"
                    filters={
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="project-status">{t('projects.status')}</Label>
                                <Select
                                    value={projectStatus}
                                    onValueChange={(value) => setProjectStatus(value as ProjectStatus | 'all')}
                                >
                                    <SelectTrigger id="project-status">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t('filters.all')}</SelectItem>
                                        <SelectItem value="planning">{t('projects.statuses.planning')}</SelectItem>
                                        <SelectItem value="in_progress">{t('projects.statuses.in_progress')}</SelectItem>
                                        <SelectItem value="completed">{t('projects.statuses.completed')}</SelectItem>
                                        <SelectItem value="cancelled">{t('projects.statuses.cancelled')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="project-category">{t('projects.category')}</Label>
                                <Select
                                    value={projectCategory}
                                    onValueChange={(value) => setProjectCategory(value as ProjectCategory | 'all')}
                                >
                                    <SelectTrigger id="project-category">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t('filters.all')}</SelectItem>
                                        <SelectItem value="reforestation">{t('projects.categories.reforestation')}</SelectItem>
                                        <SelectItem value="environmental_education">{t('projects.categories.environmental_education')}</SelectItem>
                                        <SelectItem value="waste_management">{t('projects.categories.waste_management')}</SelectItem>
                                        <SelectItem value="conservation">{t('projects.categories.conservation')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    }
                />

                {/* Volunteers Export */}
                <ExportCard
                    title={t('volunteers.title')}
                    description={t('volunteers.description')}
                    icon={Users}
                    type="volunteers"
                    filters={
                        <div className="space-y-2">
                            <Label htmlFor="volunteer-status">{t('volunteers.status')}</Label>
                            <Select
                                value={volunteerStatus}
                                onValueChange={(value) => setVolunteerStatus(value as 'active' | 'inactive' | 'suspended' | 'all')}
                            >
                                <SelectTrigger id="volunteer-status">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('filters.all')}</SelectItem>
                                    <SelectItem value="active">{t('volunteers.statuses.active')}</SelectItem>
                                    <SelectItem value="inactive">{t('volunteers.statuses.inactive')}</SelectItem>
                                    <SelectItem value="suspended">{t('volunteers.statuses.suspended')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    }
                />

                {/* Tasks Export */}
                <ExportCard
                    title={t('tasks.title')}
                    description={t('tasks.description')}
                    icon={CheckSquare}
                    type="tasks"
                    filters={
                        <div className="space-y-2">
                            <Label htmlFor="task-status">{t('tasks.status')}</Label>
                            <Select
                                value={taskStatus}
                                onValueChange={(value) => setTaskStatus(value as any)}
                            >
                                <SelectTrigger id="task-status">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('filters.all')}</SelectItem>
                                    <SelectItem value="not_started">{t('tasks.statuses.not_started')}</SelectItem>
                                    <SelectItem value="in_progress">{t('tasks.statuses.in_progress')}</SelectItem>
                                    <SelectItem value="completed">{t('tasks.statuses.completed')}</SelectItem>
                                    <SelectItem value="cancelled">{t('tasks.statuses.cancelled')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    }
                />

                {/* Time Logs Export */}
                <ExportCard
                    title={t('timeLogs.title')}
                    description={t('timeLogs.description')}
                    icon={Clock}
                    type="time-logs"
                />
            </div>

            {/* Info Section */}
            <Card className="bg-muted/50">
                <CardHeader>
                    <CardTitle className="text-base">{t('info.title')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <p>{t('info.csvDescription')}</p>
                    <p>{t('info.jsonDescription')}</p>
                    <div className="flex items-center gap-2 pt-2">
                        <Badge variant="secondary">{t('info.permissions')}</Badge>
                        <span>{t('info.permissionsDesc')}</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
