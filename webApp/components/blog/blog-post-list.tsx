'use client';

import { BlogPostSummary } from '@/lib/api/types';
import { BlogPostCard } from './blog-post-card';
import { Skeleton } from '@/components/ui/skeleton';

interface BlogPostListProps {
  posts: BlogPostSummary[];
  isLoading?: boolean;
  locale?: string;
}

export function BlogPostList({ posts, isLoading = false, locale = 'en' }: BlogPostListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card shadow-sm">
            <Skeleton className="aspect-video w-full" />
            <div className="p-6 space-y-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <div className="flex gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-lg font-medium text-muted-foreground">No blog posts found</p>
        <p className="text-sm text-muted-foreground">Check back later for new content</p>
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
