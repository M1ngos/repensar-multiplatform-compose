'use client';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, FolderKanban, Users, Award, ArrowRight, UserPlus } from 'lucide-react';
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
        volunteer_spots: number;
        volunteers_assigned: number;
        required_skills?: Record<string, any>;
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

                {/* Spots Available */}
                <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className={cn(
                        'font-medium',
                        isFull ? 'text-red-600' : 'text-emerald-600'
                    )}>
                        {isFull
                            ? t('card.spotsFull')
                            : t('card.spotsAvailable', {
                                available: spotsAvailable,
                                total: task.volunteer_spots
                            })
                        }
                    </span>
                </div>

                {/* Required Skills */}
                {skills && skills.length > 0 ? (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Award className="h-4 w-4" />
                            <span>{t('card.requiredSkills')}:</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                            {skills.slice(0, 3).map((skill) => (
                                <Badge key={skill} variant="secondary" className="text-xs">
                                    {skill}
                                </Badge>
                            ))}
                            {skills.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                    +{skills.length - 3}
                                </Badge>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Award className="h-4 w-4" />
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
