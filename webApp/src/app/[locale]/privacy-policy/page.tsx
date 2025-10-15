'use client';

import { Leaf } from "lucide-react";
import Link from "next/link";
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PrivacyPolicyPage() {
    const t = useTranslations('PrivacyPolicy');
    const router = useRouter();

    return (
        <div className="bg-muted min-h-screen p-6 md:p-10">
            <div className="mx-auto max-w-4xl">
                <Link href="/" className="flex items-center mb-6">
                    <Leaf className="h-6 w-6 text-emerald-500"/>
                    <span className="ml-2 text-xl font-semibold">Cooperativa Repensar</span>
                </Link>

                <Card>
                    <CardHeader className="relative">
                        <Button
                            variant="ghost"
                            onClick={() => router.back()}
                            className="absolute left-2 top-2 sm:left-4 sm:top-4 h-8 w-8 sm:h-auto sm:w-auto p-1 sm:p-2"
                        >
                            <ArrowLeft className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">{t('goBack')}</span>
                        </Button>
                        <CardTitle className="text-2xl sm:text-3xl text-center pt-8 sm:pt-4">{t('title')}</CardTitle>
                        <p className="text-sm text-muted-foreground text-center mt-2">
                            {t('lastUpdated')}: {t('updateDate')}
                        </p>
                    </CardHeader>
                    <CardContent className="prose prose-sm max-w-none dark:prose-invert">
                        <section className="mb-6">
                            <h2 className="text-xl font-semibold mb-3">{t('section1.title')}</h2>
                            <p className="text-muted-foreground">{t('section1.content')}</p>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-xl font-semibold mb-3">{t('section2.title')}</h2>
                            <p className="text-muted-foreground">{t('section2.content')}</p>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-xl font-semibold mb-3">{t('section3.title')}</h2>
                            <p className="text-muted-foreground">{t('section3.content')}</p>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-xl font-semibold mb-3">{t('section4.title')}</h2>
                            <p className="text-muted-foreground">{t('section4.content')}</p>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-xl font-semibold mb-3">{t('section5.title')}</h2>
                            <p className="text-muted-foreground">{t('section5.content')}</p>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-xl font-semibold mb-3">{t('section6.title')}</h2>
                            <p className="text-muted-foreground">{t('section6.content')}</p>
                        </section>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
