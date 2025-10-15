'use client';

import { useLoading } from '@/lib/hooks/useLoading';
import { Spinner } from '@/components/ui/spinner';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

export function LoadingOverlay() {
    const { isLoading } = useLoading();
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

    return ( //TODO: Improve this shitty animation
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent backdrop-blur transition-opacity duration-200">
            <Spinner
                className="h-16 w-16 text-primary"
                style={{ animationDuration: '8s' }}
            />
            <p className="text-lg font-semibold text-card-foreground">
                {t('loading')}
            </p>
        </div>
    );
}
