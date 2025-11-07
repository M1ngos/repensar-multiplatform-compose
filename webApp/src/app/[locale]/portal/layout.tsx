'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { NotificationCenter } from '@/components/notification-center';
import { GlobalSearch } from '@/components/global-search';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
    const t = useTranslations('Search');

    return (
        <ProtectedRoute>
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-gradient-nature/5">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbPage>Portal</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                        <div className="ml-auto flex items-center gap-2">
                            <Button
                                variant="outline"
                                className="relative w-60 justify-start text-sm text-muted-foreground"
                                onClick={() => {
                                    const event = new KeyboardEvent('keydown', {
                                        key: 'k',
                                        metaKey: true,
                                        bubbles: true,
                                    });
                                    document.dispatchEvent(event);
                                }}
                            >
                                <Search className="mr-2 h-4 w-4" />
                                {t('placeholder')}
                                <kbd className="pointer-events-none absolute right-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                                    <span className="text-xs">⌘</span>K
                                </kbd>
                            </Button>
                            <NotificationCenter />
                        </div>
                    </header>
                    <div className="flex flex-1 flex-col">
                        {children}
                    </div>
                </SidebarInset>
                <GlobalSearch />
            </SidebarProvider>
        </ProtectedRoute>
    );
}

