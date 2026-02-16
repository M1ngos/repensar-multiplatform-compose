'use client';

import { useLoading } from '@/lib/hooks/useLoading';
import { NatureLoader } from '@/components/nature-loader';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

export function LoadingOverlay() {
    const { isLoading, loadingText } = useLoading();
    const [show, setShow] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);
    const t = useTranslations('utils');

    useEffect(() => {
        if (isLoading) {
            // Immediately mount and show
            setShouldRender(true);
            requestAnimationFrame(() => setShow(true));
        } else {
            // Fade out, then unmount
            setShow(false);
            const timer = setTimeout(() => setShouldRender(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isLoading]);

    if (!shouldRender) return null;

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-lg transition-all duration-300 ${
                show ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
        >
            <div
                className={`transition-all duration-500 ease-out ${
                    show ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'
                }`}
            >
                <NatureLoader
                    size="md"
                    text={loadingText || t('loading')}
                />
            </div>
        </div>
    );
}
