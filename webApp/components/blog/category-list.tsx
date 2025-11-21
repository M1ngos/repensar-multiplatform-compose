'use client';

import Link from 'next/link';
import { BlogCategory } from '@/lib/api/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface CategoryListProps {
  categories: BlogCategory[];
  isLoading?: boolean;
  locale?: string;
}

export function CategoryList({ categories, isLoading = false, locale = 'en' }: CategoryListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-lg font-medium text-muted-foreground">No categories found</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/${locale}/blog?category=${category.slug}`}
          className="block transition-transform hover:scale-[1.02]"
        >
          <Card className="h-full hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{category.name}</CardTitle>
                {category.post_count !== undefined && (
                  <Badge variant="secondary">{category.post_count}</Badge>
                )}
              </div>
              {category.description && (
                <CardDescription className="line-clamp-2">
                  {category.description}
                </CardDescription>
              )}
            </CardHeader>
          </Card>
        </Link>
      ))}
    </div>
  );
}
