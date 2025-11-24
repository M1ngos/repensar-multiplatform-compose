'use client';

import { useTranslations } from 'next-intl';
import { BlogPost } from '@/lib/api/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { IconCalendar, IconUser, IconTag, IconFolder } from '@tabler/icons-react';
import { format } from 'date-fns';
import Link from 'next/link';

interface BlogPostDetailProps {
  post: BlogPost;
  locale?: string;
}

export function BlogPostDetail({ post, locale = 'en' }: BlogPostDetailProps) {
  const t = useTranslations('Blog.detail');
  const publishedDate = post.published_at
    ? format(new Date(post.published_at), 'MMMM dd, yyyy')
    : format(new Date(post.created_at), 'MMMM dd, yyyy');

  return (
    <article className="mx-auto max-w-4xl">
      {/* Featured Image */}
      {post.featured_image_url && (
        <div className="mb-8 aspect-video w-full overflow-hidden rounded-xl">
          <img
            src={post.featured_image_url}
            alt={post.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {/* Header */}
      <header className="mb-8 space-y-4">
        {/* Categories */}
        {post.categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.categories.map((category) => (
              <Link
                key={category.id}
                href={`/${locale}/blog?category=${category.slug}`}
              >
                <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                  <IconFolder className="mr-1 h-3 w-3" />
                  {category.name}
                </Badge>
              </Link>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
          {post.title}
        </h1>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-xl text-muted-foreground">
            {post.excerpt}
          </p>
        )}

        {/* Meta Information */}
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          {post.author && (
            <div className="flex items-center gap-1">
              <IconUser className="h-4 w-4" />
              <span>{post.author.full_name}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <IconCalendar className="h-4 w-4" />
            <time dateTime={post.published_at || post.created_at}>
              {publishedDate}
            </time>
          </div>
          {post.status === 'draft' && (
            <Badge variant="outline">{t('draft')}</Badge>
          )}
        </div>
      </header>

      {/* Content */}
      <Card className="mb-8">
        <CardContent className="prose prose-slate dark:prose-invert max-w-none pt-6">
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </CardContent>
      </Card>

      {/* Tags */}
      {post.tags.length > 0 && (
        <footer className="border-t pt-6">
          <div className="flex items-center gap-2 text-sm">
            <IconTag className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-muted-foreground">{t('tags')}:</span>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/${locale}/blog?tag=${tag.slug}`}
                >
                  <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                    #{tag.name}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        </footer>
      )}
    </article>
  );
}
