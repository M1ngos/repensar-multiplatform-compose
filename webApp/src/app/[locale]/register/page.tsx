'use client';

import { Leaf, Loader2 } from "lucide-react"
import { RegisterForm } from "@/components/register-form"
import Link from "next/link";
import * as React from "react";
import { useAuth } from '@/lib/hooks/useAuth.tsx';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function RegisterPage() {
    const { authStatus, isAuthLoading } = useAuth();
    const router = useRouter();

    // Redirect to portal if already authenticated
    useEffect(() => {
        if (!isAuthLoading && authStatus.is_authenticated) {
            router.push('/portal');
        }
    }, [isAuthLoading, authStatus.is_authenticated, router]);

    // Show loading state while checking authentication
    if (isAuthLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            </div>
        );
    }

    // Don't render register form if already authenticated (will redirect)
    if (authStatus.is_authenticated) {
        return null;
    }

    return (
        <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">
                <Link href="/" className="flex items-center self-center">
                    <Leaf className="h-6 w-6 text-emerald-500"/>
                    <span className="ml-2 text-xl font-semibold">Cooperativa Repensar</span>
                </Link>
                <RegisterForm />
            </div>
        </div>
    )
}
