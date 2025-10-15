'use client';

import { useAuth } from '@/lib/hooks/useAuth.tsx';

export default function PortalPage() {
    const { user, logout } = useAuth();

    return (
        <div className="container mx-auto p-6">
            <div className="mb-8 flex items-center justify-between">
                <h1 className="text-3xl font-bold">Portal Dashboard</h1>
                <button
                    onClick={() => logout()}
                    className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                >
                    Logout
                </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-lg border p-6">
                    <h2 className="mb-2 text-xl font-semibold">Welcome</h2>
                    <p className="text-muted-foreground">
                        {user?.name || user?.email}
                    </p>
                </div>

                <div className="rounded-lg border p-6">
                    <h2 className="mb-2 text-xl font-semibold">Email</h2>
                    <p className="text-muted-foreground">{user?.email}</p>
                </div>

                <div className="rounded-lg border p-6">
                    <h2 className="mb-2 text-xl font-semibold">Status</h2>
                    <p className="text-muted-foreground">
                        {user?.is_active ? 'Active' : 'Inactive'}
                    </p>
                </div>
            </div>
        </div>
    );
}
