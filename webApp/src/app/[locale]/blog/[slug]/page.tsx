'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { blogApi } from '@/lib/api';
import type { BlogPost, BlogPostSummary } from '@/lib/api/types';
import { BlogPostDetail, BlogPostCard } from '@/components/blog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function BlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const locale = params.locale as string;
  const t = useTranslations('Blog');

  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPostSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug]);

  const fetchPost = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const postData = await blogApi.getPostBySlug(slug);
      setPost(postData);

      // Fetch related posts from the same category
      if (postData.categories.length > 0) {
        const relatedRes = await blogApi.getPosts({
          category: postData.categories[0].slug,
          limit: 3,
        });
        // Filter out current post
        const filtered = relatedRes.items.filter((p) => p.id !== postData.id);
        setRelatedPosts(filtered.slice(0, 3));
      }
    } catch (err) {
      console.error('Error fetching blog post:', err);
      setError('Failed to load blog post. It may not exist or has been removed.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-6">
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="max-w-4xl mx-auto space-y-6">
            <Skeleton className="aspect-video w-full rounded-xl" />
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link href={`/${locale}/blog`}>
            <Button variant="ghost" className="mb-6">
              <ChevronLeft className="w-4 h-4 mr-2" />
              {t('backToBlog')}
            </Button>
          </Link>
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-6 text-center">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">{t('postNotFound')}</h2>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Link href={`/${locale}/blog`}>
                <Button>{t('browseAllPosts')}</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link href={`/${locale}/blog`}>
          <Button variant="ghost" className="mb-6">
            <ChevronLeft className="w-4 h-4 mr-2" />
            {t('backToBlog')}
          </Button>
        </Link>

        {/* Blog Post */}
        <BlogPostDetail post={post} locale={locale} />

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="mt-16">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{t('relatedPosts')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-3">
                  {relatedPosts.map((relatedPost) => (
                    <BlogPostCard key={relatedPost.id} post={relatedPost} locale={locale} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        )}
      </div>
    </div>
  );
}
