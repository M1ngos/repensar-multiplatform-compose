'use client';

import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { ReactNode } from 'react';

interface FilterBarProps {
    searchQuery?: string;
    onSearchChange?: (value: string) => void;
    searchPlaceholder?: string;
    children?: ReactNode;
}

export function FilterBar({
    searchQuery,
    onSearchChange,
    searchPlaceholder = 'Search...',
    children
}: FilterBarProps) {
    return (
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {onSearchChange && (
                <div className="relative flex-1 md:max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder={searchPlaceholder}
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-8"
                    />
                </div>
            )}
            {children && (
                <div className="flex items-center gap-2">
                    {children}
                </div>
            )}
        </div>
    );
}
