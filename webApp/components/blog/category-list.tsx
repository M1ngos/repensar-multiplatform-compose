'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { BlogCategory } from '@/lib/api/types';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { IconFolder, IconChevronRight, IconLeaf } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

interface CategoryListProps {
  categories: BlogCategory[];
  isLoading?: boolean;
  locale?: string;
  variant?: 'grid' | 'list' | 'compact';
}

export function CategoryList({ categories, isLoading = false, locale = 'en', variant = 'grid' }: CategoryListProps) {
  const t = useTranslations('Blog.categoryList');

  if (isLoading) {
    if (variant === 'list') {
      return (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-lg border">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      );
    }
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-12" />
              </div>
              <Skeleton className="h-4 w-full" />
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-emerald-100 dark:bg-emerald-900/30 p-4 mb-4">
          <IconLeaf className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <p className="text-lg font-medium text-foreground">{t('noCategoriesFound')}</p>
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className="space-y-2">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/${locale}/blog?category=${category.slug}`}
            className="group block"
          >
            <Card className="transition-all duration-200 hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-800 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20">
              <CardHeader className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-emerald-100 dark:bg-emerald-900/50 p-2 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-800 transition-colors">
                      <IconFolder className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <CardTitle className="text-base group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {category.name}
                      </CardTitle>
                      {category.description && (
                        <CardDescription className="line-clamp-1">
                          {category.description}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {category.post_count !== undefined && (
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 border-0">
                        {category.post_count}
                      </Badge>
                    )}
                    <IconChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/${locale}/blog?category=${category.slug}`}
          >
            <Badge 
              variant="secondary" 
              className={cn(
                "cursor-pointer transition-all hover:scale-105",
                "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 border-0",
                "hover:bg-emerald-200 dark:hover:bg-emerald-800"
              )}
            >
              <IconFolder className="mr-1 h-3 w-3" />
              {category.name}
              {category.post_count !== undefined && (
                <span className="ml-1.5 text-xs opacity-70">({category.post_count})</span>
              )}
            </Badge>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/${locale}/blog?category=${category.slug}`}
          className="group"
        >
          <Card className="h-full transition-all duration-300 hover:shadow-lg hover:border-emerald-200 dark:hover:border-emerald-800 overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-emerald-400 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-emerald-100 dark:bg-emerald-900/50 p-2.5 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-800 transition-colors">
                    <IconFolder className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <CardTitle className="text-lg group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {category.name}
                  </CardTitle>
                </div>
                {category.post_count !== undefined && (
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 border-0">
                    {category.post_count}
                  </Badge>
                )}
              </div>
            </CardHeader>
            {category.description && (
              <CardDescription className="px-5 pb-5 line-clamp-2">
                {category.description}
              </CardDescription>
            )}
          </Card>
        </Link>
      ))}
    </div>
  );
}
