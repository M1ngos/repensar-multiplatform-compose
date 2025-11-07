'use client';

import { useLoading } from '@/lib/hooks/useLoading';
import { NatureLoader } from '@/components/nature-loader';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

export function LoadingOverlay() {
    const { isLoading, loadingText } = useLoading();
    const [show, setShow] = useState(false);
    const t = useTranslations('utils');

    useEffect(() => {
        if (isLoading) {
            // Immediately show loading
            setShow(true);
        } else {
            // Slight delay before hiding to ensure smooth transition
            const timer = setTimeout(() => setShow(false), 150);
            return () => clearTimeout(timer);
        }
    }, [isLoading]);

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-md transition-all duration-300 animate-in fade-in">
            <NatureLoader
                size="md"
                text={loadingText || t('loading')}
            />
        </div>
    );
}
