'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import useSWR from 'swr';
import { badgesApi, pointsApi, volunteersApi } from '@/lib/api';
import { useAuth } from '@/lib/hooks/useAuth';
import { Unauthorized } from '@/components/unauthorized';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Award, Trophy, Star, Loader2, Search, CircleHelp } from 'lucide-react';
import { useTour } from '@/lib/hooks/useTour';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyHeader, EmptyTitle } from '@/components/ui/empty';
import type { Badge as BadgeType, VolunteerSummary, PointsHistory } from '@/lib/api/types';

export default function GamificationAwardsPage() {
    const t = useTranslations('StaffMember.gamification');
    const tTour = useTranslations('Tour.gamification');
    const tTourCommon = useTranslations('Tour');
    const { user, isAuthLoading } = useAuth();
    const { startTour } = useTour({
        tourId: 'gamification',
        tSteps: tTour,
        nextBtnText: tTourCommon('next'),
        prevBtnText: tTourCommon('prev'),
        doneBtnText: tTourCommon('done'),
    });

    // Tab state
    const [activeTab, setActiveTab] = useState<'badges' | 'points'>('badges');

    // Badge award state
    const [selectedVolunteerForBadge, setSelectedVolunteerForBadge] = useState<VolunteerSummary | null>(null);
    const [selectedBadge, setSelectedBadge] = useState<BadgeType | null>(null);
    const [badgeReason, setBadgeReason] = useState('');
    const [badgeCategory, setBadgeCategory] = useState<string>('all');
    const [isAwardingBadge, setIsAwardingBadge] = useState(false);

    // Points award state
    const [selectedVolunteerForPoints, setSelectedVolunteerForPoints] = useState<VolunteerSummary | null>(null);
    const [pointsAmount, setPointsAmount] = useState<string>('');
    const [pointsReason, setPointsReason] = useState('');
    const [isAwardingPoints, setIsAwardingPoints] = useState(false);

    // Search state
    const [volunteerSearchBadge, setVolunteerSearchBadge] = useState('');
    const [volunteerSearchPoints, setVolunteerSearchPoints] = useState('');

    // Fetch data
    const { data: badges, isLoading: badgesLoading } = useSWR('badges', () => badgesApi.list());
    const { data: volunteers } = useSWR('volunteers', () =>
        volunteersApi.getVolunteers({ limit: 100 })
    );

    // Fetch volunteer badges for selected volunteer
    const { data: volunteerBadges } = useSWR(
        selectedVolunteerForBadge ? `volunteer-badges-${selectedVolunteerForBadge.id}` : null,
        () => selectedVolunteerForBadge ? badgesApi.getVolunteerBadges(selectedVolunteerForBadge.id) : null
    );

    // Fetch recent awards (using points history as proxy)
    const { data: recentAwards, mutate: refreshAwards } = useSWR(
        'recent-awards',
        async () => {
            // Get recent points history from all volunteers as a proxy for recent awards
            if (!volunteers) return [];

            const allHistory: Array<PointsHistory & { volunteer_name: string }> = [];

            for (const volunteer of volunteers.slice(0, 10)) {
                try {
                    const history = await pointsApi.getHistory(volunteer.id, { limit: 5 });
                    allHistory.push(...history.map((h: PointsHistory) => ({ ...h, volunteer_name: volunteer.name })));
                } catch (error) {
                    // Skip if error
                }
            }

            return allHistory.sort((a: PointsHistory & { volunteer_name: string }, b: PointsHistory & { volunteer_name: string }) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            ).slice(0, 10);
        }
    );

    // Permission check
    if (isAuthLoading) {
        return <LoadingSkeleton />;
    }

    if (!user || (user.user_type !== 'admin' && user.user_type !== 'staff_member')) {
        return <Unauthorized />;
    }

    // Filter volunteers for search
    const filteredVolunteersBadge = volunteers?.filter(v =>
        v.name?.toLowerCase().includes(volunteerSearchBadge.toLowerCase())
    ) || [];

    const filteredVolunteersPoints = volunteers?.filter(v =>
        v.name?.toLowerCase().includes(volunteerSearchPoints.toLowerCase())
    ) || [];

    // Filter badges by category
    const filteredBadges = badges?.filter(b =>
        badgeCategory === 'all' || b.category === badgeCategory
    ) || [];

    // Get badge categories
    const badgeCategories = Array.from(new Set(badges?.map(b => b.category) || []));

    // Check if volunteer already has badge
    const volunteerHasBadge = (badgeId: number) => {
        return volunteerBadges?.badges?.some(vb => vb.badge_id === badgeId) || false;
    };

    // Handlers
    const handleAwardBadge = async () => {
        if (!selectedVolunteerForBadge || !selectedBadge) {
            toast.error(t('awardBadge.selectVolunteerFirst'));
            return;
        }

        if (volunteerHasBadge(selectedBadge.id)) {
            toast.error(t('awardBadge.alreadyHas'));
            return;
        }

        setIsAwardingBadge(true);
        try {
            await badgesApi.award(selectedVolunteerForBadge.id, {
                badge_id: selectedBadge.id,
                earned_reason: badgeReason || 'Awarded by staff',
            });

            toast.success(t('awardBadge.success', { volunteer: selectedVolunteerForBadge.name }));

            // Reset form
            setSelectedBadge(null);
            setBadgeReason('');
            refreshAwards();
        } catch (error) {
            console.error('Failed to award badge:', error);
            toast.error(t('awardBadge.error'));
        } finally {
            setIsAwardingBadge(false);
        }
    };

    const handleAwardPoints = async () => {
        if (!selectedVolunteerForPoints) {
            toast.error(t('awardPoints.validation.reasonRequired'));
            return;
        }

        const points = parseInt(pointsAmount);
        if (isNaN(points) || points < 1) {
            toast.error(t('awardPoints.validation.min'));
            return;
        }
        if (points > 1000) {
            toast.error(t('awardPoints.validation.max'));
            return;
        }
        if (!pointsReason.trim()) {
            toast.error(t('awardPoints.validation.reasonRequired'));
            return;
        }

        setIsAwardingPoints(true);
        try {
            await pointsApi.award(selectedVolunteerForPoints.id, {
                points,
                event_type: 'manual_award',
                description: pointsReason,
            });

            toast.success(t('awardPoints.success', {
                points: points.toString(),
                volunteer: selectedVolunteerForPoints.name
            }));

            // Reset form
            setPointsAmount('');
            setPointsReason('');
            refreshAwards();
        } catch (error) {
            console.error('Failed to award points:', error);
            toast.error(t('awardPoints.error'));
        } finally {
            setIsAwardingPoints(false);
        }
    };

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
                    <p className="text-muted-foreground">{t('description')}</p>
                </div>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={startTour} className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0">
                            <CircleHelp className="h-4 w-4" />
                            <span className="sr-only">{tTourCommon('takeTour')}</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>{tTourCommon('takeTour')}</TooltipContent>
                </Tooltip>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Content - Award Forms */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Trophy className="h-5 w-5" />
                                {t('title')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)}>
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="badges">
                                        <Award className="h-4 w-4 mr-2" />
                                        {t('tabs.badges')}
                                    </TabsTrigger>
                                    <TabsTrigger value="points">
                                        <Star className="h-4 w-4 mr-2" />
                                        {t('tabs.points')}
                                    </TabsTrigger>
                                </TabsList>

                                {/* Badge Award Tab */}
                                <TabsContent value="badges" className="space-y-4">
                                    {/* Volunteer Selection */}
                                    <div className="space-y-2">
                                        <Label>{t('awardBadge.selectVolunteer')}</Label>
                                        <div className="relative" data-tour="gamification-search">
                                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder={t('awardBadge.selectVolunteerPlaceholder')}
                                                value={volunteerSearchBadge}
                                                onChange={(e) => setVolunteerSearchBadge(e.target.value)}
                                                className="pl-9"
                                            />
                                        </div>
                                        {volunteerSearchBadge && (
                                            <div className="border rounded-md max-h-48 overflow-y-auto">
                                                {filteredVolunteersBadge.length === 0 ? (
                                                    <p className="p-4 text-sm text-muted-foreground">No volunteers found</p>
                                                ) : (
                                                    filteredVolunteersBadge.map((volunteer) => (
                                                        <button
                                                            key={volunteer.id}
                                                            onClick={() => {
                                                                setSelectedVolunteerForBadge(volunteer);
                                                                setVolunteerSearchBadge(volunteer.name);
                                                            }}
                                                            className="w-full p-3 text-left hover:bg-muted transition-colors border-b last:border-0"
                                                        >
                                                            <p className="font-medium">{volunteer.name}</p>
                                                            <p className="text-xs text-muted-foreground">{volunteer.email}</p>
                                                        </button>
                                                    ))
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Category Filter */}
                                    {selectedVolunteerForBadge && (
                                        <>
                                            <div className="space-y-2">
                                                <Label>{t('awardBadge.filterByCategory')}</Label>
                                                <Select value={badgeCategory} onValueChange={setBadgeCategory}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">{t('awardBadge.allCategories')}</SelectItem>
                                                        {badgeCategories.map((category) => (
                                                            <SelectItem key={category} value={category} className="capitalize">
                                                                {category}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* Badge Grid */}
                                            <div className="space-y-2">
                                                <Label>{t('awardBadge.selectBadge')}</Label>
                                                {badgesLoading ? (
                                                    <LoadingSkeleton />
                                                ) : filteredBadges.length === 0 ? (
                                                    <p className="text-sm text-muted-foreground p-4 border rounded-md">
                                                        {t('awardBadge.noBadgesAvailable')}
                                                    </p>
                                                ) : (
                                                    <div className="grid grid-cols-3 gap-3 max-h-96 overflow-y-auto p-1">
                                                        {filteredBadges.map((badge) => {
                                                            const hasIt = volunteerHasBadge(badge.id);
                                                            const isSelected = selectedBadge?.id === badge.id;

                                                            return (
                                                                <button
                                                                    key={badge.id}
                                                                    onClick={() => !hasIt && setSelectedBadge(badge)}
                                                                    disabled={hasIt}
                                                                    className={`
                                                                        relative p-3 border-2 rounded-lg transition-all
                                                                        ${isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
                                                                        ${hasIt ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                                                    `}
                                                                >
                                                                    <div className="flex flex-col items-center gap-2">
                                                                        <div className="text-4xl">{badge.icon_url || '🏆'}</div>
                                                                        <p className="text-xs font-medium text-center line-clamp-2">
                                                                            {badge.name}
                                                                        </p>
                                                                        {hasIt && (
                                                                            <Badge variant="secondary" className="text-xs">
                                                                                {t('awardBadge.alreadyHas')}
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Reason */}
                                            {selectedBadge && (
                                                <div className="space-y-2">
                                                    <Label>{t('awardBadge.reason')}</Label>
                                                    <Textarea
                                                        placeholder={t('awardBadge.reasonPlaceholder')}
                                                        value={badgeReason}
                                                        onChange={(e) => setBadgeReason(e.target.value)}
                                                        rows={3}
                                                    />
                                                </div>
                                            )}

                                            {/* Submit Button */}
                                            <Button
                                                data-tour="gamification-award"
                                                onClick={handleAwardBadge}
                                                disabled={!selectedBadge || isAwardingBadge}
                                                className="w-full"
                                            >
                                                {isAwardingBadge ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                        {t('awardBadge.awarding')}
                                                    </>
                                                ) : (
                                                    <>
                                                        <Award className="h-4 w-4 mr-2" />
                                                        {t('awardBadge.confirm')}
                                                    </>
                                                )}
                                            </Button>
                                        </>
                                    )}
                                </TabsContent>

                                {/* Points Award Tab */}
                                <TabsContent value="points" className="space-y-4">
                                    {/* Volunteer Selection */}
                                    <div className="space-y-2">
                                        <Label>{t('awardPoints.selectVolunteer')}</Label>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder={t('awardPoints.selectVolunteerPlaceholder')}
                                                value={volunteerSearchPoints}
                                                onChange={(e) => setVolunteerSearchPoints(e.target.value)}
                                                className="pl-9"
                                            />
                                        </div>
                                        {volunteerSearchPoints && (
                                            <div className="border rounded-md max-h-48 overflow-y-auto">
                                                {filteredVolunteersPoints.length === 0 ? (
                                                    <p className="p-4 text-sm text-muted-foreground">No volunteers found</p>
                                                ) : (
                                                    filteredVolunteersPoints.map((volunteer) => (
                                                        <button
                                                            key={volunteer.id}
                                                            onClick={() => {
                                                                setSelectedVolunteerForPoints(volunteer);
                                                                setVolunteerSearchPoints(volunteer.name);
                                                            }}
                                                            className="w-full p-3 text-left hover:bg-muted transition-colors border-b last:border-0"
                                                        >
                                                            <p className="font-medium">{volunteer.name}</p>
                                                            <p className="text-xs text-muted-foreground">{volunteer.email}</p>
                                                        </button>
                                                    ))
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {selectedVolunteerForPoints && (
                                        <>
                                            {/* Points Amount */}
                                            <div className="space-y-2">
                                                <Label>{t('awardPoints.points')}</Label>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    max="1000"
                                                    placeholder={t('awardPoints.pointsPlaceholder')}
                                                    value={pointsAmount}
                                                    onChange={(e) => setPointsAmount(e.target.value)}
                                                />
                                            </div>

                                            {/* Reason */}
                                            <div className="space-y-2">
                                                <Label>{t('awardPoints.reason')} *</Label>
                                                <Textarea
                                                    placeholder={t('awardPoints.reasonPlaceholder')}
                                                    value={pointsReason}
                                                    onChange={(e) => setPointsReason(e.target.value)}
                                                    rows={3}
                                                    required
                                                />
                                            </div>

                                            {/* Submit Button */}
                                            <Button
                                                onClick={handleAwardPoints}
                                                disabled={!pointsAmount || !pointsReason || isAwardingPoints}
                                                className="w-full"
                                            >
                                                {isAwardingPoints ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                        {t('awardPoints.awarding')}
                                                    </>
                                                ) : (
                                                    <>
                                                        <Star className="h-4 w-4 mr-2" />
                                                        {t('awardPoints.confirm')}
                                                    </>
                                                )}
                                            </Button>
                                        </>
                                    )}
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar - Recent Awards */}
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">{t('recentAwards.title')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {!recentAwards ? (
                                <LoadingSkeleton />
                            ) : recentAwards.length === 0 ? (
                                <Empty>
                                    <EmptyHeader>
                                        <Trophy className="h-8 w-8 text-muted-foreground" />
                                        <EmptyTitle className="text-sm">{t('recentAwards.noRecentAwards')}</EmptyTitle>
                                    </EmptyHeader>
                                </Empty>
                            ) : (
                                <div className="space-y-3">
                                    {recentAwards.map((award, index) => (
                                        <div key={index} className="p-3 border rounded-lg space-y-1">
                                            <div className="flex items-center justify-between">
                                                <p className="font-medium text-sm">{award.volunteer_name}</p>
                                                <Badge variant="secondary">
                                                    {t('recentAwards.points', { points: award.points_change })}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground">{award.description}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {format(new Date(award.created_at), 'MMM dd, yyyy')}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function LoadingSkeleton() {
    return (
        <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
        </div>
    );
}
