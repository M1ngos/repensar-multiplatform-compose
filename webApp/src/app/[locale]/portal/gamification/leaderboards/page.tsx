'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { leaderboardsApi } from '@/lib/api';
import { LeaderboardType as LeaderboardTypeEnum, LeaderboardTimeframe as LeaderboardTimeframeEnum } from '@/lib/api/types';
import { useAuth } from '@/lib/hooks/useAuth';
import { Unauthorized } from '@/components/unauthorized';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, RefreshCw, Download, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty';

export default function LeaderboardManagementPage() {
  const { user, isAuthLoading } = useAuth();

  // State
  const [leaderboardType, setLeaderboardType] = useState<LeaderboardTypeEnum>(LeaderboardTypeEnum.POINTS);
  const [timeframe, setTimeframe] = useState<LeaderboardTimeframeEnum>(LeaderboardTimeframeEnum.ALL_TIME);

  // Fetch leaderboard data
  const { data: leaderboardData, mutate: refreshLeaderboard, isLoading } = useSWR(
    user ? ['leaderboard-admin', leaderboardType, timeframe] : null,
    () => leaderboardsApi.get(leaderboardType, { timeframe })
  );

  // Permission check
  if (isAuthLoading) {
    return <LoadingSkeleton />;
  }

  if (!user || user.user_type !== 'admin') {
    return <Unauthorized />;
  }

  const rankings = leaderboardData?.rankings || [];

  const handleRefresh = async () => {
    try {
      await refreshLeaderboard();
      toast.success('Leaderboard refreshed');
    } catch (error) {
      console.error('Failed to refresh leaderboard:', error);
      toast.error('Failed to refresh leaderboard');
    }
  };

  const handleExportCSV = () => {
    if (rankings.length === 0) {
      toast.error('No data to export');
      return;
    }

    // Create CSV content
    const headers = ['Rank', 'Name', 'Email', 'Value'];
    const rows = rankings.map((entry: any, index: number) => [
      index + 1,
      entry.volunteer_name,
      entry.volunteer_email || '',
      entry.value,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leaderboard-${leaderboardType}-${timeframe}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success('Leaderboard exported');
  };

  const getValueLabel = () => {
    switch (leaderboardType) {
      case LeaderboardTypeEnum.POINTS:
        return 'Points';
      case LeaderboardTypeEnum.HOURS:
        return 'Hours';
      case LeaderboardTypeEnum.PROJECTS:
        return 'Projects';
      default:
        return 'Value';
    }
  };

  const formatValue = (value: number) => {
    switch (leaderboardType) {
      case LeaderboardTypeEnum.POINTS:
        return value.toLocaleString();
      case LeaderboardTypeEnum.HOURS:
        return `${value.toFixed(1)}h`;
      case LeaderboardTypeEnum.PROJECTS:
        return value.toString();
      default:
        return value.toString();
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Leaderboard Management</h1>
          <p className="text-muted-foreground">View and manage volunteer leaderboards</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExportCSV} disabled={rankings.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Volunteers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rankings.length}</div>
            <p className="text-xs text-muted-foreground">On this leaderboard</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Top Performer</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rankings[0]?.volunteer_name || '-'}
            </div>
            <p className="text-xs text-muted-foreground">
              {rankings[0] ? formatValue(rankings[0].value) : 'No data'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average {getValueLabel()}</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rankings.length > 0
                ? formatValue(rankings.reduce((sum: number, r: any) => sum + r.value, 0) / rankings.length)
                : '-'}
            </div>
            <p className="text-xs text-muted-foreground">Across all volunteers</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="space-y-2 flex-1">
              <label className="text-sm font-medium">Timeframe</label>
              <Select value={timeframe} onValueChange={(value) => setTimeframe(value as LeaderboardTimeframeEnum)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={LeaderboardTimeframeEnum.ALL_TIME}>All Time</SelectItem>
                  <SelectItem value={LeaderboardTimeframeEnum.MONTHLY}>This Month</SelectItem>
                  <SelectItem value={LeaderboardTimeframeEnum.WEEKLY}>This Week</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Leaderboards
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={leaderboardType} onValueChange={(value) => setLeaderboardType(value as LeaderboardTypeEnum)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value={LeaderboardTypeEnum.POINTS}>Points</TabsTrigger>
              <TabsTrigger value={LeaderboardTypeEnum.HOURS}>Hours</TabsTrigger>
              <TabsTrigger value={LeaderboardTypeEnum.PROJECTS}>Projects</TabsTrigger>
            </TabsList>

            <TabsContent value={leaderboardType} className="mt-6">
              {isLoading ? (
                <LoadingSkeleton />
              ) : rankings.length === 0 ? (
                <Empty>
                  <EmptyHeader>
                    <Trophy className="h-12 w-12 text-muted-foreground" />
                    <EmptyTitle>No leaderboard data</EmptyTitle>
                    <EmptyDescription>
                      There are no volunteers with activity in this category yet
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <>
                  {/* Top 3 Podium */}
                  {rankings.length >= 3 && (
                    <div className="grid gap-4 md:grid-cols-3 mb-6">
                      {/* 2nd Place */}
                      <Card className="md:order-1">
                        <CardContent className="pt-6 text-center">
                          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-3">
                            <span className="text-2xl font-bold text-slate-600">2</span>
                          </div>
                          <Avatar className="mx-auto w-16 h-16 mb-2">
                            <AvatarImage src={rankings[1].volunteer_avatar} />
                            <AvatarFallback>{rankings[1].volunteer_name[0]}</AvatarFallback>
                          </Avatar>
                          <h3 className="font-semibold">{rankings[1].volunteer_name}</h3>
                          <p className="text-2xl font-bold text-muted-foreground mt-2">
                            {formatValue(rankings[1].value)}
                          </p>
                        </CardContent>
                      </Card>

                      {/* 1st Place */}
                      <Card className="md:order-2 border-yellow-400 border-2">
                        <CardContent className="pt-6 text-center">
                          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-yellow-100 mb-3">
                            <Trophy className="h-10 w-10 text-yellow-600" />
                          </div>
                          <Avatar className="mx-auto w-20 h-20 mb-2">
                            <AvatarImage src={rankings[0].volunteer_avatar} />
                            <AvatarFallback>{rankings[0].volunteer_name[0]}</AvatarFallback>
                          </Avatar>
                          <h3 className="font-bold text-lg">{rankings[0].volunteer_name}</h3>
                          <p className="text-3xl font-bold text-yellow-600 mt-2">
                            {formatValue(rankings[0].value)}
                          </p>
                        </CardContent>
                      </Card>

                      {/* 3rd Place */}
                      <Card className="md:order-3">
                        <CardContent className="pt-6 text-center">
                          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 mb-3">
                            <span className="text-2xl font-bold text-amber-600">3</span>
                          </div>
                          <Avatar className="mx-auto w-16 h-16 mb-2">
                            <AvatarImage src={rankings[2].volunteer_avatar} />
                            <AvatarFallback>{rankings[2].volunteer_name[0]}</AvatarFallback>
                          </Avatar>
                          <h3 className="font-semibold">{rankings[2].volunteer_name}</h3>
                          <p className="text-2xl font-bold text-muted-foreground mt-2">
                            {formatValue(rankings[2].value)}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Full Rankings Table */}
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-16">Rank</TableHead>
                          <TableHead>Volunteer</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead className="text-right">{getValueLabel()}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rankings.map((entry: any, index: number) => (
                          <TableRow key={entry.volunteer_id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                {index + 1}
                                {index < 3 && (
                                  <Trophy className="h-3 w-3 text-yellow-600" />
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={entry.volunteer_avatar} />
                                  <AvatarFallback>{entry.volunteer_name[0]}</AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{entry.volunteer_name}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {entry.volunteer_email || '-'}
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {formatValue(entry.value)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(10)].map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}