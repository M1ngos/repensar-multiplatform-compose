import {Leaf} from "lucide-react"

import { LoginForm } from "@/components/login-form"
import Link from "next/link";
import * as React from "react";

export default function LoginPage() {
    return (
        <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">

                <Link href="/" className="flex items-center self-center">
                    <Leaf className="h-6 w-6 text-emerald-500"/>
                    <span className="ml-2 text-xl font-semibold">Cooperativa Repensar</span>
                </Link>
                <LoginForm />
            </div>
        </div>
    )
}
