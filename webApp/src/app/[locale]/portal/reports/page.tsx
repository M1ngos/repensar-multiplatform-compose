'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import useSWR from 'swr';
import {
    Download, FileText, FileJson, Users, FolderKanban, CheckSquare,
    Clock, CircleHelp, TrendingUp, AlertTriangle, DollarSign, BarChart3,
} from 'lucide-react';
import { useTour } from '@/lib/hooks/useTour';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { reportsApi } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ProjectStatus, ProjectCategory } from '@/lib/api/types';

type ExportType = 'projects' | 'volunteers' | 'tasks' | 'time-logs';
type ExportFormat = 'csv' | 'json';

export default function ReportsPage() {
    const t = useTranslations('Reports');
    const tTour = useTranslations('Tour.reports');
    const tTourCommon = useTranslations('Tour');
    const { startTour } = useTour({
        tourId: 'reports',
        tSteps: tTour,
        nextBtnText: tTourCommon('next'),
        prevBtnText: tTourCommon('prev'),
        doneBtnText: tTourCommon('done'),
    });
    const [exporting, setExporting] = useState<string | null>(null);

    // Filters
    const [projectStatus, setProjectStatus] = useState<ProjectStatus | 'all'>('all');
    const [projectCategory, setProjectCategory] = useState<ProjectCategory | 'all'>('all');
    const [volunteerStatus, setVolunteerStatus] = useState<'active' | 'inactive' | 'suspended' | 'all'>('all');
    const [taskStatus, setTaskStatus] = useState<'not_started' | 'in_progress' | 'completed' | 'cancelled' | 'all'>('all');

    // Executive summary data
    const { data: executiveSummary, isLoading: summaryLoading } = useSWR(
        'executive-summary',
        () => reportsApi.getExecutiveSummary()
    );

    const handleExport = async (type: ExportType | 'executive-summary', format: ExportFormat | 'csv-exec') => {
        const exportKey = `${type}-${format}`;
        setExporting(exportKey);

        try {
            let blob: Blob;
            let filename: string;

            if (type === 'executive-summary') {
                blob = await reportsApi.exportExecutiveSummaryCSV();
                filename = reportsApi.generateFilename('executive-summary', 'csv');
            } else {
                switch (type) {
                    case 'projects':
                        blob = format === 'csv'
                            ? await reportsApi.exportProjectsCSV({
                                ...(projectStatus !== 'all' && { status: projectStatus }),
                                ...(projectCategory !== 'all' && { category: projectCategory }),
                            })
                            : await reportsApi.exportProjectsJSON({
                                ...(projectStatus !== 'all' && { status: projectStatus }),
                                ...(projectCategory !== 'all' && { category: projectCategory }),
                            });
                        filename = reportsApi.generateFilename('projects', format);
                        break;
                    case 'volunteers':
                        blob = format === 'csv'
                            ? await reportsApi.exportVolunteersCSV({
                                ...(volunteerStatus !== 'all' && { volunteer_status: volunteerStatus }),
                            })
                            : await reportsApi.exportVolunteersJSON({
                                ...(volunteerStatus !== 'all' && { volunteer_status: volunteerStatus }),
                            });
                        filename = reportsApi.generateFilename('volunteers', format);
                        break;
                    case 'tasks':
                        blob = format === 'csv'
                            ? await reportsApi.exportTasksCSV({
                                ...(taskStatus !== 'all' && { status: taskStatus }),
                            })
                            : await reportsApi.exportTasksJSON({
                                ...(taskStatus !== 'all' && { status: taskStatus }),
                            });
                        filename = reportsApi.generateFilename('tasks', format);
                        break;
                    case 'time-logs':
                        blob = format === 'csv'
                            ? await reportsApi.exportTimeLogsCSV()
                            : await reportsApi.exportTimeLogsJSON();
                        filename = reportsApi.generateFilename('time-logs', format);
                        break;
                    default:
                        throw new Error('Invalid export type');
                }
            }

            reportsApi.downloadBlob(blob, filename);
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
                                <><Download className="mr-2 h-4 w-4 animate-spin" />{t('exporting')}</>
                            ) : (
                                <><FileText className="mr-2 h-4 w-4" />{t('exportCSV')}</>
                            )}
                        </Button>
                        <Button
                            onClick={() => handleExport(type, 'json')}
                            disabled={exporting !== null}
                            variant="outline"
                            className="flex-1"
                        >
                            {exporting === jsonKey ? (
                                <><Download className="mr-2 h-4 w-4 animate-spin" />{t('exporting')}</>
                            ) : (
                                <><FileJson className="mr-2 h-4 w-4" />{t('exportJSON')}</>
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
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
                    <p className="text-muted-foreground">{t('subtitle')}</p>
                </div>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={startTour} className="h-8 w-8 text-muted-foreground hover:text-foreground self-start">
                            <CircleHelp className="h-4 w-4" />
                            <span className="sr-only">{tTourCommon('takeTour')}</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>{tTourCommon('takeTour')}</TooltipContent>
                </Tooltip>
            </div>

            {/* Executive Summary Section */}
            <Card className="border-primary/20 bg-primary/5" data-tour="reports-executive">
                <CardHeader>
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15">
                                <BarChart3 className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle>{t('executiveSummary.title')}</CardTitle>
                                <CardDescription>{t('executiveSummary.description')}</CardDescription>
                            </div>
                        </div>
                        <Button
                            onClick={() => handleExport('executive-summary', 'csv-exec')}
                            disabled={exporting !== null}
                            className="gap-2 shrink-0"
                        >
                            {exporting === 'executive-summary-csv-exec' ? (
                                <><Download className="h-4 w-4 animate-spin" />{t('exporting')}</>
                            ) : (
                                <><Download className="h-4 w-4" />{t('executiveSummary.exportCSV')}</>
                            )}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {summaryLoading ? (
                        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="space-y-2 rounded-lg border bg-background p-3">
                                    <Skeleton className="h-3 w-20" />
                                    <Skeleton className="h-6 w-12" />
                                </div>
                            ))}
                        </div>
                    ) : executiveSummary ? (
                        <div className="space-y-4">
                            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                                <div className="rounded-lg border bg-background p-3">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                                        <FolderKanban className="h-3 w-3" />
                                        {t('executiveSummary.totalProjects')}
                                    </div>
                                    <div className="text-2xl font-bold">{executiveSummary.overview?.total_projects ?? '—'}</div>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {executiveSummary.overview?.active_projects} {t('executiveSummary.activeLabel')}
                                    </p>
                                </div>

                                <div className={`rounded-lg border bg-background p-3 ${executiveSummary.overview?.at_risk_projects > 0 ? 'border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/20' : ''}`}>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                                        <AlertTriangle className={`h-3 w-3 ${executiveSummary.overview?.at_risk_projects > 0 ? 'text-orange-500' : ''}`} />
                                        {t('executiveSummary.atRisk')}
                                    </div>
                                    <div className={`text-2xl font-bold ${executiveSummary.overview?.at_risk_projects > 0 ? 'text-orange-600 dark:text-orange-400' : ''}`}>
                                        {executiveSummary.overview?.at_risk_projects ?? '—'}
                                    </div>
                                    {executiveSummary.overview?.at_risk_names?.length > 0 && (
                                        <p className="text-xs text-orange-600 dark:text-orange-400 mt-0.5 truncate">
                                            {executiveSummary.overview.at_risk_names.slice(0, 2).join(', ')}
                                        </p>
                                    )}
                                </div>

                                <div className="rounded-lg border bg-background p-3">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                                        <TrendingUp className="h-3 w-3 text-blue-500" />
                                        {t('executiveSummary.taskCompletion')}
                                    </div>
                                    <div className="text-2xl font-bold">
                                        {executiveSummary.overview?.task_completion_rate?.toFixed(1) ?? '—'}%
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {executiveSummary.overview?.completed_tasks} / {executiveSummary.overview?.total_tasks} {t('executiveSummary.tasksLabel')}
                                    </p>
                                </div>

                                <div className={`rounded-lg border bg-background p-3 ${executiveSummary.financials?.over_budget_projects > 0 ? 'border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20' : ''}`}>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                                        <DollarSign className="h-3 w-3 text-green-600" />
                                        {t('executiveSummary.budgetUtilization')}
                                    </div>
                                    <div className="text-2xl font-bold">
                                        {executiveSummary.financials?.utilization_rate?.toFixed(1) ?? '—'}%
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        ${executiveSummary.financials?.total_spent?.toLocaleString() ?? 0} / ${executiveSummary.financials?.total_budget?.toLocaleString() ?? 0}
                                    </p>
                                </div>
                            </div>

                            {executiveSummary.overview?.at_risk_names?.length > 0 && (
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs text-muted-foreground">{t('executiveSummary.atRiskProjects')}:</span>
                                    {executiveSummary.overview.at_risk_names.map((name: string) => (
                                        <Badge key={name} variant="outline" className="border-orange-300 text-orange-700 dark:border-orange-700 dark:text-orange-400 text-xs">
                                            {name}
                                        </Badge>
                                    ))}
                                </div>
                            )}

                            {executiveSummary.generated_at && (
                                <p className="text-xs text-muted-foreground">
                                    {t('executiveSummary.generatedAt')} {new Date(executiveSummary.generated_at).toLocaleString()}
                                </p>
                            )}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">{t('noData')}</p>
                    )}
                </CardContent>
            </Card>

            <Separator />

            {/* Individual Export Cards */}
            <div>
                <h2 className="text-lg font-semibold mb-4">{t('exports.title')}</h2>
                <div className="grid gap-6 md:grid-cols-2" data-tour="reports-tabs">
                    <ExportCard
                        title={t('projects.title')}
                        description={t('projects.description')}
                        icon={FolderKanban}
                        type="projects"
                        filters={
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="project-status">{t('projects.status')}</Label>
                                    <Select value={projectStatus} onValueChange={(v) => setProjectStatus(v as ProjectStatus | 'all')}>
                                        <SelectTrigger id="project-status"><SelectValue /></SelectTrigger>
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
                                    <Select value={projectCategory} onValueChange={(v) => setProjectCategory(v as ProjectCategory | 'all')}>
                                        <SelectTrigger id="project-category"><SelectValue /></SelectTrigger>
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

                    <ExportCard
                        title={t('volunteers.title')}
                        description={t('volunteers.description')}
                        icon={Users}
                        type="volunteers"
                        filters={
                            <div className="space-y-2">
                                <Label htmlFor="volunteer-status">{t('volunteers.status')}</Label>
                                <Select value={volunteerStatus} onValueChange={(v) => setVolunteerStatus(v as any)}>
                                    <SelectTrigger id="volunteer-status"><SelectValue /></SelectTrigger>
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

                    <ExportCard
                        title={t('tasks.title')}
                        description={t('tasks.description')}
                        icon={CheckSquare}
                        type="tasks"
                        filters={
                            <div className="space-y-2">
                                <Label htmlFor="task-status">{t('tasks.status')}</Label>
                                <Select value={taskStatus} onValueChange={(v) => setTaskStatus(v as any)}>
                                    <SelectTrigger id="task-status"><SelectValue /></SelectTrigger>
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

                    <ExportCard
                        title={t('timeLogs.title')}
                        description={t('timeLogs.description')}
                        icon={Clock}
                        type="time-logs"
                    />
                </div>
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
