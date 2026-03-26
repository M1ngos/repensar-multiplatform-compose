'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { blogApi } from '@/lib/api';
import type { BlogPost, BlogPostUpdate, BlogCategory, BlogTag } from '@/lib/api/types';
import { BlogPostForm } from '@/components/blog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Edit3, Leaf } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

export default function EditBlogPostPage() {
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const locale = useLocale();
    const t = useTranslations('Blog.Admin');
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [post, setPost] = useState<BlogPost | null>(null);
    const [categories, setCategories] = useState<BlogCategory[]>([]);
    const [tags, setTags] = useState<BlogTag[]>([]);

    const postId = parseInt(params?.id || '0');

    useEffect(() => {
        fetchData();
    }, [postId]);

    const fetchData = async () => {
        try {
            setIsFetching(true);
            const [postData, categoriesRes, tagsRes] = await Promise.all([
                blogApi.getPost(postId),
                blogApi.getCategories({ limit: 100 }),
                blogApi.getTags({ limit: 100 }),
            ]);
            setPost(postData);
            setCategories(categoriesRes.items);
            setTags(tagsRes.items);
        } catch (error) {
            const detail = (error as { detail?: string })?.detail ?? String(error);
            console.error('Error fetching data:', detail);
            toast.error(t('loadError'));
        } finally {
            setIsFetching(false);
        }
    };

    const handleSubmit = async (data: BlogPostUpdate) => {
        try {
            setIsLoading(true);
            await blogApi.updatePost(postId, data);
            toast.success(t('postUpdated'));
            router.push(`/${locale}/portal/blog`);
        } catch (error) {
            console.error('Error updating post:', error);
            toast.error(t('saveError'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        router.push(`/${locale}/portal/blog`);
    };

    if (isFetching) {
        return (
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-xl" />
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                </div>
                <Card className="overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-emerald-300 to-teal-300" />
                    <CardContent className="pt-6 space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-64 w-full" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <Card className="border-emerald-100 dark:border-emerald-900">
                    <CardContent className="py-12 text-center">
                        <div className="mx-auto w-fit rounded-full bg-emerald-100 dark:bg-emerald-900/30 p-4 mb-4">
                            <Leaf className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <p className="text-lg font-medium text-emerald-600 dark:text-emerald-400">{t('postNotFound')}</p>
                        <Link href={`/${locale}/portal/blog`} className="mt-4 inline-block">
                            <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white">
                                {t('backToPosts')}
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Convert post to initial data format
    const initialData: BlogPostUpdate = {
        title: post.title,
        content: post.content,
        excerpt: post.excerpt || '',
        status: post.status,
        featured_image_url: post.featured_image_url || '',
        category_ids: post.categories.map((c) => c.id),
        tag_ids: post.tags.map((t) => t.id),
    };

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href={`/${locale}/portal/blog`}>
                    <Button variant="ghost" size="icon" className="rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/30">
                        <ChevronLeft className="h-4 w-4 text-emerald-600" />
                    </Button>
                </Link>
                <div className="flex items-center gap-4 flex-1">
                    <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-2.5 shadow-lg shadow-emerald-500/20">
                        <Edit3 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                            {t('editPost')}
                        </h1>
                        <p className="text-muted-foreground line-clamp-1">{post.title}</p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <BlogPostForm
                initialData={initialData}
                categories={categories}
                tags={tags}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={isLoading}
                mode="edit"
            />
        </div>
    );
}
