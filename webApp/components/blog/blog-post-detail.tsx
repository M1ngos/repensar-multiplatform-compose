'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { BlogPost } from '@/lib/api/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { IconCalendar, IconTag, IconFolder, IconClock, IconBrandTwitter, IconBrandFacebook, IconBrandLinkedin, IconBrandWhatsapp, IconLink, IconCheck } from '@tabler/icons-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface BlogPostDetailProps {
  post: BlogPost;
  locale?: string;
}

export function BlogPostDetail({ post, locale = 'en' }: BlogPostDetailProps) {
  const t = useTranslations('Blog.detail');
  const [copied, setCopied] = useState(false);

  const publishedDate = post.published_at
    ? format(new Date(post.published_at), 'MMMM dd, yyyy')
    : format(new Date(post.created_at), 'MMMM dd, yyyy');

  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';
  const encodedUrl = encodeURIComponent(pageUrl);
  const encodedTitle = encodeURIComponent(post.title);

  const shareLinks = [
    {
      label: 'Twitter / X',
      icon: IconBrandTwitter,
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      color: 'hover:text-sky-500 hover:border-sky-300 dark:hover:border-sky-700',
    },
    {
      label: 'Facebook',
      icon: IconBrandFacebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: 'hover:text-blue-600 hover:border-blue-300 dark:hover:border-blue-700',
    },
    {
      label: 'LinkedIn',
      icon: IconBrandLinkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      color: 'hover:text-blue-500 hover:border-blue-300 dark:hover:border-blue-700',
    },
    {
      label: 'WhatsApp',
      icon: IconBrandWhatsapp,
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      color: 'hover:text-green-500 hover:border-green-300 dark:hover:border-green-700',
    },
  ];

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback for older browsers
      const el = document.createElement('input');
      el.value = pageUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Calculate reading time
  const wordCount = post.content?.replace(/<[^>]*>/g, '').split(/\s+/).length || 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <article className="mx-auto max-w-4xl">
      {/* Featured Image */}
      {post.featured_image_url && (
        <div className="relative mb-8 -mx-4 md:mx-0 md:rounded-2xl overflow-hidden">
          <div className="aspect-[21/9] md:aspect-[21/9] w-full">
            <img
              src={post.featured_image_url}
              alt={post.title}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          {/* Status badge on image */}
          {post.status === 'draft' && (
            <Badge variant="secondary" className="absolute top-4 right-4 md:right-6 bg-amber-500/90 text-white border-0 backdrop-blur-sm">
              {t('draft')}
            </Badge>
          )}
        </div>
      )}

      {/* Header */}
      <header className="mb-8 space-y-6">
        {/* Back link */}
        {/* <Link href={`/${locale}/blog`}> */}
        {/*   <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-emerald-600 -ml-2"> */}
        {/*     <IconArrowLeft className="mr-2 h-4 w-4" /> */}
        {/*     {t('backToBlog') || 'Back to Blog'} */}
        {/*   </Button> */}
        {/* </Link> */}

        {/* Categories */}
        {post.categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.categories.map((category) => (
              <Link
                key={category.id}
                href={`/${locale}/blog?category=${category.slug}`}
              >
                <Badge className="cursor-pointer bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 border-0 hover:bg-emerald-200 dark:hover:bg-emerald-800 transition-colors">
                  <IconFolder className="mr-1.5 h-3 w-3" />
                  {category.name}
                </Badge>
              </Link>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
          {post.title}
        </h1>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            {post.excerpt}
          </p>
        )}

        {/* Meta Information */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {post.author && (
            <div className="flex items-center gap-3 p-2 -m-2 rounded-lg bg-muted/50">
              <Avatar className="h-10 w-10 border-2 border-emerald-200 dark:border-emerald-800">
                <AvatarFallback className="bg-emerald-100 text-emerald-700">
                  {getInitials(post.author.full_name || post.author.email)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-foreground">{post.author.full_name}</p>
                <p className="text-xs text-muted-foreground">{post.author.email}</p>
              </div>
            </div>
          )}
          <Separator orientation="vertical" className="h-8 hidden md:block" />
          <div className="flex items-center gap-1.5">
            <IconCalendar className="h-4 w-4 text-emerald-600" />
            <time dateTime={post.published_at || post.created_at}>{publishedDate}</time>
          </div>
          <div className="flex items-center gap-1.5">
            <IconClock className="h-4 w-4 text-emerald-600" />
            <span>{readingTime} min read</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <Card className="mb-8 overflow-hidden border-emerald-100 dark:border-emerald-900">
        <CardContent className="prose prose-emerald dark:prose-invert max-w-none p-6 md:p-8">
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </CardContent>
      </Card>

      {/* Tags */}
      {post.tags.length > 0 && (
        <Card className="border-emerald-100 dark:border-emerald-900">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <IconTag className="h-5 w-5 text-emerald-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-3">{t('tags')}</h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Link
                      key={tag.id}
                      href={`/${locale}/blog?tag=${tag.slug}`}
                    >
                      <Badge
                        variant="outline"
                        className="cursor-pointer text-sm px-3 py-1 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors"
                      >
                        #{tag.name}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Share Section */}
      <div className="mt-8 pt-8 border-t border-emerald-100 dark:border-emerald-900">
        <p className="text-sm font-medium text-center text-muted-foreground mb-4">
          {t('share')}
        </p>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {shareLinks.map(({ label, icon: Icon, href, color }) => (
            <Tooltip key={label}>
              <TooltipTrigger asChild>
                <a href={href} target="_blank" rel="noopener noreferrer">
                  <Button
                    variant="outline"
                    size="icon"
                    className={`h-10 w-10 transition-all duration-200 ${color}`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="sr-only">{label}</span>
                  </Button>
                </a>
              </TooltipTrigger>
              <TooltipContent>{label}</TooltipContent>
            </Tooltip>
          ))}

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className={`h-10 w-10 transition-all duration-200 ${copied ? 'text-emerald-600 border-emerald-400' : 'hover:text-emerald-600 hover:border-emerald-300 dark:hover:border-emerald-700'}`}
                onClick={handleCopyLink}
              >
                {copied ? <IconCheck className="h-4 w-4" /> : <IconLink className="h-4 w-4" />}
                <span className="sr-only">{copied ? t('linkCopied') : t('copyLink')}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>{copied ? t('linkCopied') : t('copyLink')}</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </article>
  );
}
