'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { blogApi } from '@/lib/api';
import type { BlogPostCreate, BlogPostUpdate, BlogCategory, BlogTag } from '@/lib/api/types';
import { BlogPostForm } from '@/components/blog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export default function NewBlogPostPage() {
    const router = useRouter();
    const locale = useLocale();
    const t = useTranslations('Blog.Admin');
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [categories, setCategories] = useState<BlogCategory[]>([]);
    const [tags, setTags] = useState<BlogTag[]>([]);

    useEffect(() => {
        fetchMetadata();
    }, []);

    const fetchMetadata = async () => {
        try {
            setIsFetching(true);
            const [categoriesRes, tagsRes] = await Promise.all([
                blogApi.getCategories({ limit: 100 }),
                blogApi.getTags({ limit: 100 }),
            ]);
            setCategories(categoriesRes.items);
            setTags(tagsRes.items);
        } catch (error) {
            const detail = (error as { detail?: string })?.detail ?? String(error);
            console.error('Error fetching metadata:', detail);
            toast.error(t('saveError'));
        } finally {
            setIsFetching(false);
        }
    };

    const handleSubmit = async (data: BlogPostCreate | BlogPostUpdate) => {
        try {
            setIsLoading(true);
            const newPost = await blogApi.createPost(data as BlogPostCreate);
            toast.success(t('postCreated'));
            router.push(`/${locale}/portal/blog/${newPost.id}`);
        } catch (error) {
            console.error('Error creating post:', error);
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
                        <PlusCircle className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                            {t('createPost')}
                        </h1>
                        <p className="text-muted-foreground">{t('subtitle')}</p>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card className="border-emerald-100 dark:border-emerald-900 bg-gradient-to-br from-white to-emerald-50/30 dark:from-gray-900 dark:to-emerald-950/20">
                    <CardContent className="pt-4">
                        <div className="text-2xl font-bold text-emerald-600">{categories.length}</div>
                        <p className="text-xs text-muted-foreground">Categories</p>
                    </CardContent>
                </Card>
                <Card className="border-emerald-100 dark:border-emerald-900 bg-gradient-to-br from-white to-teal-50/30 dark:from-gray-900 dark:to-teal-950/20">
                    <CardContent className="pt-4">
                        <div className="text-2xl font-bold text-teal-600">{tags.length}</div>
                        <p className="text-xs text-muted-foreground">Tags</p>
                    </CardContent>
                </Card>
            </div>

            {/* Form */}
            <BlogPostForm
                categories={categories}
                tags={tags}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={isLoading}
                mode="create"
            />
        </div>
    );
}
