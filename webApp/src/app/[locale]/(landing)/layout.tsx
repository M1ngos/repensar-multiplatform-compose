'use client';

import Link from 'next/link';
import { useState, Suspense } from 'react';
import {LogIn, Leaf, LogOut} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import LocaleSwitcher from "@/components/ui/locale-switcher.tsx";
import * as React from "react";
import ThemeSwitcher from "@/components/ui/theme-switcher.tsx";
import { Button } from '@/components/ui/button';
import {useLocale, useTranslations} from 'next-intl';
import { useAuth } from '@/lib/hooks/useAuth.tsx';


function UserMenu() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user, authStatus, logout, isLogoutLoading, isAuthLoading } = useAuth();
    const locale = useLocale();
    const t = useTranslations('Landing');


    async function handleSignOut() {
        await logout();
    }

    if (isAuthLoading) {
        return <div className="h-9 w-9 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />;
    }

    if (!authStatus || !authStatus.is_authenticated) {
        return (
            <Button asChild className="rounded-full">
                <Link href={`/${locale}/login`}>
                    <LogIn className="h-4 w-4" />
                    {t('header.portalBtn')}
                </Link>
            </Button>
        );
    }

    return (
        <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <DropdownMenuTrigger>
                <Avatar className="cursor-pointer size-9">
                    <AvatarImage alt={user?.name || 'User'} />
                    <AvatarFallback>
                        {user?.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('') || 'U'}
                    </AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="flex flex-col gap-1">
                <DropdownMenuItem className="cursor-pointer" asChild>
                    <Link href={`/${locale}/portal`} className="flex w-full items-center">
                        <LogIn className="mr-2 h-4 w-4" />
                        <span>{t('header.portal')}</span>
                    </Link>
                </DropdownMenuItem>
                <form className="w-full" onSubmit={handleSignOut}>
                    <button type="submit" className="flex w-full" disabled={isLogoutLoading}>
                        <DropdownMenuItem className="w-full flex-1 cursor-pointer" disabled={isLogoutLoading}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>{t('header.signOut')}</span>
                        </DropdownMenuItem>
                    </button>
                </form>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    React.useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // Update scrolled state (for background change)
            setIsScrolled(currentScrollY > 10);

            // Update visibility based on scroll direction
            if (currentScrollY < lastScrollY || currentScrollY < 10) {
                // Scrolling up or at the top
                setIsVisible(true);
            } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
                // Scrolling down and past threshold
                setIsVisible(false);
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    return (
        <header
            className={`
                sticky top-0 z-50
                border-b border-gray-200 dark:border-gray-700
                transition-all duration-300 ease-in-out
                ${isScrolled
                    ? 'bg-white dark:bg-gray-900 shadow-md'
                    : 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md'
                }
                ${isVisible ? 'translate-y-0' : '-translate-y-full'}
            `}
        >
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-3 md:py-4 flex justify-between items-center gap-2">
                <Link href="/" className="flex items-center shrink-0">
                    <Leaf
                        className="h-7 w-7 sm:h-9 sm:w-9 md:h-10 md:w-10 text-emerald-500"
                        suppressHydrationWarning
                    />
                    <span className="ml-1.5 sm:ml-2 text-base sm:text-lg md:text-xl font-semibold">Repensar</span>
                </Link>
                <div className="flex items-center gap-1.5 sm:gap-2 md:gap-4">
                    <Suspense fallback={<div className="h-9" />}>
                        <UserMenu />
                        <LocaleSwitcher/>
                        <ThemeSwitcher/>
                    </Suspense>
                </div>
            </div>
        </header>
    );
}

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <section className="flex flex-col min-h-screen">
            <Header />
                {children}
        </section>
    );
}

