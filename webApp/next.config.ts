import { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const backendUrl = process.env.BACKEND_URL ?? 'http://127.0.0.1:8000';

const nextConfig: NextConfig = {
    async rewrites() {
        // All backend route prefixes proxied server-side to backendUrl.
        // The browser always talks to the Next.js host; Next.js forwards to the backend.
        const backends = [
            '/auth',
            '/users',
            '/volunteers',
            '/projects',
            '/tasks',
            '/resources',
            '/reports',
            '/analytics',
            '/gamification',
            '/blog',
            '/files',
            '/uploads',
            '/search',
            '/sync',
            '/notifications',
            '/newsletter',
            '/contact',
            '/api/v1',
        ];

        // Two rules per prefix:
        // 1. Root path  GET /volunteers        → backend GET /volunteers
        // 2. Nested paths GET /volunteers/123  → backend GET /volunteers/123
        return backends.flatMap((prefix) => [
            {
                source: prefix,
                destination: `${backendUrl}${prefix}`,
            },
            {
                source: `${prefix}/:path*`,
                destination: `${backendUrl}${prefix}/:path*`,
            },
        ]);
    },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
