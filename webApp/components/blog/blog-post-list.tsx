'use client';

import { useTranslations } from 'next-intl';
import { BlogPostSummary } from '@/lib/api/types';
import { BlogPostCard } from './blog-post-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Leaf } from 'lucide-react';

interface BlogPostListProps {
  posts: BlogPostSummary[];
  isLoading?: boolean;
  locale?: string;
  variant?: 'grid' | 'featured' | 'masonry';
}

export function BlogPostList({ posts, isLoading = false, locale = 'en', variant = 'grid' }: BlogPostListProps) {
  const t = useTranslations('Blog.list');

  if (isLoading) {
    return (
      <div className={variant === 'featured' ? 'space-y-8' : 'grid gap-6 md:grid-cols-2 lg:grid-cols-3'}>
        {variant === 'featured' ? (
          <>
            {/* Featured skeleton */}
            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
              <Skeleton className="aspect-[16/9] w-full" />
              <div className="p-6 space-y-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="flex gap-4 pt-2 border-t">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </div>
            {/* Grid skeletons */}
            <div className="grid gap-6 md:grid-cols-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="rounded-xl border bg-card shadow-sm overflow-hidden">
                  <Skeleton className="aspect-video w-full" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border bg-card shadow-sm overflow-hidden">
              <Skeleton className="aspect-video w-full" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="flex gap-4 pt-2 border-t">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-emerald-100 dark:bg-emerald-900/30 p-4 mb-4">
          <Leaf className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <p className="text-lg font-medium text-foreground">{t('noPostsFound')}</p>
        <p className="text-sm text-muted-foreground mt-1">{t('noPostsFoundDesc')}</p>
      </div>
    );
  }

  if (variant === 'featured') {
    // First post is featured, rest in grid
    const [featuredPost, ...remainingPosts] = posts;
    return (
      <div className="space-y-8">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="lg:col-span-1">
            <BlogPostCard key={featuredPost.id} post={featuredPost} locale={locale} variant="featured" />
          </div>
          <div className="lg:col-span-1 grid gap-6">
            {remainingPosts.slice(0, 2).map((post) => (
              <BlogPostCard key={post.id} post={post} locale={locale} />
            ))}
          </div>
        </div>
        {remainingPosts.length > 2 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {remainingPosts.slice(2).map((post) => (
              <BlogPostCard key={post.id} post={post} locale={locale} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <BlogPostCard key={post.id} post={post} locale={locale} />
      ))}
    </div>
  );
}
