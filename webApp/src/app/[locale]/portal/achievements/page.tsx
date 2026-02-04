'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth.tsx';
import { useTranslations } from 'next-intl';
import useSWR from 'swr';
import { gamificationApi } from '@/lib/api/gamification';
import { PageHeader } from '@/components/shared/page-header';
import { StatCard } from '@/components/shared/stat-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import { Star, Award, Flame, Trophy, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function AchievementsPage() {
    const { user } = useAuth();
    const t = useTranslations('Volunteer.achievements');
    const [activeTab, setActiveTab] = useState('badges');

    // Fetch gamification summary
    const { data: summary, isLoading: summaryLoading } = useSWR(
        user?.id ? ['gamification-summary', user.id] : null,
        () => gamificationApi.stats.getVolunteerSummary(user!.id)
    );

    // Fetch badges
    const { data: badgesData, isLoading: badgesLoading, mutate: mutateBadges } = useSWR(
        user?.id ? ['volunteer-badges', user.id] : null,
        () => gamificationApi.badges.getVolunteerBadges(user!.id)
    );

    // Fetch points
    const { data: pointsData, isLoading: pointsLoading } = useSWR(
        user?.id ? ['volunteer-points', user.id] : null,
        () => gamificationApi.points.getSummary(user!.id)
    );

    // Fetch achievements
    const { data: achievementsData, isLoading: achievementsLoading } = useSWR(
        user?.id ? ['volunteer-achievements', user.id] : null,
        () => gamificationApi.achievements.getVolunteerAchievements(user!.id)
    );

    // Toggle badge showcase
    const handleToggleShowcase = async (badgeId: number, currentShowcased: boolean) => {
        try {
            await gamificationApi.badges.toggleShowcase(user!.id, badgeId, {
                is_showcased: !currentShowcased
            });
            toast.success(t('badges.showcaseSuccess'));
            mutateBadges(); // Refresh badges
        } catch (error) {
            toast.error(t('badges.showcaseError'));
            console.error('Failed to toggle badge showcase:', error);
        }
    };

    // Loading state
    if (summaryLoading) {
        return (
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <div className="grid gap-4 md:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-32" />
                    ))}
                </div>
                <Skeleton className="h-96 w-full" />
            </div>
        );
    }

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <PageHeader
                title={t('title')}
                description={t('subtitle')}
            />

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title={t('summary.totalPoints')}
                    value={summary?.points.total_points || 0}
                    icon={Star}
                    variant="emerald"
                />
                <StatCard
                    title={t('summary.badgesEarned')}
                    value={summary?.badges_earned || 0}
                    icon={Award}
                    variant="purple"
                />
                <StatCard
                    title={t('summary.currentStreak')}
                    value={`${summary?.points.current_streak_days || 0} ${t('summary.days')}`}
                    icon={Flame}
                    variant="orange"
                />
                <StatCard
                    title={t('summary.rank')}
                    value={`#${summary?.points.rank || 0}`}
                    icon={Trophy}
                    variant="blue"
                />
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3 lg:w-auto">
                    <TabsTrigger value="badges">{t('tabs.badges')}</TabsTrigger>
                    <TabsTrigger value="points">{t('tabs.points')}</TabsTrigger>
                    <TabsTrigger value="achievements">{t('tabs.achievements')}</TabsTrigger>
                </TabsList>

                {/* Badges Tab */}
                <TabsContent value="badges" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('tabs.badges')}</CardTitle>
                            <CardDescription>
                                {badgesData?.total_badges || 0} badges earned
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {badgesLoading ? (
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <Skeleton key={i} className="h-40" />
                                    ))}
                                </div>
                            ) : !badgesData?.badges || badgesData.badges.length === 0 ? (
                                <Empty>
                                    <EmptyHeader>
                                        <EmptyTitle>{t('badges.noBadges')}</EmptyTitle>
                                        <EmptyDescription>{t('badges.noBadgesDesc')}</EmptyDescription>
                                    </EmptyHeader>
                                </Empty>
                            ) : (
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {badgesData.badges.map((badge) => {
                                        const isShowcased = badgesData.showcased_badges.includes(badge.badge_id.toString());
                                        return (
                                            <Card key={badge.id} className={cn(
                                                'relative',
                                                isShowcased && 'ring-2 ring-emerald-500'
                                            )}>
                                                <CardHeader className="pb-3">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                                                                <Award className="h-6 w-6 text-emerald-600" />
                                                            </div>
                                                            <div>
                                                                <CardTitle className="text-base">{badge.badge.name}</CardTitle>
                                                                {isShowcased && (
                                                                    <Badge variant="outline" className="mt-1">
                                                                        {t('badges.showcased')}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="space-y-3">
                                                    {badge.earned_reason && (
                                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                                            {badge.earned_reason}
                                                        </p>
                                                    )}
                                                    <div className="text-xs text-muted-foreground">
                                                        {t('badges.earnedOn')}: {format(parseISO(badge.earned_at), 'MMM dd, yyyy')}
                                                    </div>
                                                    <Button
                                                        variant={isShowcased ? "outline" : "default"}
                                                        size="sm"
                                                        className="w-full"
                                                        onClick={() => handleToggleShowcase(badge.badge_id, isShowcased)}
                                                    >
                                                        {isShowcased ? (
                                                            <>
                                                                <EyeOff className="h-4 w-4 mr-2" />
                                                                {t('badges.removeFromShowcase')}
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Eye className="h-4 w-4 mr-2" />
                                                                {t('badges.showcase')}
                                                            </>
                                                        )}
                                                    </Button>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Points Tab */}
                <TabsContent value="points" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('points.overview')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {pointsLoading ? (
                                <div className="space-y-4">
                                    <Skeleton className="h-20" />
                                    <Skeleton className="h-40" />
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* Points Stats */}
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="space-y-2">
                                            <p className="text-sm text-muted-foreground">{t('points.currentPoints')}</p>
                                            <p className="text-3xl font-bold">{pointsData?.current_points || 0}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-sm text-muted-foreground">{t('points.totalEarned')}</p>
                                            <p className="text-3xl font-bold">{pointsData?.total_points || 0}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-sm text-muted-foreground">{t('points.rank')}</p>
                                            <p className="text-3xl font-bold">#{pointsData?.rank || 0}</p>
                                        </div>
                                    </div>

                                    {/* Recent Activity */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold">{t('points.recentActivity')}</h3>
                                        {!pointsData?.recent_history || pointsData.recent_history.length === 0 ? (
                                            <Empty>
                                                <EmptyHeader>
                                                    <EmptyTitle>{t('points.noActivity')}</EmptyTitle>
                                                    <EmptyDescription>{t('points.noActivityDesc')}</EmptyDescription>
                                                </EmptyHeader>
                                            </Empty>
                                        ) : (
                                            <div className="space-y-3">
                                                {pointsData.recent_history.map((entry) => (
                                                    <div key={entry.id} className="flex items-center justify-between p-3 rounded-lg border">
                                                        <div className="flex-1">
                                                            <p className="font-medium">{entry.description}</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {format(parseISO(entry.created_at), 'MMM dd, yyyy HH:mm')}
                                                            </p>
                                                        </div>
                                                        <Badge variant={entry.points_change > 0 ? "default" : "destructive"}>
                                                            {entry.points_change > 0
                                                                ? t('points.pointsAwarded', { points: entry.points_change })
                                                                : t('points.pointsDeducted', { points: entry.points_change })
                                                            }
                                                        </Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Achievements Tab */}
                <TabsContent value="achievements" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('tabs.achievements')}</CardTitle>
                            <CardDescription>
                                {achievementsData?.completed || 0} of {achievementsData?.total_achievements || 0} completed
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {achievementsLoading ? (
                                <div className="space-y-4">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Skeleton key={i} className="h-24" />
                                    ))}
                                </div>
                            ) : !achievementsData?.achievements || achievementsData.achievements.length === 0 ? (
                                <Empty>
                                    <EmptyHeader>
                                        <EmptyTitle>{t('achievementsList.noAchievements')}</EmptyTitle>
                                        <EmptyDescription>{t('achievementsList.noAchievementsDesc')}</EmptyDescription>
                                    </EmptyHeader>
                                </Empty>
                            ) : (
                                <div className="space-y-4">
                                    {achievementsData.achievements.map((achievement) => {
                                        const progressPercent = achievement.progress_percentage;
                                        const isCompleted = achievement.is_completed;

                                        return (
                                            <Card key={achievement.id} className={cn(
                                                isCompleted && 'border-emerald-500'
                                            )}>
                                                <CardHeader className="pb-3">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <CardTitle className="text-base">{achievement.name}</CardTitle>
                                                                {isCompleted && (
                                                                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                                                                )}
                                                            </div>
                                                            <CardDescription className="mt-1">
                                                                {achievement.description}
                                                            </CardDescription>
                                                        </div>
                                                        {achievement.points_reward > 0 && (
                                                            <Badge variant="outline">
                                                                +{achievement.points_reward} pts
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="space-y-3">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between text-sm">
                                                            <span className="text-muted-foreground">
                                                                {t('achievementsList.progress', {
                                                                    current: achievement.current_progress,
                                                                    target: achievement.target_progress
                                                                })}
                                                            </span>
                                                            <span className="font-medium">{progressPercent.toFixed(0)}%</span>
                                                        </div>
                                                        <Progress value={progressPercent} className="h-2" />
                                                    </div>
                                                    {isCompleted && achievement.completed_at && (
                                                        <div className="text-xs text-muted-foreground">
                                                            {t('achievementsList.completedOn')}: {format(parseISO(achievement.completed_at), 'MMM dd, yyyy')}
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
