'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth.tsx';
import { useTranslations } from 'next-intl';
import useSWR from 'swr';
import { gamificationApi } from '@/lib/api/gamification';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import { Trophy, Medal, Award } from 'lucide-react';
import { LeaderboardType, LeaderboardTimeframe } from '@/lib/api/types';
import { cn } from '@/lib/utils';

export default function LeaderboardsPage() {
    const { user } = useAuth();
    const t = useTranslations('Volunteer.leaderboards');

    // State
    const [leaderboardType, setLeaderboardType] = useState<LeaderboardType>(LeaderboardType.POINTS);
    const [timeframe, setTimeframe] = useState<LeaderboardTimeframe>(LeaderboardTimeframe.ALL_TIME);

    // Fetch leaderboard data
    const { data: leaderboard, isLoading } = useSWR(
        ['leaderboard', leaderboardType, timeframe],
        () => gamificationApi.leaderboards.get(leaderboardType, { timeframe })
    );

    // Get user's position in current leaderboard
    const userPosition = leaderboard?.rankings.find(
        entry => entry.volunteer_id === user?.id
    );

    // Get top 3 for podium
    const topThree = leaderboard?.rankings.slice(0, 3) || [];

    // Format value based on type
    const formatValue = (value: number) => {
        switch (leaderboardType) {
            case LeaderboardType.POINTS:
                return t('stats.points', { value: value.toLocaleString() });
            case LeaderboardType.HOURS:
                return t('stats.hours', { value: value.toFixed(1) });
            case LeaderboardType.PROJECTS:
                return t('stats.projects', { value });
            default:
                return value.toString();
        }
    };

    // Get rank icon color
    const getRankColor = (rank: number) => {
        switch (rank) {
            case 1:
                return 'text-yellow-600';
            case 2:
                return 'text-gray-400';
            case 3:
                return 'text-amber-700';
            default:
                return 'text-muted-foreground';
        }
    };

    // Get rank icon
    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1:
                return Trophy;
            case 2:
                return Medal;
            case 3:
                return Award;
            default:
                return null;
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <Skeleton className="h-16 w-full" />
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

            {/* Timeframe Filter */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium">Timeframe</h3>
                        <Select value={timeframe} onValueChange={(value) => setTimeframe(value as LeaderboardTimeframe)}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={LeaderboardTimeframe.ALL_TIME}>
                                    {t('timeframes.all_time')}
                                </SelectItem>
                                <SelectItem value={LeaderboardTimeframe.MONTHLY}>
                                    {t('timeframes.monthly')}
                                </SelectItem>
                                <SelectItem value={LeaderboardTimeframe.WEEKLY}>
                                    {t('timeframes.weekly')}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs value={leaderboardType} onValueChange={(value) => setLeaderboardType(value as LeaderboardType)}>
                <TabsList className="grid w-full grid-cols-3 lg:w-auto">
                    <TabsTrigger value={LeaderboardType.POINTS}>{t('types.points')}</TabsTrigger>
                    <TabsTrigger value={LeaderboardType.HOURS}>{t('types.hours')}</TabsTrigger>
                    <TabsTrigger value={LeaderboardType.PROJECTS}>{t('types.projects')}</TabsTrigger>
                </TabsList>

                <TabsContent value={leaderboardType} className="space-y-4">
                    {!leaderboard || leaderboard.rankings.length === 0 ? (
                        <Card>
                            <CardContent className="pt-6">
                                <Empty>
                                    <EmptyHeader>
                                        <EmptyTitle>{t('noData')}</EmptyTitle>
                                        <EmptyDescription>{t('noDataDesc')}</EmptyDescription>
                                    </EmptyHeader>
                                </Empty>
                            </CardContent>
                        </Card>
                    ) : (
                        <>
                            {/* Top 3 Podium */}
                            {topThree.length >= 3 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Top 3</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-3 gap-4">
                                            {/* 2nd Place */}
                                            {topThree[1] && (
                                                <div className="flex flex-col items-center space-y-3 pt-8">
                                                    <div className="relative">
                                                        <Avatar className="h-16 w-16 border-4 border-gray-400">
                                                            <AvatarImage src={topThree[1].volunteer_avatar} />
                                                            <AvatarFallback>
                                                                {topThree[1].volunteer_name.substring(0, 2).toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                                                            <Badge className="bg-gray-400 hover:bg-gray-400">2</Badge>
                                                        </div>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="font-semibold truncate max-w-[120px]">
                                                            {topThree[1].volunteer_name}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {formatValue(topThree[1].value)}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* 1st Place */}
                                            {topThree[0] && (
                                                <div className="flex flex-col items-center space-y-3">
                                                    <div className="relative">
                                                        <Avatar className="h-20 w-20 border-4 border-yellow-400">
                                                            <AvatarImage src={topThree[0].volunteer_avatar} />
                                                            <AvatarFallback>
                                                                {topThree[0].volunteer_name.substring(0, 2).toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                                            <Trophy className="h-6 w-6 text-yellow-600" />
                                                        </div>
                                                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                                                            <Badge className="bg-yellow-400 hover:bg-yellow-400 text-black">1</Badge>
                                                        </div>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="font-bold truncate max-w-[120px]">
                                                            {topThree[0].volunteer_name}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {formatValue(topThree[0].value)}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* 3rd Place */}
                                            {topThree[2] && (
                                                <div className="flex flex-col items-center space-y-3 pt-8">
                                                    <div className="relative">
                                                        <Avatar className="h-16 w-16 border-4 border-amber-700">
                                                            <AvatarImage src={topThree[2].volunteer_avatar} />
                                                            <AvatarFallback>
                                                                {topThree[2].volunteer_name.substring(0, 2).toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                                                            <Badge className="bg-amber-700 hover:bg-amber-700">3</Badge>
                                                        </div>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="font-semibold truncate max-w-[120px]">
                                                            {topThree[2].volunteer_name}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {formatValue(topThree[2].value)}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Your Position */}
                            {userPosition && (
                                <Card className="border-emerald-500">
                                    <CardHeader>
                                        <CardTitle>{t('yourPosition')}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <Badge variant="outline" className="text-lg px-3 py-1">
                                                    #{userPosition.rank}
                                                </Badge>
                                                <Avatar>
                                                    <AvatarImage src={userPosition.volunteer_avatar} />
                                                    <AvatarFallback>
                                                        {userPosition.volunteer_name.substring(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-semibold">{userPosition.volunteer_name}</p>
                                                    <p className="text-sm text-muted-foreground">{t('table.you')}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-bold">{formatValue(userPosition.value)}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Full Rankings Table */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Full Rankings</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-[80px]">{t('table.rank')}</TableHead>
                                                    <TableHead>{t('table.volunteer')}</TableHead>
                                                    <TableHead className="text-right">{t('table.value')}</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {leaderboard.rankings.map((entry) => {
                                                    const isCurrentUser = entry.volunteer_id === user?.id;
                                                    const RankIcon = getRankIcon(entry.rank);

                                                    return (
                                                        <TableRow
                                                            key={entry.volunteer_id}
                                                            className={cn(
                                                                isCurrentUser && 'bg-emerald-50 dark:bg-emerald-950/20'
                                                            )}
                                                        >
                                                            <TableCell className="font-medium">
                                                                <div className="flex items-center gap-2">
                                                                    {RankIcon && (
                                                                        <RankIcon className={cn('h-5 w-5', getRankColor(entry.rank))} />
                                                                    )}
                                                                    <span>#{entry.rank}</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex items-center gap-3">
                                                                    <Avatar className="h-8 w-8">
                                                                        <AvatarImage src={entry.volunteer_avatar} />
                                                                        <AvatarFallback>
                                                                            {entry.volunteer_name.substring(0, 2).toUpperCase()}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                    <span className="font-medium">
                                                                        {entry.volunteer_name}
                                                                        {isCurrentUser && (
                                                                            <Badge variant="outline" className="ml-2">
                                                                                {t('table.you')}
                                                                            </Badge>
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-right font-medium">
                                                                {formatValue(entry.value)}
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
