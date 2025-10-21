'use client';

import { useAuth } from '@/lib/hooks/useAuth.tsx';
import { useTranslations } from 'next-intl';
import { SectionCards } from '@/components/dashboard/section-cards';
import { ChartAreaInteractive } from '@/components/dashboard/chart-area-interactive';
import { DataTable } from '@/components/dashboard/data-table';
import data from '@/components/dashboard/data.json';

export default function PortalPage() {
    const { user } = useAuth();
    const t = useTranslations('Dashboard');

    return (
        <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                    {/* Welcome Header */}
                    <div className="flex flex-col gap-2 px-4 lg:px-6">
                        <h1 className="text-2xl font-bold md:text-3xl">
                            {t('welcome')}, {user?.name?.split(' ')[0] || 'User'}!
                        </h1>
                        <p className="text-muted-foreground">
                            {t('subtitle')}
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <SectionCards />

                    {/* Interactive Chart */}
                    <div className="px-4 lg:px-6">
                        <ChartAreaInteractive />
                    </div>

                    {/* Data Table */}
                    <DataTable data={data} />
                </div>
            </div>
        </div>
    );
}
