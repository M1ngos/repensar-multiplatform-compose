'use client';

import Link from 'next/link';
import {useState, Suspense } from 'react';
import { Home, Leaf, LogOut} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import LocaleSwitcher from "@/components/ui/locale-switcher.tsx";
import * as React from "react";
import ThemeSwitcher from "@/components/ui/theme-switcher.tsx";


function UserMenu() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    // const { data: user } = useSWR<User>('/api/user', fetcher);
    // async function handleSignOut() {
    //     await signOut();
    //     mutate('/api/user');
    //     router.push('/');
    // }

    // if (!user) {
    //     return (
    //         <>
    //             <Button asChild className="rounded-full">
    //                 <Link href="/sign-up">Sign Up</Link>
    //             </Button>
    //         </>
    //     );
    // }

    return (
        <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <DropdownMenuTrigger>
                <Avatar className="cursor-pointer size-9">
                    <AvatarImage alt={'Mingos'} />
                    {/*<AvatarFallback>*/}
                    {/*    {user.email*/}
                    {/*        .split(' ')*/}
                    {/*        .map((n) => n[0])*/}
                    {/*        .join('')}*/}
                    {/*</AvatarFallback>*/}
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="flex flex-col gap-1">
                <DropdownMenuItem className="cursor-pointer">
                    <Link href="/dashboard" className="flex w-full items-center">
                        <Home className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                    </Link>
                </DropdownMenuItem>
                <form className="w-full">
                    <button type="submit" className="flex w-full">
                        <DropdownMenuItem className="w-full flex-1 cursor-pointer">
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Sign out</span>
                        </DropdownMenuItem>
                    </button>
                </form>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function Header() {
    return (
        <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 ">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                <Link href="/" className="flex items-center">
                    <Leaf className="h-6 w-6 text-emerald-500"/>
                    <span className="ml-2 text-xl font-semibold">Repensar</span>
                </Link>
                <div className="flex items-center space-x-4">
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

