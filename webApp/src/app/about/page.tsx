"use client";

import { Button } from "@/components/ui/button";

export default function AboutPage() {
    return (
        <div className="p-4">
            <h1>About Page</h1>
            <Button onClick={() => alert("ShadCN Button works!")}>Test Button</Button>
        </div>
    );
}
