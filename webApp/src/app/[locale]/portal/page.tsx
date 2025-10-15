'use client';

import { useAuth } from '@/lib/hooks/useAuth.tsx';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FolderKanban, CheckSquare, Heart, TrendingUp, Users, FileText } from 'lucide-react';

export default function PortalPage() {
    const { user } = useAuth();
    const t = useTranslations('Dashboard');

    // These will eventually come from your API
    const stats = [
        {
            title: t('nav.projects'),
            value: '12',
            description: '+2 this month',
            icon: FolderKanban,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100 dark:bg-blue-900/20',
        },
        {
            title: t('nav.tasks'),
            value: '48',
            description: '12 completed today',
            icon: CheckSquare,
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-100 dark:bg-emerald-900/20',
        },
        {
            title: t('nav.volunteers'),
            value: '127',
            description: '+8 new this week',
            icon: Heart,
            color: 'text-pink-600',
            bgColor: 'bg-pink-100 dark:bg-pink-900/20',
        },
        {
            title: t('nav.resources'),
            value: '234',
            description: '15 documents added',
            icon: FileText,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100 dark:bg-purple-900/20',
        },
    ];

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
            {/* Welcome Header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold md:text-3xl">
                    {t('welcome')}, {user?.name?.split(' ')[0] || 'User'}!
                </h1>
                <p className="text-muted-foreground">
                    {t('subtitle')}
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={stat.title}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {stat.title}
                                </CardTitle>
                                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${stat.bgColor}`}>
                                    <Icon className={`h-5 w-5 ${stat.color}`} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <p className="text-xs text-muted-foreground">
                                    {stat.description}
                                </p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Recent Activity / Quick Actions */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Projects</CardTitle>
                        <CardDescription>
                            Your most recently active projects
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {[
                                { name: 'Urban Reforestation Program', status: 'In Progress' },
                                { name: 'Beach Cleanup Initiative', status: 'Planning' },
                                { name: 'Environmental Education Workshops', status: 'Active' },
                            ].map((project, i) => (
                                <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                                    <div>
                                        <p className="text-sm font-medium">{project.name}</p>
                                        <p className="text-xs text-muted-foreground">{project.status}</p>
                                    </div>
                                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Active Volunteers</CardTitle>
                        <CardDescription>
                            Top contributors this month
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {[
                                { name: 'Maria Silva', tasks: 24 },
                                { name: 'João Santos', tasks: 18 },
                                { name: 'Ana Costa', tasks: 15 },
                            ].map((volunteer, i) => (
                                <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 text-sm font-semibold">
                                            {volunteer.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{volunteer.name}</p>
                                            <p className="text-xs text-muted-foreground">{volunteer.tasks} tasks completed</p>
                                        </div>
                                    </div>
                                    <Users className="h-4 w-4 text-emerald-600" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
