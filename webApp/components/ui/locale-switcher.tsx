'use client';

import { usePathname, useRouter } from '@/src/i18n/navigation';
import { useLocale } from 'next-intl';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useLoading } from '@/lib/hooks/useLoading';
import { useTransition } from 'react';

export default function LocaleSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const { setLoading } = useLoading();
    const [isPending, startTransition] = useTransition();

    const switchLocale = (newLocale: string) => {
        if (newLocale !== locale) {
            setLoading(true);
            startTransition(() => {
                router.replace(pathname, { locale: newLocale });
            });
            // Keep loading state active during navigation
            // The loading overlay will be hidden when the new page renders
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                className="px-3 py-1.5 border rounded h-9 min-w-[3rem] flex items-center justify-center text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                disabled={isPending}
            >
                {locale}
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem onClick={() => switchLocale('en')}>
                    en
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => switchLocale('pt')}>
                    pt
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
