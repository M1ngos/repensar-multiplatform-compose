import './globals.css'
import type { Metadata, Viewport } from 'next';
import { SWRConfig } from 'swr';
import {NextIntlClientProvider, hasLocale} from 'next-intl';
import {notFound} from 'next/navigation';
import {routing} from "@/src/i18n/routing.ts";
import {setRequestLocale} from "next-intl/server";
import { ThemeProvider } from "@/components/ui/theme-provider.tsx"
import { AuthProvider } from '@/lib/hooks/useAuth';
import { LoadingProvider } from '@/lib/hooks/useLoading';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { LoadingReset } from '@/components/ui/loading-reset';
import { Toaster } from '@/components/ui/sonner';
// import LocaleSwitcher from "@/components/ui/locale-switcher.tsx";
export function generateStaticParams() {
    return routing.locales.map((locale) => ({locale}));
}

export const metadata: Metadata = {
    title: 'Cooperativa de Educação Ambiental Repensar ',
    description: 'Organização vocacionada para acções de educação ambiental e desperdício zero..'
};

export const viewport: Viewport = {
    maximumScale: 1
};


export default async function RootLayout({
   children,
    params
}: {
    children: React.ReactNode
    params: Promise<{locale: string}>;
}) {
    const {locale} = await params;
    if (!hasLocale(routing.locales, locale)) {
        notFound();
    }
    setRequestLocale(locale);
    return (
        <>
            <html lang={locale} suppressHydrationWarning>
                <body>
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="system"
                        enableSystem
                        disableTransitionOnChange
                    >
                        <LoadingProvider>
                            <NextIntlClientProvider>
                                <AuthProvider>
                                    <SWRConfig
                                        value={{
                                            fallback: {
                                                // We do NOT await here
                                                // Only components that read this data will suspend
                                                // '/api/user': getUser(),
                                                // '/api/team': getTeamForUser()
                                            }
                                        }}
                                    >
                                        <LoadingReset />
                                        <LoadingOverlay />
                                        <Toaster />
                                        {children}
                                    </SWRConfig>
                                </AuthProvider>
                            </NextIntlClientProvider>
                        </LoadingProvider>
                    </ThemeProvider>
                </body>
            </html>
        </>
    );
}