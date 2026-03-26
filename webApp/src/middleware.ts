import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';

export default createMiddleware(routing);

export const config = {
    // Exclude backend proxy paths (auth, users, volunteers, …) so next-intl
    // does NOT intercept them — the Next.js rewrites in next.config.ts handle those.
    // NOTE: blog/(posts|categories|tags) are excluded (backend API sub-paths) but
    // blog/[slug] is NOT excluded so Portuguese (default locale, no prefix) blog post
    // pages like /blog/testtest go through next-intl to resolve locale correctly.
    matcher: '/((?!api|trpc|_next|_vercel|auth|users|volunteers|projects|tasks|resources|reports|analytics|gamification|blog/(?:posts|categories|tags)|files|uploads|search|sync|notifications|newsletter|contact|.*\\..*).*)'
}