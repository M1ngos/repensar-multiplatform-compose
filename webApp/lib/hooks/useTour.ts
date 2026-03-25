'use client';

import { useCallback, useEffect, useRef } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { type TourId, TOUR_STEPS, isTourSeen, markTourSeen } from '@/lib/tour/volunteer-tours';

interface UseTourOptions {
    tourId: TourId;
    /** Whether the tour feature is enabled (from show_tutorials preference). Defaults to true. */
    enabled?: boolean;
    /** Translated tour step strings — call useTranslations('Tour.<tourId>') and pass the result */
    tSteps: (key: string) => string;
    /** Common button labels */
    nextBtnText: string;
    prevBtnText: string;
    doneBtnText: string;
}

export function useTour({
    tourId,
    enabled = true,
    tSteps,
    nextBtnText,
    prevBtnText,
    doneBtnText,
}: UseTourOptions) {
    const driverRef = useRef<ReturnType<typeof driver> | null>(null);

    const startTour = useCallback(() => {
        const steps = TOUR_STEPS[tourId];
        if (!steps?.length) return;

        // Filter out steps whose target elements don't exist in the DOM yet
        const validSteps = steps.filter(({ element }) => !!document.querySelector(element));
        if (!validSteps.length) return;

        driverRef.current?.destroy();

        driverRef.current = driver({
            showProgress: true,
            animate: true,
            nextBtnText,
            prevBtnText,
            doneBtnText,
            onDestroyStarted: () => {
                markTourSeen(tourId);
                driverRef.current?.destroy();
            },
            steps: validSteps.map(({ element, popover }) => ({
                element,
                popover: {
                    title: tSteps(popover.titleKey),
                    description: tSteps(popover.descriptionKey),
                    side: popover.side,
                },
            })),
        });

        driverRef.current.drive();
        markTourSeen(tourId);
    }, [tourId, tSteps, nextBtnText, prevBtnText, doneBtnText]);

    // Auto-start on first visit (after a short delay to ensure DOM is ready)
    useEffect(() => {
        if (!enabled) return;
        if (isTourSeen(tourId)) return;

        const timer = setTimeout(startTour, 900);
        return () => clearTimeout(timer);
    }, [enabled, tourId, startTour]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            driverRef.current?.destroy();
        };
    }, []);

    return { startTour };
}
