'use client';

import { ProtectedRoute } from '@/components/protected-route';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedRoute>
            <section className="flex flex-col min-h-screen">
                {children}
            </section>
        </ProtectedRoute>
    );
}

