'use client';

import { useAuth } from '@/lib/hooks/useAuth.tsx';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
  loadingComponent?: ReactNode;
}

/**
 * ProtectedRoute component that ensures the user is authenticated
 * before rendering children. Redirects to specified path if not authenticated.
 *
 * Features:
 * - Automatic token validation on mount
 * - Periodic token revalidation (every 5 minutes)
 * - Revalidation when user returns to tab
 * - Loading state while checking authentication
 * - Automatic redirect to login if not authenticated
 *
 * @example
 * ```tsx
 * <ProtectedRoute>
 *   <DashboardContent />
 * </ProtectedRoute>
 * ```
 */
export function ProtectedRoute({
  children,
  redirectTo = '/login',
  loadingComponent,
}: ProtectedRouteProps) {
  const { authStatus, isAuthLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthLoading && !authStatus.is_authenticated) {
      router.push(redirectTo);
    }
  }, [isAuthLoading, authStatus.is_authenticated, router, redirectTo]);

  // Show loading state while checking authentication
  if (isAuthLoading) {
    return (
      loadingComponent || (
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      )
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!authStatus.is_authenticated) {
    return null;
  }

  return <>{children}</>;
}
