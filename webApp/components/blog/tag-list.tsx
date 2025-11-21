'use client';

import Link from 'next/link';
import { BlogTag } from '@/lib/api/types';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface TagListProps {
  tags: BlogTag[];
  isLoading?: boolean;
  locale?: string;
  variant?: 'default' | 'outline' | 'secondary';
}

export function TagList({ tags, isLoading = false, locale = 'en', variant = 'outline' }: TagListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-6 w-20" />
        ))}
      </div>
    );
  }

  if (tags.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">No tags available</div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <Link key={tag.id} href={`/${locale}/blog?tag=${tag.slug}`}>
          <Badge variant={variant} className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
            #{tag.name}
            {tag.post_count !== undefined && (
              <span className="ml-1 text-xs opacity-70">({tag.post_count})</span>
            )}
          </Badge>
        </Link>
      ))}
    </div>
  );
}
