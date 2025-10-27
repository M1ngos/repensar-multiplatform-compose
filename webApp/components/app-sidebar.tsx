'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import {
    LayoutDashboard,
    FolderKanban,
    FileText,
    CheckSquare,
    Users,
    Heart,
    BarChart3,
    FileDown,
    Settings,
    LogOut,
    Leaf,
} from 'lucide-react';

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator,
    SidebarRail,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/lib/hooks/useAuth.tsx';
import { useRouter } from 'next/navigation';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from 'next-themes';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NavItem {
    title: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    roles?: string[]; // Which roles can see this item
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname();
    const router = useRouter();
    const locale = useLocale();
    const t = useTranslations('Dashboard');
    const { user, logout, isLogoutLoading } = useAuth();

    // Get user role
    const userRole = user?.user_type || 'volunteer';

    const navItems: NavItem[] = [
        {
            title: t('nav.overview'),
            href: `/${locale}/portal`,
            icon: LayoutDashboard,
        },
        {
            title: t('nav.projects'),
            href: `/${locale}/portal/projects`,
            icon: FolderKanban,
        },
        {
            title: t('nav.resources'),
            href: `/${locale}/portal/resources`,
            icon: FileText,
        },
        {
            title: t('nav.tasks'),
            href: `/${locale}/portal/tasks`,
            icon: CheckSquare,
        },
        {
            title: t('nav.volunteers'),
            href: `/${locale}/portal/volunteers`,
            icon: Heart,
        },
        {
            title: t('nav.users'),
            href: `/${locale}/portal/users`,
            icon: Users,
            roles: ['admin', 'project_manager'], // Only admin and PMs can see users
        },
        {
            title: t('nav.analytics'),
            href: `/${locale}/portal/analytics`,
            icon: BarChart3,
            roles: ['admin', 'project_manager'],
        },
        {
            title: t('nav.reports'),
            href: `/${locale}/portal/reports`,
            icon: FileDown,
            roles: ['admin', 'project_manager', 'staff_member'],
        },
    ];

    const filteredNavItems = navItems.filter(
        (item) => !item.roles || item.roles.includes(userRole)
    );

    const handleLogout = async () => {
        await logout();
        router.push(`/${locale}`);
    };

    const { theme, setTheme } = useTheme();

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={`/${locale}/portal`}>
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-emerald-500 text-sidebar-primary-foreground">
                                    <Leaf className="size-4" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">Repensar</span>
                                    <span className="truncate text-xs">{t('appSubtitle')}</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarSeparator />

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>{t('nav.main')}</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {filteredNavItems.map((item) => {
                                const Icon = item.icon;
                                const isActive =
                                    pathname === item.href ||
                                    (item.href !== `/${locale}/portal` &&
                                        pathname.startsWith(item.href));

                                return (
                                    <SidebarMenuItem key={item.href}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isActive}
                                            tooltip={item.title}
                                        >
                                            <Link href={item.href}>
                                                <Icon />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarSeparator />

                <SidebarGroup>
                    <SidebarGroupLabel>{t('nav.other')}</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    isActive={pathname === `/${locale}/portal/settings`}
                                    tooltip={t('nav.settings')}
                                >
                                    <Link href={`/${locale}/portal/settings`}>
                                        <Settings />
                                        <span>{t('nav.settings')}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    tooltip={t('nav.theme')}
                                >
                                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                        <Sun className="size-4 rotate-0 scale-100 transition-all dark:scale-0 dark:-rotate-90" />
                                        <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                                    </div>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-semibold">{t('nav.theme')}</span>
                                        <span className="truncate text-xs capitalize">
                                            {theme === 'system' ? t('nav.themeSystem') : theme}
                                        </span>
                                    </div>
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent side="top" align="end" className="w-[--radix-dropdown-menu-trigger-width]">
                                <DropdownMenuItem onClick={() => setTheme('light')}>
                                    <Sun className="mr-2 size-4" />
                                    {t('nav.themeLight')}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setTheme('dark')}>
                                    <Moon className="mr-2 size-4" />
                                    {t('nav.themeDark')}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setTheme('system')}>
                                    <Monitor className="mr-2 size-4" />
                                    {t('nav.themeSystem')}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={`/${locale}/portal/profile`}>
                                <Avatar className="size-8 rounded-lg">
                                    <AvatarImage alt={user?.name || 'User'} />
                                    <AvatarFallback className="rounded-lg bg-emerald-100 text-emerald-700">
                                        {user?.name
                                            ?.split(' ')
                                            .map((n) => n[0])
                                            .join('')
                                            .toUpperCase() || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">{user?.name}</span>
                                    <span className="truncate text-xs">
                                        {t(`roles.${userRole}`)}
                                    </span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            onClick={handleLogout}
                            disabled={isLogoutLoading}
                            tooltip={t('nav.logout')}
                        >
                            <LogOut />
                            <span>{t('nav.logout')}</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    );
}
