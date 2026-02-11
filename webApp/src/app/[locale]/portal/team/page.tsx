'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth.tsx';
import { useTranslations, useLocale } from 'next-intl';
import useSWR from 'swr';
import { Search } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import { projectsApi } from '@/lib/api/projects';
import type { VolunteerSummary } from '@/lib/api/types';
import Link from 'next/link';

export default function TeamPage() {
    const { user } = useAuth();
    const locale = useLocale();
    const t = useTranslations('ProjectManager');
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch PM's projects
    const { data: pmProjects, isLoading: projectsLoading } = useSWR(
        user?.id ? ['team-pm-projects', user.id] : null,
        () => projectsApi.getProjects({ manager_id: user!.id })
    );

    // Fetch volunteers for all PM's projects, deduplicate
    const { data: teamData, isLoading: teamLoading } = useSWR(
        user?.id && pmProjects && pmProjects.length > 0 ? ['team-volunteers', user.id] : null,
        async () => {
            const volunteerResults = await Promise.all(
                pmProjects!.map(p =>
                    projectsApi.getProjectVolunteers(p.id)
                        .then(res => res.data.map(v => ({ ...v, projectId: p.id, projectName: p.name })))
                        .catch(() => [] as (VolunteerSummary & { projectId: number; projectName: string })[])
                )
            );

            // Build map: volunteer ID → { volunteer, projects[] }
            const volunteerMap = new Map<number, {
                volunteer: VolunteerSummary;
                projects: { id: number; name: string }[];
            }>();

            volunteerResults.forEach(results => {
                results.forEach(v => {
                    const existing = volunteerMap.get(v.id);
                    if (existing) {
                        if (!existing.projects.some(p => p.id === v.projectId)) {
                            existing.projects.push({ id: v.projectId, name: v.projectName });
                        }
                    } else {
                        volunteerMap.set(v.id, {
                            volunteer: v,
                            projects: [{ id: v.projectId, name: v.projectName }],
                        });
                    }
                });
            });

            return Array.from(volunteerMap.values());
        }
    );

    const isLoading = projectsLoading || teamLoading;

    // Filter team members by search
    const filteredTeam = React.useMemo(() => {
        if (!teamData) return [];
        if (!searchQuery) return teamData;

        const lower = searchQuery.toLowerCase();
        return teamData.filter(member =>
            member.volunteer.name.toLowerCase().includes(lower) ||
            member.volunteer.email.toLowerCase().includes(lower) ||
            member.projects.some(p => p.name.toLowerCase().includes(lower))
        );
    }, [teamData, searchQuery]);

    if (isLoading) {
        return (
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-72" />
                </div>
                <Skeleton className="h-12 w-full max-w-sm" />
                <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <PageHeader
                title={t('team.title')}
                description={t('team.subtitle')}
            />

            {/* Search */}
            <div className="max-w-sm">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={t('team.search')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            {/* Team Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            {t('team.stats.totalMembers')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{teamData?.length || 0}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            {t('team.stats.activeProjects')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{pmProjects?.length || 0}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            {t('team.stats.totalHours')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">
                            {teamData?.reduce((sum, m) => sum + m.volunteer.total_hours_contributed, 0).toFixed(1) || 0}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Team Table */}
            <Card>
                <CardContent className="pt-6">
                    {filteredTeam.length === 0 ? (
                        <Empty>
                            <EmptyHeader>
                                <EmptyTitle>{t('team.noMembers')}</EmptyTitle>
                                <EmptyDescription>{t('team.noMembersDesc')}</EmptyDescription>
                            </EmptyHeader>
                        </Empty>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t('team.table.name')}</TableHead>
                                        <TableHead>{t('team.table.email')}</TableHead>
                                        <TableHead>{t('team.table.projects')}</TableHead>
                                        <TableHead>{t('team.table.skills')}</TableHead>
                                        <TableHead className="text-right">{t('team.table.hours')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredTeam.map((member) => (
                                        <TableRow key={member.volunteer.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs">
                                                            {member.volunteer.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <Link href={`/${locale}/portal/volunteers/${member.volunteer.id}`} className="font-medium hover:underline">
                                                        {member.volunteer.name}
                                                    </Link>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {member.volunteer.email}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {member.projects.map(p => (
                                                        <Badge key={p.id} variant="outline" className="text-xs">
                                                            {p.name}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">{member.volunteer.skills_count}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {member.volunteer.total_hours_contributed.toFixed(1)}h
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
