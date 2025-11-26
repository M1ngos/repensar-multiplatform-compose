'use client';

import { useState, useEffect, useCallback } from 'react';

const NEWSLETTER_KEYS = {
  LAST_POPUP_SHOWN: 'newsletter_popup_last_shown',
  IS_SUBSCRIBED: 'newsletter_subscribed',
} as const;

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const SCROLL_THRESHOLD = 0.5; // 50% scroll

/**
 * Hook to manage newsletter popup visibility based on scroll position and localStorage
 *
 * Rules:
 * - Don't show if already subscribed
 * - Don't show if shown within the last 7 days
 * - Show when user scrolls 50% down the page
 */
export function useNewsletterPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);

  const shouldShowPopup = useCallback((): boolean => {
    if (typeof window === 'undefined') return false;

    // Check if already subscribed
    const isSubscribed = localStorage.getItem(NEWSLETTER_KEYS.IS_SUBSCRIBED);
    if (isSubscribed === 'true') return false;

    // Check if popup was shown within 7 days
    const lastShown = localStorage.getItem(NEWSLETTER_KEYS.LAST_POPUP_SHOWN);
    if (lastShown) {
      const lastShownTime = new Date(lastShown).getTime();
      const now = Date.now();
      if (now - lastShownTime < SEVEN_DAYS_MS) return false;
    }

    return true;
  }, []);

  const markAsShown = useCallback(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(NEWSLETTER_KEYS.LAST_POPUP_SHOWN, new Date().toISOString());
  }, []);

  const markAsSubscribed = useCallback(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(NEWSLETTER_KEYS.IS_SUBSCRIBED, 'true');
    localStorage.setItem(NEWSLETTER_KEYS.LAST_POPUP_SHOWN, new Date().toISOString());
  }, []);

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
    // Mark as shown when closing (whether via X button or No thanks)
    if (!open) {
      markAsShown();
    }
  }, [markAsShown]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (hasTriggered) return;
    if (!shouldShowPopup()) return;

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPosition = window.scrollY;
      const scrollPercentage = scrollPosition / scrollHeight;

      if (scrollPercentage >= SCROLL_THRESHOLD) {
        setIsOpen(true);
        setHasTriggered(true);
        // Remove listener after triggering
        window.removeEventListener('scroll', handleScroll);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [hasTriggered, shouldShowPopup]);

  return {
    isOpen,
    setIsOpen: handleOpenChange,
    markAsShown,
    markAsSubscribed,
  };
}
