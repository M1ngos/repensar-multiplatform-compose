'use client';

import { useEffect } from 'react';
import { useLoading } from '@/lib/hooks/useLoading';

export function LoadingReset() {
    const { setLoading } = useLoading();

    useEffect(() => {
        // Add a minimum delay so users can see the loading animation
        const timer = setTimeout(() => {
            setLoading(false);
        }, 800); // 800ms minimum display time

        return () => clearTimeout(timer);
    }, [setLoading]);

    return null;
}
