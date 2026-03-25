'use client';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, FolderKanban, Users, Award, ArrowRight, UserPlus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { TaskPriority } from '@/lib/api/types';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';

interface AvailableTaskCardProps {
    task: {
        id: number;
        title: string;
        description?: string;
        priority: TaskPriority;
        project_name: string;
        end_date?: string;
        estimated_hours?: number;
        volunteer_spots: number;
        volunteers_assigned: number;
        required_skills?: Record<string, string>;
    };
    onSignUp?: (taskId: number) => Promise<void>;
    isSignedUp?: boolean;
}

export function AvailableTaskCard({ task, onSignUp, isSignedUp }: AvailableTaskCardProps) {
    const t = useTranslations('Volunteer.availableTasks');
    const tTasks = useTranslations('Tasks');
    const locale = useLocale();

    // Calculate available spots
    const spotsAvailable = task.volunteer_spots - task.volunteers_assigned;
    const isFull = spotsAvailable <= 0;

    // Get priority variant
    const getPriorityVariant = (priority: TaskPriority) => {
        switch (priority) {
            case TaskPriority.LOW:
                return 'text-gray-600';
            case TaskPriority.MEDIUM:
                return 'text-blue-600';
            case TaskPriority.HIGH:
                return 'text-orange-600';
            case TaskPriority.CRITICAL:
                return 'text-red-600';
            default:
                return 'text-gray-600';
        }
    };

    // Format due date
    const formatDueDate = () => {
        if (!task.end_date) {
            return t('card.noDueDate');
        }
        return format(parseISO(task.end_date), 'MMM dd, yyyy');
    };

    // Get required skills
    const getSkills = () => {
        if (!task.required_skills || Object.keys(task.required_skills).length === 0) {
            return null;
        }
        // Assume required_skills is an object like { "skill_name": "level" }
        return Object.keys(task.required_skills);
    };

    const skills = getSkills();

    return (
        <Card className={cn(
            'hover:shadow-md transition-shadow',
            isFull && 'opacity-75'
        )}>
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base line-clamp-2">
                        {task.title}
                    </CardTitle>
                    <Badge variant="outline" className={cn('shrink-0 capitalize', getPriorityVariant(task.priority))}>
                        {tTasks(`priorities.${task.priority}`)}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-3">
                {/* Description */}
                {task.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                        {task.description}
                    </p>
                )}

                {/* Project */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FolderKanban className="h-4 w-4" />
                    <span className="truncate">{task.project_name}</span>
                </div>

                {/* Due Date */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDueDate()}</span>
                </div>

                {/* Estimated Hours */}
                {task.estimated_hours != null && task.estimated_hours > 0 && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{t('card.estimatedHours', { hours: task.estimated_hours })}</span>
                    </div>
                )}

                {/* Spots Available */}
                <div className="flex items-center gap-2 text-xs">
                    <Users className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    {isFull ? (
                        <Badge variant="destructive" className="text-xs h-5">
                            {t('card.spotsFull')}
                        </Badge>
                    ) : (
                        <Badge
                            variant="outline"
                            className={cn(
                                "text-xs h-5",
                                spotsAvailable <= 2 ? "border-orange-400 text-orange-700 dark:text-orange-400" : "border-emerald-400 text-emerald-700 dark:text-emerald-400"
                            )}
                        >
                            {t('card.spotsAvailable', { available: spotsAvailable, total: task.volunteer_spots })}
                        </Badge>
                    )}
                </div>

                {/* Required Skills */}
                {skills && skills.length > 0 ? (
                    <div className="space-y-1">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Award className="h-3.5 w-3.5 shrink-0" />
                            <span className="font-medium">{t('filters.skills')}</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {skills.slice(0, 3).map(skill => (
                                <span
                                    key={skill}
                                    className="inline-flex items-center rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-700 ring-1 ring-inset ring-teal-600/20 dark:bg-teal-950/30 dark:text-teal-300 dark:ring-teal-500/30"
                                >
                                    {skill}
                                </span>
                            ))}
                            {skills.length > 3 && (
                                <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                                    +{skills.length - 3}
                                </span>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Award className="h-3.5 w-3.5 shrink-0" />
                        <span>{t('card.noSkills')}</span>
                    </div>
                )}
            </CardContent>

            <CardFooter className="flex flex-col gap-2 pt-3">
                {isSignedUp ? (
                    <Button variant="outline" disabled className="w-full">
                        <UserPlus className="h-3 w-3 mr-2" />
                        {t('card.signedUp')}
                    </Button>
                ) : (
                    <Button
                        onClick={() => onSignUp?.(task.id)}
                        disabled={isFull}
                        className="w-full"
                    >
                        <UserPlus className="h-3 w-3 mr-2" />
                        {t('card.signUp')}
                    </Button>
                )}

                <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="w-full"
                >
                    <Link href={`/${locale}/portal/tasks/${task.id}`}>
                        {t('card.viewDetails')}
                        <ArrowRight className="h-3 w-3 ml-2" />
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
