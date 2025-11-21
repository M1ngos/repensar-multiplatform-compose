'use client';

import Link from 'next/link';
import { BlogPostSummary } from '@/lib/api/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { IconCalendar, IconUser } from '@tabler/icons-react';
import { format } from 'date-fns';

interface BlogPostCardProps {
  post: BlogPostSummary;
  locale?: string;
}

export function BlogPostCard({ post, locale = 'en' }: BlogPostCardProps) {
  const publishedDate = post.published_at
    ? format(new Date(post.published_at), 'MMM dd, yyyy')
    : format(new Date(post.created_at), 'MMM dd, yyyy');

  return (
    <Link href={`/${locale}/blog/${post.slug}`} className="block transition-transform hover:scale-[1.02]">
      <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow">
        {post.featured_image_url && (
          <div className="aspect-video w-full overflow-hidden">
            <img
              src={post.featured_image_url}
              alt={post.title}
              className="h-full w-full object-cover transition-transform hover:scale-105"
            />
          </div>
        )}

        <CardHeader className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {post.categories.slice(0, 2).map((category) => (
              <Badge key={category.id} variant="secondary" className="text-xs">
                {category.name}
              </Badge>
            ))}
            {post.status === 'draft' && (
              <Badge variant="outline" className="text-xs">
                Draft
              </Badge>
            )}
          </div>

          <CardTitle className="line-clamp-2 text-xl">
            {post.title}
          </CardTitle>

          {post.excerpt && (
            <CardDescription className="line-clamp-3">
              {post.excerpt}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <IconUser className="h-4 w-4" />
              <span>{post.author.full_name}</span>
            </div>
            <div className="flex items-center gap-1">
              <IconCalendar className="h-4 w-4" />
              <time dateTime={post.published_at || post.created_at}>
                {publishedDate}
              </time>
            </div>
          </div>

          {post.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1">
              {post.tags.slice(0, 3).map((tag) => (
                <Badge key={tag.id} variant="outline" className="text-xs font-normal">
                  #{tag.name}
                </Badge>
              ))}
              {post.tags.length > 3 && (
                <Badge variant="outline" className="text-xs font-normal">
                  +{post.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
