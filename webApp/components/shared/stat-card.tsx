'use client';

import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: string;
    variant?: 'default' | 'emerald' | 'blue' | 'orange' | 'purple';
    description?: string;
}

export function StatCard({
    title,
    value,
    icon: Icon,
    trend,
    variant = 'default',
    description
}: StatCardProps) {
    const variantStyles = {
        default: 'text-muted-foreground',
        emerald: 'text-emerald-600',
        blue: 'text-blue-600',
        orange: 'text-orange-600',
        purple: 'text-purple-600',
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className={cn('h-4 w-4', variantStyles[variant])} />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold tabular-nums">{value}</div>
                {trend && (
                    <p className="text-xs text-muted-foreground mt-1">
                        {trend}
                    </p>
                )}
                {description && (
                    <p className="text-xs text-muted-foreground mt-1">
                        {description}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
