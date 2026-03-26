import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';

export default createMiddleware(routing);

export const config = {
    // Exclude backend proxy paths (auth, users, volunteers, …) so next-intl
    // does NOT intercept them — the Next.js rewrites in next.config.ts handle those.
    matcher: '/((?!api|trpc|_next|_vercel|auth|users|volunteers|projects|tasks|resources|reports|analytics|gamification|blog/|files|uploads|search|sync|notifications|newsletter|contact|.*\\..*).*)'
}