'use client';

import { useAuth } from '@/lib/hooks/useAuth.tsx';
import { useTranslations } from 'next-intl';
import { SectionCards } from '@/components/dashboard/section-cards';
import { RecentProjects } from '@/components/dashboard/recent-projects';
import { GamificationSummaryCard } from '@/components/dashboard/gamification-summary-card';

export default function PortalPage() {
    const { user } = useAuth();
    const t = useTranslations('Dashboard');

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            {/* Welcome Header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">
                    {t('welcome')}, {user?.name?.split(' ')[0] || 'User'}!
                </h1>
                <p className="text-muted-foreground">
                    {t('subtitle')}
                </p>
            </div>

            {/* Stats Cards - Real Backend Data */}
            <SectionCards />

            {/* Gamification Summary */}
            <GamificationSummaryCard />

            {/* Recent Projects - Real Backend Data */}
            <RecentProjects />
        </div>
    );
}
