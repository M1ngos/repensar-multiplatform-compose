'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { BlogTag } from '@/lib/api/types';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { IconTag, IconHash } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

interface TagListProps {
  tags: BlogTag[];
  isLoading?: boolean;
  locale?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'pill' | 'compact';
}

export function TagList({ tags, isLoading = false, locale = 'en', variant = 'outline' }: TagListProps) {
  const t = useTranslations('Blog.tagList');

  if (isLoading) {
    if (variant === 'pill' || variant === 'compact') {
      return (
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-20 rounded-full" />
          ))}
        </div>
      );
    }
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
      <div className="text-sm text-muted-foreground flex items-center gap-2">
        <IconTag className="h-4 w-4" />
        {t('noTagsAvailable')}
      </div>
    );
  }

  const getBadgeClasses = (index: number) => {
    const colors = [
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300 border-teal-200 dark:border-teal-800',
      'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
      'bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300 border-sky-200 dark:border-sky-800',
    ];
    return colors[index % colors.length];
  };

  if (variant === 'pill') {
    return (
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <Link key={tag.id} href={`/${locale}/blog?tag=${tag.slug}`}>
            <Badge 
              className={cn(
                "cursor-pointer px-3 py-1 text-sm font-medium transition-all hover:scale-105 hover:shadow-sm",
                getBadgeClasses(index),
                "border-0"
              )}
            >
              <IconHash className="mr-1 h-3 w-3 opacity-70" />
              {tag.name}
              {tag.post_count !== undefined && (
                <span className="ml-1.5 text-xs opacity-60">({tag.post_count})</span>
              )}
            </Badge>
          </Link>
        ))}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag, index) => (
          <Link key={tag.id} href={`/${locale}/blog?tag=${tag.slug}`}>
            <Badge 
              variant="outline"
              className={cn(
                "cursor-pointer text-xs px-2 py-0.5 transition-all hover:scale-105",
                getBadgeClasses(index)
              )}
            >
              #{tag.name}
            </Badge>
          </Link>
        ))}
      </div>
    );
  }

  if (variant === 'secondary') {
    return (
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <Link key={tag.id} href={`/${locale}/blog?tag=${tag.slug}`}>
            <Badge 
              variant="secondary"
              className={cn(
                "cursor-pointer transition-all hover:scale-105 hover:shadow-sm",
                getBadgeClasses(index),
                "border-0"
              )}
            >
              <IconHash className="mr-1 h-3 w-3 opacity-70" />
              {tag.name}
              {tag.post_count !== undefined && (
                <span className="ml-1 text-xs opacity-70">({tag.post_count})</span>
              )}
            </Badge>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag, index) => (
        <Link key={tag.id} href={`/${locale}/blog?tag=${tag.slug}`}>
          <Badge 
            variant="outline" 
            className={cn(
              "cursor-pointer transition-all hover:scale-105 hover:bg-primary hover:text-primary-foreground",
              getBadgeClasses(index)
            )}
          >
            <IconTag className="mr-1 h-3 w-3" />
            {tag.name}
            {tag.post_count !== undefined && (
              <span className="ml-1 text-xs opacity-70">({tag.post_count})</span>
            )}
          </Badge>
        </Link>
      ))}
    </div>
  );
}
