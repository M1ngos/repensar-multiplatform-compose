'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi } from '@/lib/api/auth';
import { useAuth } from '@/lib/hooks/useAuth';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

export default function GoogleCallbackPage() {
  const t = useTranslations('Login');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { checkAuth } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get code and state from URL
        const code = searchParams.get('code');
        const state = searchParams.get('state');

        if (!code) {
          throw new Error('No authorization code received from Google');
        }

        // Exchange code for tokens
        await authApi.googleCallback({
          code,
          state: state || '',
        });

        // Update auth state
        await checkAuth();

        setStatus('success');
        toast.success(t('googleSignInSuccess'));

        // Redirect to portal after a short delay
        setTimeout(() => {
          router.push('/portal');
        }, 1000);
      } catch (error: any) {
        console.error('[GoogleCallback] Authentication failed:', error);
        setStatus('error');
        setErrorMessage(
          error?.detail ||
          error?.message ||
          'Failed to authenticate with Google. Please try again.'
        );
        toast.error(t('googleSignInFailed'));

        // Redirect to login after showing error
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    };

    handleCallback();
  }, [searchParams, router, checkAuth]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        {status === 'loading' && (
          <>
            <div className="mb-4 flex justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
            <h1 className="text-2xl font-semibold">Completing sign in...</h1>
            <p className="mt-2 text-muted-foreground">
              Please wait while we authenticate your account
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="mb-4 flex justify-center">
              <svg
                className="h-12 w-12 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold">Success!</h1>
            <p className="mt-2 text-muted-foreground">
              Redirecting to your dashboard...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mb-4 flex justify-center">
              <svg
                className="h-12 w-12 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold">Authentication Failed</h1>
            <p className="mt-2 text-muted-foreground">{errorMessage}</p>
            <p className="mt-4 text-sm text-muted-foreground">
              Redirecting to login page...
            </p>
          </>
        )}
      </div>
    </div>
  );
}
