'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { BlogPostSummary } from '@/lib/api/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { IconCalendar, IconClock } from '@tabler/icons-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface BlogPostCardProps {
  post: BlogPostSummary;
  locale?: string;
  variant?: 'default' | 'featured' | 'compact';
}

export function BlogPostCard({ post, locale = 'en', variant = 'default' }: BlogPostCardProps) {
  const t = useTranslations('Blog.card');
  const publishedDate = post.published_at
    ? format(new Date(post.published_at), 'MMM dd, yyyy')
    : format(new Date(post.created_at), 'MMM dd, yyyy');

  // Estimate reading time based on excerpt length (rough estimate)
  const wordCount = post.excerpt?.split(/\s+/).length || 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 50));

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (variant === 'featured') {
    return (
      <Link href={`/${locale}/blog/${post.slug}`} className="group block">
        <Card className="overflow-hidden h-full transition-all duration-300 hover:shadow-xl hover:scale-[1.01]">
          {post.featured_image_url && (
            <div className="relative aspect-[16/9] overflow-hidden">
              <img
                src={post.featured_image_url}
                alt={post.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              {/* Status badge */}
              {post.status === 'draft' && (
                <Badge variant="secondary" className="absolute top-4 right-4 bg-amber-500/90 text-white border-0">
                  {t('draft')}
                </Badge>
              )}
              {/* Category badges */}
              <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
                {post.categories.slice(0, 2).map((category) => (
                  <Badge key={category.id} className="bg-emerald-600/90 text-white border-0 backdrop-blur-sm">
                    {category.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          <CardHeader className="space-y-3">
            <CardTitle className="text-2xl line-clamp-2 group-hover:text-emerald-600 transition-colors">
              {post.title}
            </CardTitle>
            {post.excerpt && (
              <CardDescription className="text-base line-clamp-3 text-muted-foreground/80">
                {post.excerpt}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {post.author && (
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs">
                      {getInitials(post.author.full_name || post.author.email)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-foreground">{post.author.full_name ?? post.author.email}</span>
                </div>
              )}
            </div>
            <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <IconCalendar className="h-4 w-4 text-emerald-600" />
                <time dateTime={post.published_at || post.created_at}>{publishedDate}</time>
              </div>
              <div className="flex items-center gap-1.5">
                <IconClock className="h-4 w-4 text-emerald-600" />
                <span>{readingTime} min read</span>
              </div>
            </div>
            {post.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {post.tags.slice(0, 4).map((tag) => (
                  <Badge key={tag.id} variant="outline" className="text-xs font-normal bg-emerald-50/50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors">
                    #{tag.name}
                  </Badge>
                ))}
                {post.tags.length > 4 && (
                  <Badge variant="outline" className="text-xs font-normal text-muted-foreground">
                    +{post.tags.length - 4}
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <Link href={`/${locale}/blog/${post.slug}`} className="group block">
      <Card className={cn(
        "h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-emerald-200 dark:hover:border-emerald-800",
        !post.featured_image_url && "border-emerald-100 dark:border-emerald-900"
      )}>
        {post.featured_image_url && (
          <div className="relative aspect-video overflow-hidden">
            <img
              src={post.featured_image_url}
              alt={post.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            {/* Overlay content on hover */}
            <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <div className="flex items-center gap-2 text-white text-sm">
                <IconCalendar className="h-4 w-4" />
                <span>{publishedDate}</span>
                <span className="mx-1">•</span>
                <IconClock className="h-4 w-4" />
                <span>{readingTime} min</span>
              </div>
            </div>
          </div>
        )}
        <CardHeader className="space-y-3 pb-2">
          <div className="flex flex-wrap gap-2">
            {post.categories.slice(0, 2).map((category) => (
              <Badge key={category.id} variant="secondary" className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 border-0">
                {category.name}
              </Badge>
            ))}
            {post.status === 'draft' && (
              <Badge variant="outline" className="text-xs border-amber-300 text-amber-600 dark:border-amber-600 dark:text-amber-400">
                {t('draft')}
              </Badge>
            )}
          </div>
          <CardTitle className="text-lg @[250px]/card:text-xl line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            {post.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {post.excerpt && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {post.excerpt}
            </p>
          )}
          <div className="flex items-center gap-3 pt-2 border-t">
            {post.author && (
              <div className="flex items-center gap-2 min-w-0">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs">
                    {getInitials(post.author.full_name || post.author.email)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground truncate">
                  {post.author.full_name ?? post.author.email}
                </span>
              </div>
            )}
          </div>
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {post.tags.slice(0, 3).map((tag) => (
                <Badge key={tag.id} variant="outline" className="text-xs font-normal text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                  #{tag.name}
                </Badge>
              ))}
              {post.tags.length > 3 && (
                <Badge variant="outline" className="text-xs font-normal text-muted-foreground">
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
